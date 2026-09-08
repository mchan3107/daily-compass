from tests.helpers import sign_in


def test_session_is_logged_out_by_default(client):
    response = client.get("/api/session")
    assert response.status_code == 200
    assert response.json() == {"authenticated": False}


def test_login_sets_httponly_session_cookie(client):
    response = client.post(
        "/api/login",
        json={"username": "user", "password": "password"},
    )
    assert response.status_code == 200
    cookie = response.headers["set-cookie"].lower()
    assert "session=" in cookie
    assert "httponly" in cookie
    assert client.get("/api/session").json() == {"authenticated": True}


def test_login_rejects_bad_credentials(client):
    response = client.post(
        "/api/login",
        json={"username": "user", "password": "wrong"},
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
        json={"username": "nope", "password": "password"},
    )
    assert response.status_code == 401
