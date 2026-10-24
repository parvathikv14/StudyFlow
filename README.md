# StudyFlow — Student Task & Progress Manager

StudyFlow is a full-stack student productivity app for planning assignments, keeping due dates visible, and tracking completed work. It is built with MongoDB, Express, React, and Node.js (MERN), with Vite for the client.

> This project uses the requested fallback topic because the workspace was empty. It does not include fictional seeded accounts or hardcoded task data; your account's information is loaded from the API and stored in MongoDB.

## Features

- Student registration and login with hashed passwords and signed JWTs.
- Personal dashboard with task totals and completion progress.
- Create, view, edit, complete, search, filter, and delete tasks.
- Priority, due date, and status fields for each task.
- Owner-scoped API access, pagination, validation, and safe error responses.
- Responsive landing, dashboard, authentication, task, and progress screens.
- Health endpoint at `/api/health`.

## Technology and structure

```text
client/                 React 18 + Vite SPA
  src/components/       Shared layout, task and state components
  src/lib/api.js         Central fetch API client
  src/pages/             Landing, auth, dashboard, tasks, progress
  src/state/             Authentication context
server/                 Express API
  src/config/            MongoDB connection
  src/controllers/       Authentication and task operations
  src/middleware/        JWT authentication and errors
  src/models/            Mongoose User and Task schemas
  src/routes/            API route definitions
docs/PROJECT_REPORT.md   Assignment report
screenshots/             Screenshot capture instructions
```

### Request flow

The React app sends JSON requests to the Express API using `VITE_API_URL`. After registration or login, it sends the JWT as a Bearer token. Authentication middleware verifies the token, controllers validate input and scope database operations to the signed-in user's ID, Mongoose communicates with MongoDB Atlas, and the API returns JSON with an appropriate status code. The frontend then renders the result or an actionable loading, empty, or error state.

## Requirements

- Node.js 20 or newer (use an active LTS release) and npm.
- A MongoDB Atlas cluster and database user for persistent storage.
- A modern browser.

## Run locally

1. Open this repository folder in VS Code.
2. In the integrated terminal, run `npm install` from the repository root.
3. Copy `server/.env.example` to `server/.env`. Set `MONGO_URI` to your Atlas connection string. Set `JWT_SECRET` to a randomly generated secret of at least 32 characters. Do not share, commit, or put these values in a `VITE_` variable.
4. Copy `client/.env.example` to `client/.env`. The default API URL works when the backend uses its default port.
5. In MongoDB Atlas, add your current IP address to Network Access and create a database user with a strong password. Replace the placeholders in `MONGO_URI`; URL-encode special characters in the database password.
6. Start both applications using `npm run dev`.
7. Open the Vite URL printed by the client (normally `http://localhost:5173`), register your own account, and create tasks.

The API listens on port 5000 by default. It refuses to start if MongoDB or the required JWT secret is missing; this is intentional so failures are visible rather than appearing as a working app with nowhere to save data.

### Troubleshooting: port 5173 is already in use

Only one Vite development server can use port 5173 at a time. If you see this error, a previous copy of StudyFlow may already be running. Try opening `http://localhost:5173` first. If the app is responding, keep using that copy instead of starting a second one.

To restart both apps, press `Ctrl+C` in the terminal where the previous `npm run dev` is running, then run `npm run dev` again from the project root. If you cannot find that terminal, inspect the listeners in PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 5173,5000 -State Listen | Select-Object LocalPort, OwningProcess
Get-CimInstance Win32_Process -Filter "ProcessId = <PID>" | Select-Object ProcessId, CommandLine
```

Only after confirming the command belongs to this StudyFlow workspace, stop that specific process with `Stop-Process -Id <PID>`, then start the app again. Do not stop a process you do not recognize. Port 5000 can have the same issue for the API. Vite deliberately uses a fixed port so its URL stays aligned with the default API/CORS configuration.

## Environment variables

| Variable | Location | Purpose |
|---|---|---|
| `MONGO_URI` | server | MongoDB Atlas connection string |
| `JWT_SECRET` | server | Random secret used to sign access tokens (32+ characters) |
| `JWT_EXPIRES_IN` | server | Token lifetime; defaults to `7d` |
| `PORT` | server | API listen port; defaults to `5000` |
| `NODE_ENV` | server | Runtime mode |
| `FRONTEND_URL` | server | Allowed client origin(s), comma-separated |
| `VITE_API_URL` | client | API base URL, including `/api` |

See [server/.env.example](./server/.env.example) and [client/.env.example](./client/.env.example) for placeholder values. Never commit actual `.env` files.

## API overview

All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Request | Success |
|---|---|---:|---|---|
| GET | `/api/health` | No | — | `200 { status, service, timestamp }` |
| POST | `/api/auth/register` | No | `{ "name", "email", "password" }` | `201 { token, user }` |
| POST | `/api/auth/login` | No | `{ "email", "password" }` | `200 { token, user }` |
| GET | `/api/auth/me` | Yes | — | `200 { user }` |
| GET | `/api/tasks?page=1&limit=10&status=todo&search=...` | Yes | Query filters are optional | `200 { tasks, pagination }` |
| GET | `/api/tasks/progress` | Yes | — | `200 { progress }` |
| POST | `/api/tasks` | Yes | `{ "title", "description?", "status?", "priority?", "dueDate?" }` | `201 { task }` |
| GET | `/api/tasks/:id` | Yes | — | `200 { task }` |
| PATCH | `/api/tasks/:id` | Yes | Any task fields to update | `200 { task }` |
| DELETE | `/api/tasks/:id` | Yes | — | `200 { message }` |

Task status is `todo`, `in_progress`, or `completed`; priority is `low`, `medium`, or `high`. Common errors: `400` invalid input/ID, `401` missing or invalid authentication, `404` missing route/task, `409` duplicate email, `429` authentication rate limit exceeded, and `500` unexpected server error. Error responses include a human-readable `message`; validation responses may also include `errors`.

## Tests and checks

```sh
npm run check:server  # Node syntax checks for server entry points
npm test              # API health, validation, auth guard, and CORS checks (no Atlas required)
npm run build         # Vite production build
```

The automated API checks use Node's built-in test runner and exercise paths that do not require Atlas. Full database-backed manual checks still require Atlas: create an account, call `/api/auth/me`, create/edit/complete/filter/delete a task, then confirm dashboard and progress counts update. See the report for the full test plan and current validation boundary.

## Deployment preparation

- **Database:** MongoDB Atlas offers a Free cluster for development; its free tier has a limited feature set and Atlas permits one free cluster per project. Create a database user, restrict Network Access appropriately, and keep the URI in the backend host's secret/environment settings.
- **API:** Render currently offers a free Node web-service option for demos, but its docs explicitly say not to use free instances for production. Free services spin down after 15 minutes without traffic, can take about a minute to wake, have ephemeral local storage, and share a 750 free-instance-hour monthly workspace allowance. MongoDB Atlas, not local filesystem, holds application data. Configure `MONGO_URI`, a new strong `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, `PORT` (if required), and `FRONTEND_URL` with the exact deployed client origin. Use `npm start` or a workspace-aware build.
- **Client:** Cloudflare Pages provides a Free plan with documented build/file limits and assumes SPA behavior when the deployed site has no top-level `404.html`. Build with `npm run build -w client`; publish `client/dist`. Set `VITE_API_URL` to the deployed API URL plus `/api` before building.
- These are currently documented free/demo options, not a guarantee that free service is suitable for production or that provider terms will not change. Review quotas, pricing, supported Node runtime, region, account requirements, and current service terms before creating services. Upgrade to paid compute if the expected availability/performance is needed.

Provider references checked 2026-10-24: [Render free instances](https://render.com/docs/free), [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Cloudflare Pages SPA behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/), and [MongoDB Atlas free clusters](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/).

No GitHub repository or hosted URL has been created or verified. Publishing and deployment require your explicit approval and your own hosting/GitHub access. See [the project report](./docs/PROJECT_REPORT.md) and [screenshot instructions](./screenshots/README.md).

## Security and privacy

Passwords are hashed with bcryptjs and are never returned by the API. JWT secrets and MongoDB credentials are server-only. The API uses Helmet, configured CORS, a small JSON body limit, authentication rate limiting, input checks, and per-user resource queries. The browser currently stores the access token in localStorage, which is practical for this student project but increases exposure if a cross-site scripting flaw is introduced; a production system should consider secure, HttpOnly cookies and CSRF protection. Use HTTPS in production.
#   S t u d y F l o w  
 