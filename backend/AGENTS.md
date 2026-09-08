# Backend

FastAPI app served from one Docker container. It serves the statically exported Next.js frontend at `/`, `GET /api/hello`, and a cookie session at `/api/login`, `/api/logout`, and `/api/session`.

Hardcoded credentials: `user` / `password`. The session cookie is http-only.

## Layout

```
backend/
  app/main.py       FastAPI app
  static/           Local fallback HTML (Docker overwrites with Next `out/`)
  tests/            pytest
  pyproject.toml
  uv.lock
```

Install and test from `backend/`:

```
uv sync
uv run pytest
```

The Docker image lives at the repo root (`dc/Dockerfile`). It builds the frontend export, copies it to `/app/static`, and starts uvicorn on port 8000. Host port is 8080.

API routes must be declared before `app.frontend(...)`.
