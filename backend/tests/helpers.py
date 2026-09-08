from fastapi.testclient import TestClient


def sign_in(client: TestClient) -> TestClient:
    response = client.post(
        "/api/login",
        json={"username": "user", "password": "password"},
    )
    assert response.status_code == 200
    return client
