# SEC-006 Password Reset Concurrency

13 October 2026. Scope: this checkout, branch `fix/password-reset-concurrency`, base `220365d494c6ac0101eceef645bbb0bbcf65ad24`. Initial tree clean. No merge, push, deployment, existing database, secrets, or other worktree changes.

## Investigation and design

Original issuance deletes then inserts separate token rows; redemption consumes a row then unconditionally updates the account, cleans up, and sometimes releases the row. None of those operations establishes account-level authority. Different links can both change the password, late issuance can survive recovery, and compensation can revive obsolete links.

Security invariant: one current hash/expiry pair on the account authorizes recovery. The same atomic account update must check authority and expiry, save the password, remove authority, and increment the credential/session epoch. Issuance must compare the epoch captured by account lookup, so an operation delayed across a completed reset cannot publish authority.

Chosen design: hidden additive User fields `resetTokenHash` and `resetTokenExpiresAt`; the random 256-bit hash itself identifies the recovery generation. Single-document conditional writes with majority acknowledgement, no transaction or cleanup dependency. Mail only follows an acknowledged write. Unknown outcomes never trigger compensation or an application-level retry. MongoDB server time validates expiry at the password write.

Compatibility: existing accounts require no migration/backfill. Missing `tokenVersion` means zero, consistent with authentication. Legacy token collection links cannot safely gain account authority and will be rejected; users request a fresh link. Keep the legacy model/TTL collection without deleting existing records. Coordinate all backend instances onto the fixed version before serving recovery; mixed old/new recovery writers are unsafe. Rollback must disable recovery endpoints rather than restore the vulnerable implementation. No deployment or database changes performed here.

Existing tests that mandate delete/create or release-on-error assert the vulnerable lifecycle. Replace those expectations with atomic authority and failure behavior while retaining validation, random hashed token, expiry, email, password hashing and single-use coverage.

## Verification

- Added real disposable MongoDB regression before application changes. Initial execution could not import `mongodb` because this fresh checkout had no dependencies (exit 1). Both lockfile-only `npm ci --ignore-scripts` commands succeeded (exit 0); no manifest/lockfile change or new dependency.
- **Before fix:** `node integration/runAgent1Isolated.mjs --run-isolated passwordResetConcurrency.integration.mjs`, exit 1, 0 passed/1 failed. The synchronized original delete/delete/create/create sequence allowed **two** distinct-token resets to change one account's password; expected exactly one success. The same test passed after the fix.
- **Final real database check:** `node integration/runAgent1Isolated.mjs --run-isolated passwordResetConcurrency.integration.mjs passwordResetAudit.integration.mjs`, exit 0, **16 passed / 0 failed**. Fresh temporary loopback replica set, ephemeral port/path created by the existing runner, safe cleanup; no application URI or existing database. The implementation requires only single-document atomicity, not transactions or a replica set.
- **Focused backend:** `npm test -- tests/passwordResetService.test.js tests/passwordResetRepository.test.js tests/passwordResetRoutesHttp.test.js`, exit 0, **33 passed / 3 files**.
- **Full backend:** `npm test`, exit 0, **586 passed / 49 files**. Backend has no build/lint/typecheck scripts.
- **Full frontend:** `npm test`, exit 0, **223 passed / 37 files** (includes recovery contracts). `npm run lint`, `npm run typecheck`, `npm run build`: each exit 0. Existing bundle >500 kB warning remains; jsdom navigation notice is non-failing. Frontend source unchanged.
- `git -c core.whitespace=cr-at-eol diff --check`: exit 0 before checkpoint; final staged check also required.
- No browser or live email/external service checks; automated email remains disabled/mocked.

## Coverage and failure semantics

Real tests cover concurrent issuance and distinct-token redemption, four contenders for one link, two independent backend processes, a paused obsolete reset overtaken by new authority, paused issuance across a completed reset, cleanup/release infrastructure throwing, sequential resets, expired/unknown/superseded/consumed links, expiration changed before the database write, missing legacy credential epoch, legacy token rows granting no authority, hidden authority fields, and real bcrypt login/JWT invalidation.

Errors injected before a real write leave only the existing current link usable. Errors injected after a committed write do not trigger compensation: the saved password and cleared authority remain, retries fail, old links remain invalid. A failed obsolete operation released after newer recovery completes cannot restore its link. An uncertain issuance write can leave only its single hash authorized; retrying with the captured epoch after recovery matches no account. Service mocks separately verify no mail without acknowledgement, no application retry, and sanitized notification logging.

The prior `passwordResetAudit.integration.mjs` tests intentionally asserted vulnerable behavior. They are replaced with legacy-link rejection and hidden-authority regressions because the diagnostic expectation must no longer hold. Baseline evidence is recorded above and in Git history; no test was skipped or loosened.

## Remaining risks and handoff

- Legacy links must be requested again. Keep old collection/model/index declarations; no existing data deletion or backfill is needed or performed. Expired authority is harmless and is cleared by success or replaced by a new request.
- Use one fixed recovery implementation across every backend instance. Mixed old writers or rollback to vulnerable code defeats authority enforcement; disable recovery during such a rollback. No rollout, merge, push or deployment occurred here.
- Lost acknowledgement can mean the password changed while the client sees a server error; request another link if needed. No attempt to restore state on an uncertain outcome. Notifications are best effort after acknowledged writes.
- Failure injection uses real writes with synthetic before/after errors, not actual network disruption or multi-node failover. Separate processes and real MongoDB conditional writes passed. Majority-write durability depends on the deployed MongoDB topology; no production topology inspected.
- Account-hash lookup has no new index and scans User. Existing reset rate limiting is unchanged. Review a non-unique sparse performance index separately if account volume warrants it; this is not a correctness dependency.
- No UI copy changed; added Hebrew is code comments only. No live SMTP, browser behavior or unrelated security issue verified.

**NEXT AGENT ONBOARDING:** SEC-006 is VERIFIED on `fix/password-reset-concurrency`. Application changes: User.js, passwordResetRepository.js, passwordResetService.js. Tests: two backend unit files, passwordResetConcurrency.integration.mjs, sec006ResetWorker.mjs, revised passwordResetAudit.integration.mjs. Tracking: FIX_TRACKER.md, PROGRESS.md, this file, deployment checklist. All final checks above passed. No partial implementation/failing final tests. The local checkpoint containing this document is the handoff commit (`git rev-parse HEAD` after committing); check Git status before resuming. Stop after reporting that commit and clean status; do not start another issue or merge/push/deploy. A later review should examine legacy-link/mixed-version/rollback semantics here; reproduce tests only with the existing fresh isolated runner, never an application database.
