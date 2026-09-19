# Daily Compass

A personal daily planner. I built it to organize my tasks while keeping the areas of life I care about in view, so for now it's split into five life categories: Physical Health, Relationships, Mental Wellbeing, Hobbies & Fun, and School & Career.

## Features

- Email/password sign up and sign in, with per-user data
- Today view by default, with previous/next day navigation and a date picker
- Tasks: create, edit, delete, complete, drag-and-drop reorder, and move between categories
- Tasks stay on the day they were created
- Categories can be renamed and reordered (fixed at five for now)
- AI planning guide in a sidebar that can create, edit, complete, reorder, or move tasks on the open day

## Tech Stack

- **Frontend:** Next.js (static export), React, Tailwind CSS, dnd-kit, Vitest + Testing Library, Playwright
- **Backend:** FastAPI (Python), SQLite, PBKDF2-SHA256 password hashing, signed session cookies
- **AI:** OpenRouter
- Single Docker container; FastAPI serves the static frontend build and the API

## Setup

Requires Docker and an `OPENROUTER_API_KEY` in a `.env` file at the workspace root (parent of this folder).

```bash
./scripts/start.sh   # Mac/Linux
scripts\start.ps1     # Windows
```

Open http://127.0.0.1:8080. A demo account is seeded: `user@example.com` / `password`.

Stop with `./scripts/stop.sh` (or `scripts\stop.ps1`).

## Testing

```bash
# Backend (from backend/)
uv run pytest

# Frontend (from frontend/)
npm test          # unit tests
npm run test:e2e  # Playwright end-to-end
```
