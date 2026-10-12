# Backend QA fix progress

Agent 2 work lives only on `feature/backend-qa-fixes` in `C:\FS\projects\KosherRadar-backend-qa`.

Shared trackers (`PROGRESS.md`, `FIX_TRACKER.md`, `AUDIT_FINDINGS.md`) are not modified. Other worktrees are not modified. Nothing is merged or pushed.

## Baseline

- Pinned commit: `3bbb1e2da84215e62c82010de755be2b574aa6bf`
- `main` in `C:\FS\projects\KosherRadar` is still that commit. This branch started there.
- `feature/backend-qa-fixes` already existed at that commit with a clean worktree, so it was resumed.

### Existing backend suite, before application changes

Command, from `backend`: `npm test` (`vitest run`)

- Exit code: 0
- Test files: 40 passed
- Tests: 497 passed, 0 failed
- Warning: Vitest said module transforms are not cached across runs. A later run also printed an `isolate` worker-startup note. No test failure.
- The suite mocks repositories. It does not prove database concurrency.
- No `.env` is present in this worktree. Integration runs print `injected env (0) from .env`.

## Database safety

- Host `127.0.0.1`, port `27017`, database `kosherradar_agent2_test` only.
- `AGENT2_DB_TEST=1` is required before connect. The URI is hardcoded. Inherited configuration is not used as the target.
- Resolved host, port, and database name are checked before writes. `directConnection: true`. The node is standalone (`setName` null), so multi-document transactions are not available.
- External service variables are cleared in that process. No Cloudinary, Resend, Geoapify, or Atlas calls.
- `kosherradar_qa` was not written. Port `5102` was free and was not needed. Tests call the services on the real models.
- Local read-only scan before the indexes were added: `kosherradar` had 6 restaurants, 0 pending, 0 duplicate pending groups, 0 certificates. `kosherradar_qa` had 7 restaurants, 1 pending, 0 duplicate pending groups, 4 certificates, 1 pending, 0 duplicate dated pending groups. Production was not scanned.

Guard, no database: `node --test integration/assertSafeAgent2Database.check.mjs`. Exit 0. 3 passed.

## QA-003 / M5-003 — concurrent duplicate restaurant submissions

**Status:** VERIFIED

**Reported behavior:** Two simultaneous submissions of the same restaurant by the same user both create pending restaurants. A sequential duplicate returns 409.

**Root cause:** `submitRestaurantService` looks up a pending row for the same submitter, normalized name, and normalized address, then inserts in a separate step. Nothing made that insert atomic. Near-duplicate warnings still do not block a different place or a different user.

**Solution:** Partial unique index `pending_submitter_name_address` on `submittedBy`, `nameNormalized`, and `addressNormalized` where `status` is `PENDING`. The losing insert is duplicate key 11000. The service maps that key to the existing 409 message and still deletes an uploaded photo. A different duplicate-key pattern is not rewritten. Submission does not award points. The losing request does not create a certificate.

**Not used:** a unique index on name alone; including approved or rejected rows; a multi-document transaction.

**Contract:** The success body is unchanged. Sequential and concurrent duplicates both say `You already submitted this restaurant and it is waiting for review`. An admin save that changes a pending restaurant onto another pending row for the same user now fails the index. The generic middleware then answers 409 `This value is already in use`. Public submit is unchanged.

**Migration:** Additive `createIndexes` only. No backfill and no `syncIndexes`. If a deployment already has two pending rows with the same submitter, normalized name, and normalized address, building the index fails until those rows are resolved by an approved cleanup. This session did not clean them. Mongoose `autoIndex` is still the default, so a normal process start tries to build the index on that process's database.

### Evidence

Before, `node --test integration/concurrentRestaurantSubmission.integration.mjs` with `AGENT2_DB_TEST=1`: exit 1. 9 tests, 6 passed, 3 failed. Each failure was `created, created`. Commit `06d4bedb5be729524c3af709b00915a2d64283a7`.

After: same command, exit 0, 10 passed. Three identical races left one pending row. The certificate race left one certificate, stripped the client kashrut level, and left points at 0. Distinct addresses, names, users, phones, and resubmit after approval or rejection still succeed.

## Concurrent duplicate certificates

**Status:** VERIFIED

**Reported behavior:** Not in the QA report as a separate finding. The same lookup-then-insert exists in `submitTeudaService`.

**Reproduction before the fix:** `node --test integration/concurrentCertificateSubmission.integration.mjs` with `AGENT2_DB_TEST=1`. Exit 1. Dated identical submissions and dated submissions with different mashgichim each stored two certificates (`created, created`). Sequential dated duplicate returned 409. Different dates, different users, different free-text hechshers, undated certificates with different mashgichim, and resubmit after rejection succeeded. Commit `209cd752ed919dab40f2ff070a7c354735852b57`.

A separate opt-in run, before the undated index existed, also stored two identical undated certificates (`undatedResults: ["created","created"]`, count 2).

**Root cause:** `findSimilarPendingTeudaRepo` then `createTeudaRepo`. Dated identity ignores mashgiach. Undated identity also uses mashgiach name, phone, and photo fingerprint. There was no unique index.

**Solution:**

- `pending_dated_certificate_identity`: unique on restaurant, submitter, hechsher, hechsher other text, kashrut level, and expiration date, only when `status` is `PENDING` and `expirationDate` is a date. Mashgiach is not part of this key.
- `pending_undated_certificate_identity`: unique on restaurant, submitter, hechsher, hechsher other text, kashrut level, mashgiach name, mashgiach phone, and photo fingerprint, only when `status` is `PENDING` and `expirationDate` is null. Missing fingerprint stays null, so a legacy undated row with no fingerprint still blocks a later no-photo submission with the same hechsher and mashgiach.

The losing insert is mapped to the existing 409 message, `You already submitted this certificate and it is waiting for review`. An uploaded photo is still deleted. Points are not awarded at submission. Two different users may still submit the same certificate. Different dates, different free-text hechshers, and undated certificates with a different mashgiach or a different phone still both succeed. Rejected dated certificates can be submitted again.

**Migration:** Same as the restaurant index. Additive, no backfill. Local dated pending groups were 0. Production was not scanned. A pre-existing pair that matches either key will make that index build fail until an approved cleanup. No certificate identity rule was widened or narrowed relative to the existing 409 lookup. The legacy no-fingerprint match was kept on purpose.

### Evidence after the fix

Same certificate command: exit 0, 12 passed, including the legacy no-fingerprint case.

Restaurant command re-run in the same session: exit 0, 10 passed.

`npm test`: exit 0, 40 files, 502 passed.

## Concurrent duplicate reports

**Status:** VERIFIED

**Reported behavior:** A user must not have two identical pending reports for the same restaurant. Concurrent identical submissions were both stored.

**Identity, taken from the existing lookup:** same submitter, same restaurant, same certificate (or both with no certificate), and the same description, while `status` is `PENDING`. The description match follows the schema trim: surrounding spaces are the same text, and letter case is not. Report type, photo, and proposed hechsher or level are not part of the identity. Different users, different wording, and different certificates stay separate. After the first report is resolved or rejected, the same text can be sent again.

**Root cause:** `findSimilarPendingReportRepo` then `createReportRepo`. A unique index on `description` was not used because a 2000-character value can exceed MongoDB's index key limit.

**Solution:** `pendingReportFingerprint` is the SHA-256 of the trimmed description and the certificate id, stored on the report and omitted from default queries. Partial unique index `pending_report_identity` covers `submittedBy`, `restaurant`, and that fingerprint only when `status` is `PENDING` and the fingerprint is a string. The losing insert is mapped to the existing 409, `You already sent this report and it is waiting for review`. An uploaded photo is still deleted. Points are still awarded only when an admin resolves one report with a correction, once, under the existing +1 rule.

**Migration:** No backfill. Reports saved before this field are outside the partial index, so the build does not require them to be unique and does not rewrite them. A later identical submission still hits the existing lookup. Production was not scanned. `syncIndexes` was not run.

**Reopen note:** If a resolved report is put back to pending after the user has already sent the same text again, the index can reject that reopen. The existing correction path logs a failed reopen and still reports the original write error. That window was not given a new points rule.

### Evidence

Before, `node --test integration/concurrentReportSubmission.integration.mjs` with `AGENT2_DB_TEST=1`: exit 1. 8 tests, 6 passed, 2 failed. Identical concurrent reports and a 1500-character concurrent description each stored two rows (`created, created`). Commit `70e06858e3cb48d46442689e864e2922c747cedb`.

After: same command, exit 0, 9 passed. The surviving report, resolved with `CORRECTION_ALREADY_MADE`, awarded +1 once (`REPORT:<id>`). Points were 0 before that resolution. A long description still collapsed to one row. Spacing, type, proposed level, another certificate, another user, different case, and resubmit after resolve or reject behaved as the existing rule requires.

`npm test`: exit 0, 40 files, 505 passed. Resolving the live report printed the existing Mongoose warning that `new` on `findOneAndUpdate` is deprecated. That call was already in the admin repository. It was not changed.

## Triage

| Issue | Evidence | Current status | Impact | Action |
| --- | --- | --- | --- | --- |
| QA-003 / M5-003 restaurant race | Live race stored 2 rows, then 1 row and 409 | VERIFIED | Duplicate pending restaurants | Fixed |
| Dated and undated certificate race | Live race stored 2 certificates, then 1 and 409 | VERIFIED | Duplicate pending certificates; two later approvals could award +2 twice | Fixed |
| Legacy undated photo with no fingerprint | Integration test still returns 409 for a later no-photo submission. QA reported the same limitation | NEEDS PRODUCT DECISION | A no-photo retry matches an old row that has no fingerprint | No backfill |
| Report submission race | Live race stored 2 rows, then 1 row and 409. +1 awarded once | VERIFIED | Duplicate pending reports and a second +1 | Fixed with a SHA-256 fingerprint, not an index on the description |
| Password reset token, expiry, reuse, `tokenVersion` | QA live pass. Code consumes the token, releases it when the password is not saved, and bumps `tokenVersion` in the password update | ALREADY WORKING | Session invalidation and single use | No code change |
| Concurrent certificate approval and +3 / +2 | QA live pass. Award key is per certificate id | ALREADY WORKING | Double points on one certificate | No code change |
| `CORRECTION_ALREADY_MADE` awards +1 without a field diff | Documented points rule. QA did not treat it as a defect | NEEDS PRODUCT DECISION | Points policy | Not changed |
| Report `APPLY_PROPOSED` concurrency | QA live pass: one success, one 409, +1 once | ALREADY WORKING | Split report and correction | No code change |
| Restaurant delete is not one transaction | Standalone MongoDB. QA did not call the missing transaction a defect | BLOCKED | Partial delete if a later command fails | No replica set and no new dependency |
| Cloudinary delete failures (M5-004) | Code logs and continues. No credentials | BLOCKED | Orphan images | No live calls |
| Register email race | `User.email` is already unique. An uncaught 11000 becomes the generic middleware 409, not the register sentence | DEFERRED | No second account. The message can differ | Not changed |
| Security headers (M4-003) and cookie auth (M4-004) | Tracker. Helmet or cookies need approval | BLOCKED / DEFERRED | Hardening, not a reproduced leak | Not changed |
| Search candidate cap (M6-001) | Code cap. Not reproduced with a large set | DEFERRED | Late alphabetical matches can be omitted | Not changed |
| Public restaurant payload privacy | QA live pass on details and cards | ALREADY WORKING | Private field exposure | No code change |

The report race above is the additional confirmed fix requested after the certificate work.

## NEXT AGENT ONBOARDING

**Current task:** None. The report duplicate race is verified. Do not merge or push.

**Last completed issue:** Concurrent identical pending reports.

**Git branch:** `feature/backend-qa-fixes` in `C:\FS\projects\KosherRadar-backend-qa`. This progress file is part of the report fix commit. Regression commit `70e0685`. Earlier: `06d4bed` and `b86f46d` restaurants, `209cd75` and `fd84030` certificates.

**Tests last run:**

- Report integration: exit 0, 9 passed.
- `npm test`: exit 0, 40 files, 505 passed.
- Certificate integration from the previous fix: exit 0, 12 passed. Restaurant integration: exit 0, 10 passed.

**Database safety:** `AGENT2_DB_TEST=1` and `kosherradar_agent2_test` on `127.0.0.1:27017` only. Do not use `kosherradar_qa`. Do not read `.env`.

**Known limitations:**

- Undated legacy rows with no photo fingerprint still match a later no-photo submission. That is intentional.
- Old reports without `pendingReportFingerprint` are not backfilled. The lookup still blocks a sequential duplicate.
- Reopening a resolved report can fail if an identical pending report already exists.
- Standalone MongoDB cannot run a multi-document transaction.
- Production data was not scanned. Do not `syncIndexes` a shared database.
- Admin collision on the restaurant index uses the generic duplicate-key 409 text.
- `CORRECTION_ALREADY_MADE` still awards +1 without a field diff.

**Uncommitted changes:** none after the report fix commit.

**Exact next step:** Stop. Do not merge or push.

**Do not repeat:** Do not reset `main`. Do not edit other worktrees. Do not unique-index a report description or a restaurant name. Do not backfill certificate fingerprints or report fingerprints. Do not change the +1 / +2 / +3 rules.
