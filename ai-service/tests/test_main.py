from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_extract_validation() -> None:
    assert client.post("/extract").status_code == 422
    assert client.post("/extract", files={"image": ("x.txt", b"x", "text/plain")}).status_code == 415
