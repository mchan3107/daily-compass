# Daily Compass plan

Decisions locked after review of `AGENTS.md`:

- Today is the default screen. Previous/next day and a date picker open other days. Tasks stay on their original day unless explicitly moved.
- Exactly five categories. Rename and reorder in the UI. No add or delete.
- Keep the existing cream / forest / sage / gold look.
- Part 4 uses a simple session/cookie gate (`user` / `password`). Connect it to SQLite later.
- One Docker container. FastAPI serves the statically exported Next.js app at `/`. No `next start`.
- AI chat history is session-only. The model may return a full replacement of the open day's data. One real OpenRouter "2+2" check; other tests mock the AI.
- Seed a small dummy-task set for the fake user across the five categories.

Do not start a part until the previous part is done. Part 5 schema work needs user sign-off before implementation. Part 1 needs user approval before Part 2.

The `OPENROUTER_API_KEY` lives in `.env` at the workspace root (parent of `dc/`). Scripts and Docker should read that file.

---

## Part 1: Plan

- [x] Enrich this document with checklists, tests, and success criteria
- [x] Write `frontend/AGENTS.md` describing the existing frontend
- [x] Update root `AGENTS.md` color scheme and locked MVP decisions
- [x] User approves this plan before Part 2

**Tests / success criteria**

- Plan covers Parts 2–10 with checklists and success criteria
- `frontend/AGENTS.md` describes stack, data model, components, and tests
- User has approved the plan in chat

---

## Part 2: Scaffolding

Set up one Dockerized FastAPI app that serves a hello-world page and a tiny API.

- [x] Add `backend/` FastAPI app using `uv`
- [x] Serve a small static HTML page at `/` ("hello world")
- [x] Add a simple JSON route (for example `GET /api/hello`)
- [x] Add a `Dockerfile` that installs Python with `uv` and runs the API
- [x] Add Mac/Linux start and stop scripts in `scripts/`
- [x] Add Windows start and stop scripts in `scripts/`
- [x] Scripts build the image, run one container, pass through `.env`, and stop/remove that container
- [x] Document how to start and stop in a short root or `scripts` README note
- [x] Update `backend/AGENTS.md` with the backend layout

**Tests / success criteria**

- Backend unit test: `/api/hello` returns the expected JSON
- `scripts/start` brings the container up; `GET /` returns the hello-world HTML; `GET /api/hello` returns JSON
- `scripts/stop` stops the container
- Only one container is used
- App is reachable locally after start on http://127.0.0.1:8080

---

## Part 3: Add in Frontend

Point FastAPI at a static Next.js export and extend the existing Today UI.

- [x] Configure Next.js static export (`output: 'export'`) without breaking the current look
- [x] Docker/build copies the export into the backend static directory; FastAPI serves it at `/`
- [x] `/` shows Daily Compass, not the hello-world page
- [x] Keep dummy in-memory data for now
- [x] Add previous/next day controls and a date picker; default to Today
- [x] Other days start empty in local state; dummy tasks live on Today
- [x] Add a simple way to move a task to another date in local state
- [x] Allow renaming the five categories in local state
- [x] Allow reordering the five categories in local state
- [x] Do not add or delete categories
- [x] Keep existing task CRUD, complete, and drag-and-drop
- [x] Expand frontend unit tests for day navigation, move-to-date, rename, and reorder
- [x] Expand Playwright coverage for the same flows
- [x] Point Playwright at the Docker-served app when that is the real target, or keep a documented local path if export is tested in Docker

**Tests / success criteria**

- Unit tests cover task helpers plus category rename/reorder and per-day local state
- Playwright: Today loads with five categories and dummy tasks
- Playwright: prev/next and date picker change the visible day; Today remains the default
- Playwright: rename a category; reorder categories; both persist across a day change in the same session
- Playwright: move a task to another date; it leaves Today and appears on that date
- Existing add/edit/complete/delete/drag tests still pass
- After `scripts/start`, opening `/` in the browser shows Daily Compass

---

## Part 4: Fake user sign in

Gate the app behind dummy credentials before the database exists.

- [x] Unauthenticated visit to `/` shows a simple login screen in the same visual language
- [x] Accept only `user` / `password`
- [x] Set a session cookie on success and show Daily Compass
- [x] Reject bad credentials with a clear error
- [x] Add log out on the signed-in screen; log out returns to login
- [x] Keep auth server-side on FastAPI (cookie session). Do not invent a frontend-only "secret"
- [x] Backend unit tests for login, logout, and rejected credentials
- [x] Frontend/Playwright tests for login, bad password, logout

**Tests / success criteria**

- `/` without a session shows login, not the board
- `user` / `password` signs in and shows Daily Compass
- Wrong password stays on login with an error
- Log out clears the session
- Session cookie is http-only

---

## Part 5: Database modeling

Propose the SQLite schema. Do not implement it until the user signs off.

- [x] Write `docs/DATABASE.md` with tables, columns, JSON usage, and seed plan
- [x] Cover users, user life categories, calendar days, and tasks
- [x] Keep task/day data simple; use JSON where it avoids extra tables
- [x] Support multiple users in the schema even though MVP login is one hardcoded user
- [x] Describe how a day is loaded/saved and how moving a task to another date works
- [x] Describe the small dummy seed for the fake user
- [x] Wait for user sign-off before Part 6

Suggested shape to refine in `docs/DATABASE.md` (not final until sign-off):

- `users`: id, username, password hash (or placeholder for the dummy user)
- `categories`: user_id, stable id (`health`, …), label, sort order — always five rows per user
- `days`: user_id, date, JSON board payload (tasks grouped by category, including order and completion)

**Tests / success criteria**

- `docs/DATABASE.md` is written and reviewed
- Schema can represent users, five ordered categories, and per-day task boards
- User has approved the schema in chat

---

## Part 6: Backend

Implement the signed-off schema and Daily Compass API.

- [x] Create the SQLite database automatically if missing
- [x] Seed the dummy user and dummy Today tasks on first create
- [x] Session login checks the users table (still `user` / `password`)
- [x] `GET` / `PUT` the open day for the signed-in user
- [x] `GET` / `PUT` the user's five categories (rename + reorder only)
- [x] Move a task between categories (or include that in the day save)
- [x] Move a task to another date
- [x] All mutating routes require a valid session
- [x] Backend unit tests with a temp SQLite file, no Docker required for the unit suite

**Tests / success criteria**

- Missing DB is created and seeded
- Load/save day round-trips tasks, completion, and order
- Category rename/reorder persist; adding/removing a category is rejected
- Moving a task to another date removes it from the source day and adds it to the target day
- Unauthenticated API calls fail
- Seed data covers all five categories

---

## Part 7: Frontend + Backend

Replace dummy local data with the API.

- [ ] Load the open day and categories from the API after login
- [ ] Persist task create/edit/delete/complete/reorder/move-category
- [ ] Persist category rename/reorder
- [ ] Persist day navigation (load that date's board)
- [ ] Persist move-to-another-date
- [ ] Keep UI behavior from Part 3
- [ ] Unit tests for the API client
- [ ] Playwright against the running Docker app: login, edit a task, reload, data still there; rename category and reload; change day and back

**Tests / success criteria**

- Refresh after edits still shows the same tasks, completion, order, and category names
- Dummy seed appears for the fake user on first run
- Day navigation loads the correct day's tasks from the server
- Frontend no longer depends on `dummy-tasks` for the live app (seed lives in the backend)

---

## Part 8: AI connectivity

Prove OpenRouter works from the backend.

- [ ] Read `OPENROUTER_API_KEY` from the environment
- [ ] Backend helper that calls OpenRouter with `nvidia/nemotron-3-ultra-550b-a55b:free`
- [ ] One manual or explicitly marked real request: prompt `2+2`, confirm a sensible reply
- [ ] `GET` or `POST` a tiny debug/connectivity path is optional; keep it simple
- [ ] Default automated tests mock the HTTP call to OpenRouter

**Tests / success criteria**

- Real 2+2 call succeeds when the key is present (run once, not in the normal suite)
- Mocked unit test covers request shaping and error handling without hitting the network

---

## Part 9: AI + Daily Compass data

Turn the model into a planning guide for the open day.

- [ ] Chat endpoint sends: open day's full task data, user's categories, user question, session conversation history
- [ ] System prompt: Daily Compass planning guide (prioritize, create, edit, complete, reorder, move within the open day)
- [ ] Response: assistant message plus optional full replacement of that day's board
- [ ] If a replacement board is present, save it for that user/date
- [ ] History stays in memory for the session only
- [ ] Do not let the model add/delete categories or change other days
- [ ] Unit tests with a mocked model: no board change; valid board replacement persisted; malformed replacement ignored; history included on follow-up

**Tests / success criteria**

- Mocked tests cover the cases above
- Valid AI board replacement is what `GET` day returns afterward
- Invalid AI payload does not corrupt stored data

---

## Part 10: AI sidebar

Add the chat UI and wire it to Part 9.

- [ ] Polished sidebar on the Daily Compass board, matching cream / forest / sage / gold
- [ ] Full conversation in the session: send, receive, scroll, keep history until logout/refresh
- [ ] On a board replacement, refresh the open day's tasks without a manual reload
- [ ] Copy and empty states should feel like a planning guide, not a generic chatbot
- [ ] Frontend unit tests for rendering messages and applying an updated board
- [ ] Playwright: open sidebar, send a message (mock AI in e2e), see the reply; if the mock returns a new task, the board updates

**Tests / success criteria**

- Sidebar is usable on desktop
- Conversation survives multiple turns in the same session and resets on logout
- Board updates from the AI appear immediately
- Normal e2e/unit tests still mock OpenRouter
