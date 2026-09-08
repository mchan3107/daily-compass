<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

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

Playwright uses `npm run dev` on port 3000. To run e2e against Docker instead:

```
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080 npm run test:e2e
```

## Layout

```
src/app/          layout, page, globals.css
src/components/   Today board UI
src/lib/          types, dummy data, pure helpers
src/test/         Vitest setup
e2e/              Playwright specs
```

`src/app/page.tsx` renders `AuthGate`. Login is checked with `GET /api/session`. Credentials are `user` / `password`. The http-only session cookie is set by FastAPI.

## Data model

`src/lib/types.ts`:

- `CategoryId`: `"health" | "relationships" | "growth" | "hobbies" | "career"`
- `Category`: `id`, `label`
- `Task`: `id`, `categoryId`, `title`, `details`, `completed`
- `BoardState`: `Record<CategoryId, Task[]>`
- `DaysState`: `Record<YYYY-MM-DD, BoardState>`

`src/lib/categories.ts`: five default labels plus `renameCategory` and `reorderCategories`. No add or delete.

`src/lib/dates.ts`: local `YYYY-MM-DD` helpers.

`src/lib/days.ts`: `boardForDate`, `setBoard`, `moveTaskToDate`. Missing days are empty boards. Dummy tasks live on Today only.

`src/lib/dummy-tasks.ts` seeds Today. `src/lib/tasks.ts` has board helpers. Blank titles are ignored. Completing a task does not move it.

State lives in `TodayBoard` via `useState`. Nothing is persisted.

## UI

Keep the cream / forest / sage / gold look in `src/app/globals.css`. Headings use Fraunces; body uses Source Sans 3.

- `AuthGate`: login or the today board
- `LoginForm`: username / password
- `TodayHeader`: title, prev/next, date picker, log out.
- `TodayBoard`: five columns, dnd-kit, CRUD, day state, category rename/reorder.
- `CategoryColumn`: droppable column, rename, move left/right, add-task form.
- `SortableTaskCard`: drag handle (`data-testid="drag-{id}"`) wrapping `TaskCard`.
- `TaskCard`: checkbox, title, details, move-to-date, edit, delete.
- `TaskForm`: title (required) and details.

Test ids: `login-form`, `logout`, `today-board`, `column-{categoryId}`, `add-task-{categoryId}`, `task-{id}`, `drag-{id}`, `prev-day`, `next-day`, `date-picker`, `move-date-{id}`.

## Tests

- `src/lib/*.test.ts`: helpers, dummy seed, days, categories, dates
- `src/components/*.test.tsx`: TaskCard, TaskForm, TodayHeader, CategoryColumn
- `e2e/today.spec.ts`: signs in, then header, categories, dummy tasks, CRUD, drag, day nav, rename/reorder, move-to-date
- `e2e/login.spec.ts`: login required, bad password, logout

Playwright builds the static export and serves it with FastAPI on port 3000.

## Not in this frontend yet

Persistence, Daily Compass API client, AI sidebar.
