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
    email, password_hash = conn.execute(
        "SELECT email, password_hash FROM users"
    ).fetchone()
    assert email == "user@example.com"
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


def test_init_renames_legacy_username_column(tmp_path, monkeypatch):
    path = tmp_path / "legacy.db"
    monkeypatch.setenv("COMPASS_DB", str(path))
    conn = sqlite3.connect(path)
    conn.executescript(
        """
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        );
        CREATE TABLE categories (
            user_id INTEGER NOT NULL,
            id TEXT NOT NULL,
            label TEXT NOT NULL,
            sort_order INTEGER NOT NULL,
            PRIMARY KEY (user_id, id)
        );
        CREATE TABLE days (
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            board TEXT NOT NULL,
            PRIMARY KEY (user_id, date)
        );
        """
    )
    conn.execute(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        ("user", "salt:hash"),
    )
    conn.commit()
    conn.close()

    init_db()
    conn = sqlite3.connect(path)
    columns = [row[1] for row in conn.execute("PRAGMA table_info(users)")]
    assert "email" in columns
    assert "username" not in columns
    email = conn.execute("SELECT email FROM users").fetchone()[0]
    assert email == "user@example.com"
    conn.close()
