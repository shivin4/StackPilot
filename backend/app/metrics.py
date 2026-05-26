from __future__ import annotations

import time
from collections.abc import Callable

from fastapi import Request, Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest
from sqlalchemy import func

from app.database import SessionLocal
from app.models import Deployment, DeploymentStatus

REQUEST_COUNT = Counter(
    "stackpilot_http_requests_total",
    "Total HTTP requests processed",
    ["method", "path", "status_code"],
)
REQUEST_LATENCY_SECONDS = Histogram(
    "stackpilot_http_request_latency_seconds",
    "HTTP request latency in seconds",
    ["method", "path"],
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)
REQUEST_ERRORS = Counter(
    "stackpilot_http_request_errors_total",
    "HTTP request errors (status >= 500)",
    ["method", "path"],
)
ACTIVE_REQUESTS = Gauge(
    "stackpilot_http_active_requests",
    "Number of in-flight HTTP requests",
)

DEPLOYMENTS_BY_STATUS = Gauge(
    "stackpilot_deployments_by_status",
    "Current deployments grouped by status",
    ["status"],
)
DEPLOYMENTS_TOTAL = Gauge(
    "stackpilot_deployments_total",
    "Total deployments in database",
)
FAILED_DEPLOYMENTS_TOTAL = Gauge(
    "stackpilot_failed_deployments_total",
    "Failed deployments in database",
)


def _normalize_path(request: Request) -> str:
    route = request.scope.get("route")
    if route and getattr(route, "path", None):
        return route.path
    return request.url.path


async def prometheus_middleware(request: Request, call_next: Callable) -> Response:
    method = request.method
    path = _normalize_path(request)
    ACTIVE_REQUESTS.inc()
    start = time.perf_counter()
    status_code = 500
    try:
        response = await call_next(request)
        status_code = response.status_code
        return response
    finally:
        elapsed = time.perf_counter() - start
        ACTIVE_REQUESTS.dec()
        REQUEST_COUNT.labels(method=method, path=path, status_code=str(status_code)).inc()
        REQUEST_LATENCY_SECONDS.labels(method=method, path=path).observe(elapsed)
        if status_code >= 500:
            REQUEST_ERRORS.labels(method=method, path=path).inc()


def update_deployment_metrics() -> None:
    db = SessionLocal()
    try:
        totals = (
            db.query(Deployment.status, func.count(Deployment.id))
            .group_by(Deployment.status)
            .all()
        )
        DEPLOYMENTS_TOTAL.set(0)
        for status in DeploymentStatus:
            DEPLOYMENTS_BY_STATUS.labels(status=status.value).set(0)
        total_count = 0
        failed_count = 0
        for status, count in totals:
            status_value = status.value if isinstance(status, DeploymentStatus) else str(status)
            DEPLOYMENTS_BY_STATUS.labels(status=status_value).set(count)
            total_count += count
            if status_value == DeploymentStatus.failed.value:
                failed_count = count
        DEPLOYMENTS_TOTAL.set(total_count)
        FAILED_DEPLOYMENTS_TOTAL.set(failed_count)
    finally:
        db.close()


def metrics_response() -> Response:
    update_deployment_metrics()
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
