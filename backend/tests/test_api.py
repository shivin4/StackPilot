import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_register_and_login():
    email = f"test-{uuid.uuid4().hex[:8]}@stackpilot.dev"
    password = "testpass123"
    r = client.post("/auth/register", json={"email": email, "password": password})
    assert r.status_code == 200
    r = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert r.status_code == 200
    assert "access_token" in r.json()
