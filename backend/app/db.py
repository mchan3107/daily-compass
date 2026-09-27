import json
import os

import psycopg
from psycopg.rows import dict_row

from app.board import (
    DEFAULT_CATEGORIES,
    BadInput,
    NotFound,
    dummy_board,
    empty_board,
    validate_board,
    validate_categories,
)
from app.passwords import hash_password

SEED_EMAIL = "user@example.com"

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
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


class DuplicateEmail(Exception):
    pass


def database_url() -> str:
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        raise RuntimeError("DATABASE_URL is missing")
    return url


def connect() -> psycopg.Connection:
    return psycopg.connect(database_url(), row_factory=dict_row)


def init_db() -> None:
    with connect() as conn:
        conn.execute(SCHEMA)
        _migrate_users(conn)
        count = conn.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"]
        if count == 0:
            _seed(conn)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def is_valid_email(email: str) -> bool:
    if email.count("@") != 1 or " " in email:
        return False
    local, domain = email.split("@")
    return bool(local) and "." in domain


def create_user(email: str, password: str) -> str:
    cleaned = normalize_email(email)
    if not is_valid_email(cleaned):
        raise BadInput("Enter a valid email")
    if len(password) < 8:
        raise BadInput("Password must be at least 8 characters")
    with connect() as conn:
        try:
            conn.execute(
                "INSERT INTO users (email, password_hash) VALUES (%s, %s)",
                (cleaned, hash_password(password)),
            )
        except psycopg.errors.UniqueViolation as exc:
            raise DuplicateEmail("An account with this email already exists") from exc
        user_id = conn.execute(
            "SELECT id FROM users WHERE email = %s", (cleaned,)
        ).fetchone()["id"]
        _insert_categories(conn, user_id)
    return cleaned


def get_user(email: str) -> dict | None:
    cleaned = normalize_email(email)
    with connect() as conn:
        return conn.execute(
            "SELECT id, email, password_hash FROM users WHERE email = %s",
            (cleaned,),
        ).fetchone()


def list_categories(email: str) -> list[dict[str, str]]:
    with connect() as conn:
        user_id = _user_id(conn, email)
        rows = conn.execute(
            """
            SELECT id, label FROM categories
            WHERE user_id = %s
            ORDER BY sort_order
            """,
            (user_id,),
        ).fetchall()
        return [{"id": row["id"], "label": row["label"]} for row in rows]


def replace_categories(email: str, items: object) -> list[dict[str, str]]:
    normalized = validate_categories(items)
    with connect() as conn:
        user_id = _user_id(conn, email)
        for category_id, label, order in normalized:
            conn.execute(
                """
                UPDATE categories
                SET label = %s, sort_order = %s
                WHERE user_id = %s AND id = %s
                """,
                (label, order, user_id, category_id),
            )
        return [{"id": category_id, "label": label} for category_id, label, _ in normalized]


def get_day(email: str, date: str) -> dict:
    with connect() as conn:
        user_id = _user_id(conn, email)
        count = conn.execute(
            "SELECT COUNT(*) AS count FROM days WHERE user_id = %s",
            (user_id,),
        ).fetchone()["count"]
        if count == 0 and normalize_email(email) == SEED_EMAIL:
            board = dummy_board()
            _save_board(conn, user_id, date, board)
            return board
        return _load_board(conn, user_id, date)


def put_day(email: str, date: str, board: object) -> dict:
    cleaned = validate_board(board)
    with connect() as conn:
        user_id = _user_id(conn, email)
        _save_board(conn, user_id, date, cleaned)
        return cleaned


def _migrate_users(conn: psycopg.Connection) -> None:
    columns = [
        row["column_name"]
        for row in conn.execute(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
        )
    ]
    if "username" in columns and "email" not in columns:
        conn.execute("ALTER TABLE users RENAME COLUMN username TO email")
    conn.execute(
        "UPDATE users SET email = %s WHERE email = %s",
        (SEED_EMAIL, "user"),
    )


def _seed(conn: psycopg.Connection) -> None:
    conn.execute(
        "INSERT INTO users (email, password_hash) VALUES (%s, %s)",
        (SEED_EMAIL, hash_password("password")),
    )
    user_id = conn.execute(
        "SELECT id FROM users WHERE email = %s", (SEED_EMAIL,)
    ).fetchone()["id"]
    _insert_categories(conn, user_id)


def _insert_categories(conn: psycopg.Connection, user_id: int) -> None:
    for order, (category_id, label) in enumerate(DEFAULT_CATEGORIES):
        conn.execute(
            """
            INSERT INTO categories (user_id, id, label, sort_order)
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, category_id, label, order),
        )


def _user_id(conn: psycopg.Connection, email: str) -> int:
    row = conn.execute(
        "SELECT id FROM users WHERE email = %s",
        (normalize_email(email),),
    ).fetchone()
    if row is None:
        raise NotFound("User not found")
    return row["id"]


def _load_board(conn: psycopg.Connection, user_id: int, date: str) -> dict:
    row = conn.execute(
        "SELECT board FROM days WHERE user_id = %s AND date = %s",
        (user_id, date),
    ).fetchone()
    if row is None:
        return empty_board()
    return json.loads(row["board"])


def _save_board(
    conn: psycopg.Connection, user_id: int, date: str, board: dict
) -> None:
    payload = json.dumps(board)
    conn.execute(
        """
        INSERT INTO days (user_id, date, board) VALUES (%s, %s, %s)
        ON CONFLICT (user_id, date) DO UPDATE SET board = excluded.board
        """,
        (user_id, date, payload),
    )
