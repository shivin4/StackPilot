import pytest

from app.services import local_paths


@pytest.fixture(autouse=True)
def reset_settings(monkeypatch):
    monkeypatch.setenv("HOST_PROJECTS_PATH", "")
    local_paths.settings.host_projects_path = ""


def test_is_git_url():
    assert local_paths.is_git_url("https://github.com/user/repo.git")
    assert local_paths.is_git_url("git@github.com:user/repo.git")
    assert not local_paths.is_git_url("/samples/node-hello")
    assert not local_paths.is_git_url("C:/Users/dev/projects/app")


def test_is_windows_abs_path():
    assert local_paths.is_windows_abs_path(r"C:\Users\dev\app")
    assert local_paths.is_windows_abs_path("C:/Users/dev/app")
    assert not local_paths.is_windows_abs_path("/samples/node-hello")


def test_resolve_unix_samples_path(tmp_path):
    sample = tmp_path / "node-hello"
    sample.mkdir()
    (sample / "Dockerfile").write_text("FROM node:20\n")
    resolved = local_paths.resolve_local_source_path(str(sample))
    assert resolved == str(sample.resolve())


def test_resolve_windows_path_via_mount(monkeypatch, tmp_path):
    host_root = "C:/Users/dev/projects"
    repo_url = "C:/Users/dev/projects/my-app"

    mount = tmp_path / "mount"
    mount.mkdir()
    mounted_app = mount / "my-app"
    mounted_app.mkdir()
    (mounted_app / "Dockerfile").write_text("FROM node:20\n")

    monkeypatch.setattr(local_paths.settings, "host_projects_path", host_root)
    monkeypatch.setattr(local_paths.settings, "host_projects_mount", str(mount))

    resolved = local_paths.resolve_local_source_path(repo_url)
    assert resolved == str(mounted_app.resolve())


def test_windows_path_outside_root_raises(monkeypatch):
    monkeypatch.setattr(
        local_paths.settings, "host_projects_path", "C:/Users/dev/projects"
    )
    monkeypatch.setattr(
        local_paths.settings, "host_projects_mount", "/host-projects"
    )

    with pytest.raises(ValueError, match="HOST_PROJECTS_PATH"):
        local_paths.resolve_local_source_path("C:/Users/dev/elsewhere/my-app")


def test_windows_path_without_env_raises(monkeypatch):
    monkeypatch.setattr(local_paths.settings, "host_projects_path", "")
    with pytest.raises(ValueError, match="HOST_PROJECTS_PATH"):
        local_paths.resolve_local_source_path("C:/Users/dev/my-app")
