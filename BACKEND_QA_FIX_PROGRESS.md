# Backend QA fix progress

Agent 2 work lives only on `feature/backend-qa-fixes` in `C:\FS\projects\KosherRadar-backend-qa`.

Shared trackers (`PROGRESS.md`, `FIX_TRACKER.md`, `AUDIT_FINDINGS.md`) are not modified. Other worktrees are not modified. Nothing is merged or pushed.

## Baseline

- Pinned commit: `3bbb1e2da84215e62c82010de755be2b574aa6bf`
- `main` in `C:\FS\projects\KosherRadar` is still that commit. This branch started there. No divergence.
- `feature/backend-qa-fixes` already existed at that commit with a clean worktree, so it was resumed.

### Existing backend suite, before application changes

Command, from `backend`: `npm test` (`vitest run`)

- Exit code: 0
- Test files: 40 passed
- Tests: 497 passed, 0 failed
- Warning: Vitest said module transforms are not cached across runs (`fsModuleCache`). No test failure.
- The suite mocks repositories. It does not prove database concurrency.
- No `.env` is present in this worktree. Integration runs print `injected env (0) from .env`.

## QA-003 / M5-003 — concurrent duplicate restaurant submissions

**Status:** VERIFIED on the isolated database.

**Reported behavior:** Two simultaneous submissions of the same restaurant by the same user both create pending restaurants. A sequential duplicate returns 409.

**Root cause:** `submitRestaurantService` calls `findPendingRestaurantBySubmitterRepo` and, only when that returns nothing, `createRestaurantRepo`. The pending identity is the submitter plus the normalized name and address, and only while `status` is `PENDING`. Nothing made that insert atomic. `findPossibleDuplicatesService` stores a warning and does not block a different place or a different user.

**Chosen solution:** Partial unique index `pending_submitter_name_address` on `submittedBy`, `nameNormalized`, and `addressNormalized`, with `partialFilterExpression: { status: 'PENDING' }`. The losing insert raises MongoDB duplicate key 11000. The service maps that key pattern to the existing 409 message, `You already submitted this restaurant and it is waiting for review`, and still deletes an uploaded photo. A different duplicate-key pattern is not rewritten. Points are not awarded at submission, and the losing request never creates a certificate.

**Alternatives not used:**

- A unique index on restaurant name would reject different branches and different addresses.
- Including approved rows would stop a user from submitting again after approval. The current 409 rule does not do that.
- A multi-document transaction is unnecessary. One insert is enough, and the local MongoDB node is not a replica set.

**Identity rules preserved by tests:** same name at another address; another name at the same address; another phone is still the same pending restaurant; two users may submit the same place; the same user may submit again after approval or rejection; case and spacing normalize to one pending row.

**Contract:** Successful submission body is unchanged. Sequential and concurrent duplicates both use the existing 409 message. An admin save of a pending restaurant that collides with another pending row for the same user now fails at the index. The generic duplicate-key middleware answers `409` with `This value is already in use`. That path previously could store two pending rows. Public submit is unchanged.

**Migration:** The index is additive. `createIndexes` does not drop other indexes. No backfill. Local read-only scan of `127.0.0.1:27017` (standalone, `setName` null):

| Database | Restaurants | Pending | Duplicate pending groups |
| --- | ---: | ---: | ---: |
| `kosherradar` | 6 | 0 | 0 |
| `kosherradar_qa` | 7 | 1 | 0 |

Production was not scanned. If a deployment already has two pending rows with the same submitter, normalized name, and normalized address, building this index fails until those rows are resolved. This session does not clean them and does not run `syncIndexes` on a shared database. Mongoose `autoIndex` is still the default, so a normal process start will try to build the index on whatever database that process uses.

### Before the fix

Database: `kosherradar_agent2_test` on `127.0.0.1:27017`. Opt-in `AGENT2_DB_TEST=1`. The URI is hardcoded. The resolved host, port, and database name are checked before writes. `directConnection: true`.

```text
$env:AGENT2_DB_TEST='1'
node --test integration/concurrentRestaurantSubmission.integration.mjs
```

Exit code: 1. 9 tests, 6 passed, 3 failed. Each failure was `created, created` (`2 !== 1`): identical concurrent submissions, concurrent submissions that differ only by case and spacing, and concurrent submissions that include certificate evidence. Sequential 409 and the legitimate distinct cases passed.

Guard, no database: `node --test integration/assertSafeAgent2Database.check.mjs`. Exit 0. 3 passed.

Reproduction commit: `06d4bedb5be729524c3af709b00915a2d64283a7`

### After the fix

Same integration command. Exit code: 0. 10 tests passed, including a check that `pending_submitter_name_address` is unique and partial on `PENDING`. Three identical races each left one pending row. The certificate race left one certificate, stripped the client kashrut level, and left `points` at 0 with an empty `awardedPointKeys`.

`npm test`: exit 0. 40 files, 500 passed (497 baseline plus the index declaration and the two duplicate-key service tests). Vitest also printed an `isolate` worker-startup note. No failures.

## Database safety

- Host `127.0.0.1`, port `27017`, database `kosherradar_agent2_test` only.
- `AGENT2_DB_TEST=1` is required before connect. `.env` is not read for the target.
- External service variables are cleared in that process. No Cloudinary, Resend, Geoapify, or Atlas calls.
- `kosherradar_qa` was not written. Port `5102` was free and was not needed, because the tests call the service on the real models.

## Triage

Not written yet. Next step after this fix is committed.

## NEXT AGENT ONBOARDING

**Current task:** Commit this fix, then triage the remaining backend issues. Do not merge or push.

**Last completed issue:** QA-003 / M5-003, verified on `kosherradar_agent2_test`.

**Git:** `feature/backend-qa-fixes`. Regression commit `06d4bedb5be729524c3af709b00915a2d64283a7`. The fix commit is the next one. Worktree: `C:\FS\projects\KosherRadar-backend-qa`.

**Files in the fix:**

- `backend/src/models/Restaurant.js`
- `backend/src/services/restaurantSubmissionService.js`
- `backend/tests/models.test.js`
- `backend/tests/restaurantSubmissionService.test.js`
- `backend/integration/concurrentRestaurantSubmission.integration.mjs`
- `BACKEND_QA_FIX_PROGRESS.md`

**Tests:** integration 10 passed, exit 0. `npm test` 500 passed, exit 0.

**Known limitations:** Undated certificate identity was not changed. Standalone MongoDB cannot run a multi-document transaction. Production duplicate pending rows were not scanned. The index build can fail there until conflicts are removed by an approved cleanup.

**Uncommitted changes:** the fix listed above, until the fix commit lands.

**Exact next step:** Commit with `fix(backend): prevent concurrent duplicate restaurant submissions`. Then triage certificate identity, reports, password reset, moderation points, and authorization. Fix only a confirmed, safe defect. Do not change certificate identity or points rules without approval.

**Do not repeat:** Do not reset `main`. Do not edit other worktrees. Do not unique-index restaurant name alone. Do not `syncIndexes` a shared database.
