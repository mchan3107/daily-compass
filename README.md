# Daily Compass

Daily Compass is a personal daily planner I built after realizing I was often focusing too much on one area of my life while neglecting others. I wanted a way to organize my daily tasks while reminding myself that balance across different parts of life is just as important as productivity. The app organizes tasks into five categories: Physical Health, Relationships, Mental Wellbeing, Hobbies & Fun, and School & Career.

**Live demo:** https://dailycompass.onrender.com/ (demo account: `user@example.com` / `password`)
**GitHub:** https://github.com/mchan3107/daily-compass

> The free Render tier spins down after 15 minutes of inactivity. The first request after that can take a moment to wake it up.

## Features

- Public landing page with separate sign in and create account views
- Email/password sign up and sign in, with per-user data
- Today view by default, with previous/next day navigation and a date picker
- Tasks: create, edit, delete, complete, drag-and-drop reorder, and move between categories
- Tasks stay on the day they were created
- Categories can be renamed and reordered (fixed at five for now)
- AI planning guide in a sidebar that can create, edit, complete, reorder, or move tasks on the open day

## Tech Stack

- **Frontend:** Next.js (static export), React, Tailwind CSS, dnd-kit, Vitest + Testing Library, Playwright
- **Backend:** FastAPI (Python), PostgreSQL (Supabase), PBKDF2-SHA256 password hashing, signed session cookies
- **AI:** OpenRouter
- Single Docker container; FastAPI serves the static frontend build and API, with Supabase providing PostgreSQL externally

## Setup

Requires Docker and a PostgreSQL `DATABASE_URL` in a `.env` file at the workspace root (parent of this folder). Add `OPENROUTER_API_KEY` to enable the AI planning guide.

```bash
./scripts/start.sh   # Mac/Linux
scripts\start.ps1     # Windows
```

Open http://127.0.0.1:8080. A demo account is seeded: `user@example.com` / `password`.

Stop with `./scripts/stop.sh` (or `scripts\stop.ps1`).

## Testing

Backend tests are currently being migrated from SQLite to PostgreSQL.

```bash
# Frontend (from frontend/)
npm test          # unit tests
npm run test:e2e  # Playwright end-to-end
```
