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
        try:
            deployment.status = DeploymentStatus.building
            db.commit()
            local_path = repo_url if repo_url.startswith("/") else None
            image_tag, container_id, host_port, public_url, logs = deployer.build_and_run(
                deployment_id, repo_url, local_path, deployment.logs
            )
            deployment.status = DeploymentStatus.running
            deployment.image_tag = image_tag
            deployment.container_id = container_id
            deployment.host_port = host_port
            deployment.public_url = public_url
            deployment.logs = logs
        except Exception as exc:
            deployment.status = DeploymentStatus.failed
            deployment.logs = (deployment.logs or "") + f"\nFAILED: {exc}"
        db.commit()
    finally:
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


@router.get("/{deployment_id}", response_model=DeploymentOut)
def get_deployment(
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
    return deployment


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
    deployer.stop_container(deployment.container_id)
    deployment.status = DeploymentStatus.stopped
    db.commit()
    db.refresh(deployment)
    return deployment
