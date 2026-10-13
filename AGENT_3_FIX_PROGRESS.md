## Agent 3 - submission and application reliability (13 October 2026)

Current status: COMPLETE. The final handoff below supersedes the retained initial plan. All five tracked issues verified; integration only.

User-assigned scope supersedes the older stop/one-milestone recommendation for this branch only. Baseline dc5dc24, branch fix/submissions-app, clean worktree. No other worktrees, merges, pushes, deployment, credentials or live services. Existing locked dependencies installed with npm ci --ignore-scripts --no-audit --no-fund; no package/lock changes.

### SEARCH-003 - VERIFIED
- Root cause: usePhotoField cleared evidence before asynchronous validation and accepted every completion; five consumers could send while reads were pending. Baseline regression run: 5 failed / 7 passed, exit 1 (stale success, stale rejection, unreadable file, pending and clear).
- Implemented versioned validation, synchronous submission guard, pending state and visible read failures. Retain last valid file on a failed replacement; block submission until replacing or explicitly clearing. Obsolete reads cannot change errors, pending state or selected file. Unmount invalidates reads. Existing imageCheck size and byte-signature checks unchanged.
- Consumers: SubmitRestaurantPage, SubmitTeudaPage, SubmitReportPage, AdminAddTeudaPage, AdminCreateRestaurantPage. Input accessibility in TeudaFields and report form; localized pending/read error strings. Hebrew needs native-speaker review.
- Tests: usePhotoField.test.tsx and photoSubmission.test.tsx (all five real form handlers with mocked API calls).
- Verification: frontend npm test -- src/hooks/usePhotoField.test.tsx src/pages/photoSubmission.test.tsx src/utils/imageCheck.test.ts, exit 0, 19 passed. Earlier full npm test, exit 0, 28 files / 170 passed; subsequent test typing/lint cleanup verified in targeted run. npm run lint and npm run typecheck exit 0; npm run build exit 0, existing >500 kB bundle warning. No browser or live upload testing.

### Initial plan (completed; retained for session history)
A1-003: expose correctionApplied from persisted report separately from awards; backend/frontend tests; explicit newest-50 notice. SEC-011: readiness 503 while MongoDB unavailable, distinct liveness, state tests. Investigate expiry refresh only if straightforward.

### Initial next step (completed)
Implement A1-003, then SEC-011; run both full suites and frontend lint/typecheck/build. Do not change admin correction/award writes or search/address/email/auth recovery logic.

### A1-003 - VERIFIED
- Baseline reproduction: backend qaSubmissionHistory.test.js 3 failed / 6 passed; frontend MySubmissionsPage.test.tsx 2 failed / 2 passed, exit 1. Stored correctionApplied was excluded from repository projection and service response; UI inferred outcome from points.
- Expose correctionApplied boolean, default false for old documents without it (consistent with existing schema). Display outcome independently of points; administrator zero points and award-key semantics remain unchanged. No schema, migration or backfill required; rollback is removing the additive response field/UI use.
- Authenticated router regression rejects anonymous requests and ignores query userId. Repository regression checks user filter, allowlisted projection, restaurant name-only population and newest-50 limit. Mocked applied correction without award covers administrators and failed awarding. No admin write logic changed.
- Added explicit 50-most-recent-per-category notice in both locales. Fixed PowerShell stdin encoding damage to new Hebrew photo strings/comments found during locale inspection; native review still required.
- Files: userSubmissionsRepository.js, userSubmissionsService.js, qaSubmissionHistory.test.js, new userSubmissionsRepository.test.js and userSubmissionsRoutesHttp.test.js; MySubmissionsPage.tsx and test, mySubmissions.ts, en.ts/he.ts, five photo form comment corrections.
- Verification: backend npm test -- tests/qaSubmissionHistory.test.js tests/userSubmissionsService.test.js tests/userSubmissionsRepository.test.js tests/userSubmissionsRoutesHttp.test.js exit 0, 4 files / 13 passed. Frontend npm test -- src/pages/MySubmissionsPage.test.tsx src/locales/locales.test.ts src/pages/photoSubmission.test.tsx exit 0, 11 passed; npm run lint, npm run typecheck, npm run build exit 0 (existing large-chunk warning). HTTP uses loopback and mocked auth/service; no real DB, browser or external service.
- Next: SEC-011 health readiness/liveness; final full verification.

### SEC-011 - VERIFIED
- Extracted the exact legacy handler into healthRoutes for safe HTTP reproduction; baseline test exit 1, 6 failed, including original /api/health returning 200 with state 0. No server/database startup in tests.
- /api/health and /api/health/ready return 200 only for Mongoose readyState 1, otherwise 503 and status unavailable. Connected legacy payload unchanged; non-connected database label remains disconnected for compatibility. /api/health/live always returns 200 when Express responds. Cache-Control no-store; allowlisted generic body contains no configuration. Initial startup connection behavior unchanged.
- Files: server.js, new routes/healthRoutes.js, tests/healthRoutesHttp.test.js, README.md. Tests cover connected/disconnected/connecting/disconnecting/unknown, recovery to connected, aliases and liveness.
- Verification: backend npm test -- tests/healthRoutesHttp.test.js exit 0, 6 passed; full npm test exit 0, 43 files / 517 passed. No backend build/lint/typecheck scripts. Mongoose state mocked; no real DB or production/service resources. Readiness does not actively ping MongoDB.
- Next: scoped detail-page Israel-date rollover refresh; final frontend checks and handoff.

### APP3-001 - VERIFIED: long-lived detail-page expiry refresh
- Evidence: detail fetch depended only on restaurantId, translation and explicit retry; timer/focus/visibility rollover regressions failed 3/17 before changes (exit 1).
- useIsraelDay checks Asia/Jerusalem calendar day every minute and on focus/visible return. A changed day refetches the existing details API; no duplicated or changed kashrut classification logic. Previous-day data is hidden during refresh; failed refresh uses existing retry UI. Timers/listeners cleaned up.
- Files: new hooks/useIsraelDay.ts, RestaurantDetailsPage.tsx and test. Four regressions cover midnight polling, foreground return, no redundant same-day requests, loading/error/retry.
- Verification: frontend full npm test exit 0, 29 files / 178 passed; npm run lint, npm run typecheck, npm run build exit 0; chunk warning persists. Backend unchanged after full 517-pass check. No browser testing.
- Limitations: visible-page rollover detected within one minute under normal timer scheduling; background timer suspension handled when focus/visibility resumes. Server remains source of status truth; browser clock schedules refetch.
- Next: explicit photo clear control for recovery, then final frontend verification.

### APP3-002 - VERIFIED: explicit photo error recovery
- Added shared PhotoFieldRecovery to all five forms. Keyboard-accessible Clear photo selection is available for valid, invalid or pending files; clearing resets the uncontrolled file input, cancels obsolete reads and keeps all text fields. Disabled while sending.
- Submission guard checks synchronous pending ref and rendered pending state, so validation completion cannot release a stale form snapshot before the selected file renders.
- Tests: hook clearing during pending; five form regressions clearing before read completion verify no stale restoration and no stuck pending submit state. Existing failed-read/invalid replacement cases remain.
- Files: PhotoFieldRecovery.tsx, usePhotoField.ts/test, all five consumers, photoSubmission.test.tsx, locales en/he.
- Verification: final full frontend 183 tests passed; lint/typecheck/build exit 0. No browser test.

## Final handoff - all assigned work complete

Current branch fix/submissions-app; baseline dc5dc24. SEARCH-003, A1-003, SEC-011, APP3-001 and APP3-002 are VERIFIED in FIX_TRACKER.md. No pending implementation, failing tests or approval blockers. Exact next step: stop and hand off for integration; do not merge, push, deploy or edit another worktree.

Final verification on the completed source:
- backend npm test: exit 0, 43 files / 517 passed (after final backend change; frontend-only changes followed).
- frontend npm test: exit 0, 29 files / 183 passed.
- frontend npm run lint, npm run typecheck, npm run build: exit 0. Existing JS chunk warning remains (~770 kB). Backend has no build/lint/typecheck scripts.
- git -c core.whitespace=cr-at-eol diff --check: exit 0.
- Browser behavior was NOT tested. Unit/component tests use jsdom; HTTP tests use loopback with mocked auth, services or Mongoose. No live MongoDB, external service, production data, emails or uploads.

Integration dependencies/limitations:
- Integrate the history API field alongside the UI; absent legacy correctionApplied defaults false, never inferred from awards. No migration/backfill or dependency additions. Administrator zero points unchanged. No dependency on Agent 1 write changes, Agent 2 search/address work or Agent 4 email/recovery work.
- Monitoring should use /api/health/live for liveness and /api/health or /api/health/ready for readiness. State checks do not prove active database queries or startup availability.
- Date rollover refetches the existing server classification; up to one-minute normal timer delay, foreground checks handle suspended tabs.
- New Hebrew photo/recovery/history notice strings require native-speaker review (M8-004).
- Existing untracked files were preserved; no user changes existed at start. No package/lock changes, other worktree edits, merge, push or deployment.

Checkpoints:
- f00109b: SEARCH-003 validation coordination.
- 494ac7e: A1-003 history outcomes/limit notice, photo Hebrew encoding repair.
- e50ce79: SEC-011 readiness/liveness.
- 4a1d5c4: APP3-001 date rollover.
- Final checkpoint carrying this handoff: APP3-002 explicit recovery; obtain hash with git log -1.

Modified files (including tests and tracking):
- AGENT_3_FIX_PROGRESS.md
- FIX_TRACKER.md
- PROGRESS.md
- README.md
- backend/src/repositories/userSubmissionsRepository.js
- backend/src/routes/healthRoutes.js
- backend/src/server.js
- backend/src/services/userSubmissionsService.js
- backend/tests/healthRoutesHttp.test.js
- backend/tests/qaSubmissionHistory.test.js
- backend/tests/userSubmissionsRepository.test.js
- backend/tests/userSubmissionsRoutesHttp.test.js
- frontend/src/components/TeudaFields.tsx
- frontend/src/hooks/useIsraelDay.ts
- frontend/src/hooks/usePhotoField.test.tsx
- frontend/src/hooks/usePhotoField.ts
- frontend/src/locales/en.ts
- frontend/src/locales/he.ts
- frontend/src/pages/AdminAddTeudaPage.tsx
- frontend/src/pages/AdminCreateRestaurantPage.tsx
- frontend/src/pages/MySubmissionsPage.test.tsx
- frontend/src/pages/MySubmissionsPage.tsx
- frontend/src/pages/RestaurantDetailsPage.test.tsx
- frontend/src/pages/RestaurantDetailsPage.tsx
- frontend/src/pages/SubmitReportPage.tsx
- frontend/src/pages/SubmitRestaurantPage.tsx
- frontend/src/pages/SubmitTeudaPage.tsx
- frontend/src/pages/photoSubmission.test.tsx
- frontend/src/types/mySubmissions.ts
- frontend/src/components/PhotoFieldRecovery.tsx
