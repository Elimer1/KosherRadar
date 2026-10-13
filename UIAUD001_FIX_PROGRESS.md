# UIAUD-001 - Wrong-restaurant administrator updates

Status: VERIFIED, 13 October 2026. Local branch: fix/admin-navigation-race. Baseline: 220365d494c6ac0101eceef645bbb0bbcf65ad24; working tree initially clean. This document and the local fix checkpoint are the final handoff. No merge, push or deployment.

## Root cause and reproduced evidence

React reused AdminRestaurantPage across route parameter changes. Details, restaurant fields, extras, rejection state and certificate cards still belonged to A while Save/approve/reject/delete used the current route ID B. Presence checks did not establish record ownership. Reads could resolve out of order, and old mutation completions could reload, display notices, change status or navigate from the new record. AdminAddTeudaPage similarly retained certificate fields/photo across restaurant route changes.

Before/after verification used the same 19 regression cases. Temporarily loading the four original source files from the specified baseline produced exit 1: 17 failed, 2 passed. Original files were restored to the fix byte-for-byte in a finally block. The initial 16-case version produced 14 failures and 2 passes. No assertions were weakened.

Chrome independently reproduced the original defect against the baseline production build: GET B was held, the A form remained visible, and submitting it emitted PUT /api/admin/restaurants/B with restaurant.name = Cafe A, address = Street A, extras.nameEn = English A and extras.adminNote = Note A. All API requests were intercepted and fulfilled with synthetic fixtures; no server or database received a mutation.

## Safeguards and affected actions

- Route-keyed inner editor/creator components make each route ID the immutable owner of the entire form, notices, rejection state, certificate subtree, photo and upload state. Navigation commits a fresh loading state immediately, including A -> B -> A; no old draft is reused.
- Returned restaurant identity is checked against the owner before initialization, rendering and mutation entry. A mismatched response follows the existing load-error UI. Existing translation keys and RTL behavior are preserved.
- Reads accept an optional AbortSignal in adminApi. Each effect aborts obsolete reads and invalidates its response closure. Stale success and failure are ignored even if the transport ignores abort, including reload/language changes on the same route.
- Layout-effect cleanup invalidates the old editor/card/creator lifetime at unmount. Detached handlers and late completions cannot act on the new route. Synchronous ref locks prevent duplicate mutation entry before React renders busy state.
- Restaurant Save, approve, reject and delete all validate ownership before starting. Save's fields/extras and every target ID are captured by the originating handler and API payload builder before awaiting. Delete rechecks the guard after confirmation.
- Certificate edit, approve, reject and delete validate both parent record ownership and card lifetime. Late callbacks cannot reload another restaurant; certificate targets remain their original IDs.
- Certificate add/upload uses its loaded restaurant ID, clears fields/photo on navigation and ignores detached upload progress, success and failure.
- Successful or failed old Save/decision/certificate completions cannot change the new page's fields, notices, busy state, status, reload count or navigation.

## Files changed

Application: frontend/src/pages/AdminRestaurantPage.tsx, frontend/src/pages/AdminAddTeudaPage.tsx, frontend/src/components/admin/AdminTeudaCard.tsx, frontend/src/api/adminApi.ts.

Regression/verification: frontend/src/pages/AdminRestaurantPage.test.tsx, scripts/reviewAdminNavigation.mjs.

Tracking: FIX_TRACKER.md, PROGRESS.md, UIAUD001_FIX_PROGRESS.md. Backend, schemas, package manifests, lockfiles, authorization, points, kashrut classifications and UI copy unchanged. No dependency added. Hebrew additions are comments and synthetic test labels only, not product UI text.

## Tests and verification

The routed component tests exercise real forms, React Router navigation and actual admin API payload builders, intercepting Axios HTTP methods rather than mocking admin mutations. They assert outgoing endpoint IDs and restaurant/extras/certificate/rejection payloads. The 19 cases cover delayed B loading and attempted stale Save/delete, out-of-order A success/failure with abort ignored, failed B loading and recovery, mismatched response identity, back navigation, same-record language reload, duplicate Save events, navigation during Save success/failure, restaurant approve/reject/delete, all four certificate mutations, normal editing under StrictMode and certificate upload navigation/reset.

| Command | Actual result |
| --- | --- |
| Frontend npm test -- src/pages/AdminRestaurantPage.test.tsx, original baseline | Exit 1; 17 failed, 2 passed (expected defect evidence) |
| Frontend npm test -- src/pages/AdminRestaurantPage.test.tsx, initial fix | Exit 0; initial 16 cases passed |
| Frontend npm test, final restored fix | Exit 0; 38 files, 242 passed, 0 failed (includes all 19 new cases) |
| Frontend npm run lint | Exit 0, no warnings in final run |
| Frontend npm run typecheck | Exit 0 |
| Frontend npm run build, baseline and final restored fix | Exit 0 for each; final production build succeeds |
| node scripts/reviewAdminNavigation.mjs --expect-vulnerable, baseline build | Exit 0; confirmed A payload sent to B endpoint, intercepted only |
| node scripts/reviewAdminNavigation.mjs, final build | Exit 0; 4 browser scenarios passed, 0 exceptions |
| git -c core.whitespace=cr-at-eol diff --check | Exit 0 |

Chrome fixed scenarios: delayed B exposes no form and emits no mutation; normal B Save sends B's restaurant fields and extras; failed B load leaves A actions unavailable; A Save completing after navigation remains targeted to A and leaves B's unsaved draft intact. Browser result JSON and diagnostic logs are ignored artifacts under design-screenshots/admin-navigation. The committed script reproduces the checks from the built frontend without live services. The original-versus-fixed comparison helper is an ignored local diagnostic, not required for normal verification.

Setup: initial focused test exit 1 because this checkout lacked node_modules. Existing frontend dependencies were copied read-only from KosherRadar-integration into this checkout; package-lock SHA256 matched (7073E961FAC44ADC2AEDA5BE54944ACF4D33FECFE529B4663456FF60E2381025). No environment files were read or copied. Two restricted Chrome attempts failed with Page.enable timeout; the authorized isolated browser checks then passed outside the sandbox. First lint run emitted two test-only unused-expression warnings, corrected with explicit if/else; final lint is clean.

## Limitations and next step

The existing build chunk-size warning and unrelated jsdom navigation diagnostic remain. Reads use cancellation and invalidation; already accepted server writes are not cancelled or rolled back by navigation. They retain the original target and payload. Route changes intentionally discard unsaved admin drafts and reset local form state.

External integrations/database writes were mocked or intercepted only; this does not prove live uploads, moderation mail or database behavior. No backend code or request contract changed, so backend tests were not rerun. No production data, real credentials, user files, other agents' worktrees, deployment, merge or push were modified. Existing unrelated tracker issues remain outside this fix's scope.

Exact next step: inspect this local fix checkpoint for review/integration when separately authorized; stop after committing. Do not repeat the baseline swap or start another milestone. Re-run the four frontend verification commands and the intercepted Chrome script if source changes during integration. Commit identity is the Git commit containing this report (git log -1).
