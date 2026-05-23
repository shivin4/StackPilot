from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import SessionLocal, get_db
from app.models import Deployment, DeploymentStatus, Project, User
from app.schemas import DeploymentCreate, DeploymentOut
from app.services import deployer

router = APIRouter(prefix="/deployments", tags=["deployments"])


def _run_deploy(deployment_id: int, repo_url: str):
    db = SessionLocal()
    try:
        deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
        if not deployment:
            return
        if deployer.is_cancelled(deployment_id):
            return
        try:
            deployment.status = DeploymentStatus.building
            db.commit()
            db.refresh(deployment)
            if (
                deployer.is_cancelled(deployment_id)
                or deployment.status == DeploymentStatus.stopped
            ):
                return

            local_path = repo_url if repo_url.startswith("/") else None
            image_tag, container_id, host_port, public_url, logs = deployer.build_and_run(
                deployment_id, repo_url, local_path, deployment.logs
            )

            db.refresh(deployment)
            if (
                deployer.is_cancelled(deployment_id)
                or deployment.status == DeploymentStatus.stopped
            ):
                deployer.cleanup_deployment(deployment_id, container_id)
                deployment.status = DeploymentStatus.stopped
                deployment.logs = (logs or "") + "\nCancelled by user."
                deployment.public_url = None
                deployment.host_port = None
                deployment.container_id = None
            else:
                deployment.status = DeploymentStatus.running
                deployment.image_tag = image_tag
                deployment.container_id = container_id
                deployment.host_port = host_port
                deployment.public_url = public_url
                deployment.logs = logs
        except deployer.DeploymentCancelled:
            deployer.cleanup_deployment(deployment_id, deployment.container_id)
            deployment.status = DeploymentStatus.stopped
            deployment.logs = (deployment.logs or "") + "\nCancelled by user."
        except Exception as exc:
            if deployer.is_cancelled(deployment_id):
                deployer.cleanup_deployment(deployment_id, deployment.container_id)
                deployment.status = DeploymentStatus.stopped
                deployment.logs = (deployment.logs or "") + "\nCancelled by user."
            else:
                deployment.status = DeploymentStatus.failed
                deployment.logs = (deployment.logs or "") + f"\nFAILED: {exc}"
        db.commit()
    finally:
        deployer.clear_cancelled(deployment_id)
        db.close()


@router.get("", response_model=list[DeploymentOut])
def list_deployments(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    project_ids = [
        p.id for p in db.query(Project).filter(Project.owner_id == user.id).all()
    ]
    return db.query(Deployment).filter(Deployment.project_id.in_(project_ids)).all()


@router.post("", response_model=DeploymentOut)
def create_deployment(
    body: DeploymentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == body.project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    deployment = Deployment(
        project_id=project.id,
        status=DeploymentStatus.pending,
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)

    background_tasks.add_task(_run_deploy, deployment.id, project.repo_url)
    return deployment


def _get_owned_deployment(deployment_id: int, user: User, db: Session) -> Deployment:
    deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Not found")
    project = db.query(Project).filter(Project.id == deployment.project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    return deployment


@router.post("/{deployment_id}/restart", response_model=DeploymentOut)
def restart_deployment(
    deployment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    deployment = _get_owned_deployment(deployment_id, user, db)
    if deployment.status not in (
        DeploymentStatus.stopped,
        DeploymentStatus.failed,
    ):
        raise HTTPException(
            status_code=400,
            detail="Only stopped or failed deployments can be restarted",
        )

    deployer.cleanup_deployment(deployment_id, deployment.container_id)
    deployment.status = DeploymentStatus.pending
    deployment.image_tag = None
    deployment.container_id = None
    deployment.host_port = None
    deployment.public_url = None
    deployment.logs = (deployment.logs or "") + "\nRestart requested…"
    db.commit()
    db.refresh(deployment)

    project = db.query(Project).filter(Project.id == deployment.project_id).first()
    background_tasks.add_task(_run_deploy, deployment.id, project.repo_url)
    return deployment


@router.delete("/{deployment_id}", status_code=204)
def delete_deployment(
    deployment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    deployment = _get_owned_deployment(deployment_id, user, db)
    if deployment.status in (DeploymentStatus.pending, DeploymentStatus.building):
        deployer.mark_cancelled(deployment_id)
    deployer.cleanup_deployment(deployment_id, deployment.container_id)
    db.delete(deployment)
    db.commit()
    return None


@router.get("/{deployment_id}", response_model=DeploymentOut)
def get_deployment(
    deployment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return _get_owned_deployment(deployment_id, user, db)


@router.post("/{deployment_id}/stop", response_model=DeploymentOut)
def stop_deployment(
    deployment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Not found")
    project = db.query(Project).filter(Project.id == deployment.project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    if deployment.status in (
        DeploymentStatus.pending,
        DeploymentStatus.building,
    ):
        deployer.mark_cancelled(deployment_id)
        deployer.cleanup_deployment(deployment_id, deployment.container_id)
        deployment.status = DeploymentStatus.stopped
        deployment.logs = (deployment.logs or "") + "\nCancelled by user."
        deployment.public_url = None
        deployment.host_port = None
        deployment.container_id = None
        deployment.image_tag = None
    elif deployment.status == DeploymentStatus.running:
        deployer.stop_container(deployment.container_id)
        deployment.status = DeploymentStatus.stopped
        deployment.logs = (deployment.logs or "") + "\nStopped by user."
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot stop deployment with status '{deployment.status.value}'",
        )

    db.commit()
    db.refresh(deployment)
    return deployment
