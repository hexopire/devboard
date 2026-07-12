# DevBoard — Progress Tracker

Rules (see `CLAUDE.md` → Task-level workflow):
- One task at a time. Agent stops after each ✅, user commits manually, fills in Commit hash.
- Agent asks before starting the next task — always, even mid-Day.

Status legend: ☐ not started · 🔄 in progress · ✅ done

| Day | Task | Learning Outcome | Status | Commit |
|---|---|---|---|---|
| 1 | 1.1 Init backend (Express, dotenv, nodemon) | Minimal Express server anatomy, env loading | ✅ | |
| 1 | 1.2 Init frontend (Vite + React) | Vite dev server vs CRA, project skeleton | ✅ | |
| 1 | 1.3 Write raw SQL migrations for all 7 tables | FK / CHECK / UNIQUE / ENUM constraints by hand | ✅ | |
| 1 | 1.4 DB pool config + `GET /health` returning `SELECT NOW()` | Connection pooling, async route handlers | ✅ | |
| 2 | 2.1 Raw SQL insert/select queries for User | Parameterized queries, SQL injection avoidance | ✅ | |
| 2 | 2.2 `POST /auth/register` (bcrypt hash + insert) | Password hashing mechanics, salt rounds | ✅ | |
| 2 | 2.3 Issue JWT on register | JWT structure/signing, what claims to embed | ✅ | |
| 3 | 3.1 `POST /auth/login` (verify password) | bcrypt.compare flow, timing-safe comparison | ✅ | |
| 3 | 3.2 `authMiddleware` (verify Bearer token) | Middleware chain, `req.user` attachment pattern | ✅ | |
| 3 | 3.3 `GET /auth/me` protected route | Applying middleware to a route, 401 handling | ✅ | |
| 4 | 4.1 Team CRUD (create/get/list) | Basic resource CRUD over raw SQL | ✅ | |
| 4 | 4.2 TeamMember join table logic (add member) | Many-to-many join tables | ✅ | |
| 4 | 4.3 List teams for a user via JOIN query | Writing/reasoning about SQL JOINs | ✅ | |
| 5 | 5.1 Project CRUD nested under teams | Nested resource routing conventions | ✅ | |
| 5 | 5.2 Basic membership-based authorization check | Ownership/membership guard before role-based auth | ✅ | |
| 6 | 6.1 `roleGuard(allowedRoles)` middleware | Middleware factories, closures over config | ✅ | |
| 6 | 6.2 Apply roleGuard to team/project/task routes per Section 6 table | Mapping a permissions matrix to code | ✅ | |
| 7 | 7.1 Task CRUD (create/get/update/delete) | Full nested-resource CRUD, one more FK level | ✅ | |
| 7 | 7.2 Assignee + status transitions | Enum-constrained state field updates | ✅ | |
| 8 | 8.1 Manual validation pass in controllers | What validation actually checks, error shapes | ✅ | |
| 8 | 8.2 Refactor to `express-validator`, compare | Trade-off: library vs hand-rolled validation | ✅ | |
| 9 | 9.1 Comment CRUD nested under tasks | Third level of nested resources, tied to `req.user` | ✅ | |
| 10 | 10.1 Configure `multer`, local `uploads/` storage | Multipart form parsing basics | ✅ | |
| 10 | 10.2 `POST/GET /tasks/:taskId/attachments` | Storing file metadata vs file bytes separately | ✅ | |
| 11 | 11.1 Central error-handling middleware | Express error middleware signature `(err,req,res,next)` | ✅ | |
| 11 | 11.2 Async handler wrapper applied across controllers | Why unhandled promise rejections crash Express | ✅ | |
| 12 | 12.1 react-router-dom routes (Login/Register/Dashboard/Team/Project/Task) | Client-side routing setup | ✅ | |
| 12 | 12.2 `AuthContext` (user + token in memory) | Context API for cross-component auth state | ✅ | |
| 12 | 12.3 `ProtectedRoute` wrapper | Route guards, redirect-on-unauthenticated pattern | ✅ | |
| 13 | 13.1 Login/Register forms via raw `fetch` | Manual loading/error state without a form library | ✅ | |
| 13 | 13.2 Token persistence decision (localStorage vs cookie) + implement | XSS/CSRF trade-offs of each storage choice | ✅ | |
| 14 | 14.1 Teams list + create team page | Wiring fetch → state → render loop | ✅ | |
| 14 | 14.2 Team's projects list + create project page | Passing route params to scope API calls | ✅ | |
| 15 | 15.1 Project detail page: task list + create form | List/detail pattern, controlled forms | ✅ | |
| 15 | 15.2 Status update control + assignee dropdown | PATCH from UI, optimistic vs refetch update | ✅ | |
| 16 | 16.1 Task detail page: comment thread | Nested data fetch/display, append-on-submit | ✅ | |
| 16 | 16.2 File upload control (multipart from browser) | `FormData` + `fetch`, upload progress basics | ✅ | |
| 17 | 17.1 Manual QA pass across admin/member/viewer roles | End-to-end permission verification by hand | ✅ | |
| 17 | 17.2 Fix permission leaks / broken states found in QA | Debugging auth logic from symptom to root cause | ✅ | |
| 17 | 17.3 Write `README.md` (setup, env vars, migrations) | Documenting a project for a fresh clone | ✅ | |
