# StudyFlow — Student Task and Progress Management System

## Abstract

StudyFlow is a MERN application that gives students one private workspace to record academic tasks, set priorities and due dates, update task status, and review progress. A React single-page application communicates with an Express/Node API. Mongoose stores accounts and tasks in MongoDB. Password hashing and JWT-protected, owner-scoped endpoints ensure that one account cannot access another account's task records.

## Introduction and problem statement

Students often manage assignments, revision, and deadlines across notes, calendars, and memory. That fragmentation makes it harder to decide what to do next or see work already completed. StudyFlow provides a small, focused task manager with a progress overview. The system does not replace a learning management system or calendar; its goal is to make personal study work easier to plan and review.

## Target users, objectives, scope

**Target users:** Students who want to organize assignments and study activities independently.

**Objectives**

1. Let an individual create an account and return to a private workspace.
2. Support CRUD operations for study tasks.
3. Make status, priority, and due date visible.
4. Summarize task totals and completion progress using persisted data.
5. Provide a responsive, accessible interface with useful feedback.

**Scope / MVP:** Account registration and login, dashboard, task list with search/status filters, create/edit/delete and completion actions, progress view, API validation, database persistence, health check, setup and deployment instructions.

**Out of scope:** Social collaboration, push reminders, calendar synchronization, file uploads, administrator roles, password reset/email verification, and course/teacher management.

## Requirements and technology stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React 18, Vite, React Router, Lucide icons, CSS | Responsive pages, forms, routing, API calls |
| Backend | Node.js, Express | REST API, validation, authentication, HTTP errors |
| Persistence | MongoDB Atlas, Mongoose | User and task documents, indexes, validation |
| Security | bcryptjs, jsonwebtoken, Helmet, CORS, express-rate-limit | Password hashes, bearer tokens, headers, origin and auth request controls |

### Functional requirements

- Register using name, email, and a password of at least eight characters.
- Log in with email/password and load the authenticated profile.
- Create, list, read, update, and delete a task belonging to the current account.
- Filter by task status, search titles, and paginate API results.
- Calculate overall and per-status progress from stored tasks.
- Provide loading, error/retry, empty, validation, and success feedback.

### Non-functional requirements

- Use environment variables for credentials and API configuration.
- Return JSON and meaningful HTTP status codes.
- Prevent unauthenticated task access and scope database queries by owner.
- Keep layouts usable on phone, tablet, and desktop sizes.
- Avoid exposing secrets in client code or source control.

## User stories and acceptance criteria

| User story | Acceptance criteria |
|---|---|
| As a student, I can register so that I have my own workspace. | Valid data creates a bcrypt-hashed account and returns a JWT; invalid data and duplicate email return actionable errors. |
| As a returning student, I can sign in. | Correct credentials return a token and profile; incorrect credentials return `401` without revealing which field was incorrect. |
| As a student, I can add a study task. | A title of 2–120 characters is required; optional description, priority, status, and due date are persisted and returned. |
| As a student, I can update or remove my task. | Only the owner can update/delete it; another user's task is indistinguishable from a missing task (`404`). |
| As a student, I can focus my task list. | Status and search filters are supported; list responses include page, limit, total, and page count. |
| As a student, I can review progress. | Counts and completion rate are computed from MongoDB task records and update after task changes. |
| As a student using a phone, I can navigate and submit forms. | Navigation and page content reflow; controls have labels/focus states and status feedback is announced. |

## System architecture and request flow

```text
Browser / React SPA (client)
  ├─ React Router: landing, login/register, dashboard, tasks, progress
  ├─ Auth context: profile and token lifecycle
  └─ Central API client: JSON + Authorization: Bearer <JWT>
                    │ HTTP / JSON
                    ▼
Express API (server)
  ├─ Helmet, CORS, JSON limit, auth rate limit
  ├─ /api/auth → auth controller → User model
  ├─ /api/tasks → JWT middleware → task/progress controllers
  ├─ input checks + owner-scoped query filters
  └─ error middleware + /api/health
                    │ Mongoose
                    ▼
MongoDB Atlas
  ├─ users
  └─ tasks (owner references users._id)
```

The client obtains an API base from `VITE_API_URL`. Public authentication endpoints issue a signed JWT. For protected requests, middleware verifies the token and sets the request user ID. Controllers validate request data, restrict task operations to that owner, execute Mongoose queries, and send JSON. The frontend updates its views from returned data; it does not use hardcoded task records for application features.

## Module descriptions

- **Landing page:** Introduces the product and links to account access.
- **Authentication:** Registration/login forms, client validation, session restoration, and sign-out.
- **Dashboard:** User greeting, persisted task totals, completion rate, upcoming/current list, and quick add.
- **Task manager:** Filter/search, create/edit form, priority/due date, status toggle, delete confirmation, success/error states.
- **Progress:** Overall completion, task status breakdown, and recent updates.
- **API client:** Central URL, token attachment, JSON parsing, and explicit network/API errors.
- **Express API:** Authentication, task CRUD, progress aggregation/counts, rate limits, validation, and error mapping.

## Database design

### `User`

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | MongoDB primary key |
| `name` | String | Required, trimmed, 2–60 characters |
| `email` | String | Required, lowercased, trimmed, unique |
| `password` | String | Required bcrypt hash; excluded from queries by default |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

### `Task`

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | MongoDB primary key |
| `owner` | ObjectId reference to User | Required; indexed |
| `title` | String | Required, trimmed, 2–120 characters |
| `description` | String | Optional, up to 1000 characters |
| `status` | String | `todo`, `in_progress`, or `completed`; defaults to `todo` |
| `priority` | String | `low`, `medium`, or `high`; defaults to `medium` |
| `dueDate` | Date or null | Optional |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

**Relationship:** One user owns many tasks (`User 1 ─── 0..* Task`). `Task.owner` references `User._id`. Deleting an account is not exposed in this MVP; if added, an explicit cascade/retention policy is required. Indexes support owner/status filtering and owner plus newest-first sorting.

## API design

Base path: `/api`. JSON request/response bodies. Protected routes use `Authorization: Bearer <token>`.

| Method and path | Auth | Input | Response |
|---|---|---|---|
| `GET /health` | No | None | `200 { status, service, timestamp }` |
| `POST /auth/register` | No | `{ name, email, password }` | `201 { token, user }` |
| `POST /auth/login` | No | `{ email, password }` | `200 { token, user }` |
| `GET /auth/me` | Yes | None | `200 { user }` |
| `GET /tasks?page=1&limit=10&status=...&search=...` | Yes | Optional query | `200 { tasks, pagination: { page, limit, total, pages } }` |
| `GET /tasks/progress` | Yes | None | `200 { progress: { total, completed, inProgress, todo, completionRate, recent } }` |
| `POST /tasks` | Yes | Task fields | `201 { task }` |
| `GET /tasks/:id` | Yes | ObjectId in path | `200 { task }` |
| `PATCH /tasks/:id` | Yes | One or more valid task fields | `200 { task }` |
| `DELETE /tasks/:id` | Yes | ObjectId in path | `200 { message }` |

**Error codes:** `400` invalid fields, date, identifier, or empty update; `401` missing/invalid/expired token or invalid credentials; `404` unknown route/task; `409` duplicate email; `429` authentication rate limit; `500` unanticipated server error. Errors use `{ message }`, optionally with `{ errors: [...] }`.

## Implementation and security

The server loads configuration from environment variables and does not listen if MongoDB or a sufficiently long JWT secret is missing. Passwords use bcrypt with 12 rounds. JWT authentication is checked before task/progress routes. Every read, update, and delete uses both task ID and authenticated owner ID; clients cannot choose or change the owner. Inputs have length and enum checks, and search text is escaped before building a regular expression. JSON payload size is limited; authentication routes are rate-limited; Helmet sets security headers; CORS allows only configured origins (and non-browser requests). Production deployment should use HTTPS and a restricted Atlas network policy.

The browser stores the bearer token in localStorage for this teaching MVP. XSS could expose it; secure HttpOnly cookies with CSRF controls are a production alternative. Password reset, email verification, comprehensive audit logging, and automated security tests are not implemented.

## Testing plan and results

### Automated checks provided

- `npm run check:server`: Node syntax checks for server entry points and controllers.
- `npm test`: API contract checks for health, registration validation, malformed JSON, authentication guards, invalid status/ID handling, and CORS rejection; these checks do not need Atlas.
- `npm run build`: Vite production client build.

### Manual acceptance test plan

1. With valid Atlas/network settings, start API and client; `GET /api/health` returns `200`.
2. Register a new fictional test account; inspect that only the hash is stored and API returns the profile/token.
3. Reject malformed email, short password, and duplicate account; verify clear error status/message.
4. Log in with correct and incorrect credentials; test `/api/auth/me` with valid, absent, and invalid tokens.
5. Create tasks with default/optional fields; list/filter/search/page; retrieve one; edit status/title; delete it.
6. Create a second account and verify it cannot read, modify, or delete the first account's task.
7. Verify progress totals after each CRUD change; verify empty-state with a new account.
8. Exercise narrow mobile, tablet, desktop, keyboard navigation, labels, and error/retry states.

### Results / current verification boundary

Verified in this workspace after installing dependencies: `npm run build` completed successfully, `npm run check:server` completed successfully, `npm test` passed all 7 API contract checks, and `npm audit` reported 0 vulnerabilities. The Vite dev server was opened in a browser and the landing and registration pages rendered. Starting the API without configuration failed immediately with the expected `JWT_SECRET` setup message. Database-backed journeys cannot be verified until a valid Atlas URI, Atlas database user, and network allow-list are configured. No live deployment, GitHub publication, or screenshot file saved in the repository is claimed by this report.

## Deployment process

1. Create a MongoDB Atlas Free cluster or other appropriate tier, a database user, and a restricted IP access list. Atlas documents one Free cluster per project and feature limits for this tier. Store the URI only in backend secrets.
2. For a demonstration, Render currently documents free Node web services. Its free instances are explicitly not recommended for production, sleep after 15 minutes idle, take about one minute to wake, have ephemeral local storage, and consume a shared 750-hour monthly allowance. Deploy the server and configure `MONGO_URI`, a unique random `JWT_SECRET` (at least 32 characters), `JWT_EXPIRES_IN`, `NODE_ENV`, `PORT` as required, and `FRONTEND_URL` to the exact client origin.
3. Cloudflare Pages documents a Free plan and default SPA rendering when there is no top-level `404.html`. Build the Vite client with `VITE_API_URL` set to `<deployed-api-origin>/api`, then deploy `client/dist`.
4. Verify HTTPS, CORS, `/api/health`, registration/login, CRUD, and progress from the deployed origin. Recheck current quotas, pricing, Node runtime support, and provider terms before deployment.

Provider documentation checked 2026-10-24: [Render free instances](https://render.com/docs/free), [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Cloudflare Pages SPA behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/), and [MongoDB Atlas free clusters](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/). No host or live URL has been created or verified.

## Limitations and future enhancements

- MongoDB credentials and an Atlas connection are required for all persisted features.
- No password reset, email verification, reminders, course grouping, calendar sync, file attachments, or collaboration.
- Token is stored in localStorage and is not refreshed; expiry requires signing in again.
- Task list UI requests at most 50 items at a time and explains when more exist; server pagination is available for larger clients.
- API/controller integration tests and accessibility automation should be added.
- Future work: secure cookie sessions, password reset, course labels, reminders, recurring tasks, charts over time, export, and automated unit/integration/end-to-end tests.

## Conclusion

StudyFlow demonstrates a complete MERN MVP for student task and progress management: user accounts, private persisted CRUD, API validation, dashboard metrics, and responsive client views. It is ready for local setup after MongoDB Atlas credentials are supplied, and is structured for a separately hosted API and static SPA. Deployment, external publication, and database-backed validation remain user-configured steps.

## Project links

- GitHub repository: Not created or verified.
- Hosted application: Not deployed or verified.
- Screenshots: Not yet captured. Follow [screenshots/README.md](../screenshots/README.md) after configuring Atlas and running the application.
