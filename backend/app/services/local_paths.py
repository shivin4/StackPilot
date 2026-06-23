"""Resolve local filesystem paths for deployments (host PC dirs → container mount)."""

from __future__ import annotations

import re
from pathlib import Path

from app.config import settings

_WINDOWS_ABS = re.compile(r"^[A-Za-z]:[/\\]")
_GIT_PREFIXES = ("http://", "https://", "git://", "ssh://", "git@")


def normalize_slashes(path: str) -> str:
    return path.strip().replace("\\", "/").rstrip("/")


def is_git_url(repo_url: str) -> bool:
    u = repo_url.strip()
    if any(u.startswith(prefix) for prefix in _GIT_PREFIXES):
        return True
    if u.endswith(".git"):
        return True
    return False


def is_windows_abs_path(path: str) -> bool:
    return bool(_WINDOWS_ABS.match(path.strip()))


def is_unix_abs_path(path: str) -> bool:
    u = path.strip()
    return u.startswith("/") and not is_git_url(u)


def is_relative_local_path(path: str) -> bool:
    u = path.strip()
    return u.startswith("./") or u.startswith("../")


def looks_like_local_path(repo_url: str) -> bool:
    u = repo_url.strip()
    if not u:
        return False
    return (
        is_windows_abs_path(u)
        or is_unix_abs_path(u)
        or is_relative_local_path(u)
    )


def _path_exists(path: str) -> bool:
    return Path(path).exists()


def _resolve_through_mount(repo_url: str) -> str:
    mount = settings.host_projects_mount.rstrip("/")
    root = normalize_slashes(settings.host_projects_path or "")
    if not root:
        raise ValueError(
            "Local PC paths need HOST_PROJECTS_PATH in .env (maps your projects folder "
            "into the API container). Example: HOST_PROJECTS_PATH=C:/Users/you/Desktop/projects"
        )

    normalized = normalize_slashes(repo_url)
    rel: str

    if is_windows_abs_path(repo_url):
        root_key = root.lower()
        path_key = normalized.lower()
        if not path_key.startswith(root_key):
            raise ValueError(
                f"Path must be inside HOST_PROJECTS_PATH ({root}). Got: {repo_url}"
            )
        rel = normalized[len(root) :].lstrip("/")
    elif is_relative_local_path(repo_url):
        rel = normalized.lstrip("./")
    else:
        rel = normalized.lstrip("/")

    container_path = f"{mount}/{rel}" if rel else mount
    if not _path_exists(container_path):
        raise FileNotFoundError(
            f"Local project not found at {container_path}. "
            f"Set HOST_PROJECTS_PATH={root} in .env, restart with "
            f"'docker compose up --build', then use a path under that folder."
        )
    return str(Path(container_path).resolve())


def resolve_local_source_path(repo_url: str) -> str | None:
    """
    Return an absolute path to local source, or None if repo_url is a git remote.
    """
    raw = repo_url.strip()
    if not raw or is_git_url(raw):
        return None

    if not looks_like_local_path(raw):
        return None

    # Native path (API on host, or paths already inside the container e.g. /samples/...)
    direct = Path(raw)
    if direct.exists():
        return str(direct.resolve())

    if is_windows_abs_path(raw) or is_relative_local_path(raw):
        return _resolve_through_mount(raw)

    if is_unix_abs_path(raw):
        raise FileNotFoundError(f"Path not found: {repo_url}")

    return None
