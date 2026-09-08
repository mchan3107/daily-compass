# Backend

FastAPI app served from one Docker container. It serves the statically exported Next.js frontend at `/`, plus the Daily Compass JSON API.

Login is `user` / `password` against the `users` table. The password is stored as a PBKDF2-SHA256 hash. The session cookie is http-only and holds the username.

SQLite file: `backend/data/compass.db` (or `COMPASS_DB`). Created and seeded on startup if missing. Schema: `docs/DATABASE.md`.

## Layout

```
backend/
  app/main.py       FastAPI routes
  app/db.py         SQLite init, seed, queries
  app/board.py      Board JSON shape and dummy seed
  app/passwords.py  Hash and verify
  data/             compass.db (created at runtime)
  static/           Local fallback HTML (Docker overwrites with Next `out/`)
  tests/            pytest, uses a temp SQLite file
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

Authenticated routes (cookie required):

- `GET` / `PUT` `/api/categories`
- `GET` / `PUT` `/api/days/{YYYY-MM-DD}`
- `POST` `/api/days/{YYYY-MM-DD}/move-task`
