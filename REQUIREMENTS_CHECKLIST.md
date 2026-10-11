# Requirements Checklist

Statuses: `NOT STARTED`, `IN PROGRESS`, `IMPLEMENTED UNVERIFIED`, `TESTED`, `BLOCKED`. `TESTED` requires evidence (a passing test or a real run), recorded in the Evidence column.
Source of requirements: `PROJECT_SPEC.md`.

Evidence for Milestone 1 came from `npm test` runs on `main` after merging both feature branches (backend 4 files / 40 tests, frontend 1 file / 11 tests). After the Milestone 2 merges, `main` runs backend 13 files / 150 tests and frontend 4 files / 24 tests, all passing; frontend `npm run typecheck`, `npm run build` and `npm run lint` succeed. No MongoDB, Cloudinary account or browser was available, so nothing was verified against real services.

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

"Unit tests" below means Vitest with mocked repositories; none of these ran against a real MongoDB.

| Requirement (spec section) | Status | Files / tests / evidence |
| --- | --- | --- |
| New restaurant submission, saved PENDING, client cannot set status/owner (6) | TESTED | `restaurantSubmissionService.js`; `restaurantSubmissionService.test.js` (PENDING even for an ADMIN user), `restaurantSchemas.test.js` (extra fields ignored). Unit tests only |
| Restaurant submitted together with a first teuda (6) | TESTED | `restaurantSubmissionService.test.js` (teuda PENDING, `submittedWithNewRestaurant: true`; restaurant and photo removed if the teuda cannot be saved). Unit tests only |
| New teuda for an existing APPROVED restaurant, PENDING, existing teudot untouched (6) | TESTED | `teudaSubmissionService.js`; `teudaSubmissionService.test.js` (404 for pending/rejected restaurant; only creates one new record). Unit tests only |
| Report / correction submission, PENDING, no correction applied (6) | TESTED | `reportSubmissionService.js`; `reportSubmissionService.test.js`, schema tests. Unit tests only |
| Users cannot approve, edit or delete (4) | TESTED | `submissionRoutes.test.js` (only the expected routes exist; every create route uses `authMiddleware`). Admin approval itself is Milestone 3 |
| Anonymous users are prompted to log in (10) | IMPLEMENTED UNVERIFIED | Submission pages sit behind the existing `ProtectedRoute`; not run in a browser |
| Cloudinary upload through Express, server-only credentials (2) | IMPLEMENTED UNVERIFIED | `config/cloudinary.js`, `imageUploadService.js`; `imageUpload.test.js` uses a mocked SDK (URL + public id saved, failure gives 502, missing config gives 503). **No real Cloudinary upload was done** |
| Photo validation: JPG/PNG/WebP by real bytes, max 5 MB, server side (2) | TESTED | `utils/imageType.js`, `imageUpload.test.js` (renamed script, PDF, GIF, empty file rejected; >5 MB gives 413). A throwaway HTTP run through multer + Zod also gave 400/413 as expected (script not committed) |
| Photo validation client side (2) | TESTED | `frontend/src/utils/imageCheck.test.ts`; the file picker UI itself was not run in a browser |
| Upload and submission rate limits (4) | IMPLEMENTED UNVERIFIED | `middleware/rateLimiters.js`; not exercised against a running server |
| Upload progress and success/error feedback (10) | IMPLEMENTED UNVERIFIED | `SubmitTeudaPage.tsx`, `SubmitRestaurantPage.tsx`; compiled only |
| Honest failure: no fake certificate when upload fails (12) | TESTED | `teudaSubmissionService.test.js`, `restaurantSubmissionService.test.js` (nothing saved when upload fails; photo deleted when saving fails) |
| Manual entry; coordinates never invented (10, 12) | TESTED | `models.test.js` (no `location` without coordinates), `restaurantSchemas.test.js` (both or neither, inside Israel). Address geocoding is Milestone 5 |
| Expiration is a date-only value in Israel time (3, 5) | TESTED | `utils/israelDate.js`, `teudaRulesService.test.js` (UTC+2 and UTC+3 cases, calendar-month math) |
| Submitted teuda must still be valid, at most 5 years ahead (3) | TESTED | `teudaRulesService.test.js` (`checkExpirationForSubmission`) |
| Reports blocked against admin-only (>6 months expired) teudot (5.3) | TESTED | `reportSubmissionService.test.js`; `getTeudaVisibility` boundary tests. Only the date helper exists; full status derivation is Milestone 3 |
| Standard hechsher list + Other free text (3) | IMPLEMENTED UNVERIFIED | `config/constants.js`, `GET /api/options`, schema tests for OTHER. **The list of names was written by the agent and has not been reviewed by the team** |
| Initial duplicate warning, never blocks (6) | TESTED | `duplicateService.js`; `duplicateService.test.js`, `restaurantSubmissionService.test.js`. The MongoDB queries (`$or` on indexed fields, `$geoWithin`) were not run against a real database |
| Guard against accidental double submits (4) | TESTED | 409 tests for restaurant, teuda and report. Unit tests only |
| Zod validation, NoSQL-injection-safe inputs, safe URLs (4) | TESTED | `submissionSchemas.test.js`, `restaurantSchemas.test.js` (objects instead of strings, `javascript:` links, bad ids) |
| No points awarded at submission (7) | IMPLEMENTED UNVERIFIED | No points code exists in Milestone 2 and no test asserts it. `submittedWithNewRestaurant` is stored for the Milestone 3 +3 / +2 decision |
| Submission pages (restaurant, certificate, report) (10) | IMPLEMENTED UNVERIFIED | `SubmitRestaurantPage.tsx`, `SubmitTeudaPage.tsx`, `SubmitReportPage.tsx`; typecheck, lint and build pass, API payload builders tested; **no browser run**. English only until Milestone 5 |
| Entry points for certificate/report pages (10) | NOT STARTED | Needs the restaurant detail page (Milestone 4); until then only reachable by URL |
| Real submission flow against MongoDB + Cloudinary (15) | BLOCKED | No MongoDB connection string, Cloudinary account, or `backend/.env` here |

## Milestone 3 — Admin and kashrut business rules

| Requirement | Status | Notes |
| --- | --- | --- |
| Moderation dashboard tabs (6) | NOT STARTED | |
| Approve / reject (reason required) / edit / delete (6) | NOT STARTED | |
| Kashrut status derivation, six-month rule (5) | IN PROGRESS | Date rule `getTeudaVisibility` exists and is tested (Milestone 2). Verified/unverified/unknown status and priority are not built |
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
