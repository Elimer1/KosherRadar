# Requirements Checklist

Statuses: `NOT STARTED`, `IN PROGRESS`, `IMPLEMENTED UNVERIFIED`, `TESTED`, `BLOCKED`. `TESTED` requires evidence (a passing test or a real run), recorded in the Evidence column.
Source of requirements: `PROJECT_SPEC.md`.

After the Milestone 4 merges, `main` runs backend 34 files / 448 tests and frontend 11 files / 76 tests, all passing; frontend typecheck, lint and build succeed. (After Milestone 3: backend 24 files / 324 tests, frontend 7 files / 40 tests.)

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
| Entry points for certificate/report pages (10) | IMPLEMENTED UNVERIFIED | Linked from the restaurant page in Milestone 4 (see the Milestone 4 table) |
| Real submission flow against MongoDB + Cloudinary (15) | BLOCKED | No MongoDB connection string, Cloudinary account, or `backend/.env` here |

## Milestone 3 — Admin and kashrut business rules

| Requirement | Status | Notes |
| --- | --- | --- |
"TESTED" below means Vitest with mocked repositories, a mocked `fetch` for Resend, or real HTTP requests to an Express app with mocked services (no database). **Nothing ran against a real MongoDB, Cloudinary or Resend, and no page was opened in a browser.**

| Requirement | Status | Notes |
| --- | --- | --- |
| Admin API behind login + ADMIN role on every route (4, 6) | TESTED | `adminRoutes.test.js` (every route sits behind `authMiddleware` then `adminMiddleware`; endpoint list), `adminRoutesHttp.test.js` (real HTTP: 401 without a token, 403 for a USER, 400 for bad ids/bodies, ADMIN reaches the service) |
| Moderation dashboard tabs: pending restaurants / certificates / reports, expiring soon, manage (6) | IMPLEMENTED UNVERIFIED | `frontend/src/pages/AdminDashboardPage.tsx`, `components/admin/*Tab.tsx`. Backend list endpoints are TESTED (`adminRestaurantService.test.js`, `adminTeudaService.test.js`, `adminReportService.test.js`); the screens compile, lint and build but have **no component tests and were never opened in a browser** |
| Approve / reject (reason required) restaurants, certificates, reports (6) | TESTED | Services above; `adminSchemas.test.js` (reason required, min 3 characters). Approve and reject use filtered atomic updates (PENDING only), so a repeat or a lost race changes nothing. Real-database behavior of the atomic updates NOT verified. UI IMPLEMENTED UNVERIFIED |
| Edit and delete restaurants and certificates, with private admin notes (6) | TESTED | `adminRestaurantService.test.js`, `adminTeudaService.test.js` (deleting a restaurant removes its certificates, reports and Cloudinary photos and never touches points; editing keeps the status). UI IMPLEMENTED UNVERIFIED |
| Admin can create approved restaurants / certificates, dates may be in the past (6) | TESTED | `adminRestaurantService.test.js`, `adminTeudaService.test.js` (`checkExpirationForAdmin`: from 2000-01-01 up to 5 years ahead). The multipart upload route itself was not run with a real file |
| Cannot approve a certificate before its restaurant is approved (6, 12) | TESTED | `adminTeudaService.test.js` ("cannot approve a certificate while its restaurant is not approved"). The UI also disables the button |
| Report resolution: apply proposed / already corrected / no correction; correction changes only the allowed fields (6, 7) | TESTED | `adminReportService.test.js` (`buildCorrectionChanges`, idempotent resolve). Unit tests only |
| Kashrut status derivation: verified / unverified / expired / unknown, priority, `+N more`, six-month rule (5) | TESTED | `kashrutStatusService.js`, `kashrutStatusService.test.js` (24 cases, e.g. verified RABBANUT outranks an unverified MEHADRIN claim). Israel calendar dates, expired status is derived and never stored |
| Public teuda serializer hides admin-only data (5, 12) | TESTED | `kashrutStatusService.test.js` (`toPublicTeuda` has no admin or internal fields; `getPublicTeudot` removes admin-only and unapproved certificates). Since Milestone 4 the public search and details endpoints use it |
| Conflict warning, overrideable (5.8) | TESTED | `findConflictingTeudot` tests (same level, both valid, never blocks); `adminTeudaService.test.js` (approve still succeeds with `conflictWarning`). UI shows "Approve anyway" |
| Rejection emails via Resend, failure does not roll back (6, 12) | TESTED | `emailService.test.js` (mocked `fetch`: SENT / FAILED / NOT_CONFIGURED, never throws, plain text, no admin note), `adminTeudaService.test.js` and siblings (rejection saved when the email fails; `emailStatus` returned). **Real delivery through Resend: BLOCKED (see next row)** |
| Real Resend delivery (2, 6) | BLOCKED | No `RESEND_API_KEY`, no verified domain here. Without a verified domain Resend only sends to the owner's own address. Never attempted |
| Private contribution points, idempotent (7) | TESTED | `pointsService.test.js` (+3 / +2 / +1, once per key, admins and missing users get nothing). The atomic `$ne` / `$push` update (`awardPointsOnceRepo`) was **not run against a real MongoDB** |
| Password reset: hashed single-use short-lived token, bcrypt, same answer for every email (4, 12) | TESTED | `passwordResetService.test.js` (only the hash is stored, 64-hex random token, older links cancelled, one use only, 400 for unknown/used/expired, password hashed), `passwordResetRoutesHttp.test.js` (real HTTP: 400 validation, identical 200 message). The atomic consume query was not run against a real MongoDB. Existing login sessions (JWT) are **not** revoked by a reset |
| Password reset emails via Resend (4) | BLOCKED | Same reason as above; a failed email is only logged on the server so the response never reveals whether the account exists |
| Forgot / reset password pages (4, 10) | IMPLEMENTED UNVERIFIED | `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`; `utils/resetToken.test.ts` covers the token check. No browser run |
| Rate limit on password reset requests (4) | IMPLEMENTED UNVERIFIED | `passwordResetRateLimiter` (5 per hour per IP), `authRateLimiter` on reset; not exercised against a running server |
| Admin-only UI guard and navbar link (4, 10) | IMPLEMENTED UNVERIFIED | `AdminRoute.tsx` (hides the pages for non-admins; real protection is the server). No browser run |
| Frontend helpers: labels, form values, payload builders (10) | TESTED | `adminLabels.test.ts`, `adminForms.test.ts`, `resetToken.test.ts` |
| Kosharot URL (6) | TESTED | Admin-only `kosharotUrl` (http/https only): `adminSchemas.test.js`, `adminRestaurantService.test.js`. Shown on the public restaurant page since Milestone 4 (re-checked as http/https on output) |
| Real admin flow against MongoDB + Cloudinary + Resend (15) | BLOCKED | No connection string, accounts or `backend/.env` here |

## Milestone 4 — Search and restaurant pages

"TESTED" below means Vitest with mocked repositories, real HTTP requests to an Express app with mocked services, or the frontend helper tests. **Nothing ran against a real MongoDB or Atlas Search.** The UI was looked at once in a browser, but only against a throwaway stub API (not part of the repo), never the real backend.

| Requirement | Status | Notes |
| --- | --- | --- |
| Mongoose fallback search (APPROVED only, name + food, filters, 20 per page, stable order) (8) | TESTED | `restaurantSearchService.test.js` (relevance, nearest-first with stable tie-breaks, paging, `capped`), `restaurantSearchRepository.test.js` (the query that is built: APPROVED only, anchored prefixes, `$in`, `$geoWithin`), `searchRoutesHttp.test.js`. The real MongoDB execution of these queries was **not** run |
| Search fields built on save + `npm run search:rebuild` for existing restaurants (8) | TESTED | `searchFields.test.js` (including the Restaurant model rebuilding the fields on `validate()`); the rebuild script's database write was not run. Existing restaurants need the rebuild before they are found |
| Bilingual food search with synonym groups (8) | IMPLEMENTED UNVERIFIED | `searchFields.test.js` covers Hebrew/English matching and typed prefixes. **The synonym list was written by the agent and is not reviewed by the team** |
| Atlas Search with working fallback (2, 14) | IMPLEMENTED UNVERIFIED | Fallback is TESTED (`restaurantSearchService.test.js`: Atlas error gives `atlasUnavailable` and basic results). Atlas itself (`$search` stage, fuzzy name match) was **never run against a real Atlas cluster** and a missing index silently returns nothing |
| `ATLAS_SEARCH_SETUP.md` with exact index JSON (14) | IMPLEMENTED UNVERIFIED | `ATLAS_SEARCH_SETUP.md` (index JSON, steps, verification by a typo search, troubleshooting). The index definition was never created in a real Atlas project |
| Autocomplete: 2 chars, 300 ms debounce, max 8 (8) | TESTED | `searchSchemas.test.js` (min 2), `restaurantSearchService.test.js` (limit 8); `useDebouncedValue` / `SearchBar` behavior was only seen in the browser against the stub API, no component tests |
| Kashrut filters: level, hechsher (same evidence item), hide expired, include unknown (8, 5) | TESTED | `kashrutFilters.test.js`, `restaurantSearchService.test.js`; reuses `kashrutStatusService.js` |
| Food type, category and distance-radius filters (8) | TESTED | `searchSchemas.test.js` (radius must be 1/5/10/25/50 and needs `lat` + `lng`), repository test (`$geoWithin` only with center + radius). Address / Geoapify location is Milestone 5 |
| Query validation, NoSQL-injection-safe, rate limit (4) | TESTED | `searchSchemas.test.js`, `searchRoutesHttp.test.js` (repeated keys 400; injected keys never reach the service). The rate limiter was not exercised against a running server |
| Filters, results and 20-per-page Load More UI (8, 10) | IMPLEMENTED UNVERIFIED | `HomePage.tsx`, `SearchFiltersPanel.tsx`, `RestaurantCard.tsx`, `useRestaurantSearch.ts` (stale answers ignored, duplicates removed); `searchApi.test.ts` (query building); typecheck, lint, build pass. Viewed in the browser only with a stub API. No component tests |
| Result cards: status in words, Call and Waze, no ratings (10, 12) | IMPLEMENTED UNVERIFIED | `RestaurantCard.tsx`, `KashrutBadge.tsx`, `kashrutText.test.ts`, `navigationLinks.test.ts`. "Use my current location" uses the browser's location prompt and was not tried on a real device |
| Public restaurant details API: APPROVED only, no admin data, same 404 otherwise (6, 10, 12) | TESTED | `restaurantDetailsService.test.js` (404 for missing / PENDING / REJECTED; serialized JSON checked for admin note, submitter, rejection reason, duplicates, search fields, Cloudinary id), `restaurantDetailsRoutesHttp.test.js` (public, 400 for bad ids) |
| Public certificates only: no pending, no admin-only (> 6 months expired) (5) | TESTED | `restaurantDetailsService.test.js` (exact six-month boundary, old certificate hidden even next to a newer one, claim hidden when a certificate repeats it) |
| Safe links: only http/https for website, Kosharot and photo links (4, 12) | TESTED | `safeUrl.test.js` (backend, re-checked on output), `safeUrl.test.ts` (frontend), `restaurantDetailsService.test.js` (a `javascript:` value written straight into the database is never sent) |
| Restaurant detail page (status, certificates with photo, mashgiach, EXPIRED labels, unverified claims apart, Kosharot link) (10) | IMPLEMENTED UNVERIFIED | `RestaurantDetailsPage.tsx`; looked at in the browser with a stub API (loaded, 404 state). No component tests |
| Entry points: add certificate / report problem from the restaurant page (10) | IMPLEMENTED UNVERIFIED | Links on `RestaurantDetailsPage.tsx`; the existing `ProtectedRoute` sends anonymous visitors to login. Not clicked through with a real login |
| Google Maps and Waze links (8, 10) | IMPLEMENTED UNVERIFIED | Waze on cards and the detail page, Google Maps on the detail page (`navigationLinks.test.ts`). Share button and map popups are Milestone 5 |
| Real search and details flow against MongoDB / Atlas Search / browser (15) | BLOCKED | No `backend/.env`, MongoDB or Atlas cluster available here |

## Milestone 5 — Maps, location, interface polish

| Requirement | Status | Notes |
| --- | --- | --- |
| Leaflet map, clustering, bounds queries (9) | NOT STARTED | |
| Geoapify location (8, 10) | NOT STARTED | |
| Waze / Google Maps / share (8, 10) | IN PROGRESS | Waze and Call on result cards, Waze and Google Maps on the detail page were done in Milestone 4. Share button and map popup links are still to do |
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
