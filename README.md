# KosherRadar

A crowdsourced, factual kashrut-information directory for restaurants in Israel. KosherRadar is not a rating app and does not certify anything itself. The authoritative requirements are in `PROJECT_SPEC.md`; current status is in `PROGRESS.md` and `REQUIREMENTS_CHECKLIST.md`.

Current state: **Milestone 1 (foundation and auth)** only. Registration, login, account page, protected routes and the seed-admin script exist. Restaurants, certificates, reports, search and maps are later milestones.

## Structure

- `backend/` - Node.js + Express + MongoDB (Mongoose), plain JavaScript ES modules. Its own `package.json`.
- `frontend/` - React + TypeScript + Vite + Tailwind. Its own `package.json`.

The two packages are fully separate. Run install and scripts inside each folder.

## Requirements

- Node.js (a recent LTS) and npm
- A MongoDB Atlas free-tier cluster and its connection string

## Backend setup

```bash
cd backend
npm install
cp .env.example .env     # on Windows PowerShell: Copy-Item .env.example .env
```

Fill in `backend/.env`:

- `MONGODB_URI` - Atlas connection string, including a database name (for example `.../kosherradar?retryWrites=true&w=majority`). Add your IP to the Atlas network access list.
- `JWT_SECRET` - at least 32 characters. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- `CLIENT_URL` - the frontend origin allowed by CORS (default `http://localhost:5173`).
- `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` - used only by the seed script.

`.env` is git-ignored. Never commit it.

### Backend commands

```bash
npm run dev          # start with auto-reload (node --watch)
npm start            # start normally
npm test             # run Vitest
npm run seed:admin   # create the first ADMIN account (safe to run more than once)
```

The API listens on `http://localhost:5000`. Health check: `GET /api/health`.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env     # on Windows PowerShell: Copy-Item .env.example .env
```

`VITE_API_URL` defaults to `http://localhost:5000/api`. Only put non-secret values in this file.

### Frontend commands

```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run typecheck    # tsc -b
npm test             # run Vitest
npm run lint         # oxlint
npm run build        # type-check and production build into dist/
npm run preview      # serve the production build locally
```

## Running locally

1. Start the backend (`cd backend; npm run dev`).
2. Optionally create the admin: `cd backend; npm run seed:admin`.
3. Start the frontend (`cd frontend; npm run dev`) and open `http://localhost:5173`.

## API in Milestone 1

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/health` | public |
| POST | `/api/auth/register` | public, rate-limited; always creates a `USER` |
| POST | `/api/auth/login` | public, rate-limited |
| GET | `/api/auth/me` | logged-in user |
| GET | `/api/users/me` | logged-in user (includes private points) |
| GET | `/api/admin/check` | ADMIN only |

## External services

Cloudinary, Geoapify, Resend and Atlas Search are not used yet. They belong to later milestones.
