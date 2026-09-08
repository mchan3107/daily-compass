from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response
from pydantic import BaseModel

SESSION_COOKIE = "session"
SESSION_VALUE = "user"

ROOT = Path(__file__).resolve().parent.parent
STATIC_CANDIDATES = [
    ROOT.parent / "frontend" / "out",
    ROOT / "static",
]
STATIC_DIR = next(
    path for path in STATIC_CANDIDATES if (path / "index.html").exists()
)

app = FastAPI()


class LoginBody(BaseModel):
    username: str
    password: str


def is_authenticated(request: Request) -> bool:
    return request.cookies.get(SESSION_COOKIE) == SESSION_VALUE


@app.get("/api/hello")
def hello() -> dict[str, str]:
    return {"message": "hello world"}


@app.get("/api/session")
def session_status(request: Request) -> dict[str, bool]:
    return {"authenticated": is_authenticated(request)}


@app.post("/api/login")
def login(body: LoginBody, response: Response) -> dict[str, bool]:
    if body.username != "user" or body.password != "password":
        raise HTTPException(status_code=401, detail="Invalid username or password")
    response.set_cookie(
        SESSION_COOKIE,
        SESSION_VALUE,
        httponly=True,
        samesite="lax",
    )
    return {"ok": True}


@app.post("/api/logout")
def logout(response: Response) -> dict[str, bool]:
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}


app.frontend("/", directory=STATIC_DIR)
