import sqlite3

from app.db import db_path, init_db
from app.passwords import verify_password
from tests.helpers import sign_in


def test_init_creates_and_seeds_database(tmp_path, monkeypatch):
    monkeypatch.setenv("COMPASS_DB", str(tmp_path / "compass.db"))
    init_db()

    path = db_path()
    assert path.exists()
    conn = sqlite3.connect(path)
    username, password_hash = conn.execute(
        "SELECT username, password_hash FROM users"
    ).fetchone()
    assert username == "user"
    assert password_hash != "password"
    assert verify_password("password", password_hash)

    category_ids = [
        row[0]
        for row in conn.execute(
            "SELECT id FROM categories WHERE user_id = 1 ORDER BY sort_order"
        )
    ]
    assert category_ids == [
        "health",
        "relationships",
        "growth",
        "hobbies",
        "career",
    ]
    day_count = conn.execute("SELECT COUNT(*) FROM days").fetchone()[0]
    assert day_count == 0
    conn.close()


def test_init_does_not_reseed_existing_database(client):
    sign_in(client)
    renamed = [
        {"id": "health", "label": "Body"},
        {"id": "relationships", "label": "Relationships"},
        {"id": "growth", "label": "Personal Growth"},
        {"id": "hobbies", "label": "Hobbies"},
        {"id": "career", "label": "School / Career"},
    ]
    assert (
        client.put("/api/categories", json={"categories": renamed}).status_code
        == 200
    )

    init_db()
    labels = [row["label"] for row in client.get("/api/categories").json()["categories"]]
    assert labels[0] == "Body"
