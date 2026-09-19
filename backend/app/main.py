import hashlib
import hmac
import os
import secrets
from contextlib import asynccontextmanager
from datetime import date
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from pydantic import BaseModel, Field

from app.board import BadInput
from app.db import (
    DuplicateEmail,
    create_user,
    get_day,
    get_user,
    init_db,
    list_categories,
    put_day,
    replace_categories,
)
from app.guide import clear_history, run_turn
from app.openrouter import OpenRouterError
from app.passwords import verify_password

SESSION_COOKIE = "session"
SESSION_SECRET = os.environ.get("COMPASS_SECRET_KEY", secrets.token_hex(32)).encode()

ROOT = Path(__file__).resolve().parent.parent
STATIC_CANDIDATES = [
    ROOT.parent / "frontend" / "out",
    ROOT / "static",
]
STATIC_DIR = next(
    path for path in STATIC_CANDIDATES if (path / "index.html").exists()
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


class AuthBody(BaseModel):
    email: str
    password: str


class CategoryBody(BaseModel):
    id: str
    label: str


class CategoriesBody(BaseModel):
    categories: list[CategoryBody]


class BoardBody(BaseModel):
    board: dict


class ChatBody(BaseModel):
    date: str
    message: str = Field(min_length=1)


def sign_session(email: str) -> str:
    signature = hmac.new(SESSION_SECRET, email.encode(), hashlib.sha256).hexdigest()
    return f"{email}.{signature}"


def verify_session(token: str) -> str | None:
    email, _, signature = token.rpartition(".")
    if not email:
        return None
    expected = hmac.new(SESSION_SECRET, email.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return None
    return email


def session_email(request: Request) -> str | None:
    token = request.cookies.get(SESSION_COOKIE)
    return verify_session(token) if token else None


def is_authenticated(request: Request) -> bool:
    email = session_email(request)
    return bool(email) and get_user(email) is not None


def current_user(request: Request) -> str:
    email = session_email(request)
    if not email or get_user(email) is None:
        raise HTTPException(status_code=401, detail="Not signed in")
    return email


def parse_date(value: str) -> str:
    try:
        date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date") from exc
    return value


@app.get("/api/hello")
def hello() -> dict[str, str]:
    return {"message": "hello world"}


@app.get("/api/session")
def session_status(request: Request) -> dict[str, bool]:
    return {"authenticated": is_authenticated(request)}


@app.post("/api/signup")
def signup(body: AuthBody) -> dict[str, bool]:
    try:
        create_user(body.email, body.password)
    except DuplicateEmail as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except BadInput as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"ok": True}


@app.post("/api/login")
def login(body: AuthBody, response: Response) -> dict[str, bool]:
    user = get_user(body.email)
    if user is None or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    response.set_cookie(
        SESSION_COOKIE,
        sign_session(user["email"]),
        httponly=True,
        samesite="lax",
    )
    return {"ok": True}


@app.post("/api/logout")
def logout(request: Request, response: Response) -> dict[str, bool]:
    email = session_email(request)
    if email:
        clear_history(email)
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}


@app.get("/api/categories")
def read_categories(username: Annotated[str, Depends(current_user)]):
    return {"categories": list_categories(username)}


@app.put("/api/categories")
def write_categories(body: CategoriesBody, username: Annotated[str, Depends(current_user)]):
    try:
        categories = replace_categories(
            username, [item.model_dump() for item in body.categories]
        )
    except BadInput as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"categories": categories}


@app.get("/api/days/{day}")
def read_day(day: str, username: Annotated[str, Depends(current_user)]):
    return {"date": parse_date(day), "board": get_day(username, day)}


@app.put("/api/days/{day}")
def write_day(day: str, body: BoardBody, username: Annotated[str, Depends(current_user)]):
    parse_date(day)
    try:
        board = put_day(username, day, body.board)
    except BadInput as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"date": day, "board": board}


@app.post("/api/chat")
def write_chat(body: ChatBody, username: Annotated[str, Depends(current_user)]):
    parse_date(body.date)
    try:
        return run_turn(username, body.date, body.message)
    except OpenRouterError as exc:
        raise HTTPException(status_code=502, detail="AI is unavailable") from exc


app.frontend("/", directory=STATIC_DIR)
