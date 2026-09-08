from fastapi.testclient import TestClient


SEED_EMAIL = "user@example.com"
SEED_PASSWORD = "password"


def sign_in(client: TestClient) -> TestClient:
    response = client.post(
        "/api/login",
        json={"email": SEED_EMAIL, "password": SEED_PASSWORD},
    )
    assert response.status_code == 200
    return client


def sign_up(client: TestClient, email: str, password: str = "password1"):
    return client.post("/api/signup", json={"email": email, "password": password})
