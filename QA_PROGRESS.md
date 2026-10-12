# KosherRadar — QA progress

QA branch: `feature/qa-testing`  
Base commit: `f87e665` (`fix(m4-001): invalidate existing sessions when a password is reset`)  
Worktree: `C:\FS\projects\KosherRadar-qa`  
Date: 12 October 2026

This branch was taken from the committed tip of `feature/audit-must-fix`. Agent 1’s uncommitted edits were not included. Those dirty files, left alone here, were:

- `backend/src/repositories/adminReportRepository.js`
- `backend/src/repositories/passwordResetRepository.js`
- `backend/src/services/passwordResetService.js`
- `backend/tests/passwordResetService.test.js`

Agent 2 is on `feature/ui-polish` in `C:\FS\projects\KosherRadar-ui`. No UI files were edited in this session.

`AGENTS.md`, `PROGRESS.md`, `FIX_TRACKER.md`, and `AUDIT_FINDINGS.md` were not modified. Application logic was not changed.

## Tests added

| File | What it locks in |
| --- | --- |
| `backend/tests/qaSubmissionHistory.test.js` | Account submission history: empty lists, rejection reasons, +3 / +2 / +1 only when the stored award key exists, a missing restaurant name, and no admin note, submitter, or Cloudinary id |
| `backend/tests/qaPendingCertificateIdentity.test.js` | A client kashrut level is not stored or used in the pending-duplicate lookup. `it.fails` records QA-001 |

Repositories and Cloudinary stay mocked. These tests do not prove a live database, upload, email, or map provider.

## Coverage audit

The suites are service and helper tests. On this base, before these files, the backend had 38 test files. The frontend has 14 files and 90 tests, all pure functions or request builders. There are no component tests and no browser runner. That gap is already M10A-001 and M10B-001. Playwright was not added.

What is already covered well enough that it was not repeated:

- Search filters, paging, Atlas fallback, and public card fields (`restaurantSearchService.test.js`, `kashrutFilters.test.js`)
- Public restaurant details, including hiding unapproved and old certificates
- Points amounts and idempotency (`pointsService.test.js`)
- Login, registration role injection, and session version (`authService.test.js`)
- Certificate expiration boundaries (`teudaRulesService.test.js`), including an approved certificate with no level or no date
- Admin approve / reject for restaurants, certificates, and reports, except the files Agent 1 is editing now

Useful gaps that are still open:

- MongoDB query behavior is never executed. Duplicate detection, search filters, and award updates are mocked, so a query that matches `null` differently than the author expected stays green.
- `getMySubmissionsService` had a single happy-path test. The new file covers the missing point and privacy cases. It still does not run the repository’s 50-row cap.
- Protected routes and the admin screen are not rendered in tests. `ProtectedRoute` treats any saved token as logged in. `AdminRoute` checks the role stored in the browser. The server remains the real check.
- Password reset and report resolution were not given new tests, because Agent 1 is changing them.

## Newly discovered bugs

### QA-001 — Undated certificates of the same hechsher collapse into one pending duplicate

- **For:** Agent 1
- **Severity:** High for the add-certificate flow
- **Status:** Documented. Production code was not changed.

`submitTeudaService` blocks a second pending certificate when `findSimilarPendingTeudaRepo` finds a row. The lookup is restaurant, submitter, hechsher, optional other-hechsher text, kashrut level, and expiration date. After M1-001 the level sent by a user is ignored (`kashrutLevel: null`). If the user also leaves the expiration date empty, `expirationDate` is `null`. Mashgiach name and photo are saved on the certificate but are not part of the lookup.

Two submissions that differ only by mashgiach therefore produce the same lookup object:

```js
{
  restaurant: 'rest-1',
  submittedBy: 'user-1',
  hechsher: 'BADATZ_BEIT_YOSEF',
  hechsherOther: undefined,
  kashrutLevel: null,
  expirationDate: null,
}
```

Evidence from a one-off run of the new test as a normal `it` (then restored to `it.fails`):

```text
AssertionError: expected { restaurant: 'rest-1', …(5) } to not deeply equal { restaurant: 'rest-1', …(5) }
Compared values have no visual difference.
```

Reproduction without a database: call `submitTeudaService` twice for an approved restaurant, same hechsher, no date, mashgiach “Avi Cohen” then “Dana Levi”, with `findSimilarPendingTeudaRepo` returning null the first time. The two calls receive equal arguments. On a real database the second call finds the first row, returns 409 “You already submitted this certificate and it is waiting for review”, and does not upload the second photo.

A dated certificate is distinct: the same test file shows `expirationDate` of `2027-01-15` is passed through, and a client `kashrutLevel` of `MEHADRIN` is not stored.

**Recommendation:** Treat two undated certificates as different when the mashgiach name or the photo differs, or only run this duplicate check when an expiration date is present. Keep the 409 for a genuine retry of the same dated certificate. When the lookups differ, change `it.fails` in `qaPendingCertificateIdentity.test.js` to a normal `it`. Until then Vitest reports that case as an expected failure and the suite exits 0.

### QA-002 — `tokenVersion` is declared twice on the User schema

- **For:** Agent 1
- **Severity:** Low. No behavior change today.

`backend/src/models/User.js` defines `tokenVersion` twice in the same schema object (the block before `points`, and again after `awardedPointKeys`). A JavaScript object keeps the second definition. Both definitions are `{ type: Number, default: 0, min: 0 }`, so Mongoose still has one path and existing sessions are unaffected. A later edit to only one of the two blocks would be misleading. Delete the duplicate and keep a single field.

## Not filed as bugs

- Account history shows +3 whenever `submittedWithNewRestaurant` is true and the award key exists. The award itself also requires the restaurant and the certificate to have the same submitter. Current restaurant submission sets both to the same user, and nothing in the API changes `submittedBy` afterwards, so the page matches the points that were stored. The history query does not load `restaurant.submittedBy`, so it could not detect a hand-edited mismatch.
- `formatDate` in `MySubmissionsPage.tsx` uses `new Date(value)`. `new Date(null)` is the Unix epoch, not an invalid date. Saved documents get `createdAt` from Mongoose, so this does not show up for normal rows.
- `AdminRoute` still shows the English sentence “This area is only for administrators.” That is UI copy for Agent 2, not a logic bug.

## Test isolation

Checked without reading `.env` files and without opening MongoDB, Cloudinary, Resend, Geoapify, or Atlas.

- `mongoose.connect` exists only in `backend/src/config/db.js`. No test imports `db.js` or `server.js`.
- `models.test.js` imports Mongoose to construct documents. It does not connect.
- HTTP tests bind a local port and mock the services behind the routes.
- `imageUpload.test.js` replaces `config/cloudinary.js` with a mock.
- `emailService.test.js` and `placesService.test.js` stub `fetch` and set a fake in-memory key before any call.
- `restaurantSearchService.test.js` replaces `config/env.js`, so Atlas stays off in that file.
- Several other tests import the real `config/env.js`. That module calls `dotenv.config()` at import. If `backend/.env` is in the working directory, its values are loaded into the process. A future test that then calls `fetch`, Cloudinary, or `connectDb` without a mock could reach a real service.
- This worktree has no `backend/.env` and no `frontend/.env` (gitignored files are not copied). The main checkout does have both files. Their contents were not read. This test run therefore did not load those files.
- Mocked passing tests are not evidence that Cloudinary, Resend, Geoapify, or Atlas work.

## Verification

Commands were run in `C:\FS\projects\KosherRadar-qa`. Exit code 0 for both suites.

| Command | Result |
| --- | --- |
| `cd backend; npm test` | 40 files, 491 passed, 1 expected fail, 492 total. Exit 0. About 6.7s. |
| `cd frontend; npm test` | 14 files, 90 passed, 0 failed. Exit 0. About 6.1s. |

The expected failure is QA-001 in `qaPendingCertificateIdentity.test.js`. It was introduced here on purpose. The other 491 backend tests passed, including the 7 new history and lookup assertions. No earlier test failed. Frontend files were not changed. Frontend lint, typecheck, and build were not run.

A temporary run of the QA-001 case as a normal `it` exited 1 with the assertion above, then the case was put back on `it.fails`. The full backend suite was run after that restore.

## Files modified

- `backend/tests/qaSubmissionHistory.test.js` (new)
- `backend/tests/qaPendingCertificateIdentity.test.js` (new)
- `QA_PROGRESS.md` (new)

## Recommendations for Agent 1

1. Fix QA-001 in `submitTeudaService` / `findSimilarPendingTeudaRepo`. Do not change point amounts or public kashrut labels.
2. Remove the duplicate `tokenVersion` field in `User.js` (QA-002) when next editing that model.
3. Leave the `it.fails` test in place until the lookup can tell the two mashgichim apart, then convert it to a normal test.

## Next QA agent

- Stay on `feature/qa-testing`. Do not commit onto `main` or onto Agent 1’s dirty tree.
- Skip password reset and `adminReportRepository` until those uncommitted edits land.
- After QA-001 is fixed, `it.fails` will fail the suite because the assertion starts passing. Update that test in the same change.
- Do not add Playwright or another database driver without approval.
