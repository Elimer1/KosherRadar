# KosherRadar — audit findings

Read-only audit on 12 October 2026. Application code, tests, schemas, dependencies, configuration, and database data were not modified. Live Cloudinary, Resend, Geoapify, and Atlas were not called. `.env` files were not read. Variable names come from `backend/.env.example` and `frontend/.env.example`.

Issue status lives in `FIX_TRACKER.md`. This file is the evidence.

Classification totals, matching the tracker:

| Class | Count | Issue IDs |
| --- | ---: | --- |
| Confirmed bug | 4 | M1-001, M2-002, M4-001, M5-002 (token order) |
| Security or reliability risk | 12 | M1-003, M4-003, M4-004, M5-001, M5-003, M5-004, M6-001, M6-003, M9-001, M9-002, M9-003, M9-004 |
| UX, architecture, or readiness improvement | 12 | M1-002, M2-003, M2-004, M3-003, M6-002, M6-004, M8-002, M8-003, M8-004, M10A-001, M10B-001, M11-001 |
| Already implemented correctly | 8 | M2-001, M3-001, M3-002, M4-002, M7-001, M7-002, M7-003, M8-001 |

M5-002 is counted once, as a confirmed bug, because the reset-token order is a definite defect. The same issue also lists other multi-document flows that are risks.

---

## Confirmed bugs

### Finding ID

M1-001

### Severity

Critical

### Evidence

- `frontend/src/pages/SubmitRestaurantPage.tsx`, `handleSubmit`
- `frontend/src/components/TeudaFields.tsx`, `showLevel`
- `frontend/src/api/restaurantApi.ts`, `submitRestaurant`
- `backend/src/schemas/teudaSchemas.js`, `teudaFieldsSchema`
- `backend/src/services/restaurantSubmissionService.js`, `submitRestaurantService`

`certificateComplete` is true only when level, expiration, both mashgiach fields, and a valid photo are all present. The page renders `TeudaFields` with `showLevel={false}`, so the level `<select>` is not mounted. The level stays at the empty default. `certificateComplete` is therefore false for every submit on this page.

The call then passes `null` for both the teuda and the photo:

```tsx
certificateComplete ? teuda : null,
certificateComplete ? photo : null,
```

`submitRestaurant` appends those parts only when both are non-null. The hechsher is copied onto the restaurant as `claimedHechsher`. The API receives a restaurant and no certificate.

A `photoError` also forces `certificateComplete` to false and does not `return` before the request. The restaurant is still submitted. The thank-you view checks `result.teuda`, which is null, and shows the restaurant-only message.

Reproduction from the code path: enter name, address, and hechsher; attach a JPG; fill expiration and mashgiach; submit. The browser sends the claim and omits the file. The server never sees the photo, so it cannot reject or store it.

The add-certificate page still sends a full teuda with `showLevel` left at its default `true`. That path is not this bug.

`PROGRESS.md` (product update after Milestone 6) already says a photo on this form is not stored. The desired behavior for this program is the opposite: a photo must be kept as pending evidence, or the form must show an error. Silent success is the defect.

### Root cause

The level was hidden because there is no approved map from hechsher to Rabbanut or Mehadrin. The completeness check still requires the level, and a failed check drops the certificate instead of reporting it. The server cannot accept a partial teuda today: `kashrutLevel` is a required enum on `teudaFieldsSchema` and on the `Teuda` model.

### Impact

A user who photographs a certificate believes it was sent. Admins never see the photo. The restaurant, once approved, can appear as an unverified claim only. Points that depend on an approved certificate (+3 / +2) cannot be earned from this form. A bad image file is also ignored rather than explained.

### Recommended fix

Keep restaurant-only submit working. If the user added a photo or any certificate field, either store that evidence as pending or stop the submit and name the problem. Do not require the user to pick a kashrut level. Do not invent the level from the hechsher name.

The smallest storage fix is an additive schema change: allow `kashrutLevel` to be absent on a pending teuda, and teach `kashrutStatusService.js` to keep ignoring unapproved teudot. Existing teuda documents already have a level, so no backfill is required if the public code treats a missing level as "not a verified level". Rollback is to stop accepting level-less teudot; old documents stay valid.

If that schema change is not approved, the smallest safe fix is to block submit when a photo or extra certificate field is present and to say the photo was not sent. That meets "errors instead of silent drop" and does not meet "photo submission works".

### Verification plan

Unit-test the payload builder: photo plus hechsher and no level produces either a teuda payload or a visible error, and never a success that omits the file. Extend `restaurantSubmissionService` tests for a level-less pending teuda if storage is approved. Browser: submit with a photo, confirm the pending teuda or the error, then submit with name, address, and hechsher only and confirm no teuda row.

### Dependencies and approvals

- Schema: optional `kashrutLevel` on new pending teudot, only if storage is chosen. No backfill expected. Needs approval.
- Product decision: store a certificate without a level, or refuse the photo with an error. Do not guess the hechsher-to-level map.
- Cloudinary is required to prove a real upload (M9-003). The bug itself is visible without Cloudinary: the file is absent from the request.
- Hebrew strings changed by the fix need native-speaker review (M8-004).

---

### Finding ID

M2-002

### Severity

Critical

### Evidence

- `backend/src/services/adminReportService.js`, `applyProposedCorrection`, `resolveReportService`
- `backend/src/repositories/adminReportRepository.js`, `resolvePendingReportRepo`
- `backend/src/services/pointsService.js`, `awardPointsForAppliedCorrectionService`
- `frontend/src/pages/SubmitReportPage.tsx`
- `backend/src/schemas/reportSchemas.js`, `submitReportSchema`

`resolveReportService` applies `APPLY_PROPOSED` by writing the teuda or the restaurant claim, then calls `findOneAndUpdate` with `{ status: 'PENDING' }`. If another admin already resolved the report, the update returns null and the service throws 409. The earlier write is not undone.

Reproduction: two admins open the same `KASHRUT_UPDATE` report. One chooses Apply and the other chooses No correction. If Apply writes the hechsher and No correction wins the status update, the certificate or claim has changed, `correctionApplied` is false, and no point is awarded. If Apply wins the status after the other request already wrote nothing, the data change and the points can still be consistent. The bad case is the first one. This was not executed against a database; the order of the two awaits is the evidence.

`CORRECTION_ALREADY_MADE` sets `correctionApplied` true without reading the teuda or restaurant. The points helper awards +1 once for `REPORT:<id>` whenever status is `RESOLVED` and that flag is true. Two admins cannot double-award, because the status update matches `PENDING` only and the award key is unique per report. They can award +1 when no field changed. That matches the written rule and can still credit a correction that did not happen.

The current report form sends a description and an optional photo. The schema defaults type to `GENERAL` and strips proposed hechsher and level. `PendingReportsTab` hides Apply unless `type === 'KASHRUT_UPDATE'` and a proposed value exists. New reports from this UI cannot hit Apply. Older stored `KASHRUT_UPDATE` reports still can. A client can still post `KASHRUT_UPDATE` with proposed fields; the API allows it.

### Root cause

The data correction and the report status are separate writes. Points follow the flag on the report, and "already corrected" sets the flag without a diff.

### Impact

A lost race can change public kashrut data while the report looks informational and the contributor gets no point, or the admin who lost the race sees an error after the data already changed. "Already corrected" can pay +1 for a report the admin only closed.

### Recommended fix

Claim the pending report in the same transaction as the correction, or claim it first and apply only if this caller won, then compensate on failure. Keep the award idempotent. Do not change the +1 amount. Ask before requiring a stored diff for `CORRECTION_ALREADY_MADE`.

For new general reports, keep Apply hidden. Show the attached photo in the admin card (M2-003).

### Verification plan

Service test with a fake repository: Apply writes the teuda, then the status update returns null, and the teuda write is reverted or never committed. Second test: two resolutions, only one status change, one point. Existing `adminReportService.test.js` covers the happy path with mocks and does not cover this race.

### Dependencies and approvals

- A MongoDB transaction needs a replica set. Do not add `mongodb-memory-server` without approval. Compensating writes can be tested with mocks.
- Requiring a real edit before +1 changes the point rule and needs approval.
- No live services.

---

### Finding ID

M4-001

### Severity

High

### Evidence

- `backend/src/services/authService.js`, `signTokenService`, `getUserFromTokenService`
- `backend/src/services/passwordResetService.js`, `resetPasswordService`
- `backend/src/models/User.js`
- `backend/src/config/env.js`, default `JWT_EXPIRES_IN` of `24h`

The token payload is `sub` and `role`. Reset replaces `passwordHash` and consumes reset-token documents. `User` has no version or password-changed time. `getUserFromTokenService` rejects a missing user and otherwise accepts the signature. A token issued before the reset still verifies until it expires. Logout only clears `localStorage` (`authStore.ts`). This is the limitation already written in `PROGRESS.md` Milestone 3. It is still present.

### Root cause

JWTs are stateless and do not carry a session version. Changing the password does not change what `jwt.verify` checks.

### Impact

Anyone who still has a stolen token can call the API for up to 24 hours after the account owner resets the password. Logout on one browser does not end a copy of the token elsewhere.

### Recommended fix

Add `sessionVersion` (number, default 0) or `passwordChangedAt` on `User`. Include it in new tokens. Reject a token whose value is older than the user document. Update it in the same write as the new password hash. Tokens that lack the claim can keep working until they expire, so deploy does not log everyone out. That behavior should be confirmed before coding if an immediate logout is preferred. Do not move the token to an HttpOnly cookie (M4-004).

### Verification plan

`passwordResetService` test: after reset, a token signed with the old version fails `getUserFromTokenService`, and a newly signed token works. An old token fixture without the claim still works until expiry if that compatibility rule is chosen.

### Dependencies and approvals

- Additive field. Existing users without the field are treated as version 0. No backfill. Rollback is to stop checking the claim.
- No new package.
- Cookie storage stays deferred.

---

### Finding ID

M5-002 (password-reset token order)

### Severity

High

### Evidence

- `backend/src/services/passwordResetService.js`, `resetPasswordService`
- No `startSession` or `withTransaction` under `backend/src`

`consumeResetTokenRepo` runs before `bcrypt.hash` and `setUserPasswordHashRepo`. If the password write throws, or the user was deleted, the token is already used and the password is unchanged. The user must request a new link. The forgot-password response still hides whether the email exists. This failure path was not executed.

Other multi-document flows in the same issue, without a transaction:

- `submitRestaurantService` inserts the restaurant, then the teuda, and deletes both the restaurant and the photo if the teuda insert fails. A failed cleanup is logged.
- `rejectRestaurantService` rejects the restaurant, then rejects pending certificates in a later call that only logs a failure.
- Report apply-then-resolve is M2-002.

### Root cause

The token is consumed first so it cannot be used twice. The password update is a second command.

### Impact

A crash or a database error during reset burns the link. The password stays the same. The user sees an invalid-or-expired message on retry and must request mail again. If Resend is down, they may not get the new mail (M9-004).

### Recommended fix

Put the token consume and the password update in one transaction when a replica set is available. Otherwise set the password and consume the token in an order that still allows one winner, and restore the token if the password write fails. Keep one-time use.

### Verification plan

Mock the password update to throw and assert the token is not left consumed, or run the pair inside a transaction against an isolated replica set.

### Dependencies and approvals

- Transactions need a replica set. A new test package needs approval.
- No email send in the unit test.

---

## Risks

### Finding ID

M1-003

### Severity

High

### Evidence

- `backend/src/services/placesService.js`, `geocodeAddressService`, `geocodePlaceService`, `requestGeoapify`, `toSuggestion`
- `frontend/src/components/AddressSearch.tsx`
- `frontend/src/api/placesApi.ts`, `searchAddresses`
- `backend/src/schemas/placesSchemas.js`, `addressQuerySchema` versus `publicPlaceQuerySchema`
- `frontend/src/components/LocationField.tsx`, `handleLookupTyped`
- `backend/src/schemas/restaurantSchemas.js`, city optional

`geocodeAddressService` and `geocodePlaceService` keep the first in-bounds result. Geoapify rank and confidence are not read. A typed restaurant address that was not chosen from the list is geocoded on the server the same way. A miss, a missing key, or an HTTP error stores no coordinates. That part does not invent a point.

`searchAddresses` does not send `lang`. The public location field does (`suggestPlaces` / `geocodePlace` with `en` or `he`). Form autocomplete therefore asks Geoapify in the default English.

`AddressSearch` clears coordinates when the user edits the street or the city. City is not required (`cityRequired={false}`), matching the later product update. Suggestion buttons have no listbox keyboard support (M8-003).

Real match quality was not tested. No Geoapify request was made.

### Root cause

Geocoding fills a pin from the first hit. Language support was added on the public endpoint and not on the logged-in autocomplete query.

### Impact

A restaurant can be stored at a different street that happened to be result 0, and then appear on the map there. Hebrew typing on the restaurant form may get weaker suggestions than the home-page location box. Ambiguous names are not shown again at submit time.

### Recommended fix

Store coordinates when the user picks a suggestion. For a free-typed address, geocode only when a documented confidence rule says the hit is unique; otherwise save the text and leave coordinates empty, and tell the user the pin was not set. Pass the active UI language on `/api/places/autocomplete`. Keep city optional unless the user says it is required.

### Verification plan

Unit tests: two Geoapify hits do not auto-select; one high-confidence hit does, if that rule is approved; provider error leaves coordinates empty. Browser keyboard and Hebrew suggestions wait on M8-003 and an approved Geoapify key (M9-002).

### Dependencies and approvals

- Live accuracy needs M9-002 approval.
- No new provider.
- City required or optional is a product decision. Current code: optional.

---

### Finding ID

M4-003

### Severity

High

### Evidence

- `backend/src/server.js`
- `backend/src/middleware/rateLimiters.js`
- `backend/src/middleware/errorMiddleware.js`
- `backend/src/middleware/uploadMiddleware.js`
- `backend/src/services/imageUploadService.js`, `checkImageFile`

Present and sound: CORS origin is `CLIENT_URL` only; `x-powered-by` is disabled; JSON limit 10kb; multer file size matches the 5 MB image cap; image type is detected from bytes; Zod schemas reject unexpected shapes; production 500 responses omit `error.message`; admin routes use auth then admin middleware.

Absent: security headers (no `helmet`, no CSP, `nosniff`, or frame denial in application code). `trust proxy` is not set, so behind a reverse proxy every client can share one rate-limit bucket or the proxy address. Rate-limit state is in process memory. `GET /api/health` is public and reveals whether the database connection is up. Limiters were not driven over their caps.

### Root cause

Hardening matches a single-process dev server. It does not include browser security headers or a shared limiter.

### Impact

Clickjacking and MIME sniffing are not blocked by the API responses. A multi-instance deploy will not share rate limits. A proxy can collapse all users into one IP bucket. Health output is low sensitivity.

### Recommended fix

Set a small header set. Ask before adding `helmet`. Set `trust proxy` only for a known deployment. Keep the existing limits. Do not add Redis without approval.

### Verification plan

HTTP test: a response includes the chosen headers; a non-`CLIENT_URL` origin is not reflected (already the CORS design). Rate-limit test against a local server, not production.

### Dependencies and approvals

- `helmet` or any new package needs approval.
- Proxy setting needs the hosting layout (M11-001).

---

### Finding ID

M4-004

### Severity

High

### Evidence

- `frontend/src/stores/authStore.ts`
- Persist name `kosherradar-auth`, `partialize` saves `token` and `user`
- Server issues a bearer token and sets no cookie (`authService.js`)

The token is readable by any script on the origin. This audit did not find an XSS bug. The risk is the storage choice, which the project rules say to keep for now.

### Root cause

Milestone 1 stored the session in `localStorage`. The current rules defer an HttpOnly cookie migration.

### Impact

An XSS bug, if one is introduced later, can exfiltrate a token that remains valid until expiry, and until M4-001 even across a password reset.

### Recommended fix

Leave the storage as it is. Record the risk. Implement M4-001. Do not migrate to cookies in Milestone 4.

### Verification plan

No functional test is required to document the risk. A future cookie design would need its own CSRF tests and explicit approval.

### Dependencies and approvals

- Cookie migration is deferred until the user approves it.
- Status in the tracker is `DEFERRED`. Do not count it as verified.

---

### Finding ID

M5-001

### Severity

High

### Evidence

- `backend/src/services/adminRestaurantService.js`, `deleteRestaurantService`
- `backend/src/repositories/userSubmissionsRepository.js`

Order: load teuda and report image ids, delete teuda documents, delete report documents, delete the restaurant, then `deleteImageService` for each id. Points are not reduced. If the process stops after the teuda delete and before the restaurant delete, certificates are gone and the restaurant remains. Submission history reads the live rows, so a deleted restaurant disappears from the account page with no tombstone. Image failures are M5-004.

### Root cause

Cascade is several commands. The spec called deletion permanent. It did not add a transaction or a history row.

### Impact

A partial failure can remove certificates while leaving the restaurant, or leave Cloudinary files after the documents are gone. Contributors lose the submission row and keep the points.

### Recommended fix

One transaction for the three deletes when a replica set exists. Images after commit, with failures recorded (M5-004). Ask before adding tombstones.

### Verification plan

Mock a failure on the restaurant delete and assert certificates are restored, or run a transaction test on an isolated replica set. Do not delete production rows.

### Dependencies and approvals

- Transaction package or replica set needs approval.
- Tombstones need a product decision.
- Cloudinary deletes of real files need M9-003 approval.

---

### Finding ID

M5-003

### Severity

High

### Evidence

- `backend/src/services/restaurantSubmissionService.js`, pending lookup then create
- `backend/src/models/Restaurant.js`, non-unique indexes on normalized name, address, phone, and place id
- `backend/src/services/duplicateService.js`, warning only, cap 10
- `backend/src/models/User.js`, unique email

Two concurrent requests from the same user with the same normalized name and address can both pass `findPendingRestaurantBySubmitterRepo` and both insert. The product rule that a similar place does not block is separate and should stay. Email uniqueness is already enforced.

### Root cause

The 409 guard is a read followed by an insert.

### Impact

Duplicate pending restaurants for one submitter, which admins must reject by hand. Public near-duplicates remain allowed, by design.

### Recommended fix

A partial unique index on submitter, normalized name, normalized address, and `PENDING`, after checking existing data for conflicts. Do not unique-index all restaurants.

### Verification plan

Two parallel creates in a test database; the second returns 409. Skip if adding the index is not approved.

### Dependencies and approvals

- Index build on a shared database needs approval.
- Check for existing duplicate pending rows before the index.

---

### Finding ID

M5-004

### Severity

High

### Evidence

- `backend/src/services/imageUploadService.js`, `deleteImageService`
- Callers in restaurant, teuda, and report submit services and in admin delete services

`destroy` errors are logged. The function does not throw and does not store the public id for a retry. If Cloudinary is not configured, it returns without deleting.

### Root cause

Cleanup must not hide the original save error, and nothing replaced the lost retry.

### Impact

Orphan images in the Cloudinary account after a failed save or a successful restaurant delete. Disk and privacy cost on the image host. The database can already be consistent.

### Recommended fix

Write a small cleanup record when `destroy` fails and retry it. Do not call the live API while implementing the record. Do not bulk-delete remote files without approval.

### Verification plan

Mock `destroy` to reject and assert a retry record exists. A real delete of a test image is M9-003.

### Dependencies and approvals

- Live delete needs an approved Cloudinary test cloud.
- No new package required for a MongoDB retry collection. Confirm before adding one.

---

### Finding ID

M6-001

### Severity

High

### Evidence

- `backend/src/config/constants.js`, `MAX_SEARCH_CANDIDATES = 2000`, `MAP_MARKER_LIMIT = 500`
- `backend/src/repositories/restaurantSearchRepository.js`, `findSearchCandidatesRepo` sort `{ name: 1, _id: 1 }` and `limit`
- `backend/src/services/restaurantSearchService.js`, `loadMatches`

The repository asks for `candidateLimit + 1` rows. `capped` is true when that extra row exists. Kashrut filters and relevance run only on the kept rows. Atlas ids are merged into the filter and then subjected to the same name sort and limit. Paging inside the examined set is stable because the final sort ends with the id.

This is the Milestone 4 design, including the `capped` flag. It was not replayed with more than 2000 documents here. At a small data set the cap does not hide rows.

### Root cause

Status cannot be filtered in one simple query, so the code caps the candidate query. The cap is alphabetical, not by relevance.

### Impact

Above 2000 text matches, a relevant restaurant later in the alphabet is missing while an earlier name is kept. The response says the list may be incomplete. The map drops names past 500 inside the box. A level filter can then discard many of those alphabetical rows and still have ignored later rows that would have matched.

### Recommended fix

Keep the warning. Change candidate ordering when there is search text so the cap keeps the better name matches, and add a unit test that the extra row sets `capped`. Do not remove the cap.

### Verification plan

Repository or service test with a mocked candidate list longer than the cap. A volume test belongs on an isolated database, not production.

### Dependencies and approvals

- None for the unit test.
- Atlas behavior is M9-001.

---

### Finding ID

M6-003

### Severity

High

### Evidence

- `backend/src/models/Restaurant.js`, `location` omitted without both coordinates
- `backend/src/services/placesService.js`, null on miss, first hit on success
- `backend/src/repositories/restaurantSearchRepository.js`, `$geoWithin` on `location`

Missing coordinates stay off the map and out of radius search. Invalid pairs are rejected by the schema. A wrong first geocode hit is stored as a normal point (M1-003). Approximate versus rooftop is not stored, because the code does not read Geoapify's rank.

### Root cause

Same as M1-003 for wrong pins. Missing pins are intentional.

### Impact

Map and "near me" omit ungeocoded restaurants. A bad first hit places a restaurant in the wrong neighborhood with no ambiguity flag.

### Recommended fix

Use the M1-003 selection rule. Keep ungeocoded restaurants in the text list.

### Verification plan

Schema tests already cover both-or-neither coordinates. Add a geocode test that an ambiguous payload does not set `latitude`.

### Dependencies and approvals

- Live samples need M9-002.

---

### Finding ID

M9-001

### Severity

High before launch

### Evidence

- `backend/src/config/env.js`, `ATLAS_SEARCH_ENABLED` is true only when the variable is the string `true`
- `ATLAS_SEARCH_SETUP.md`
- `PROGRESS.md` Milestone 6: local `127.0.0.1:27017`, `search.mode` `BASIC`
- No transaction usage in `backend/src`

Mocked search tests show the fallback when Atlas throws. They do not show a `$search` index working. Local MongoDB cannot host an Atlas Search index.

### Root cause

Not run against Atlas, by policy and because this audit did not use credentials.

### Impact

Typo search, index mistakes, and transaction support are unknown on the real host. A missing index can add no fuzzy hits while basic search still answers.

### Recommended fix

Approved isolated cluster only: create the documented index, enable the flag, search a typo, and record the mode. Decide there whether transactions are available before M5 depends on them.

### Verification plan

Manual script against that cluster, plus the existing fallback unit test. State clearly that the unit test is mocked.

### Dependencies and approvals

- Which Atlas cluster may be used. Not production. Not this audit.

---

### Finding ID

M9-002

### Severity

High before launch

### Evidence

- `backend/src/services/placesService.js`
- `backend/tests/placesService.test.js` mocks HTTP
- `PROGRESS.md`: a missing key returns `available: false`; no successful live lookup is recorded

### Root cause

No live call in this audit, and none recorded as successful in the project history.

### Impact

Hebrew and English suggestion quality, ambiguity, and quota errors are unknown. The code path for a missing key is implemented.

### Recommended fix

After M1-003, call Geoapify with an approved key on a short address list in both languages.

### Verification plan

Record each address, the hit that was kept, and whether a person judged it correct. Do not claim the provider is generally accurate from a handful of samples.

### Dependencies and approvals

- Permission to use `GEOAPIFY_API_KEY` and spend quota.

---

### Finding ID

M9-003

### Severity

High before launch

### Evidence

- `backend/src/services/imageUploadService.js`
- `backend/tests/imageUpload.test.js` uses a mocked SDK
- Milestone 6: missing keys produced 503 and no certificate document

### Root cause

No approved upload was performed.

### Impact

A real JPEG, a Cloudinary rejection, and a destroy of a test image are unproven. Byte checks and the 503 path are covered without the network.

### Recommended fix

Upload and delete one fixture on an approved test cloud. Then approve that certificate only in an isolated database if points must be seen.

### Verification plan

Separate the mocked unit result from the live result in the notes.

### Dependencies and approvals

- Cloud name and API credentials for a non-production cloud, plus permission to upload and delete.

---

### Finding ID

M9-004

### Severity

High before launch

### Evidence

- `backend/src/services/emailService.js`, statuses `SENT`, `FAILED`, `NOT_CONFIGURED`, never throws
- `backend/tests/emailService.test.js` mocks `fetch`
- `backend/.env.example` sandbox note: unverified domains can send only to the Resend account owner
- Reset stores the SHA-256 of the token, not the raw token, so the link cannot be rebuilt from the database

### Root cause

No approved send.

### Impact

Inbox delivery, spam placement, and the reset link are unproven. Moderation still saves when mail is not configured.

### Recommended fix

One reset mail and one rejection mail to an approved mailbox. Open the link once.

### Verification plan

Record the provider status and whether the message arrived. Mocked tests stay labeled as mocks.

### Dependencies and approvals

- `RESEND_API_KEY`, `EMAIL_FROM`, and a recipient the user names. Do not email arbitrary users.

---

## Improvements

### Finding ID

M1-002

### Severity

Critical (because it is part of the submission milestone; the data-loss bug is M1-001)

### Evidence

`RestaurantFields` with `variant="user"` hides latitude, longitude, food keywords, and the claim block. `SubmitRestaurantPage` still mounts a certificate section and optional food type, categories, phone, and website. Hechsher is required and stored as `claimedHechsher`. Backend fields remain for admin edit, duplicates, and search.

### Root cause

The client form was slimmed after Milestone 6, and the certificate section was left visible while M1-001 discards it.

### Impact

Users answer questions that are not saved, or they skip a photo that looks optional and is actually dropped. Admins still need the stored fields.

### Recommended fix

After the M1-001 decision, show only fields that are saved, label the hechsher as the claim, and leave the database schema's admin and search fields in place.

### Verification plan

Browser submit, then read the created restaurant document in an isolated database and compare it to the form.

### Dependencies and approvals

- Depends on M1-001.
- Hebrew label changes need M8-004.

---

### Finding ID

M2-003

### Severity

High

### Evidence

`AdminRestaurantPage.handleSave` stops when `categories.length === 0`. The admin `RestaurantFields` marks food type required. User submit allows both to be empty (`restaurantFieldsSchema`). Approve sits outside that form (M2-001), so approval can succeed when Save cannot. `PendingReportsTab` links `photoUrl` instead of showing the image. Pending restaurant cards do not show a certificate photo, which is consistent with M1-001.

A failed reload after approve writes the load error into `decisionNotices` and can replace the success text (`AdminRestaurantPage` effect). That is a residual edge, not the old "approve did nothing" bug.

### Root cause

Admin edit still uses the stricter create rules. Report UI still assumes a text proposal more than a photo.

### Impact

An admin cannot save coordinates or a note on a user restaurant until they invent a food type and a category. Report photos are easy to miss.

### Recommended fix

Allow save when food type or categories are empty. Preview the report image when the URL is http/https. Keep approval outside the edit form.

### Verification plan

Browser: open a pending restaurant with no category, approve it, then save an edit without being forced to pick a category. Open a report that has a photo URL.

### Dependencies and approvals

- None beyond a local database.
- Do not change public kashrut labels.

---

### Finding ID

M2-004

### Severity

High

### Evidence

Search of `backend/src` found no audit log, `reviewedBy`, or before/after history. Models store the latest `status`, `rejectionReason`, `adminNote`, `submittedBy`, and timestamps. Deletes remove the documents.

### Root cause

Updates overwrite the previous value. `updatedAt` is not an approval record.

### Impact

After an edit, the previous hechsher, level, or note cannot be reconstructed from the database. The admin who approved is not stored.

### Recommended fix

Append-only events for approve, reject, edit, delete, and report resolve, visible on the admin page only. Additive collection. No rewrite of old documents. Skip this if the user does not want the extra data.

### Verification plan

One approve and one edit produce two events with actor and changed fields. Public restaurant JSON does not include them.

### Dependencies and approvals

- New collection needs a yes from the user before it is added.
- No backfill of past actions.

---

### Finding ID

M3-003

### Severity

Medium

### Evidence

`RestaurantDetailsPage` `TeudaCard` shows expiration and EXPIRED versus verified from `visibility`. Public teuda JSON has no review timestamp. Pending reports are not passed into `buildKashrutSummary`, so they do not change the public status. That separation is correct.

### Root cause

Freshness is the certificate date and the six-month window.

### Impact

A visitor sees how long a certificate lasts. They do not see when a person last checked it. There is no separate "source" line beyond hechsher, level, mashgiach, and photo.

### Recommended fix

Keep the expiration line. Add a review date only after M2-004 stores one. Do not publish pending reports.

### Verification plan

Details API test: pending report text is absent; expiration is present.

### Dependencies and approvals

- Review date depends on M2-004.
- No terminology change (M3-002).

---

### Finding ID

M6-002

### Severity

Medium

### Evidence

Indexes `{ status, nameTokens }`, `{ status, foodTokens }`, `{ status, foodGroups }` are declared on the restaurant schema. Relevance is in `calculateRelevance`. Synonym groups in `config/foodSynonyms.js` are unreviewed. No query `explain` was run. Atlas is M9-001.

### Root cause

Not a measured bottleneck. The design is in-process filtering after a capped read (M6-001).

### Impact

Unknown latency once the approved set is large. Synonym mistakes can hide or over-match foods.

### Recommended fix

`explain` on an isolated database before new indexes. Leave synonym text for a human review. Do not enable Atlas in this milestone.

### Verification plan

Record the explain summary. Existing `restaurantSearchService.test.js` covers scoring with mocks.

### Dependencies and approvals

- Isolated database for explain.
- Synonym edits need a reviewer. They are user-facing search behavior.

---

### Finding ID

M6-004

### Severity

Medium

### Evidence

`RestaurantMap.tsx` clusters with `react-leaflet-cluster` and shows a capped message. The map request uses 500 candidates; the list uses 2000 and is not clipped to the viewport. Milestone 6 saw a single marker, so clustering, call, Waze, and share inside a popup were not seen then, and they were not repeated now.

### Root cause

Shared filters, different limits. Density was never on screen.

### Impact

In a full city view the map can omit restaurants the list still shows, or both can warn. Clustering behavior is unconfirmed.

### Recommended fix

Keep the warning. Browser-test a viewport with more markers than one cluster, at a phone width, and use the popup actions.

### Verification plan

Manual or later e2e (M10A-001). No new map library.

### Dependencies and approvals

- Local stack only.
- Playwright only if M10A-001 is approved.

---

### Finding ID

M8-002

### Severity

Medium

### Evidence

On the user restaurant form, hechsher is required inside a section titled as an optional certificate. Expiration, mashgiach, food type, and categories are not marked optional in the labels even when they are not required. State is kept when submit throws. The button is disabled while `loading` is true.

### Root cause

Shared fields plus M1-001.

### Impact

Users cannot tell what will be saved. Failed submits do at least keep what they typed.

### Recommended fix

Align labels with M1-002 in English and Hebrew.

### Verification plan

Browser: empty optional fields submit; a validation error leaves the typed name in the box.

### Dependencies and approvals

- Hebrew review (M8-004).

---

### Finding ID

M8-003

### Severity

Medium

### Evidence

`AddressSearch` suggestion list is click-only. `LocationField` has `role="listbox"` and uses Enter to geocode the raw text. Delete confirmation is `window.confirm` in `handleDelete`. Responsive checks at four widths are historical (Milestone 6) and were not repeated. There is no React component test suite.

### Root cause

Autocomplete was built for pointer use. Layout was checked manually once.

### Impact

Keyboard users cannot move through address suggestions. A narrow-screen regression would not be caught by `npm test`.

### Recommended fix

Combobox keyboard behavior on both lists. Re-check the four widths when Milestone 1 changes the form. Do not add a component-test dependency unless asked.

### Verification plan

Browser keyboard pass and the four widths.

### Dependencies and approvals

- None.

---

### Finding ID

M8-004

### Severity

Medium

### Evidence

`locales.test.ts` expects the same keys and non-empty Hebrew. `language.ts` persists the choice and the app sets `dir`. Names and addresses are stored as entered, not machine-translated. Hechsher labels and food synonyms are recorded as agent-written and unreviewed. API validation messages are English.

### Root cause

Key coverage is tested. Native review is not done.

### Impact

Hebrew UI can be grammatically wrong or use the wrong kashrut term while tests stay green. RTL can still be correct.

### Recommended fix

Freeze copy changes to what a milestone must touch, and list them for a native speaker. Do not close the issue on the key test alone.

### Verification plan

`npm test` in `frontend` for the locale file, plus a written review note from a native speaker.

### Dependencies and approvals

- Blocked on a named reviewer or an explicit waiver.
- Status: `BLOCKED`.

---

### Finding ID

M10A-001

### Severity

High before launch

### Evidence

No Playwright, Cypress, or other e2e script in either `package.json`. Frontend Vitest files are utilities and API helpers. Milestone 6's browser notes are manual and were not repeated. `@vitest/browser-playwright` is only a transitive lockfile entry.

### Root cause

Tests stop at the service and helper boundary.

### Impact

Route guards, persisted login, and search UI can break without a red unit test.

### Recommended fix

Manual script on an isolated database for this milestone. Add Playwright only after approval.

### Verification plan

Register, login, refresh, logout, search, filter, open a restaurant, hit a protected URL while logged out.

### Dependencies and approvals

- Playwright needs approval.
- Do not use production data.

---

### Finding ID

M10B-001

### Severity

High before launch

### Evidence

Same missing runner as M10A-001. A full certificate path cannot pass while M1-001 drops the photo. Points on approval need a stored teuda and, for a real file, Cloudinary. Milestone 6 covered no-photo submit, reject, and a report with no correction.

### Root cause

Product gap plus no e2e harness plus blocked vendors.

### Impact

Admin and submission regressions stay invisible until a person clicks through them.

### Recommended fix

Run after Milestones 1 and 2. Include Hebrew `dir` and one phone width. Use live vendors only under Milestone 9 approvals.

### Verification plan

The flow list in the tracker, with certificate and points marked live or mocked explicitly.

### Dependencies and approvals

- Same Playwright question.
- M9-003 for a real photo.

---

### Finding ID

M11-001

### Severity

High before launch

### Evidence

`README.md`, both `.env.example` files, and `GET /api/health` exist. Logging is `console.error`. No monitoring or backup runbook was found. The historical test log in `PROGRESS.md` is the build record. The frontend bundle size warning is historical (about 716 kB) and was not reproduced in this audit. Backend has no build script; `npm start` runs `node src/server.js`.

### Root cause

Docs match a student/local deployment. Production operations were not specified.

### Impact

A deploy can ship with Atlas Search off, no backups, and no way to tell a mocked test from a live check.

### Recommended fix

A short checklist in the existing README or a section the user asks for: env names, health, backup owner, and pointers to this tracker. Do not edit `PROJECT_SPEC.md`.

### Verification plan

Read-through against `package.json` scripts. No secret values.

### Dependencies and approvals

- Host and backup owner are user decisions.

---

## Already implemented correctly

These were investigated because the milestone list named them. They are not open bugs. Tracker status is `ALREADY WORKING`. Browser clicks were not repeated in this audit unless noted.

### Finding ID

M2-001

### Severity

Low (residual only)

### Evidence

`PendingRestaurantsTab.handleApprove` and `AdminRestaurantPage.handleApprove` both call `approveRestaurant`. The detail button is `type="button"` outside `<form onSubmit={handleSave}>`. `approveRestaurantService` updates a PENDING row only. The earlier inconsistency is not in this code. A plausible old cause is a submit button inside a form whose food type or category was empty; that Save trap remains as M2-003.

### Root cause

Fixed in the post-Milestone-4 polish by moving the decision buttons. Not re-clicked here.

### Impact

None for the reported bug, if the current structure is what is deployed.

### Recommended fix

Click both buttons once in Milestone 2 against a local database. No code change unless that click fails.

### Verification plan

Browser approve from the list and from `/admin/restaurants/:id`, then confirm the row leaves the pending list.

### Dependencies and approvals

- Local database only.

---

### Finding ID

M3-001

### Severity

Low

### Evidence

`buildKashrutSummary` and `applyKashrutFilters` are used by `restaurantDetailsService.js` and by `loadMatches`, which serves both the list and the map. Unapproved teudot and certificates older than six months are excluded through `isTeudaPublic`. Expired is derived from the Israel date. A claim with no level ranks as `UNVERIFIED_NO_LEVEL` and does not satisfy a level filter. Search and details cannot disagree about status unless they diverge in the candidate set (M6-001), not in the status function.

### Root cause

Not a defect.

### Impact

None identified in the status function.

### Recommended fix

Keep all public status reads on this service.

### Verification plan

Re-run `backend` tests `kashrutStatusService.test.js` and `kashrutFilters.test.js` when a caller changes.

### Dependencies and approvals

- Do not rename statuses (M3-002).

---

### Finding ID

M3-002

### Severity

Low, unless labels are changed without review

### Evidence

Status values are `VERIFIED` (approved certificate, not past its Israel expiration date), `UNVERIFIED` (claim only), `EXPIRED` (best public evidence expired within six calendar months), `UNKNOWN` (no public evidence). English UI strings match those meanings. The restaurant page says the site is not a kashrut authority. Older certificates are admin-only.

### Root cause

Not a defect. "Verified" can still be misread as an endorsement; the disclaimer is the current control.

### Impact

Changing a word without approval would change a public kashrut claim.

### Recommended fix

Keep the words. Any new public term needs approval and Hebrew review.

### Verification plan

None until copy changes.

### Dependencies and approvals

- Label changes are blocked pending approval.

---

### Finding ID

M4-002

### Severity

Low

### Evidence

Registration hashes the password and does not accept client `role` or `points`. Login uses bcrypt and a dummy hash for unknown emails. `authMiddleware` loads the user from the database; `adminMiddleware` checks that role. Reset tokens are random, hashed, single-use, and the forgot-password path does not reveal whether the email exists. `safeReturnPath` keeps post-login navigation on this site. Remaining gaps are M4-001, M4-003, and M4-004.

### Root cause

Not a defect in the reviewed controls.

### Impact

None beyond the sibling issues.

### Recommended fix

No redesign. Logout stays a local token clear unless M4-001 is extended with an approved "end other sessions" action.

### Verification plan

Existing `authService.test.js`, `middleware.test.js`, and `passwordResetService.test.js` when auth code changes.

### Dependencies and approvals

- No storage redesign.

---

### Finding ID

M7-001

### Severity

Low

### Evidence

`getMySubmissionsService` returns the user's restaurants, teudot, and reports, newest 50 each, with status, `createdAt`, `rejectionReason`, and points taken from `awardedPointKeys`. `adminNote` is not selected. `AccountPage` renders that panel. `/account/submissions` redirects to `/account`. A certificate omitted by M1-001 has no row to show.

### Root cause

Not a missing page. The cap is intentional in the repository (`LIMIT = 50`).

### Impact

Older than the newest 50 of each kind are hidden. No paging.

### Recommended fix

Leave it unless the user wants paging.

### Verification plan

API test already in `userSubmissionsService.test.js`. Browser check is optional.

### Dependencies and approvals

- None.

---

### Finding ID

M7-002

### Severity

Low

### Evidence

The account panel prints `rejectionReason`. The query does not load `adminNote`. Rejection email is plain text and is sent the reason, not the private note. Certificates closed because the restaurant was rejected store the sentence `The restaurant was not approved.` An admin can still type a private remark into the reason field; the code will show it to the user, because that field is the user-facing explanation.

### Root cause

Not a leak of the note field.

### Impact

The reason is as sensitive as whatever the admin typed into it.

### Recommended fix

Keep the split. No code change.

### Verification plan

Serializer or repository test that the submissions payload has no `adminNote` key.

### Dependencies and approvals

- None.

---

### Finding ID

M7-003

### Severity

Low

### Evidence

`pointsService.js`: +3 when the same user submitted the restaurant with the teuda, +2 for a teuda on an existing restaurant, +1 when `correctionApplied` is true, once per `TEUDA:<id>` or `REPORT:<id>`, and only if `role === 'USER'`. Admins receive nothing. Amounts match the account display via the shared constants. The case of +1 without a field change is M2-002's resolution rule, and the award helper then does what the flag says.

### Root cause

Not a double-award bug in the helper.

### Impact

None in the helper. Point qualification changes need approval.

### Recommended fix

Do not change the numbers. Keep using `awardOnce`.

### Verification plan

`pointsService.test.js` on any edit nearby.

### Dependencies and approvals

- Amount and qualification changes need approval.

---

### Finding ID

M8-001

### Severity

Low

### Evidence

`LoginPage` uses `PasswordField` (show/hide, `aria-pressed`), sets `loading`, disables the submit button, and renders `role="alert"` on failure. Register and reset import the same field. Extra inline field errors are not present; the API message is.

### Root cause

Not a defect for the requested controls. This audit did not click the eye icon. An earlier milestone note says it was clicked; that is not re-certified here.

### Impact

None identified in the component structure.

### Recommended fix

No change unless a browser pass finds the single alert insufficient.

### Verification plan

Click show/hide, submit empty, submit a bad password, on the login page.

### Dependencies and approvals

- None.

---

## Verification commands

Discovered from `backend/package.json` and `frontend/package.json`. Working directories are the package folders. These commands were not run in this audit.

| Purpose | Directory | Command | Present |
| --- | --- | --- | --- |
| Backend unit tests (Vitest, repositories and services mocked in the existing files) | `backend` | `npm test` | yes (`vitest run`) |
| Backend integration tests | `backend` | none | no separate script. Some tests boot HTTP with mocked services (`searchRoutesHttp.test.js`, `adminRoutesHttp.test.js`, `passwordResetRoutesHttp.test.js`, `restaurantDetailsRoutesHttp.test.js`) and run inside `npm test` |
| Frontend unit tests | `frontend` | `npm test` | yes (`vitest run`). Helpers and API builders. No component or browser project |
| Frontend lint | `frontend` | `npm run lint` | yes (`oxlint`) |
| Frontend typecheck | `frontend` | `npm run typecheck` | yes (`tsc -b`) |
| Frontend build | `frontend` | `npm run build` | yes (`tsc -b && vite build`) |
| Backend lint | `backend` | none | gap |
| Backend typecheck | `backend` | none | gap. The backend is plain JavaScript |
| Backend build | `backend` | none | `npm start` is `node src/server.js`. `npm run dev` is `node --watch src/server.js` |
| End-to-end | either | none | gap. Do not add Playwright without approval |
| Admin seed | `backend` | `npm run seed:admin` | yes. Writes a user. Do not run against production |
| Search-field backfill | `backend` | `npm run search:rebuild` | yes. Writes restaurant search fields. Do not run against production |

Historical results recorded in `PROGRESS.md` (not re-run here): on 12 October 2026, `backend` `npm test` was 37 files / 466 tests passed, and `frontend` `npm test` was 14 files / 89 tests passed, with typecheck, lint, and build passing. Those numbers describe that earlier documentation session. They are not evidence for this audit's findings.

## Decisions that need the user

1. M1-001: store a pending certificate with no kashrut level, or reject the photo with a visible error? Do not guess hechsher-to-level.
2. M1-003: keep city optional? Current behavior is optional.
3. M2-002: must "already corrected" change a field before +1, or is the admin's choice enough?
4. M2-004: store an admin action history?
5. M3-002: keep the public words verified / unverified / expired / unknown?
6. M4-004: HttpOnly cookies stay deferred. Confirm that is still the choice.
7. M8-004: who reviews Hebrew and the hechsher names?
8. M9: which isolated Atlas, Geoapify, Cloudinary, and Resend resources may a later session use?
9. M10A-001: add Playwright, or stay with manual checks?
10. M11-001: where is this hosted, and who backs up the database?
11. New packages (`helmet`, `mongodb-memory-server`, Playwright) are not approved.

## Recommended Milestone 1 scope

Do not start it until the M1-001 storage decision is answered.

Then, in one session, in order:

1. M1-001. Stop silent omission. Implement the approved storage or the visible error. Add tests. Do not require a user-selected level.
2. M1-002. Make the user form match what is saved. Leave backend fields used by admin and search.
3. M1-003. Pass `lang` on form autocomplete. Do not apply the first geocode hit without a selection or an explicit confidence rule. Leave coordinates empty on a miss. Live Geoapify stays blocked.

Skip Milestones 2 through 11 in that session.
