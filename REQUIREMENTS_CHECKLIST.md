# Requirements Checklist

Statuses: `NOT STARTED`, `IN PROGRESS`, `IMPLEMENTED UNVERIFIED`, `TESTED`, `BLOCKED`. `TESTED` requires evidence (a passing test or a real run), recorded in the Evidence column.
Source of requirements: `PROJECT_SPEC.md`.

## Milestone 1 — Foundation and auth

| Requirement (spec section) | Status | Files / tests / evidence |
| --- | --- | --- |
| Master spec saved as `PROJECT_SPEC.md` (intro) | IN PROGRESS | `PROJECT_SPEC.md` |
| Coding style notes with honest findings (0A) | IN PROGRESS | `CODING_STYLE_NOTES.md` |
| Separate `backend/` and `frontend/` packages (0, 13) | NOT STARTED | |
| Backend plain JS ES modules, layered flow (0, 0A) | NOT STARTED | |
| `.env.example` files, `.env` ignored (2, 14) | NOT STARTED | |
| Mongoose models User/Restaurant/Teuda/Report (3) | NOT STARTED | |
| Registration assigns USER server-side, ignores role/points (3, 4) | NOT STARTED | |
| bcrypt password hashing (4) | NOT STARTED | |
| JWT login, 24h expiry, Bearer header (4) | NOT STARTED | |
| `authMiddleware` / `adminMiddleware` (4) | NOT STARTED | |
| Zod validation middleware (4) | NOT STARTED | |
| Central error middleware, consistent error shape (4) | NOT STARTED | |
| Auth endpoint rate limiting (4) | NOT STARTED | |
| CORS from env origin (4) | NOT STARTED | |
| Seed-admin script, idempotent, env credentials (14) | NOT STARTED | |
| Basic auth Vitest tests (15) | NOT STARTED | |
| Frontend: Zustand persisted auth, shared Axios, interceptor (4) | NOT STARTED | |
| Frontend: expired-token 401 logs out only (4, 18) | NOT STARTED | |
| Frontend: login/register/account pages, protected routes | NOT STARTED | |
| Private points shown on own account only (7) | NOT STARTED | |
| Real frontend -> Express -> MongoDB flow verified (15) | NOT STARTED | |
| Root README with install/start/test/build commands (14) | NOT STARTED | |
| Feature-branch commits with per-feature authors (19) | IN PROGRESS | `git log` |

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
| Password reset via Resend (4) | NOT STARTED | |
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
