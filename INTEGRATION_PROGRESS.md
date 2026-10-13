# Completed-agent integration — 13 October 2026

## Scope and baseline

Local integration only in `C:/FS/projects/KosherRadar-integration`, branch `integration/agent-fixes`. Clean starting HEAD and local main: `dc5dc24aab5ecac8701fd5083238d4de9f75a5b7`, descending from accepted V2 merge `406dd65`. No main merge, push, deployment, source branch/worktree edits, existing database operations or live external services authorized.

## Final result

All five sources are integrated with preserved histories. Full available automated checks pass. One confirmed integration defect (INT-001) is fixed and verified. **Two unresolved confirmed P1 pre-production blockers remain: SEC-006 / EMAILAUD-001 and UIAUD-001.** Competing resets with different tokens can overwrite a completed recovery. Admin navigation can submit the previous restaurant's form to the newly selected restaurant's update endpoint. Passing existing tests does not establish safety for either workflow. Local integration is complete, but this is not approval for production or an unconditional recommendation to merge main.

Final application fix: `7cdc1fb`. Final handoff HEAD is the commit containing this document; retrieve its exact hash with `git rev-parse integration/agent-fixes`. The user-facing final report records that exact hash after committing. No source history was squashed or rewritten.

## Frozen source tips

| Source | Exact tip | Expected checkpoint |
| --- | --- | --- |
| feature/email-password-recovery | 1fa1c547466376d1e72b67f42ac75a41e5d58736 | 1fa1c54 |
| test/email-verification | 1beaaa9373d1f96e77a5027318eba390ff7a2888 | 1beaaa9 |
| fix/admin-data-integrity | 5c830e08d068c5e45e1c5413e5f8b310d42cb544 | includes 37725fc; newer documentation tip |
| fix/search-location | 2ca7b504c1db8826a71fb3fb9802d0cc45efefcd | includes 64457fc; newer Atlas fallback fix |
| fix/submissions-app | 8fcede85be2e455cbea0177c5de8793d29b8be9a | 8fcede8 |

All source branches start from the baseline. Email verification descends from the email feature and changes only its progress document, FIX_TRACKER and PROGRESS. Preserve both histories through sequential merges. Expected overlaps: adminRestaurantService and tests (email, authority/transactions, location); Restaurant model (integrity counter, city identity); restaurant submission and tests (transactions, identity); shared tracking files and README. Source handoffs read through Git without switching branches.

## Current position

Local integration COMPLETE. All five source histories are incorporated; verified application fix INT-001 at 7cdc1fb. Final handoff is the commit containing the completion record below (resolve with git rev-parse HEAD). Sources and main remain at their starting tips. No push/deployment or existing application database operations.

User explicitly approved fresh disposable replica-set regressions with dedicated temporary storage, separate port, no original URI, mocked/disabled external services and cleanup only of newly created resources. Approval applied only to disposable tests; no target migration approval inferred.

## Risks and required preparation

Agent 1 transactions require a replica set or sharded deployment; standalone fails closed. Startup disables implicit index creation and checks unique indexes. Agent 2 replaces the pending restaurant identity index with a city-aware constraint and adds a query index. Review these together after merging; do not provision/drop any existing database index. See SEARCH_LOCATION_INDEX_ROLLOUT.md when incorporated.

SEC-006 assessment is complete and confirms an unresolved production blocker; see the independent-audit follow-up below. Historical Gmail live verification is source evidence only; this integration session will not send mail. Native Hebrew review, live service/deployment checks and existing bundle warning remain limitations.

## Verification and handoff

Integration verification is complete; actual commands and results are recorded below. The initial sequential merge plan was executed without discarding completed work. The independent-audit follow-up is documentation and targeted verification only, with no authentication implementation rewrite.

## Email and Agent 1 merge progress

Email feature merged with preserved history; email evidence merge de83b93 includes 1beaaa9 (docs only). Targeted backend email/reset/notification tests: 5 files / 53 passed, exit 0; frontend recovery/token tests: 2 files / 14 passed, exit 0. Frontend first attempt failed before tests with sandbox EPERM in Vite config cache; expanded local execution passed. No mail/database calls.

Agent 1 merge in progress: only FIX_TRACKER/PROGRESS conflicts; preserved all issue and historical handoff records and recomputed counts from detailed statuses. Automatic code merges retain post-decision approval/rejection notification calls and transactional creation/deletion/rejection. Targeted admin tests next. Disposable replica-set approval received with fresh directory/separate port, no original URI, external services disabled and cleanup restricted to newly created resources. Runner inspected: generated port/URI, mkdtemp, restricted child env, validated cleanup root.

Agent 1 targeted verification: backend npm test -- tests/adminRestaurantService.test.js tests/adminTeudaService.test.js tests/adminReportService.test.js tests/pointsService.test.js tests/transaction.test.js tests/userSubmissionRoutesHttp.test.js: exit 0, 6 files / 89 passed. Frontend npm test -- src/components/UserSubmissionRoute.test.tsx: exit 0, 4 passed. No browser/live services. Commit merge now, then inspect Agent 2 changes.

## Agent 2 merge verification

Agent 1 merge checkpoint: 8a92e0e. Agent 2 merged from frozen 2ca7b50. Code conflict only in restaurantSubmissionService.test.js: preserve new city-normalization regression and Agent 1 rejection/no-side-effect ADMIN test. The obsolete source test expecting ADMIN public contributions to become PENDING contradicts the explicit integrated business rule and was already replaced by Agent 1; do not restore it. Model auto-merge retains integrityVersion plus cityNormalized and city-aware index. Admin service retains transactional creation/rejection/deletion, notifications and location resolution.

Targeted backend command: npm test -- tests/adminRestaurantService.test.js tests/adminRestaurantLocationService.test.js tests/restaurantSubmissionService.test.js tests/restaurantPendingIdentity.test.js tests/models.test.js tests/placesService.test.js tests/restaurantSearchService.test.js tests/restaurantSearchRepository.test.js tests/mapSearchService.test.js: exit 0, 9 files / 144 passed. Frontend npm test -- src/components/AddressSearch.test.tsx src/components/LocationField.test.tsx src/hooks/useSearchCriteria.test.tsx src/pages/HomePage.test.tsx src/api/locationDeadline.test.ts: exit 0, 5 files / 23 passed. Tracking conflicts preserve all issues/history and recalculate counts.

Identified integration follow-up: Agent 1 real index tests still address old pending_submitter_name_address. Update those to assert new city-aware constraint with real cross-city/concurrent/legacy regressions. Assess startup when both old and new indexes exist; no existing database touched. Next: Agent 3 merge, then verified index compatibility fix/checkpoint.

## Agent 3 merge verification

Search merge checkpoint 86124f7. Agent 3 from 8fcede8: code and EN/HE locale additions merged automatically; only tracking conflicts, resolved preserving all issue/history sections and derived counts. Backend npm test -- tests/healthRoutesHttp.test.js tests/qaSubmissionHistory.test.js tests/userSubmissionsRepository.test.js tests/userSubmissionsRoutesHttp.test.js: exit 0, 4 files / 18 passed. Frontend npm test -- src/hooks/usePhotoField.test.tsx src/pages/photoSubmission.test.tsx src/pages/MySubmissionsPage.test.tsx src/pages/RestaurantDetailsPage.test.tsx src/locales/locales.test.ts: exit 0, 5 files / 41 passed. These cover all five photo form handlers, correction history independent of awards, readiness/liveness, Israel-day rollover and locale key parity. No browser/live external checks.

All five source histories now accounted for; next work is index compatibility regression verification, SEC-006 evidence and final full checks.

Agent 3 merge checkpoint 0adf745. INT-001 confirmed with actual disposable MongoDB: startup accepts leftover broader index (6 pass / 1 fail after correcting fixture order). Implement read-only compatibility rejection; no constraint weakening or automatic migration. Existing index regressions updated because SEARCH-007 explicitly replaces their old schema definition.

## INT-001 verified checkpoint

Read-only startup now rejects obsolete broader pending uniqueness by index keys even with a different name. It never repairs catalogs or records. Approved full MongoDB command: node integration/runAgent1Isolated.mjs --run-isolated agent1Authority.integration.mjs agent1Corrections.integration.mjs agent1Integrity.integration.mjs agent1Rejection.integration.mjs agent1Indexes.integration.mjs: exit 0, 21 passed / 0 failed. Tests verify correction/award atomicity and crash rollback, USER/ADMIN workflows, cascade/child races, durable mocked image cleanup, rejection rollback, index provisioning only in disposable DB, city-aware concurrent uniqueness and legacy read/save. Runner stopped its own mongod and removed only its validated fresh temporary directory. Mongoose deprecated-new warnings and deliberate failure-injection logs are non-failing.

SEC-006 diagnostic on separate fresh disposable runner: node integration/runAgent1Isolated.mjs --run-isolated passwordResetAudit.integration.mjs: exit 0, 2 diagnostic checks passed. Same-token four-way consumption has exactly one winner, but synchronized distinct reset issuance leaves two unused/unexpired hashes, and BOTH can be consumed. This passing diagnostic is evidence of an unresolved vulnerability, not a verified security fix. No raw links/passwords logged and Gmail explicitly disabled. Add separate production blocker record after index checkpoint; no speculative authentication rewrite.

## Final verification

| Command | Exit | Result / boundaries |
| --- | --- | --- |
| `cd backend; npm test` | 0 | 49 files / 580 passed; repositories/providers mocked, local HTTP fixtures; external credentials disabled and non-listening loopback test URI |
| `cd frontend; npm test` | 0 | 35 files / 215 passed; jsdom/mocked APIs; non-failing jsdom navigation diagnostic |
| `cd frontend; npm run lint` | 0 | Actual package script is oxlint, not ESLint; no separate ESLint script/config |
| `cd frontend; npm run typecheck` | 0 | TypeScript passed |
| `cd frontend; npm run build` | 0 | Production build passed; JS 774.93 kB / gzip 226.52 kB; existing >500 kB warning remains |
| `cd backend; node integration/runAgent1Isolated.mjs --run-isolated agent1Authority.integration.mjs agent1Corrections.integration.mjs agent1Integrity.integration.mjs agent1Rejection.integration.mjs agent1Indexes.integration.mjs` | 0 | 21 actual disposable MongoDB regressions passed; external services disabled/mocked |
| `cd backend; node integration/runAgent1Isolated.mjs --run-isolated passwordResetAudit.integration.mjs` | 0 | 2 actual disposable diagnostic checks; one confirms unresolved SEC-006, not a fix |
| `cd backend; node integration/runAgent1Isolated.mjs --run-isolated agent1Authority.integration.mjs` | 0 | Final strengthened direct admin certificate and combined restaurant/certificate success assertions pass; both APPROVED immediately, zero ADMIN points, SDK upload mocked |
| `node scripts/reviewPasswordRecovery.mjs` | 0 | Integrated production frontend in installed Chrome with intercepted API fixtures; 88 renders / 8 EN/HE journeys at 375/768/1024/1280, zero exceptions/referrer headers; no external requests |
| `git -c core.whitespace=cr-at-eol diff dc5dc24 --check` | 0 | CRLF-aware full integration whitespace check |

Backend has no build/lint/typecheck scripts. No separate ESLint invocation was invented. Full suites include auth/recovery, admin moderation/correction/points, consistency/duplicates/search, readiness, photo/history and UI regressions. Relevant MongoDB regressions actually ran, rather than treating source claims as proof.

The added admin success fixture initially failed (exit 1, 0/1) because it omitted a mandatory certificate photo. Corrected only the fixture: valid synthetic JPEG bytes and mocked Cloudinary SDK, preserving input validation; final run exit 0, 1/1. No app behavior was weakened. The earlier index-fixture order failure and actual INT-001 reproduction are recorded above. No final failing check or partial code remains.

Browser recovery fixture results and screenshots are local ignored artifacts in `design-screenshots/email-password/`; EN mobile reset and HE mobile expired screenshots were visually inspected. Search/map/details/admin/photo browser journeys were not rerun in this integration; component tests and source historical browser evidence do not imply a new live end-to-end pass. No actual Gmail, Geoapify, Cloudinary, Atlas, production behavior or real user files were accessed. Historical Agent 4 live evidence remains explicitly attributed to that isolated source session.

## Completed merges and conflict resolutions

| Local merge | Incorporated source |
| --- | --- |
| `8ff573a` | Email feature `1fa1c54` |
| `de83b93` | Email verification `1beaaa9`, unique documentation only |
| `8a92e0e` | Agent 1 `5c830e0`, including expected `37725fc` |
| `86124f7` | Agent 2 `2ca7b50`, including expected `64457fc` and final Atlas fallback completeness change |
| `0adf745` | Agent 3 `8fcede8` |

Only application/test conflict: `restaurantSubmissionService.test.js`, retaining normalized-city detection and ADMIN rejection/no-side-effect assertions. Shared admin/model/service changes auto-merged and were reviewed/tested together: transactions/parent guards, city identity, stale-location clearing and post-decision notifications retained. Tracking conflicts preserve all source issues and historical records; repeated source onboarding headings are labelled historical and current onboarding supersedes them. Status fields standardized so counts include the source's inline statuses; at the initial integration completion, 64 issues derived to 40 VERIFIED, 8 ALREADY WORKING, 10 NOT STARTED, 4 BLOCKED and 2 DEFERRED. SEC-006 is deferred, never counted as verified.

README corrected stale Resend/current-index references and distinguishes historical Gmail evidence from this session. New detailed rollout/rollback checklist: `INTEGRATION_DEPLOYMENT_CHECKLIST.md`, alongside preserved `SEARCH_LOCATION_INDEX_ROLLOUT.md`. Unique startup enforcement never auto-migrates indexes. Transactions require replica-set/sharded topology. All test mongod instances and validated newly created data directories were cleaned up by their runner; no existing database or source-worktree resource was cleaned up.

## Remaining risks and exact next step

- **CONFIRMED P1 production blocker SEC-006 / EMAILAUD-001:** separately fix/review all five independently reproduced account-level failure paths before public release. Same-token single-use and each password-write/JWT-version increment remain atomic, but they do not prevent competing distinct-token recoveries. No speculative redesign here.
- **CONFIRMED P1 pre-production blocker UIAUD-001:** admin edit navigation can mismatch retained form data and the current route's update target. Agent 3's reported intercepted-browser reproduction changed no real database. The affected integrated page/API/route and required stale-navigation regression plan are recorded below; no unrelated UI changes or blocker implementation in this documentation follow-up.
- **Required deployment preparation:** approve a target/topology and city-aware index replacement, provision all unique/query/geospatial/TTL indexes plus cleanup collection, verify catalog and legacy compatibility. Do not run existing-target operator commands under the disposable-test approval.
- Native Hebrew review, live service/Atlas compatibility/performance, moderation email delivery, real browser workflows, backups/operations remain outstanding. Existing large bundle, localStorage risk and upload-before-durable-record crash window remain documented.

Recommendation: suitable for local review as the consolidated integration candidate. Hold production release and unconditional main promotion until SEC-006, UIAUD-001 and deployment gates are addressed. No merge into main, push or deploy occurred. Exact next step: STOP and provide final report. Future work must reconcile this document/FIX_TRACKER/PROGRESS against Git, preserve all frozen source worktrees, and obtain separate scope/resource authorization where required.

## Independent email security audit follow-up — 13 October 2026

Resumed from clean completed integration `781f9707bbfc59cec2ed3d6eabce8a8fc4d3a46e`. All completed merges, source tips and application code are preserved. The user supplied Agent 4's independent audit conclusion: **EMAILAUD-001 aliases SEC-006, CONFIRMED P1**. Agent 4 reportedly reproduced five failure paths using an isolated in-memory harness:

1. Concurrent issuance leaves multiple valid tokens.
2. Competing resets using different tokens both succeed; a later write overwrites an already completed recovery.
3. Issuance begun before a recovery can finish afterward and leave an obsolete request's token valid.
4. Cleanup failure leaves other usable links after password change.
5. Failed-write compensation restores a token that another completed recovery made obsolete.

Evidence attribution: those five reproductions are the user's report of Agent 4's harness, not five tests run in this checkout. No new audit artifact was present in the inspected source branch trees or searched Markdown files. This integration independently reproduced concurrent issuance and same-token consumption on a real fresh disposable replica set. Code review supports the additional paths: unconditional per-user password updates, cleanup after the update, and token-only compensation without an account epoch check. Neither mocked test success nor historical Gmail delivery closes this finding.

Integrated files involved:

- `backend/src/services/passwordResetService.js`: separate delete/create issuance; token consumption before bcrypt/password write; cleanup after saving; failure compensation through releaseResetTokenRepo.
- `backend/src/repositories/passwordResetRepository.js`: per-hash consume, delete-unused cleanup and token-only release.
- `backend/src/repositories/userRepository.js`: setUserPasswordHashRepo updates passwordHash and tokenVersion atomically but has no expected account recovery generation/credential version guard.
- `backend/src/models/PasswordResetToken.js`: unique tokenHash and expiry; no account recovery generation binding.
- `backend/src/models/User.js`: current credential/session tokenVersion; no shared recovery-generation guard.
- `backend/src/repositories/transaction.js`: existing transaction/session facility suitable for a separately reviewed narrow fix; currently not used by password recovery.
- Verification boundaries: `backend/tests/passwordResetService.test.js`, `passwordResetRepository.test.js`, `passwordResetRoutesHttp.test.js`, and `backend/integration/passwordResetAudit.integration.mjs`. Existing passing cases do not cover all account-level interleavings.

### Recommended account-level atomicity approach (proposal only)

Keep the current account, JWT and localStorage architecture. Prefer the existing replica-set transaction facility with **a shared conditional write on the User document in both issuance and redemption**, plus a monotonic recovery generation bound to each token. Independent token-document transactions alone do not serialize two different tokens; an in-process mutex or cleanup-only fix is insufficient across workers and restarts.

Issuance should capture the account's credential epoch when its work begins. In one transaction, conditionally guard that unchanged epoch, advance the account recovery generation and create the hash-only token bound to that generation. A request that began before a successful reset must not acquire fresh authority by rereading a new epoch on an automatic retry. A genuinely new request after a recovery can issue a new link normally. Concurrent issuance must have a defined commit order and only its current generation should be redeemable.

Hash the new password outside the transaction, then revalidate expiry, unused status, token generation and credential epoch inside it. One transaction must conditionally claim the account/current generation, consume the token, update passwordHash, increment JWT tokenVersion and advance recovery generation to invalidate every previous or already-in-flight redemption. If another recovery wins, this transaction must abort without changing the password. Transaction rollback replaces unconditional token-release compensation; cleanup becomes housekeeping and cannot determine whether old links work. SMTP notifications run only after commit, outside retryable callbacks.

Any proposed additive generation fields need explicit compatibility/rollback review. Missing legacy fields and already-issued tokens need a deliberate fail-closed rollout policy; do not silently grant old tokens the new generation or run a backfill. This document does not authorize schema/data changes or implement the proposal.

### Required resolution tests

Convert the diagnostic vulnerability expectations into fixed-behavior regressions when implementing the separately scoped fix. Use controlled barriers/failure injection, real approved disposable replica-set persistence and multiple processes where relevant:

1. Simultaneous issuance: only the current committed generation is redeemable; stale issuance cannot overwrite newer recovery state.
2. Two distinct tokens racing to reset: exactly one valid recovery commits; the loser cannot overwrite the winner; password/JWT epoch/generation/token state commit together.
3. Delay issuance across a successful reset: its captured old credential epoch is rejected, including automatic transaction retries. A fresh post-reset request still works.
4. Force cleanup failure after commit: every older token remains invalid, current password stays saved, existing JWTs remain rejected.
5. Force hashing/password-write failure while another recovery or issuance wins: abort must not revive an obsolete token; a failure without a competing winner remains safely retryable.
6. Same-token races, expired/used/unknown tokens, legacy-generation policy, missing/deleted user, and unrelated accounts progressing independently.
7. Kill/restart a worker around token claim/password update/commit; verify rollback or complete commit, no partial state, and safe driver retries across processes.
8. Preserve neutral forgot responses/no-store, hash-only storage, 60-minute validity, password policy, English/Hebrew/RTL UI, old-password rejection/new-password login, JWT invalidation and post-commit best-effort mail. No mail from aborted/retried transaction callbacks.

Follow-up targeted verification:

- `cd backend; npm test -- tests/passwordResetService.test.js tests/passwordResetRepository.test.js tests/passwordResetRoutesHttp.test.js`: exit 0, 3 files / 27 passed, mocked boundaries and local HTTP fixtures, service credentials disabled and non-listening loopback URI.
- `cd backend; node integration/runAgent1Isolated.mjs --run-isolated passwordResetAudit.integration.mjs`: exit 0, 2 diagnostic checks passed on a fresh disposable replica set with mail disabled; again confirms two distinct consumable links and atomic same-hash consumption. Runner cleaned up only its generated resources. This is confirmation of a blocker, not remediation success.
- No application/tests/package/schema changes in this follow-up; only INTEGRATION_PROGRESS.md, FIX_TRACKER.md, PROGRESS.md and INTEGRATION_DEPLOYMENT_CHECKLIST.md updated. Full prior 580 backend / 215 frontend tests, lint/typecheck/build, 21 database regressions and 88 browser fixture renders remain actual unchanged-code results; broad checks were not repeated for documentation edits. Backend has no build/lint/typecheck scripts. No new browser/live-service verification.
- `git -c core.whitespace=cr-at-eol diff --check`: exit 0. Final documentation checkpoint contains these results; exact final HEAD is reported after committing. Source branch tips and main remain unchanged. Working tree clean after the checkpoint.

No claim that five-path security remediation has passed. SEC-006 remains DEFERRED only as an implementation-scope status, never as evidence of lower severity or readiness. Exact next step: STOP/report completed local integration with a confirmed P1 production blocker; no automatic main merge/push/deploy or existing-database operations.

## Independent UI/UX audit follow-up — 13 October 2026

Continued clean completed integration from `b555dfdd9c6744b574c5a67c0c7b48f84a4bbff9`. No restart, discarded work, new merges or application edits. **UIAUD-001 is CONFIRMED P1, an unresolved pre-production blocker alongside SEC-006.** The user reports Agent 3 reproduced the wrong-target update with browser interception and no real database mutation. That reproduction is independent audit evidence, not a browser run performed in this follow-up.

Integrated source inspection confirms the mechanism. React's existing `/admin/restaurants/:restaurantId` route reuses AdminRestaurantPage state across parameter changes. Its load effect fetches the new ID without clearing/binding `details`, `values`, `extras` or `hasDetails`, and has no cancellation/generation cleanup to exclude obsolete responses. The loaded-form rendering guard checks only that state exists. Save calls `updateRestaurant(restaurantId, values, extras)`: route B can therefore receive A's retained form values while B is loading. A failed B request can also leave the old record actionable because `hasDetails` still reports previously loaded data. The backend sees an authorized valid PUT payload and cannot infer the administrator's intended restaurant.

Affected integrated components and boundaries:

- `frontend/src/pages/AdminRestaurantPage.tsx`: retained state, unguarded load effect, form rendering/Save handler and asynchronous mutation completion notices/reloads. This is the primary defect location.
- `frontend/src/components/RestaurantFields.tsx` and `frontend/src/components/admin/RestaurantExtrasFields.tsx`: controlled form values owned by the parent page; they render retained values with only `busy` disabling input. Their presence does not bind those values to a restaurant ID.
- `frontend/src/App.tsx`: parameterized admin edit route; no record-specific remount is supplied at this boundary.
- `frontend/src/api/adminApi.ts`: getRestaurantDetails loads the selected ID; updateRestaurant uses its ID argument for PUT `/admin/restaurants/:id` and builds payload from supplied values/extras. API behavior is consistent with its arguments; the caller mismatches their identities.
- `frontend/src/utils/adminForms.ts`: maps loaded restaurant data into the editable values/extras. Include these mappings in full payload assertions.
- `frontend/src/components/admin/AdminTeudaCard.tsx` remains visible under retained parent details; review stale child display and callback handling in the same navigation regression. No separate certificate mutation bug was reproduced here.

### Narrow remediation recommendation (not implemented)

Bind loaded details and editable values/extras to one explicit loaded restaurant ID. If it differs from the current route, immediately hide or disable the record and every parent mutation action, including before effects run. Route changes must invalidate old record state and notices. Guard all load success/failure and mutation completion callbacks with the active route/request generation; abort when supported, but do not rely on cancellation alone. Preserve safe same-record refresh behavior separately from switching records.

Before dispatching Save, require `routeId === loadedRecordId === formOwnerId`, and capture an immutable snapshot of that target and its payload. Do not repair the problem solely by submitting to the previous record ID while the URL shows a different restaurant. If navigation occurs during a valid dispatched mutation, its request remains bound to the original snapshot, and its completion must not update, enable, announce success on or reload a different record. Apply the same parent identity guard to approve/reject/delete and review child callbacks without expanding into unrelated UI work.

### Required regression tests

1. Load restaurant A, navigate through an actual router link to B with B's GET held pending, then try Save. A's form must not be actionable under B's URL and no PUT may be issued with A's data to B.
2. Resolve requests out of order (A after B, A after C, older same-record reload after a newer one). Obsolete success or failure must not replace active form/details, notices, busy state or error state.
3. Fail B's fetch after A was loaded: show a safe unavailable/retry state, no retained actionable A form. Retry can enable B only after matching B data arrives.
4. Assert mutation-target consistency across displayed identity, route, form owner, PUT path, complete restaurant payload and extras. A forced ID mismatch blocks dispatch; a successful matched B save uses B's edited fields only.
5. Start a valid A save, navigate to B before it settles, and complete A with success and failure in separate tests. No B mutation/replay, stale success notice, stale form overwrite, busy-state release or refresh of B from A's completion. Verify original request path/payload stay A.
6. Cover rapid A/B/A navigation, browser back/forward, duplicate-record links, unmount, and language-triggered reloads. Retain English/Hebrew/RTL behavior and unsaved-edit handling without transferring edits between records.
7. Verify approve/reject/delete and stale certificate-card callbacks obey the active parent identity guard; valid same-record edits and refresh still work. These are recommended adjacent safety checks, not separately confirmed findings.

Use existing Vitest/jsdom with MemoryRouter and controlled deferred API promises for deterministic component checks. Add intercepted-browser coverage matching Agent 3's scenario against the integrated production build; intercept every mutation, record endpoint and synthetic payload, and assert zero live database/service requests. Browser timing regressions are required before declaring UIAUD-001 resolved. Do not introduce a new test dependency without approval.

This follow-up changes only tracking/handoff/deployment documents. There is no AdminRestaurantPage regression test covering this scenario in the current suite; no new test or browser reproduction was run here, and existing passing frontend tests do not close UIAUD-001. Prior full integration verification remains unchanged-code evidence. git -c core.whitespace=cr-at-eol diff --check exit 0; tracker count validation confirms 65 issues (40 VERIFIED, 8 ALREADY WORKING, 10 NOT STARTED, 4 BLOCKED, 3 DEFERRED). Source branch/main tips verified unchanged. Final local documentation HEAD is the commit containing this follow-up, reported after committing; working tree clean after checkpoint. UIAUD-001 is DEFERRED from this follow-up's implementation scope, not verified or downgraded. Exact next step: STOP/report both confirmed P1 blockers; do not merge main, push, deploy or access existing application data.
