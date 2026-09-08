import json

import pytest

from app.board import dummy_board
from app.guide import reset_history
from tests.helpers import sign_in

DATE = "2026-09-07"


@pytest.fixture(autouse=True)
def _clear_history():
    reset_history()
    yield
    reset_history()


def _added_water_board():
    board = dummy_board()
    board["health"].append(
        {
            "id": "health-new",
            "categoryId": "health",
            "title": "Drink water",
            "details": "A full glass.",
            "completed": False,
        }
    )
    return board


def test_chat_requires_session(client):
    response = client.post(
        "/api/chat",
        json={"date": DATE, "message": "Hello"},
    )
    assert response.status_code == 401


def test_chat_without_board_change_leaves_day_alone(client, monkeypatch):
    def fake_chat(messages):
        assert messages[0]["role"] == "system"
        assert "planning guide" in messages[0]["content"].lower()
        return json.dumps({"reply": "Keep the morning stretch first.", "board": None})

    monkeypatch.setattr("app.guide.chat", fake_chat)
    sign_in(client)
    client.get(f"/api/days/{DATE}")

    response = client.post(
        "/api/chat",
        json={"date": DATE, "message": "What should I do first?"},
    )
    assert response.status_code == 200
    assert response.json()["reply"] == "Keep the morning stretch first."
    assert response.json()["board"] is None

    board = client.get(f"/api/days/{DATE}").json()["board"]
    titles = [task["title"] for task in board["health"]]
    assert "Morning stretch" in titles
    assert "Drink water" not in titles


def test_chat_persists_valid_board_replacement(client, monkeypatch):
    next_board = _added_water_board()

    def fake_chat(_messages):
        return json.dumps(
            {"reply": "I added a water break.", "board": next_board}
        )

    monkeypatch.setattr("app.guide.chat", fake_chat)
    sign_in(client)
    client.get(f"/api/days/{DATE}")

    response = client.post(
        "/api/chat",
        json={"date": DATE, "message": "Add a water break."},
    )
    assert response.status_code == 200
    assert response.json()["reply"] == "I added a water break."
    assert any(
        task["title"] == "Drink water"
        for task in response.json()["board"]["health"]
    )

    stored = client.get(f"/api/days/{DATE}").json()["board"]
    assert any(task["title"] == "Drink water" for task in stored["health"])
    other = client.get("/api/days/2026-09-08").json()["board"]
    assert other["health"] == []


def test_chat_ignores_malformed_board(client, monkeypatch):
    def fake_chat(_messages):
        return json.dumps({"reply": "Oops.", "board": {"health": []}})

    monkeypatch.setattr("app.guide.chat", fake_chat)
    sign_in(client)
    client.get(f"/api/days/{DATE}")

    response = client.post(
        "/api/chat",
        json={"date": DATE, "message": "Clear everything."},
    )
    assert response.status_code == 200
    assert response.json()["reply"] == "Oops."
    assert response.json()["board"] is None

    stored = client.get(f"/api/days/{DATE}").json()["board"]
    assert any(task["title"] == "Morning stretch" for task in stored["health"])


def test_chat_includes_history_on_follow_up(client, monkeypatch):
    calls = []

    def fake_chat(messages):
        calls.append(messages)
        return json.dumps({"reply": f"turn-{len(calls)}", "board": None})

    monkeypatch.setattr("app.guide.chat", fake_chat)
    sign_in(client)
    client.get(f"/api/days/{DATE}")

    client.post("/api/chat", json={"date": DATE, "message": "First question"})
    client.post("/api/chat", json={"date": DATE, "message": "Second question"})

    assert len(calls) == 2
    follow_up = calls[1]
    assert follow_up[0]["role"] == "system"
    roles = [item["role"] for item in follow_up]
    assert roles.count("user") == 2
    assert "First question" in follow_up[1]["content"]
    assert follow_up[2] == {"role": "assistant", "content": "turn-1"}
    assert "Second question" in follow_up[3]["content"]


def test_logout_clears_chat_history(client, monkeypatch):
    calls = []

    def fake_chat(messages):
        calls.append(messages)
        return json.dumps({"reply": "ok", "board": None})

    monkeypatch.setattr("app.guide.chat", fake_chat)
    sign_in(client)
    client.post("/api/chat", json={"date": DATE, "message": "Remember this"})
    client.post("/api/logout")
    sign_in(client)
    client.post("/api/chat", json={"date": DATE, "message": "New session"})

    assert len(calls[1]) == 2
    assert "Remember this" not in json.dumps(calls[1])
