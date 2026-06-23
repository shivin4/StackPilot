from datetime import datetime

from app.models import DeploymentStatus
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    repo_url: str = Field(
        description="GitHub URL or local path e.g. /samples/node-hello for dev"
    )


class ProjectOut(BaseModel):
    id: int
    name: str
    repo_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class DeploymentCreate(BaseModel):
    project_id: int


class DeploymentOut(BaseModel):
    id: int
    project_id: int
    status: DeploymentStatus
    image_tag: str | None
    container_id: str | None
    host_port: int | None
    public_url: str | None
    logs: str | None
    created_at: datetime

    class Config:
        from_attributes = True
