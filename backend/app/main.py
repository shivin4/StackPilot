from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.metrics import metrics_response, prometheus_middleware
from app.routers import auth, deployments, gateway, projects


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="StackPilot API",
    description="Cloud-Native DevOps Platform for Deploying Student Apps",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.middleware("http")(prometheus_middleware)


@app.get("/health")
def health():
    return {"status": "ok", "service": "stackpilot-api"}


@app.get("/metrics")
def metrics():
    return metrics_response()


app.include_router(gateway.router)
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(deployments.router)
