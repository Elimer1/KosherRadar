## Agent 3 ? submission and application reliability (13 October 2026)

User-assigned scope supersedes the older stop/one-milestone recommendation for this branch only. Baseline dc5dc24, branch fix/submissions-app, clean worktree. No other worktrees, merges, pushes, deployment, credentials or live services. Existing locked dependencies installed with npm ci --ignore-scripts --no-audit --no-fund; no package/lock changes.

### SEARCH-003 ? VERIFIED
- Root cause: usePhotoField cleared evidence before asynchronous validation and accepted every completion; five consumers could send while reads were pending. Baseline regression run: 5 failed / 7 passed, exit 1 (stale success, stale rejection, unreadable file, pending and clear).
- Implemented versioned validation, synchronous submission guard, pending state and visible read failures. Retain last valid file on a failed replacement; block submission until replacing or explicitly clearing. Obsolete reads cannot change errors, pending state or selected file. Unmount invalidates reads. Existing imageCheck size and byte-signature checks unchanged.
- Consumers: SubmitRestaurantPage, SubmitTeudaPage, SubmitReportPage, AdminAddTeudaPage, AdminCreateRestaurantPage. Input accessibility in TeudaFields and report form; localized pending/read error strings. Hebrew needs native-speaker review.
- Tests: usePhotoField.test.tsx and photoSubmission.test.tsx (all five real form handlers with mocked API calls).
- Verification: frontend npm test -- src/hooks/usePhotoField.test.tsx src/pages/photoSubmission.test.tsx src/utils/imageCheck.test.ts, exit 0, 19 passed. Earlier full npm test, exit 0, 28 files / 170 passed; subsequent test typing/lint cleanup verified in targeted run. npm run lint and npm run typecheck exit 0; npm run build exit 0, existing >500 kB bundle warning. No browser or live upload testing.

### Pending
A1-003: expose correctionApplied from persisted report separately from awards; backend/frontend tests; explicit newest-50 notice. SEC-011: readiness 503 while MongoDB unavailable, distinct liveness, state tests. Investigate expiry refresh only if straightforward.

### Exact next step
Implement A1-003, then SEC-011; run both full suites and frontend lint/typecheck/build. Do not change admin correction/award writes or search/address/email/auth recovery logic.

### A1-003 ? VERIFIED
- Baseline reproduction: backend qaSubmissionHistory.test.js 3 failed / 6 passed; frontend MySubmissionsPage.test.tsx 2 failed / 2 passed, exit 1. Stored correctionApplied was excluded from repository projection and service response; UI inferred outcome from points.
- Expose correctionApplied boolean, default false for old documents without it (consistent with existing schema). Display outcome independently of points; administrator zero points and award-key semantics remain unchanged. No schema, migration or backfill required; rollback is removing the additive response field/UI use.
- Authenticated router regression rejects anonymous requests and ignores query userId. Repository regression checks user filter, allowlisted projection, restaurant name-only population and newest-50 limit. Mocked applied correction without award covers administrators and failed awarding. No admin write logic changed.
- Added explicit 50-most-recent-per-category notice in both locales. Fixed PowerShell stdin encoding damage to new Hebrew photo strings/comments found during locale inspection; native review still required.
- Files: userSubmissionsRepository.js, userSubmissionsService.js, qaSubmissionHistory.test.js, new userSubmissionsRepository.test.js and userSubmissionsRoutesHttp.test.js; MySubmissionsPage.tsx and test, mySubmissions.ts, en.ts/he.ts, five photo form comment corrections.
- Verification: backend npm test -- tests/qaSubmissionHistory.test.js tests/userSubmissionsService.test.js tests/userSubmissionsRepository.test.js tests/userSubmissionsRoutesHttp.test.js exit 0, 4 files / 13 passed. Frontend npm test -- src/pages/MySubmissionsPage.test.tsx src/locales/locales.test.ts src/pages/photoSubmission.test.tsx exit 0, 11 passed; npm run lint, npm run typecheck, npm run build exit 0 (existing large-chunk warning). HTTP uses loopback and mocked auth/service; no real DB, browser or external service.
- Next: SEC-011 health readiness/liveness; final full verification.

### SEC-011 ? VERIFIED
- Extracted the exact legacy handler into healthRoutes for safe HTTP reproduction; baseline test exit 1, 6 failed, including original /api/health returning 200 with state 0. No server/database startup in tests.
- /api/health and /api/health/ready return 200 only for Mongoose readyState 1, otherwise 503 and status unavailable. Connected legacy payload unchanged; non-connected database label remains disconnected for compatibility. /api/health/live always returns 200 when Express responds. Cache-Control no-store; allowlisted generic body contains no configuration. Initial startup connection behavior unchanged.
- Files: server.js, new routes/healthRoutes.js, tests/healthRoutesHttp.test.js, README.md. Tests cover connected/disconnected/connecting/disconnecting/unknown, recovery to connected, aliases and liveness.
- Verification: backend npm test -- tests/healthRoutesHttp.test.js exit 0, 6 passed; full npm test exit 0, 43 files / 517 passed. No backend build/lint/typecheck scripts. Mongoose state mocked; no real DB or production/service resources. Readiness does not actively ping MongoDB.
- Next: scoped detail-page Israel-date rollover refresh; final frontend checks and handoff.
