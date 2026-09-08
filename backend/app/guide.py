import json

from app.board import BadInput, validate_board
from app.db import get_day, list_categories, put_day
from app.openrouter import chat

SYSTEM_PROMPT = """You are Daily Compass, a calm planning guide for one calendar day.
You may prioritize, create, edit, complete, reorder, or move tasks among the five categories on that day only.
You cannot add or delete categories or change other days.

Reply with JSON only, no markdown:
{"reply": "short user-facing guidance", "board": null}
or the same object with "board" set to a full replacement of that day's tasks.
A board must have keys health, relationships, growth, hobbies, career.
Each task must have id, categoryId, title, details, completed.
If you are not changing tasks, set board to null.
"""

_history: dict[str, list[dict[str, str]]] = {}


def reset_history() -> None:
    _history.clear()


def clear_history(username: str) -> None:
    _history.pop(username, None)


def parse_model_text(text: str) -> tuple[str, dict | None]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```json").removeprefix("```").strip()
        if cleaned.endswith("```"):
            cleaned = cleaned[: -3].strip()
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        return text.strip(), None
    if not isinstance(data, dict):
        return text.strip(), None
    reply = data.get("reply")
    if not isinstance(reply, str) or not reply.strip():
        reply = text.strip()
    else:
        reply = reply.strip()
    board = data.get("board")
    if board is None:
        return reply, None
    try:
        return reply, validate_board(board)
    except BadInput:
        return reply, None


def run_turn(username: str, date: str, message: str) -> dict:
    categories = list_categories(username)
    board = get_day(username, date)
    user_text = json.dumps(
        {
            "date": date,
            "categories": categories,
            "board": board,
            "question": message,
        }
    )
    past = list(_history.get(username, []))
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *past,
        {"role": "user", "content": user_text},
    ]
    raw = chat(messages)
    reply, next_board = parse_model_text(raw)
    saved = None
    if next_board is not None:
        saved = put_day(username, date, next_board)
    past.append({"role": "user", "content": user_text})
    past.append({"role": "assistant", "content": reply})
    _history[username] = past
    return {"reply": reply, "board": saved}
