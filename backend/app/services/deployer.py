"""Build and run student app containers via Docker."""

from __future__ import annotations

import random
import re
import shutil
import subprocess
import time
from pathlib import Path

import docker
from docker.errors import DockerException

from app.config import settings

WORKSPACE = Path("/workspace")
PORT_CANDIDATES = (3000, 8000, 5000, 8080)


def _docker_client() -> docker.DockerClient:
    return docker.from_env()


def _append_log(existing: str | None, line: str) -> str:
    base = existing or ""
    return f"{base}{line}\n"


def _detect_container_port(app_path: str) -> int:
    dockerfile = Path(app_path) / "Dockerfile"
    if not dockerfile.exists():
        return 3000
    for line in dockerfile.read_text(encoding="utf-8", errors="ignore").splitlines():
        stripped = line.strip()
        if stripped.upper().startswith("EXPOSE"):
            match = re.search(r"(\d+)", stripped)
            if match:
                return int(match.group(1))
    return 3000


def clone_or_use_path(repo_url: str, local_path: str | None, work_dir: Path) -> str:
    """Return filesystem path to app source."""
    if local_path and Path(local_path).exists():
        dest = work_dir / "app"
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(local_path, dest)
        return str(dest)

    if repo_url.startswith("/") or repo_url.startswith("./"):
        path = Path(repo_url)
        if not path.exists():
            raise FileNotFoundError(f"Path not found: {repo_url}")
        dest = work_dir / "app"
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(path, dest)
        return str(dest)

    dest = work_dir / "app"
    if dest.exists():
        shutil.rmtree(dest)
    result = subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, str(dest)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr or "git clone failed")
    return str(dest)


def _start_container(client, image_tag: str, deployment_id: int, container_port: int, host_port: int):
    """Start container; try alternate ports if the primary EXPOSE port fails."""
    ports_to_try = [container_port] + [p for p in PORT_CANDIDATES if p != container_port]
    last_error = None

    for port in ports_to_try:
        try:
            container = client.containers.run(
                image=image_tag,
                detach=True,
                ports={f"{port}/tcp": host_port},
                restart_policy={"Name": "unless-stopped"},
                labels={
                    "stackpilot.deployment_id": str(deployment_id),
                    "stackpilot.managed": "true",
                },
            )
            for _ in range(15):
                container.reload()
                if container.status == "running":
                    return container, port
                time.sleep(1)
            logs = container.logs(tail=20).decode("utf-8", errors="replace")
            container.remove(force=True)
            last_error = RuntimeError(f"Container exited on port {port}. Logs: {logs}")
        except DockerException as exc:
            last_error = exc
            continue

    raise last_error or RuntimeError("Could not start container")


def build_and_run(
    deployment_id: int,
    repo_url: str,
    local_path: str | None = None,
    existing_logs: str | None = None,
) -> tuple[str, str, int, str, str]:
    """
    Returns: image_tag, container_id, host_port, public_url, logs
    """
    logs = existing_logs
    work_dir = WORKSPACE / f"deploy-{deployment_id}"
    work_dir.mkdir(parents=True, exist_ok=True)

    try:
        logs = _append_log(logs, f"Preparing source from {local_path or repo_url}")
        app_path = clone_or_use_path(repo_url, local_path, work_dir)
        logs = _append_log(logs, f"Source ready at {app_path}")

        image_tag = f"stackpilot-app-{deployment_id}:latest"
        dockerfile = Path(app_path) / "Dockerfile"
        if not dockerfile.exists():
            raise FileNotFoundError(
                "No Dockerfile in project. Student apps must include a Dockerfile."
            )

        container_port = _detect_container_port(app_path)
        logs = _append_log(logs, f"Detected container port {container_port}")

        logs = _append_log(logs, f"Building image {image_tag}...")
        client = _docker_client()
        client.images.build(path=app_path, tag=image_tag, rm=True)

        host_port = random.randint(10000, 20000)
        logs = _append_log(logs, f"Starting container on host port {host_port}")
        container, used_port = _start_container(
            client, image_tag, deployment_id, container_port, host_port
        )
        logs = _append_log(logs, f"Container running (maps {used_port} -> {host_port})")

        base = settings.platform_base_url.rstrip("/")
        public_url = f"{base}/apps/{deployment_id}/"
        logs = _append_log(logs, f"Live URL: {public_url}")
        return image_tag, container.id, host_port, public_url, logs

    except (DockerException, subprocess.CalledProcessError, OSError, RuntimeError) as exc:
        logs = _append_log(logs, f"ERROR: {exc}")
        raise


def stop_container(container_id: str | None) -> None:
    if not container_id:
        return
    try:
        client = _docker_client()
        container = client.containers.get(container_id)
        container.stop(timeout=10)
        container.remove()
    except DockerException:
        pass
