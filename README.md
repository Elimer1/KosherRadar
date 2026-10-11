# KosherRadar

A crowdsourced, factual kashrut-information directory for restaurants in Israel. KosherRadar is not a rating app and does not certify anything itself. The authoritative requirements are in `PROJECT_SPEC.md`; current status is in `PROGRESS.md` and `REQUIREMENTS_CHECKLIST.md`.

Current state: **Milestone 2 (submissions and image upload)** on top of Milestone 1. Logged-in users can submit restaurants (optionally with a certificate photo), add a certificate to an approved restaurant, and report a problem. Everything is saved as `PENDING`. The admin dashboard, approval, public restaurant pages, search and maps are later milestones, so submitted data is not visible anywhere on the site yet.

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
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - from your Cloudinary free account (Dashboard, Settings, API Keys). They stay on the server. Without them everything else works, but uploading a certificate photo answers `503 Image upload is not available`.

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

## API

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/health` | public |
| POST | `/api/auth/register` | public, rate-limited; always creates a `USER` |
| POST | `/api/auth/login` | public, rate-limited |
| GET | `/api/auth/me` | logged-in user |
| GET | `/api/users/me` | logged-in user (includes private points) |
| GET | `/api/admin/check` | ADMIN only |
| GET | `/api/options` | public; hechsher list, food types, categories, levels |
| GET | `/api/restaurants/:restaurantId/submission-context` | public; name/address and the public certificates of an APPROVED restaurant (404 for any other status) |
| POST | `/api/restaurants` | logged-in; multipart: `restaurant` JSON, optional `teuda` JSON and `photo` file; saves PENDING |
| POST | `/api/restaurants/:restaurantId/teudot` | logged-in; multipart: `teuda` JSON and `photo` file; restaurant must be APPROVED; saves PENDING |
| POST | `/api/reports` | logged-in; JSON; restaurant must be APPROVED; saves PENDING |

Submission pages in the frontend (all need login):

- `/submit-restaurant` - linked from the navbar and home page.
- `/restaurants/:restaurantId/add-teuda` and `/restaurants/:restaurantId/report` - there is no restaurant page or search yet (Milestone 4), so these are only reachable by typing the URL with the id of an APPROVED restaurant. Approving restaurants arrives with the admin dashboard (Milestone 3).

### Submission rules

- A new restaurant, certificate or report is always `PENDING`. The client cannot set status, owner, points or admin notes; those fields are ignored.
- A certificate needs a photo (JPG, PNG or WebP, up to 5 MB). The server checks the real file bytes, not the file name or the browser-reported type.
- A new certificate must expire today (Israel date) or later, and not more than five years ahead.
- Restaurants can be sent without coordinates. Coordinates are never guessed; a restaurant without them cannot be placed on the map until they are added.
- Possible duplicates (same Geoapify place id, phone, address, or a similar name within 300 m) are saved on the new restaurant for admins and never block the submission.
- A report cannot target a certificate that expired more than six months ago (admin-only).
- Sending the same restaurant, certificate or report twice while the first is still pending answers `409`.

## External services

Cloudinary is used for certificate photos (see setup above). Geoapify, Resend and Atlas Search are not used yet. They belong to later milestones.
