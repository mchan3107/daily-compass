<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from this diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Daily Compass frontend

Personal planner UI. Build on this code. Do not recreate it.

## Stack

- Next.js 16 App Router, React 19, Tailwind CSS 4
- Static export (`output: "export"`) so FastAPI can serve `out/`
- `@dnd-kit/react` for drag and drop
- Vitest + Testing Library for unit tests
- Playwright for e2e (Chromium, `npm run test:e2e`)

Run locally with `npm run dev` at http://localhost:3000. Tests: `npm test`.

`next dev` cannot load or save days (no API proxy). Use Docker or Playwright's FastAPI server.

Playwright builds the static export and serves it with FastAPI on port 3000, using `frontend/.e2e/compass.db`. Tests run one at a time and reset the dummy seed after sign-in.

To run e2e against Docker instead:

```
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080 npm run test:e2e
```

## Layout

```
src/app/          layout, page, globals.css
src/components/   Today board UI
src/lib/          types, API client, dummy seed (tests only), pure helpers
src/test/         Vitest setup
e2e/              Playwright specs
```

`src/app/page.tsx` renders `AuthGate`. Login is checked with `GET /api/session`. Users sign up or sign in with email and password. The demo account is `user@example.com` / `password`. The http-only session cookie is set by FastAPI.

## Data model

`src/lib/types.ts`:

- `CategoryId`: `"health" | "relationships" | "growth" | "hobbies" | "career"`
- `Category`: `id`, `label`
- `Task`: `id`, `categoryId`, `title`, `details`, `completed`
- `BoardState`: `Record<CategoryId, Task[]>`
- `DaysState`: `Record<YYYY-MM-DD, BoardState>`

`src/lib/api.ts` loads and saves categories and days. Dummy tasks for the fake user are seeded by the backend.

`src/lib/categories.ts`: five default labels plus `renameCategory` and `reorderCategories`. No add or delete.

`src/lib/dates.ts`: local `YYYY-MM-DD` helpers.

`src/lib/days.ts`: `boardForDate` and `setBoard` for tests and helpers.

`src/lib/dummy-tasks.ts` is the expected seed shape for tests. `src/lib/tasks.ts` has board helpers. Blank titles are ignored. Completing a task does not move it.

`TodayBoard` loads the open date from the API and PUTs after edits.

## UI

Keep the cream / forest / sage / gold look in `src/app/globals.css`. Headings use Fraunces; body uses Source Sans 3.

- `AuthGate`: login or the today board
- `LoginForm`: email / password sign-in and signup
- `TodayHeader`: title, prev/next, date picker, log out.
- `TodayBoard`: five columns, dnd-kit, CRUD, day state, category rename/reorder, planning guide sidebar.
- `GuideSidebar`: session chat for the open day; applies a returned board immediately.
- `CategoryColumn`: droppable column, rename, move left/right, add-task form.
- `SortableTaskCard`: drag handle (`data-testid="drag-{id}"`) wrapping `TaskCard`.
- `TaskCard`: checkbox, title, details, edit, delete.
- `TaskForm`: title (required) and details.

Test ids: `login-form`, `signup-form`, `logout`, `today-board`, `column-{categoryId}`, `add-task-{categoryId}`, `task-{id}`, `drag-{id}`, `prev-day`, `next-day`, `date-picker`, `guide-sidebar`, `guide-messages`, `guide-input`, `guide-send`, `guide-empty`, `guide-message`.

## Tests

- `src/lib/*.test.ts`: helpers, dummy seed, days, categories, dates, API client
- `src/components/*.test.tsx`: TaskCard, TaskForm, TodayHeader, CategoryColumn, GuideSidebar
- `e2e/today.spec.ts`: signs in, then header, categories, dummy tasks, CRUD, drag, day nav, rename/reorder
- `e2e/login.spec.ts`: login required, bad password, logout
- `e2e/signup.spec.ts`: create account, then sign in; short password; data stays private per user
- `e2e/persist.spec.ts`: edit/rename/day nav survive reload
- `e2e/guide.spec.ts`: mocked chat reply, board update, logout clears messages

`TodayBoard` loads the open date from the API and PUTs after edits. The guide sidebar posts `/api/chat`.

