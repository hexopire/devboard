# DevBoard — Project Requirements & Build Plan

## 0. Purpose of this document

This is a PRD-style build document meant to be read by Claude Code (or any AI coding agent) at the start of each session. It defines the product, the tech stack, the database design, the API contract, and a **day-by-day task breakdown**. The agent should:

1. Read this entire file before writing any code.
2. Work through **one "Day" section at a time**, in order.
3. Not skip ahead to later days even if it seems faster to do so — the point is to build fundamentals manually, not to autogenerate the whole app.
4. At the end of each Day, run/test what was built before moving to the next Day.
5. Ask the user for confirmation before moving to the next Day if anything in that day's acceptance criteria is unclear or failing.

This is a **learning-first** project. Abstraction libraries (ORMs with magic, meta-frameworks, UI kits with prebuilt logic) are intentionally avoided in early phases so the underlying mechanics are visible and understood.

---

## 1. Problem Statement / Real Need

Developers jumping straight into meta-frameworks (Next.js, Refine, NestJS with heavy decorators) often ship features without understanding what's happening underneath — routing, auth, ORM query generation, state management. This project exists to force manual construction of every core piece of a full-stack app **once**, so that future use of higher-level frameworks is informed rather than magical.

**The product itself**: DevBoard is a lightweight internal team task tracker — similar in spirit to a stripped-down Jira/Linear. Teams have projects, projects have tasks, tasks have assignees and comments. Multiple roles control what a user can see/do.

---

## 2. Goals

- Build a working full-stack CRUD application with real relational data.
- Implement authentication and authorization from scratch (no Auth0/Clerk/Passport shortcuts in v1).
- Design and normalize a relational database by hand (raw SQL, no ORM in the first pass).
- Build a REST API following resource conventions, proper status codes, and centralized error handling.
- Build the frontend with plain React (Vite) using raw `fetch`, local/lifted state, and Context — no React Query, no Redux, no Refine — in the first pass.
- Understand file uploads, middleware, and request validation manually.
- End with a fully working app that could later be refactored into Next.js or Refine as a "graduation" exercise (out of scope for this document).

## 3. Non-Goals (for v1)

- No SSR/SSG — this is a pure SPA + REST API.
- No ORM (Prisma/TypeORM) in v1 — raw `pg` driver + SQL first. ORM can be introduced later as a deliberate comparison exercise.
- No TypeScript in v1 (optional stretch goal after JS version works) — the point is fundamentals, and TS adds a layer best added once JS data flow is understood.
- No deployment/CI pipeline in v1 (can be a later phase).
- No real-time features (websockets) in v1.

---

## 4. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev server, no CRA bloat |
| Routing | react-router-dom v6 | Manual protected routes teach the auth flow |
| Frontend state | useState/useEffect/useContext | No state library — build lifting/context by hand |
| HTTP client | native `fetch` | No axios initially — see raw request/response handling |
| Styling | Plain CSS or CSS Modules | No Tailwind/UI kit initially — avoid pre-built components hiding structure |
| Backend | Node.js + Express | Minimal, unopinionated — you write the middleware |
| Database | PostgreSQL | Real relational DB, supports FKs, joins, constraints |
| DB access | `pg` (node-postgres), raw SQL | No ORM — write and understand every query |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` | Build login/register/token verification manually |
| File upload | `multer` | Understand multipart form handling |
| Validation | Manual + `express-validator` (introduced Day 8) | Start manual, then see what a validation library saves you |
| Env config | `dotenv` | Standard fundamental |
| Dev tooling | `nodemon` (backend), Vite HMR (frontend) | Standard fundamental |

**Explicitly deferred to later (post-v1) phases:** TypeScript, Prisma, React Query/TanStack Query, Tailwind, Docker, CI/CD, Next.js, Refine.

---

## 5. Domain Model / Database Schema

### Entities

- **User** — id, name, email, password_hash, role (enum: admin/member/viewer), created_at
- **Team** — id, name, created_by (FK → User), created_at
- **TeamMember** (join table, many-to-many User↔Team) — team_id (FK), user_id (FK), role_in_team (enum: lead/member), joined_at
- **Project** — id, team_id (FK → Team), name, description, created_at
- **Task** — id, project_id (FK → Project), title, description, status (enum: todo/in_progress/done), assignee_id (FK → User, nullable), created_by (FK → User), due_date, created_at
- **Comment** — id, task_id (FK → Task), user_id (FK → User), body, created_at
- **Attachment** — id, task_id (FK → Task), file_path, uploaded_by (FK → User), uploaded_at

### Relationships

- User ↔ Team: many-to-many via TeamMember
- Team → Project: one-to-many
- Project → Task: one-to-many
- Task → Comment: one-to-many
- Task → Attachment: one-to-many
- User → Task (assignee): one-to-many
- User → Comment: one-to-many

### Constraints to implement by hand

- Foreign key constraints with `ON DELETE CASCADE` where appropriate (e.g., deleting a project deletes its tasks).
- `UNIQUE` constraint on User.email.
- `CHECK` constraint on Task.status and User.role enums (or use Postgres native ENUM types — pick one and justify it in code comments).
- `NOT NULL` on required fields.

---

## 6. Role-Based Permissions

| Action | Admin | Member | Viewer |
|---|---|---|---|
| Create team | ✅ | ❌ | ❌ |
| Create project in team | ✅ | ✅ (if team lead) | ❌ |
| Create/edit task | ✅ | ✅ | ❌ |
| Assign task | ✅ | ✅ | ❌ |
| Comment on task | ✅ | ✅ | ✅ |
| Delete task | ✅ | ✅ (own) | ❌ |
| View everything in their team | ✅ | ✅ | ✅ |

This table drives the authorization middleware design in Day 6.

---

## 7. API Contract (v1)

Base URL: `/api/v1`

**Auth**
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (protected)

**Teams**
- `GET /teams` (teams user belongs to)
- `POST /teams` (admin only)
- `GET /teams/:id`
- `POST /teams/:id/members` (add member)

**Projects**
- `GET /teams/:teamId/projects`
- `POST /teams/:teamId/projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`

**Tasks**
- `GET /projects/:projectId/tasks`
- `POST /projects/:projectId/tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

**Comments**
- `GET /tasks/:taskId/comments`
- `POST /tasks/:taskId/comments`

**Attachments**
- `POST /tasks/:taskId/attachments` (multipart)
- `GET /tasks/:taskId/attachments`

All responses follow the shape:
```json
{ "success": true, "data": {...} }
```
or
```json
{ "success": false, "error": { "message": "...", "code": "..." } }
```

---

## 8. Folder Structure

```
devboard/
├── backend/
│   ├── src/
│   │   ├── config/          (db pool, env loading)
│   │   ├── middleware/      (auth, roleGuard, errorHandler, upload)
│   │   ├── routes/          (one file per resource)
│   │   ├── controllers/     (business logic per resource)
│   │   ├── db/              (raw SQL queries per resource)
│   │   ├── utils/           (jwt helpers, password hashing)
│   │   └── app.js
│   ├── migrations/          (raw .sql files, run manually/sequentially)
│   ├── uploads/             (local file storage for attachments)
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/         (AuthContext)
│   │   ├── api/             (fetch wrapper functions)
│   │   ├── routes/          (ProtectedRoute component)
│   │   └── App.jsx
│   └── package.json
└── DevBoard_PRD.md          (this file)
```

---

## 9. Day-by-Day Build Plan

> **Instruction to Claude Code:** Execute exactly one "Day" per session unless the user explicitly says to continue. At the end of each day, list what was built, how to test it, and stop.

### Day 1 — Project scaffolding & DB setup
- Initialize `backend/` (Express, nodemon, dotenv, pg) and `frontend/` (Vite + React).
- Set up PostgreSQL locally, create database `devboard`.
- Write raw SQL migration files for all 7 tables with constraints from Section 5.
- Verify connection from Node to Postgres with a simple `SELECT NOW()` test route.
- **Acceptance:** `GET /api/v1/health` returns DB timestamp.

### Day 2 — User model & registration
- Write raw SQL insert/select queries for User.
- Build `POST /auth/register`: hash password with bcrypt, insert user, return user (no password hash) + JWT.
- **Acceptance:** Can register a user via Postman/curl and receive a token.

### Day 3 — Login & auth middleware
- Build `POST /auth/login`: verify password, issue JWT.
- Build `authMiddleware` that verifies JWT from `Authorization: Bearer` header and attaches `req.user`.
- Build `GET /auth/me` as first protected route.
- **Acceptance:** Requests without token get 401; valid token returns user info.

### Day 4 — Teams & many-to-many membership
- Build Team CRUD (create, get, list user's teams).
- Build TeamMember join logic (add member to team).
- **Acceptance:** Can create a team, add members, and list teams for a given user via a join query.

### Day 5 — Projects
- Build Project CRUD nested under teams.
- Enforce that only team members can view/create projects for that team (basic authorization check, not yet role-based).
- **Acceptance:** Full CRUD on projects, scoped correctly to team membership.

### Day 6 — Role-based authorization middleware
- Build `roleGuard(allowedRoles)` middleware using the permissions table in Section 6.
- Apply to team/project/task creation routes.
- **Acceptance:** Viewer role gets 403 on write actions; Member/Admin succeed per the table.

### Day 7 — Tasks CRUD
- Build Task CRUD nested under projects, including assignee and status fields.
- **Acceptance:** Full task lifecycle create → assign → update status → delete.

### Day 8 — Validation layer
- First pass: manual validation (check required fields, types) in controllers.
- Second pass: refactor using `express-validator`, compare the code reduction.
- **Acceptance:** Invalid payloads return 400 with clear field-level errors.

### Day 9 — Comments
- Build Comment CRUD nested under tasks.
- **Acceptance:** Can add/list comments on a task, tied to the commenting user.

### Day 10 — File uploads
- Configure `multer` for task attachments, store locally in `uploads/`.
- Build `POST /tasks/:taskId/attachments` and `GET` to list them.
- **Acceptance:** Can upload a file via form-data and retrieve its metadata + download link.

### Day 11 — Centralized error handling & logging
- Build a single Express error-handling middleware.
- Wrap all controllers in a consistent try/catch or async handler pattern.
- **Acceptance:** Any thrown error anywhere returns the standard error JSON shape from Section 7, never a raw stack trace to the client.

### Day 12 — Frontend scaffolding & routing
- Set up `react-router-dom` with routes for Login, Register, Dashboard, Team, Project, Task Detail.
- Build `AuthContext` to hold current user + token (in memory, not localStorage yet — discuss tradeoffs).
- Build `ProtectedRoute` wrapper component.
- **Acceptance:** Unauthenticated users redirected to login; authenticated users reach dashboard.

### Day 13 — Auth pages (frontend)
- Build Login and Register forms using raw `fetch`, manual loading/error state.
- Persist token (discuss localStorage vs cookie tradeoffs, pick one, document why).
- **Acceptance:** Can register/login through the UI and land on dashboard.

### Day 14 — Teams & Projects UI
- Build pages to list teams, create a team, view team's projects, create a project.
- **Acceptance:** Full team/project flow usable end-to-end in browser.

### Day 15 — Tasks UI
- Build project detail page listing tasks, task creation form, status update control, assignee dropdown.
- **Acceptance:** Can manage full task lifecycle from the UI.

### Day 16 — Comments & Attachments UI
- Build task detail page with comment thread and file upload control.
- **Acceptance:** Can comment and attach files from the UI.

### Day 17 — Polish & manual QA pass
- Walk through every user role (admin/member/viewer) manually across the whole app.
- Fix any permission leaks, broken states, or unhandled errors.
- Write a short `README.md` covering setup steps, env vars, and how to run migrations.
- **Acceptance:** A fresh clone + documented setup steps results in a working app.

---

## 10. Stretch Goals (explicitly out of scope until v1 is complete)

- Add TypeScript across both frontend and backend.
- Introduce Prisma ORM and compare against raw SQL.
- Introduce React Query for frontend data fetching and compare against manual fetch/state.
- Rebuild the frontend in Next.js (App Router) as a direct comparison exercise.
- Rebuild the admin/task views using Refine, now that the underlying data model is fully understood.
- Add Docker Compose for one-command local setup.
- Add basic CI (lint + test) via GitHub Actions.

---

## 11. Working Agreement for the AI Agent

- Do not introduce a library not listed in Section 4 without flagging it to the user first and explaining what fundamental it would hide.
- Prefer verbose, commented code over clever one-liners — this is a learning project.
- After each Day, summarize: what was built, which files changed, and exact commands to test it manually (curl/Postman for backend, browser steps for frontend).
- If a Day's task reveals that an earlier Day's work needs revision, say so explicitly rather than silently patching around it.
