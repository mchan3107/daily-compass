# Daily Compass SQLite schema

Signed off for Part 6, with hashed passwords (not plaintext).

The database stores users, each user's five life categories, and one JSON board per user per calendar day. It matches the frontend types in `frontend/src/lib/types.ts`. Tasks are not a separate table.

SQLite file: `backend/data/compass.db`. Create the parent directory and the file automatically if they are missing. No migration tool for the MVP; create the three tables on first open.

---

## Tables

### `users`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER | Primary key |
| `username` | TEXT | Unique, not empty |
| `password_hash` | TEXT | PBKDF2-SHA256 hash with a random salt. Never store plaintext |

The schema supports many users. The MVP seeds one row: username `user`, password `password` (stored hashed). Part 6 login looks up this table and verifies the hash. The session cookie can keep storing the username (`user`); there is no sessions table.

AI chat history is not stored.

### `categories`

Always exactly five rows per user. Stable ids never change. Labels and order do.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | INTEGER | References `users(id)` ON DELETE CASCADE |
| `id` | TEXT | One of `health`, `relationships`, `growth`, `hobbies`, `career` |
| `label` | TEXT | Display name, not empty |
| `sort_order` | INTEGER | 0–4, left to right |

Primary key: `(user_id, id)`.

Application rules (reject in the API, not with fancy triggers):

- A user always has these five ids, never more, never fewer
- Rename may change `label` only
- Reorder may change `sort_order` only
- Add and delete are rejected

### `days`

One row per user per date that has been saved.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | INTEGER | References `users(id)` ON DELETE CASCADE |
| `date` | TEXT | `YYYY-MM-DD` (the calendar day the UI sent, not UTC conversion) |
| `board` | TEXT | JSON object, see below |

Primary key: `(user_id, date)`.

A missing row means an empty board. Do not insert a row on GET. PUT creates or replaces the row.

---

## Day board JSON

Same shape as frontend `BoardState`. Array order is display order. Each task's `categoryId` matches the object key it sits under.

```json
{
  "health": [
    {
      "id": "health-1",
      "categoryId": "health",
      "title": "Morning stretch",
      "details": "Ten minutes of easy mobility before coffee.",
      "completed": false
    }
  ],
  "relationships": [],
  "growth": [],
  "hobbies": [],
  "career": []
}
```

Task fields: `id` (string), `categoryId` (one of the five ids), `title` (string), `details` (string), `completed` (boolean). New tasks keep using frontend `crypto.randomUUID()`.

A valid board has all five keys and an array at each key. Reject PUT / AI replacement that is missing a key, uses an unknown category, or has a task under the wrong key.

---

## How operations map

Categories live in `categories`. Everything about tasks on a day lives in that day's `board` JSON.

| Action | Persistence |
| --- | --- |
| Open a day | `GET` that `date`. Missing row → empty board (all five arrays empty). Do not create a row. |
| Create / edit / delete / complete / reorder / move between categories | `PUT` the full board for the open date. One JSON blob replaces the previous one. |
| Rename / reorder categories | `PUT` the five category rows. Reject if the id set is not exactly the five stable ids. |
| Move a task to another date | One transaction: load source board, remove the task, save source; load target board (or empty), append the task to the same `categoryId` list, save target. If source and target are the same date, no-op. |
| AI replacement of the open day | Same as day `PUT`. Other dates and categories are not touched. |

Move-to-date is the only write that touches two day rows. Cross-category drag stays inside one day's JSON, so it does not need its own table or endpoint if the frontend saves the whole board.

Unfinished tasks do not roll over. Other days stay empty until the user (or seed) writes them.

---

## Seed (first create)

When the database file is created:

1. Insert user `user` with a hash of password `password`.
2. Insert that user's five categories:

| `id` | `label` | `sort_order` |
| --- | --- | --- |
| `health` | Health / Exercise | 0 |
| `relationships` | Relationships | 1 |
| `growth` | Personal Growth | 2 |
| `hobbies` | Hobbies | 3 |
| `career` | School / Career | 4 |

3. Do **not** seed a day row at create time using the server clock. Docker and the browser can disagree on "today". Instead, on the first `GET` day for this user, if they still have zero `days` rows, insert the dummy board for the date the client asked for. That puts the seed on the user's Today.

Dummy board content matches `frontend/src/lib/dummy-tasks.ts` (same titles, details, ids, all `completed: false`, at least one task in every category). After that first GET, later dates stay empty until the user adds tasks or moves a task there.

If the file already exists, do not re-seed. Tests use a temp SQLite file so they get a fresh seed each run.

---

## Out of scope

- Sessions table (cookie value is the username)
- Tasks table
- AI conversation history
- Rolling unfinished tasks to the next day
- Adding or deleting categories
- Migration framework

---

## API

All of these except login/logout/hello/session require a valid session. The session username must exist in `users`.

- `GET /api/categories` — `{ "categories": [{ "id", "label" }, ...] }` in display order
- `PUT /api/categories` — same body; rename/reorder only
- `GET /api/days/{date}` — `{ "date", "board" }`; empty if missing; may seed dummy on first GET
- `PUT /api/days/{date}` — `{ "board": ... }`
- `POST /api/days/{date}/move-task` — `{ "taskId", "toDate" }` in one transaction
- `POST /api/chat` — `{ "date", "message" }` returns `{ "reply", "board" }`. `board` is a full replacement of that day or `null`. History is in memory and cleared on logout.
