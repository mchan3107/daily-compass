from tests.helpers import SEED_EMAIL, SEED_PASSWORD, sign_in, sign_up


def test_session_is_logged_out_by_default(client):
    response = client.get("/api/session")
    assert response.status_code == 200
    assert response.json() == {"authenticated": False}


def test_login_sets_httponly_session_cookie(client):
    response = client.post(
        "/api/login",
        json={"email": SEED_EMAIL, "password": SEED_PASSWORD},
    )
    assert response.status_code == 200
    cookie = response.headers["set-cookie"].lower()
    assert "session=" in cookie
    assert "httponly" in cookie
    assert client.get("/api/session").json() == {"authenticated": True}


def test_login_rejects_bad_credentials(client):
    response = client.post(
        "/api/login",
        json={"email": SEED_EMAIL, "password": "wrong"},
    )
    assert response.status_code == 401
    assert client.get("/api/session").json() == {"authenticated": False}


def test_logout_clears_session(client):
    sign_in(client)
    response = client.post("/api/logout")
    assert response.status_code == 200
    assert client.get("/api/session").json() == {"authenticated": False}


def test_unknown_user_is_rejected(client):
    response = client.post(
        "/api/login",
        json={"email": "nope@example.com", "password": SEED_PASSWORD},
    )
    assert response.status_code == 401


def test_signup_creates_account_without_signing_in(client):
    response = sign_up(client, "new@example.com")
    assert response.status_code == 200
    assert "set-cookie" not in response.headers
    assert client.get("/api/session").json() == {"authenticated": False}

    login = client.post(
        "/api/login",
        json={"email": "new@example.com", "password": "password1"},
    )
    assert login.status_code == 200
    assert client.get("/api/session").json() == {"authenticated": True}


def test_signup_rejects_short_password(client):
    response = sign_up(client, "short@example.com", "1234567")
    assert response.status_code == 400
    assert "8" in response.json()["detail"]
    assert client.get("/api/session").json() == {"authenticated": False}


def test_signup_rejects_invalid_email(client):
    response = sign_up(client, "not-an-email", "password1")
    assert response.status_code == 400
    assert client.get("/api/session").json() == {"authenticated": False}


def test_signup_rejects_duplicate_email(client):
    assert sign_up(client, "dup@example.com").status_code == 200
    response = sign_up(client, "Dup@example.com")
    assert response.status_code == 409


def test_users_cannot_see_each_others_days(client):
    sign_in(client)
    client.put(
        "/api/days/2026-09-07",
        json={
            "board": {
                "health": [
                    {
                        "id": "a1",
                        "categoryId": "health",
                        "title": "User A secret",
                        "details": "",
                        "completed": False,
                    }
                ],
                "relationships": [],
                "growth": [],
                "hobbies": [],
                "career": [],
            }
        },
    )
    client.post("/api/logout")

    assert sign_up(client, "other@example.com").status_code == 200
    login = client.post(
        "/api/login",
        json={"email": "other@example.com", "password": "password1"},
    )
    assert login.status_code == 200
    board = client.get("/api/days/2026-09-07").json()["board"]
    titles = [task["title"] for bucket in board.values() for task in bucket]
    assert "User A secret" not in titles
    assert "Morning stretch" not in titles

    client.put(
        "/api/days/2026-09-07",
        json={
            "board": {
                "health": [
                    {
                        "id": "b1",
                        "categoryId": "health",
                        "title": "User B secret",
                        "details": "",
                        "completed": False,
                    }
                ],
                "relationships": [],
                "growth": [],
                "hobbies": [],
                "career": [],
            }
        },
    )
    client.post("/api/logout")

    sign_in(client)
    again = client.get("/api/days/2026-09-07").json()["board"]
    again_titles = [task["title"] for bucket in again.values() for task in bucket]
    assert "User A secret" in again_titles
    assert "User B secret" not in again_titles
