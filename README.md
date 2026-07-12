# DevBoard

A lightweight internal team task tracker (teams → projects → tasks → comments/attachments), built as a learning project. See `DevBoard_PRD.md` for the full spec and day-by-day build plan, and `PROGRESS.md` for what's been built so far.

## Tech stack

- **Backend**: Node.js + Express, raw `pg` (no ORM), JWT + bcrypt auth, `multer` for uploads, `express-validator`, `nodemon`
- **Frontend**: React 18 + Vite, `react-router-dom`, Context API, native `fetch`
- **DB**: PostgreSQL, raw SQL migrations (no ORM/migration tool)

## Prerequisites

- Node.js
- A running local PostgreSQL server

## Setup

### 1. Database

Create the database, then run each migration **in order** — they have FK dependencies on each other (users → teams → team_members → projects → tasks → comments → attachments):

```bash
createdb devboard
psql devboard -f backend/migrations/001_create_users.sql
psql devboard -f backend/migrations/002_create_teams.sql
psql devboard -f backend/migrations/003_create_team_members.sql
psql devboard -f backend/migrations/004_create_projects.sql
psql devboard -f backend/migrations/005_create_tasks.sql
psql devboard -f backend/migrations/006_create_comments.sql
psql devboard -f backend/migrations/007_create_attachments.sql
```

If you don't have a `psql` CLI available (e.g. Postgres running as a Windows service with no client installed), you can run each file's SQL through Node's `pg` driver instead — see the "no psql client" note in `PROGRESS.md`'s Task 1.3/1.4 history for the exact approach.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in real values, see below
npm run dev             # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Both must be running at the same time — the frontend is hardcoded to call the backend at `http://localhost:4000/api/v1` (`frontend/src/api/client.js`).

## Environment variables (`backend/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | Port the Express server listens on (default `4000`) |
| `DATABASE_URL` | Postgres connection string, e.g. `postgres://user:password@localhost:5432/devboard` |
| `JWT_SECRET` | Signing secret for auth tokens — use a real random value outside local dev |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |

There is no frontend `.env` — the API base URL is a hardcoded constant (see `frontend/src/api/client.js`).

## Roles & permissions

Three global roles (`admin` / `member` / `viewer`) plus a per-team role (`lead` / `member`) — see `DevBoard_PRD.md` Section 6 for the full permissions table. In short:

- **admin** — can create teams; can do everything a member can everywhere else
- **member** — can create/edit projects and tasks, assign tasks, comment, delete their own tasks
- **viewer** — read-only, except commenting (everyone can comment)

All of the above still requires **team membership** — a role alone doesn't grant access to a team you don't belong to.

## Test accounts

If you're working from the same dev database this project was built against, a few accounts already exist (all password `pass1234`): an `admin` role account, a couple of `member` accounts, and a `viewer` account. Otherwise, register fresh via `POST /api/v1/auth/register` (or the `/register` page once the frontend is running) — pass `"role": "admin"` in the body to get an admin account, since the UI has no role picker.

## Project structure

```
devboard/
├── backend/
│   ├── src/
│   │   ├── middleware/   (auth, roleGuard, errorHandler, upload, cors, validate)
│   │   ├── routes/       (one file per resource)
│   │   ├── controllers/  (business logic per resource)
│   │   ├── db/           (raw SQL queries per resource)
│   │   ├── utils/        (jwt, asyncHandler, shared membership checks)
│   │   └── app.js
│   ├── migrations/       (raw .sql files, run manually/sequentially)
│   └── uploads/          (local file storage for attachments)
├── frontend/
│   └── src/
│       ├── pages/        (one per route)
│       ├── context/      (AuthContext)
│       ├── api/          (fetch wrapper functions)
│       └── routes/        (ProtectedRoute)
└── DevBoard_PRD.md
```
