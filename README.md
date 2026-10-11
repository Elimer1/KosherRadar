# KosherRadar

A crowdsourced, factual kashrut-information directory for restaurants in Israel. KosherRadar is not a rating app and does not certify anything itself. The authoritative requirements are in `PROJECT_SPEC.md`; current status is in `PROGRESS.md` and `REQUIREMENTS_CHECKLIST.md`.

Current state: **Milestone 4 (search and restaurant pages)** on top of Milestones 1 to 3. Anyone can search approved restaurants on the home page (by name or food, in Hebrew or English, with filters, autocomplete and 20 results per page) and open a restaurant page that shows its kashrut evidence: certificates, EXPIRED certificates and unverified claims, kept apart. Logged-in users can submit restaurants (optionally with a certificate photo), add a certificate to an approved restaurant, and report a problem. Everything they send is saved as `PENDING`; admins review it in the admin dashboard (approve, reject with a reason, edit, delete, resolve reports), and users can reset a forgotten password by email. The map, location search, share button and the Hebrew interface are Milestone 5.

Nothing in this project has been run against a real MongoDB, Cloudinary or Resend account yet. See `PROGRESS.md` for what is tested and what is not.

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

- `RESEND_API_KEY` and `EMAIL_FROM` - from your Resend free account (see "Email (Resend)" below). Without them everything else works: moderation decisions are still saved and the admin sees that the email was not sent, but password reset emails are not delivered.

- `ATLAS_SEARCH_ENABLED` (default `false`) and `ATLAS_SEARCH_INDEX` (default `restaurant_search`) - optional typo-tolerant search. Search works without it (it then uses a plain MongoDB query). To switch it on, create the Atlas Search index described in `ATLAS_SEARCH_SETUP.md`. **That guide was written but never run against a real Atlas cluster.**

`.env` is git-ignored. Never commit it.

### Email (Resend)

Rejection reasons (restaurants, certificates, reports) and password reset links are sent through [Resend](https://resend.com) using its REST API.

1. Create a Resend account and an API key (https://resend.com/api-keys), and put it in `RESEND_API_KEY`.
2. `EMAIL_FROM` must be a sender on a domain you verified in Resend, for example `KosherRadar <noreply@your-domain.com>`.
3. **Sandbox limit:** without a verified domain, Resend only lets you send from `onboarding@resend.dev` and only to the email address of your own Resend account. Emails to other users will fail until a domain is verified.
4. A failed or missing email never undoes a moderation decision. The admin screen says whether the email was `sent`, `failed` or `not configured`. Password reset never reveals whether an email has an account, so a failed reset email is only visible in the server log.
5. Emails are plain text. The reset link points to `CLIENT_URL` + `/reset-password?token=...`, so `CLIENT_URL` must be the real address of the frontend.

### Backend commands

```bash
npm run dev          # start with auto-reload (node --watch)
npm start            # start normally
npm test             # run Vitest
npm run seed:admin   # create the first ADMIN account (safe to run more than once)
npm run search:rebuild  # fill the search fields of restaurants that already exist (see below)
```

**After updating to Milestone 4, run `npm run search:rebuild` once.** Search uses three fields (`nameTokens`, `foodTokens`, `foodGroups`) that are built every time a restaurant is saved. Restaurants saved before Milestone 4 do not have them yet, so they will not be found until the script has run. It is safe to run again.

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
| POST | `/api/auth/forgot-password` | public, limited to 5 per hour per IP; same answer for every email |
| POST | `/api/auth/reset-password` | public, rate-limited; body `token` (64 hex characters) and `password`; token works once, 60 minutes |
| GET | `/api/auth/me` | logged-in user |
| GET | `/api/users/me` | logged-in user (includes private points) |
| GET | `/api/admin/check` | ADMIN only |
| GET | `/api/options` | public; hechsher list, food types, categories, levels |
| GET | `/api/restaurants?q&level&hechsher&foodType&category&hideExpired&includeUnknown&lat&lng&radiusKm&page` | public, rate-limited; search APPROVED restaurants, 20 per page, response has `items`, `total`, `hasMore`, `capped` and `search.mode` (`ATLAS` or `BASIC`). A radius needs `lat` and `lng`. Without a location the order is relevance (with text) or A-Z; with one it is nearest first |
| GET | `/api/restaurants/suggestions?q&...` | public, rate-limited; autocomplete, at most 8 rows, `q` needs 2 characters |
| GET | `/api/restaurants/:restaurantId` | public, rate-limited; one APPROVED restaurant with all public kashrut evidence and public certificates (404 for any other status, no admin data) |
| GET | `/api/restaurants/:restaurantId/submission-context` | public; name/address and the public certificates of an APPROVED restaurant (404 for any other status) |
| POST | `/api/restaurants` | logged-in; multipart: `restaurant` JSON, optional `teuda` JSON and `photo` file; saves PENDING |
| POST | `/api/restaurants/:restaurantId/teudot` | logged-in; multipart: `teuda` JSON and `photo` file; restaurant must be APPROVED; saves PENDING |
| POST | `/api/reports` | logged-in; JSON; restaurant must be APPROVED; saves PENDING |

Admin endpoints (every one needs a valid login **and** the `ADMIN` role; the server checks both on each request):

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/admin/restaurants/pending` | pending restaurants, paginated, with possible duplicates |
| GET | `/api/admin/restaurants?search&status&page&limit` | search / browse all restaurants |
| POST | `/api/admin/restaurants` | create an APPROVED restaurant; multipart: `restaurant`, optional `extras`, optional `teuda` and `photo` |
| GET / PUT / DELETE | `/api/admin/restaurants/:restaurantId` | details (with every certificate and a preview of what the public would see) / edit / delete with its certificates and reports |
| POST | `/api/admin/restaurants/:restaurantId/approve` or `/reject` | approve / reject (`reason` required, saved and emailed) |
| POST | `/api/admin/restaurants/:restaurantId/teudot` | add an APPROVED certificate (the date may be in the past) |
| GET | `/api/admin/teudot/pending` and `/api/admin/teudot/expiring-soon` | pending certificates (with conflict warnings) / valid certificates expiring within 30 days |
| PUT / DELETE | `/api/admin/teudot/:teudaId` | edit (including a private admin note) / delete |
| POST | `/api/admin/teudot/:teudaId/approve` or `/reject` | approve (needs an approved restaurant; a conflict is only a warning) / reject with a reason |
| GET | `/api/admin/reports/pending` | pending reports |
| POST | `/api/admin/reports/:reportId/resolve` or `/reject` | resolve (`APPLY_PROPOSED`, `CORRECTION_ALREADY_MADE` or `NO_CORRECTION`) / reject with a reason |

Public pages (no login needed), added in Milestone 4:

- `/` - the search page: one search box (restaurant name or food), autocomplete, filters (kashrut level, hechsher, food type, category, hide expired, include unknown, "use my current location" with a radius) and a Load More button.
- `/restaurants/:restaurantId` - the restaurant page: status in words, certificates with their photo, mashgiach details and EXPIRED labels, unverified claims shown separately, a Kosharot link when an admin added one, Call / Google Maps / Waze links, and links to add a certificate or report a problem.

Submission pages in the frontend (all need login):

- `/submit-restaurant` - linked from the navbar and home page.
- `/restaurants/:restaurantId/add-teuda` and `/restaurants/:restaurantId/report` - linked from the restaurant page (anonymous visitors are sent to the login page first).

Other pages added in Milestone 3:

- `/forgot-password` and `/reset-password?token=...` - password reset (no login needed; linked from the login page).
- `/admin` - admin dashboard with five tabs (pending restaurants, pending certificates, pending reports, expiring soon, manage restaurants). Admin-only: the navbar shows an "Admin" link only to admins, and the server rejects non-admin calls anyway.
- `/admin/restaurants/new`, `/admin/restaurants/:restaurantId` and `/admin/restaurants/:restaurantId/add-teuda` - create, review/edit and add a certificate.

To try the admin area: run `npm run seed:admin`, log in with that account, and open `/admin`. To get the first ADMIN you need the seed script; nobody can become an admin by signing up.

### Kashrut rules

- A restaurant's public status is derived from its approved certificates and is never stored: **verified** (a valid certificate), **unverified** (only the restaurant's own claim), **expired** (only expired certificates), **unknown** (nothing). A certificate that expired up to six months ago (Israel calendar date) can still be shown, clearly marked expired; older ones are visible to admins only.
- Approving a certificate that has the same kashrut level as another currently valid approved certificate of the same restaurant only shows a warning to the admin (different levels, such as Rabbanut and Mehadrin, can coexist). A certificate can never be approved before its restaurant is approved.
- Rejecting anything requires a reason, which is saved and emailed to the contributor. The decision is saved even if the email fails.
- Private points go to the contributor once per item: +3 when the certificate sent together with a new restaurant is approved, +2 when a certificate added to an existing restaurant is approved, +1 when a report's correction is applied. A restaurant without a certificate earns nothing, admins do not collect points, and approving the same item twice cannot award points twice.

### Search rules

- Only APPROVED restaurants are searchable. Status and certificate filters reuse the same kashrut service as the restaurant page, so a restaurant never shows two different statuses.
- The text is matched against the restaurant name (any language) and its food: `foodKeywords` plus a built-in Hebrew / English synonym list (for example "פיצה" finds "pizza"). **The synonym list was written by the agent and has not been reviewed by the team.**
- The level and hechsher filters must match the **same** certificate (or claim); "hide expired" removes expired evidence; restaurants with unknown status only appear with "include unknown" and never match a kashrut filter.
- Because status depends on dates, the database narrows the candidates first (at most 2000, sorted by name) and the server then applies the kashrut filters and the sort. If more than 2000 restaurants match, the response has `capped: true` and the page tells the visitor that the list may be incomplete.
- Search works fully without Atlas Search. With `ATLAS_SEARCH_ENABLED=true` it also finds restaurants with a mistyped name; if Atlas fails, the plain search is used and the page says so.

### Submission rules

- A new restaurant, certificate or report is always `PENDING`. The client cannot set status, owner, points or admin notes; those fields are ignored.
- A certificate needs a photo (JPG, PNG or WebP, up to 5 MB). The server checks the real file bytes, not the file name or the browser-reported type.
- A new certificate must expire today (Israel date) or later, and not more than five years ahead.
- Restaurants can be sent without coordinates. Coordinates are never guessed; a restaurant without them cannot be placed on the map until they are added.
- Possible duplicates (same Geoapify place id, phone, address, or a similar name within 300 m) are saved on the new restaurant for admins and never block the submission.
- A report cannot target a certificate that expired more than six months ago (admin-only).
- Sending the same restaurant, certificate or report twice while the first is still pending answers `409`.

## External services

Cloudinary is used for certificate photos and Resend for emails (see setup above). Atlas Search is optional (see `ATLAS_SEARCH_SETUP.md`). Geoapify is not used yet; it belongs to Milestone 5.
