# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

No code written yet. Repo has only `DevBoard_PRD.md` — read it in full before writing anything. It is the spec, architecture, and execution plan combined.

## Working rules (from PRD Section 11 — mandatory)

- Execute **exactly one "Day" section at a time** (PRD Section 9), in order. Do not skip ahead or pre-build later days even if it seems faster.
- At the end of each Day: summarize what was built, which files changed, and exact manual test commands (curl/Postman for backend, browser steps for frontend). Then stop.
- If a Day's acceptance criteria is unclear or failing, ask the user before moving to the next Day.
- If an earlier Day's work needs revision, say so explicitly — do not silently patch around it.
- Do not introduce any library not listed in the tech stack (PRD Section 4) without flagging it and explaining what fundamental it would hide.
- Prefer verbose, commented code over clever one-liners — this is a learning project, not production code.

## Task-level workflow (stricter than "one Day at a time" above)

`PROGRESS.md` breaks every Day from PRD Section 9 into smaller tasks, each tied to one specific learning outcome. Follow this loop:

- Work **one task row from `PROGRESS.md` at a time** — never a whole Day in one shot.
- Before starting any task (including the next one within the same Day), ask the user to confirm. Do not assume "continue" from a prior message.
- After finishing a task: show/run its manual test, mark that row ✅ in `PROGRESS.md`, then **stop**.
- Do not commit — the user commits manually after reviewing. Do not start the next task until they explicitly say to.
- If `PROGRESS.md` and the PRD ever disagree on scope, PRD Section 9 is the source of truth; flag the mismatch and propose a `PROGRESS.md` fix rather than silently deviating.

## Tech stack (no substitutions without flagging)

Backend: Node.js + Express, raw `pg` (no ORM), JWT + bcrypt auth, multer for uploads, dotenv, nodemon.
Frontend: React 18 + Vite, react-router-dom v6, useState/useEffect/useContext (no Redux/React Query), native `fetch` (no axios), plain CSS.
DB: PostgreSQL, raw SQL migrations (no Prisma/TypeORM).
No TypeScript, no SSR, no Docker/CI, no websockets in v1 — all explicitly deferred (PRD Section 3, 10).

## Architecture

- Domain model, relationships, and constraints: PRD Section 5.
- Role permissions (admin/member/viewer) driving authorization middleware: PRD Section 6.
- REST API contract, response envelope shape (`{success, data}` / `{success:false, error}`): PRD Section 7.
- Target folder structure (backend: config/middleware/routes/controllers/db/utils; frontend: pages/components/context/api/routes): PRD Section 8.

## Commands

None yet — no `package.json` exists. Day 1 sets up backend/frontend scaffolding and npm scripts; update this section once those exist.
