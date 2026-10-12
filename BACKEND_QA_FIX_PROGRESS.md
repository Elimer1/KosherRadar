# Backend QA fix progress

Agent 2 work lives only on `feature/backend-qa-fixes` in `C:\FS\projects\KosherRadar-backend-qa`.

Shared trackers (`PROGRESS.md`, `FIX_TRACKER.md`, `AUDIT_FINDINGS.md`) are not modified. Other worktrees are not modified. Nothing is merged or pushed.

## Baseline

- Pinned commit: `3bbb1e2da84215e62c82010de755be2b574aa6bf`
- `main` in `C:\FS\projects\KosherRadar` is still that commit. The branch was created from it. No divergence.
- `feature/backend-qa-fixes` already existed at that commit with a clean worktree, so it was resumed instead of duplicated.

### Existing backend suite, before application changes

Command, from `backend`:

`npm test` (`vitest run`)

- Exit code: 0
- Test files: 40 passed
- Tests: 497 passed, 0 failed
- Warning: Vitest reports that module transforms are not cached across runs (`fsModuleCache`). No test failure.
- The suite mocks repositories. It does not prove database concurrency.
- No `.env` is present in this worktree. The integration run printed `injected env (0) from .env`.

## QA-003 / M5-003 — concurrent duplicate restaurant submissions

**Status:** REPRODUCED, not fixed yet.

**Reported behavior:** Two simultaneous submissions of the same restaurant by the same user both create pending restaurants. A sequential duplicate returns HTTP 409.

**Root cause, confirmed in code:** `submitRestaurantService` calls `findPendingRestaurantBySubmitterRepo` and, only when that returns nothing, `createRestaurantRepo`. The pending identity is `submittedBy` + normalized name + normalized address + `PENDING`. `Restaurant` has no unique index on that identity. `findPossibleDuplicatesService` only stores a warning and does not block.

**Identity rules that must stay:**

- Same name at a different address is allowed.
- A different name at the same address is allowed.
- Two different users may submit the same name and address. That remains a warning, not a 409.
- Phone is not part of the pending identity.
- After the pending row is approved or rejected, the same user may submit that name and address again.
- A unique index on restaurant name alone would be wrong.

**Local data check (read-only, `127.0.0.1:27017`, standalone, no replica set):**

| Database | Restaurants | Pending | Duplicate pending groups |
| --- | ---: | ---: | ---: |
| `kosherradar` | 6 | 0 | 0 |
| `kosherradar_qa` | 7 | 1 | 0 |

No local pending group would block a partial unique index. Production was not scanned. The index is additive. No backfill and no destructive sync are planned. If a deployment already has two pending rows with the same submitter, normalized name, and normalized address, index creation fails until those rows are resolved by an approved cleanup. This session does not do that cleanup.

### Reproduction

Database: `kosherradar_agent2_test` on `127.0.0.1:27017`. Opt-in `AGENT2_DB_TEST=1`. The test URI is hardcoded. Inherited `MONGODB_URI` is overwritten only after that opt-in, and the resolved host, port, and database name are checked before writes. `directConnection: true`. Replica set name was null.

Command:

```text
$env:AGENT2_DB_TEST='1'
node --test integration/concurrentRestaurantSubmission.integration.mjs
```

Exit code: 1. 9 tests, 6 passed, 3 failed.

The three failures each stored two creates (`created, created`, assertion `2 !== 1`):

- identical concurrent submissions
- concurrent submissions that differ only by case and spacing
- concurrent submissions that also include certificate evidence

Sequential duplicate, distinct branches, distinct names at one address, a different phone, two users, and resubmit after approval or rejection passed on the unfixed code.

Guard command, no database:

```text
node --test integration/assertSafeAgent2Database.check.mjs
```

Exit code: 0. 3 passed.

## Triage

Not started. QA-003 is still open.

## NEXT AGENT ONBOARDING

**Current task:** Commit this regression, then implement the concurrency fix. Do not start another issue first.

**Last completed issue:** none. QA-003 is reproduced only.

**Git:** `feature/backend-qa-fixes` at `3bbb1e2da84215e62c82010de755be2b574aa6bf` until the regression commit lands. Worktree: `C:\FS\projects\KosherRadar-backend-qa`.

**Files added, not yet committed:**

- `backend/integration/assertSafeAgent2Database.mjs`
- `backend/integration/assertSafeAgent2Database.check.mjs`
- `backend/integration/agent2Database.mjs`
- `backend/integration/concurrentRestaurantSubmission.integration.mjs`
- `BACKEND_QA_FIX_PROGRESS.md`

**Application source:** unchanged.

**Database safety:** set `AGENT2_DB_TEST=1`. Tests connect only to `mongodb://127.0.0.1:27017/kosherradar_agent2_test`. Do not use `kosherradar_qa`. Do not read `.env`. Do not call Cloudinary, Resend, Geoapify, or Atlas.

**Uncommitted changes:** the files listed above.

**Exact next step:** Commit the regression with `test(backend): reproduce concurrent restaurant submission race`. Then add a partial unique index on `submittedBy`, `nameNormalized`, and `addressNormalized` where `status` is `PENDING`, catch that duplicate-key error in `submitRestaurantService`, and map it to the existing 409 message. Re-run the integration file and `npm test`.

**Do not repeat:** Do not reset `main`. Do not edit other worktrees. Do not build the index on a shared database with `syncIndexes`. Do not unique-index restaurant name alone.
