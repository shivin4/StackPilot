"""Reverse-proxy student apps deployed on the Docker host."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
import httpx

from app.config import settings
from app.database import get_db
from app.models import Deployment, DeploymentStatus

router = APIRouter(tags=["gateway"])

HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}


def _target_base(deployment: Deployment) -> str:
    if not deployment.host_port:
        raise HTTPException(status_code=503, detail="Deployment has no host port")
    return f"http://{settings.deploy_host}:{deployment.host_port}"


async def _proxy_request(
    deployment_id: int, full_path: str, request: Request, db: Session
) -> Response:
    deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    if deployment.status != DeploymentStatus.running:
        raise HTTPException(status_code=503, detail=f"Deployment is {deployment.status}")

    path = full_path.lstrip("/")
    url = f"{_target_base(deployment)}/{path}" if path else _target_base(deployment)

    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() not in HOP_BY_HOP
    }

    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
        upstream = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=await request.body(),
            params=dict(request.query_params),
        )

    resp_headers = {
        k: v
        for k, v in upstream.headers.items()
        if k.lower() not in HOP_BY_HOP
    }
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=resp_headers,
        media_type=upstream.headers.get("content-type"),
    )


@router.api_route(
    "/apps/{deployment_id}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
)
@router.api_route(
    "/apps/{deployment_id}/",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
)
async def proxy_app_root(
    deployment_id: int, request: Request, db: Session = Depends(get_db)
):
    return await _proxy_request(deployment_id, "", request, db)


@router.api_route(
    "/apps/{deployment_id}/{full_path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
)
async def proxy_app_path(
    deployment_id: int,
    full_path: str,
    request: Request,
    db: Session = Depends(get_db),
):
    return await _proxy_request(deployment_id, full_path, request, db)
