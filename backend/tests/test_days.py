from tests.helpers import sign_in

DATE = "2026-09-07"
OTHER = "2026-09-08"

SAMPLE_BOARD = {
    "health": [
        {
            "id": "t1",
            "categoryId": "health",
            "title": "Stretch",
            "details": "Easy",
            "completed": True,
        }
    ],
    "relationships": [],
    "growth": [],
    "hobbies": [],
    "career": [],
}


def test_days_require_session(client):
    assert client.get(f"/api/days/{DATE}").status_code == 401
    assert client.put(f"/api/days/{DATE}", json={"board": SAMPLE_BOARD}).status_code == 401
    assert (
        client.post(
            f"/api/days/{DATE}/move-task",
            json={"taskId": "t1", "toDate": OTHER},
        ).status_code
        == 401
    )


def test_first_day_get_seeds_dummy_on_requested_date(client):
    sign_in(client)
    response = client.get(f"/api/days/{DATE}")
    assert response.status_code == 200
    board = response.json()["board"]
    for key in ("health", "relationships", "growth", "hobbies", "career"):
        assert len(board[key]) > 0
    titles = [task["title"] for task in board["health"]]
    assert "Morning stretch" in titles

    other = client.get(f"/api/days/{OTHER}").json()["board"]
    assert other["health"] == []
    assert other["career"] == []


def test_put_day_round_trips_tasks(client):
    sign_in(client)
    put = client.put(f"/api/days/{DATE}", json={"board": SAMPLE_BOARD})
    assert put.status_code == 200
    board = client.get(f"/api/days/{DATE}").json()["board"]
    assert board["health"][0]["title"] == "Stretch"
    assert board["health"][0]["completed"] is True
    assert board["health"][0]["id"] == "t1"


def test_put_day_rejects_unknown_category(client):
    sign_in(client)
    bad = {**SAMPLE_BOARD, "extra": []}
    assert client.put(f"/api/days/{DATE}", json={"board": bad}).status_code == 400


def test_move_task_to_another_date(client):
    sign_in(client)
    client.get(f"/api/days/{DATE}")
    response = client.post(
        f"/api/days/{DATE}/move-task",
        json={"taskId": "health-1", "toDate": OTHER},
    )
    assert response.status_code == 200

    source = client.get(f"/api/days/{DATE}").json()["board"]
    target = client.get(f"/api/days/{OTHER}").json()["board"]
    assert not any(task["id"] == "health-1" for task in source["health"])
    assert any(task["id"] == "health-1" for task in target["health"])


def test_move_missing_task_is_not_found(client):
    sign_in(client)
    client.get(f"/api/days/{DATE}")
    response = client.post(
        f"/api/days/{DATE}/move-task",
        json={"taskId": "missing", "toDate": OTHER},
    )
    assert response.status_code == 404
