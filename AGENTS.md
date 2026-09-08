# Daily Compass MVP web app

## Business Requirements

This project is building a personal daily planning app. Key features:

- A user can sign in
- When signed in, the user sees Today by default
- The user can open other days with previous/next day navigation and a date picker
- Each day contains tasks organized into life categories
- There are exactly five categories. The default names are Health / Exercise, Relationships, Personal Growth, Hobbies, and School / Career
- Tasks can be created, edited, deleted, completed, reordered, and moved between categories with drag and drop
- Tasks stay on the day they were created
- Categories can be renamed and reordered. Categories cannot be added or deleted in the MVP
- There is an AI chat feature in a sidebar; the AI can create / edit / complete / reorder / move one or more tasks within the open day

## Limitations

Users sign up and sign in with email and password (at least 8 characters). Passwords are stored as PBKDF2-SHA256 hashes. Each user only sees their own categories and days. A demo account `user@example.com` / `password` is seeded for local use.

For the MVP, unfinished tasks will not automatically roll over to the next day.

For the MVP, the AI only works with the currently open day.

For the MVP, AI conversation history is session-only and is not stored in the database.

For the MVP, this will run locally in a Docker container.

## Technical Decisions

- NextJS frontend, statically exported
- Python FastAPI backend, including serving the static NextJS site at `/`
- One Docker container only. Do not use a separate frontend container or `next start`
- Use `uv` as the package manager for Python in the Docker container
- Use OpenRouter for the AI calls. An `OPENROUTER_API_KEY` is in `.env` in the project root
- Use `nvidia/nemotron-3-ultra-550b-a55b:free` as the model
- AI returns a user-facing reply plus an optional full replacement of the currently open day's data. Do not use patches
- Automated tests mock OpenRouter except for one real connectivity check
- Use SQLite local database for the database, creating a new db if it doesn't exist
- Seed a small set of dummy tasks for the fake user across the five life categories
- Auth is an http-only session cookie. Signup and login use email plus a hashed password against SQLite.
- Use drag and drop for reordering tasks and moving tasks between categories
- Start and Stop server scripts for Mac, PC, Linux in `scripts/`

## Starting Point

A working MVP of the frontend has already been built and is in `frontend`. Build on the existing frontend rather than recreating it.

## Color Scheme

Keep the existing Daily Compass look. Do not switch to the old Kanban yellow / blue / purple palette.

- Cream: `#f6f0e6` - page background
- Cream Dark: `#ebe2d2` - secondary background
- Forest: `#2f4a3c` - headings, primary actions
- Sage: `#8fa084` - borders, muted controls
- Sage Soft: `#d8e0d0` - category columns
- Gold: `#c6a65a` - accent lines, highlights, drop targets
- Clay: `#c47a5a` - delete actions, checkbox accent
- Warm Gray: `#6f675e` - supporting text, labels
- Paper: `#fffbf4` - cards and forms

Fonts: Fraunces for headings, Source Sans 3 for body text.

## Coding standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever
4. When hitting issues, always identify root cause before trying a fix. Do not guess. Prove with evidence, then fix the root cause.

## Working documentation

All documents for planning and executing this project will be in the docs/ directory.
Please review the docs/PLAN.md document before proceeding.