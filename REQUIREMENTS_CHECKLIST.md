# Requirements Checklist

Statuses: `NOT STARTED`, `IN PROGRESS`, `IMPLEMENTED UNVERIFIED`, `TESTED`, `BLOCKED`. `TESTED` requires evidence (a passing test or a real run), recorded in the Evidence column.
Source of requirements: `PROJECT_SPEC.md`.

Evidence below comes from `npm test` runs on `main` after merging both feature branches: backend 4 files / 40 tests passed; frontend 1 file / 11 tests passed; frontend `npm run typecheck`, `npm run build` and `npm run lint` succeeded.

## Milestone 1 — Foundation and auth

| Requirement (spec section) | Status | Files / tests / evidence |
| --- | --- | --- |
| Master spec saved as `PROJECT_SPEC.md` (intro) | TESTED | `PROJECT_SPEC.md` matches the supplied prompt (verified at the start of Milestone 1) |
| Coding style notes with honest findings (0A) | TESTED | `CODING_STYLE_NOTES.md` records "No verified JS/TS source samples available" for both developers |
| Separate `backend/` and `frontend/` packages (0, 13) | TESTED | Separate `package.json` and lockfiles; both installed and run independently |
| Backend plain JS ES modules, layered flow (0, 0A) | IMPLEMENTED UNVERIFIED | `backend/src/{routes,controllers,services,repositories,models}`; layering is a code-structure property with no test |
| `.env.example` files, `.env` ignored (2, 14) | TESTED | `backend/.env.example`, `frontend/.env.example`; `.gitignore`; `git status` shows no `.env` |
| Mongoose models User/Restaurant/Teuda/Report (3) | TESTED | `backend/tests/models.test.js` (User, Restaurant, Teuda schema rules). `Report` and `PasswordResetToken` have no direct test |
| Registration assigns USER server-side, ignores role/points (3, 4) | TESTED | `authService.test.js` ("never passes role or points"); `middleware.test.js` (`validateBody` drops role/points) |
| bcrypt password hashing (4) | TESTED | `authService.test.js` ("hashes the password") |
| JWT login, 24h expiry, Bearer header (4) | TESTED | `authService.test.js` (24h expiry, wrong secret, expired token); frontend `attachToken` test |
| `authMiddleware` / `adminMiddleware` (4) | TESTED | `middleware.test.js` (no header, bad token, valid token, USER blocked with 403, ADMIN allowed) |
| Zod validation middleware (4) | TESTED | `middleware.test.js` (short password, object instead of string, over-72-char password) |
| Central error middleware, consistent error shape (4) | TESTED | `middleware.test.js` (`errorMiddleware`: app error, Zod, duplicate key 409, DB down 503, hides internals in production) |
| Auth endpoint rate limiting (4) | IMPLEMENTED UNVERIFIED | `backend/src/middleware/rateLimiters.js` (30 requests per 15 minutes) on login/register; no test and not exercised against a running server |
| CORS from env origin (4) | IMPLEMENTED UNVERIFIED | `backend/src/app.js` uses `CLIENT_URL`; not exercised against a running server |
| Seed-admin script, idempotent, env credentials (14) | IMPLEMENTED UNVERIFIED | Service logic TESTED in `adminSeedService.test.js` (new admin, promote user, run twice, missing credentials, short password); the script was not run against a real MongoDB |
| Basic auth Vitest tests (15) | TESTED | Backend 40 tests passed; frontend 11 tests passed |
| Frontend: Zustand persisted auth, shared Axios, interceptor (4) | TESTED | `frontend/src/api/axiosInstance.test.ts` (auth store persistence, `attachToken`) |
| Frontend: expired-token 401 logs out only (4, 18) | TESTED | `axiosInstance.test.ts` (`isExpiredSessionError` true only for 401 on an authenticated, non-login request; false for 403, 500, network errors, login 401). Not exercised in a real browser |
| Frontend: login/register/account pages, protected routes | IMPLEMENTED UNVERIFIED | `frontend/src/pages/*`, `ProtectedRoute.tsx`; compiles, builds and lints, but there are no component tests and no browser run |
| Private points shown on own account only (7) | IMPLEMENTED UNVERIFIED | Backend `getMyProfileService` includes points (TESTED, `middleware.test.js`); `AccountPage.tsx` shows them; the page was not run against a real API |
| Real frontend -> Express -> MongoDB flow verified (15) | BLOCKED | No `backend/.env` / MongoDB Atlas connection string available in this environment. Nothing was verified against a real database |
| Root README with install/start/test/build commands (14) | IMPLEMENTED UNVERIFIED | `README.md`; commands match the package scripts but the full setup was not repeated from a clean clone |
| Feature-branch commits with per-feature authors (19) | TESTED | `git log`: backend and docs by Eli Mermelstein, frontend by Moshe Silber; features merged with `--no-ff` |

## Milestone 2 — Submissions and image upload

| Requirement | Status | Notes |
| --- | --- | --- |
| Restaurant/teuda/report submission workflows (6, 10) | NOT STARTED | |
| Cloudinary upload and validation (2) | NOT STARTED | |
| Manual entry, initial duplicate warning (6) | NOT STARTED | |

## Milestone 3 — Admin and kashrut business rules

| Requirement | Status | Notes |
| --- | --- | --- |
| Moderation dashboard tabs (6) | NOT STARTED | |
| Approve / reject (reason required) / edit / delete (6) | NOT STARTED | |
| Kashrut status derivation, six-month rule (5) | NOT STARTED | |
| Conflict warning, overrideable (5.8) | NOT STARTED | |
| Rejection emails via Resend, failure does not roll back (6, 12) | NOT STARTED | |
| Private contribution points, idempotent (7) | NOT STARTED | |
| Password reset via Resend (4) | NOT STARTED | `PasswordResetToken` model exists from Milestone 1; no endpoints or email yet |
| Kosharot URL (6) | NOT STARTED | |

## Milestone 4 — Search and restaurant pages

| Requirement | Status | Notes |
| --- | --- | --- |
| Atlas Search + Mongoose fallback, `ATLAS_SEARCH_SETUP.md` (2, 14) | NOT STARTED | |
| Bilingual food search (8) | NOT STARTED | |
| Autocomplete: 2 chars, 300ms debounce (8) | NOT STARTED | |
| Filters and 20-per-page Load More (8) | NOT STARTED | |
| Restaurant detail page (10) | NOT STARTED | |

## Milestone 5 — Maps, location, interface polish

| Requirement | Status | Notes |
| --- | --- | --- |
| Leaflet map, clustering, bounds queries (9) | NOT STARTED | |
| Geoapify location (8, 10) | NOT STARTED | |
| Waze / Google Maps / share (8, 10) | NOT STARTED | |
| English + Hebrew, RTL/LTR (11) | NOT STARTED | |
| Responsive across four width ranges (11) | NOT STARTED | |
| List/Map exclusive toggle, saved view (8, 18) | NOT STARTED | |

## Milestone 6 — Full verification and fixes

| Requirement | Status | Notes |
| --- | --- | --- |
| End-to-end checks against real services (15) | NOT STARTED | |
| Security / data-leak review (15) | NOT STARTED | |
| README completion, requirements reconciliation | NOT STARTED | |

## Milestone 7 — Hebrew project book

| Requirement | Status | Notes |
| --- | --- | --- |
| `PROJECT_BOOK.md` in Hebrew based on actual implementation (16) | NOT STARTED | |
