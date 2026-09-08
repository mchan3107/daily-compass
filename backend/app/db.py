import json
import os
import sqlite3
from pathlib import Path

from app.board import (
    CATEGORY_IDS,
    DEFAULT_CATEGORIES,
    BadInput,
    NotFound,
    dummy_board,
    empty_board,
    validate_board,
    validate_categories,
)
from app.passwords import hash_password

DEFAULT_DB = Path(__file__).resolve().parent.parent / "data" / "compass.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    user_id INTEGER NOT NULL,
    id TEXT NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    PRIMARY KEY (user_id, id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS days (
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    board TEXT NOT NULL,
    PRIMARY KEY (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""


def db_path() -> Path:
    return Path(os.environ.get("COMPASS_DB", DEFAULT_DB))


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    path = db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    with connect() as conn:
        conn.executescript(SCHEMA)
        count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if count == 0:
            _seed(conn)


def get_user(username: str) -> sqlite3.Row | None:
    with connect() as conn:
        return conn.execute(
            "SELECT id, username, password_hash FROM users WHERE username = ?",
            (username,),
        ).fetchone()


def list_categories(username: str) -> list[dict[str, str]]:
    with connect() as conn:
        user_id = _user_id(conn, username)
        rows = conn.execute(
            """
            SELECT id, label FROM categories
            WHERE user_id = ?
            ORDER BY sort_order
            """,
            (user_id,),
        ).fetchall()
        return [{"id": row["id"], "label": row["label"]} for row in rows]


def replace_categories(username: str, items: object) -> list[dict[str, str]]:
    normalized = validate_categories(items)
    with connect() as conn:
        user_id = _user_id(conn, username)
        for category_id, label, order in normalized:
            conn.execute(
                """
                UPDATE categories
                SET label = ?, sort_order = ?
                WHERE user_id = ? AND id = ?
                """,
                (label, order, user_id, category_id),
            )
        return [{"id": category_id, "label": label} for category_id, label, _ in normalized]


def get_day(username: str, date: str) -> dict:
    with connect() as conn:
        user_id = _user_id(conn, username)
        count = conn.execute(
            "SELECT COUNT(*) FROM days WHERE user_id = ?",
            (user_id,),
        ).fetchone()[0]
        if count == 0:
            board = dummy_board()
            _save_board(conn, user_id, date, board)
            return board
        return _load_board(conn, user_id, date)


def put_day(username: str, date: str, board: object) -> dict:
    cleaned = validate_board(board)
    with connect() as conn:
        user_id = _user_id(conn, username)
        _save_board(conn, user_id, date, cleaned)
        return cleaned


def move_task(username: str, from_date: str, task_id: str, to_date: str) -> None:
    if from_date == to_date:
        return
    with connect() as conn:
        user_id = _user_id(conn, username)
        source = _load_board(conn, user_id, from_date)
        moving = None
        from_category = None
        for category_id in CATEGORY_IDS:
            for task in source[category_id]:
                if task["id"] == task_id:
                    moving = task
                    from_category = category_id
                    break
            if moving is not None:
                break
        if moving is None or from_category is None:
            raise NotFound("Task not found")
        source[from_category] = [
            task for task in source[from_category] if task["id"] != task_id
        ]
        target = _load_board(conn, user_id, to_date)
        target[from_category] = [*target[from_category], moving]
        _save_board(conn, user_id, from_date, source)
        _save_board(conn, user_id, to_date, target)


def _seed(conn: sqlite3.Connection) -> None:
    conn.execute(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        ("user", hash_password("password")),
    )
    user_id = conn.execute("SELECT id FROM users WHERE username = ?", ("user",)).fetchone()[
        0
    ]
    for order, (category_id, label) in enumerate(DEFAULT_CATEGORIES):
        conn.execute(
            """
            INSERT INTO categories (user_id, id, label, sort_order)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, category_id, label, order),
        )


def _user_id(conn: sqlite3.Connection, username: str) -> int:
    row = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if row is None:
        raise NotFound("User not found")
    return row["id"]


def _load_board(conn: sqlite3.Connection, user_id: int, date: str) -> dict:
    row = conn.execute(
        "SELECT board FROM days WHERE user_id = ? AND date = ?",
        (user_id, date),
    ).fetchone()
    if row is None:
        return empty_board()
    return json.loads(row["board"])


def _save_board(
    conn: sqlite3.Connection, user_id: int, date: str, board: dict
) -> None:
    payload = json.dumps(board)
    conn.execute(
        """
        INSERT INTO days (user_id, date, board) VALUES (?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET board = excluded.board
        """,
        (user_id, date, payload),
    )
