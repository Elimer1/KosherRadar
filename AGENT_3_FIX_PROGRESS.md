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
