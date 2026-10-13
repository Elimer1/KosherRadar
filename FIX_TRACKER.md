# KosherRadar — fix tracker

Single source of truth for problems found in the 12 October 2026 read-only audit and for their later resolution.

Counts below are derived from the issue statuses in this file.

| Status | Count |
| --- | ---: |
| NOT STARTED | 13 |
| ALREADY WORKING | 8 |
| BLOCKED | 5 |
| DEFERRED | 1 |
| VERIFIED | 13 |
| Other | 0 |
| **Total** | **40** |

## Priority bands (12 October 2026)

The user asked to finish important fixes and to defer low-impact, cosmetic, end-to-end infrastructure, and production-hardening work. Issue IDs and findings are unchanged. A continuation session works **MUST FIX NOW** only.

### MUST FIX NOW

| ID | Why it is in this band | Status |
| --- | --- | --- |
| M1-001 | Confirmed bug: certificate evidence was dropped | VERIFIED |
| M1-002 | The user form has to match what is stored | VERIFIED |
| M1-003 | A typed address must not take the first geocode hit | VERIFIED |
| M2-002 | Confirmed bug: report correction can stick when the report does not | VERIFIED |
| M2-003 | Admin cannot save a user restaurant that omitted food type or categories | VERIFIED |
| M4-001 | Confirmed bug: password reset leaves existing JWTs valid | VERIFIED |
| M5-002 | Confirmed bug: a failed password write burns the reset link | VERIFIED |

`CORRECTION_ALREADY_MADE` still awards +1 on the admin's word. Changing that would change the points rule and was not done.

### LATER

M2-004, M3-003, M4-003, M4-004, M5-001, M5-003, M5-004, M6-001, M6-002, M6-004, M8-003, M8-004, M9-001, M9-002, M9-003, M9-004, M10A-001, M10B-001, M11-001.

M6-003 is verified with M1-003: the same unambiguous-match rule covers restaurant submit and the search location field. Live Geoapify accuracy stays blocked under M9-002. M8-002 is verified with M1-002: optional certificate fields are labeled, and the required hechsher is no longer inside the optional certificate block.

Classification of those 36 issues: **4 confirmed bugs**, **12 risks**, **12 improvement or readiness items**, **8 already working**. Confirmed bugs are M1-001, M2-002, M4-001, and the token-ordering defect inside M5-002. Details and evidence are in `AUDIT_FINDINGS.md`.

Blocked and deferred issues are not counted as verified. The sentence above is the audit classification; current statuses are in the tables.

QA-001 and QA-002 were found on 12 October 2026 while checking `feature/qa-testing` at `54d9605`. They are not part of the original 36. Both are verified. LATER issues were not started.

## Milestone index

| ID | Milestone | Priority | Status | Class |
| --- | --- | --- | --- | --- |
| M1-001 | 1 Restaurant and certificate submission | Critical | VERIFIED | Confirmed bug |
| M1-002 | 1 Restaurant and certificate submission | Critical | VERIFIED | UX improvement |
| M1-003 | 1 Restaurant and certificate submission | Critical | VERIFIED | Reliability risk |
| QA-001 | Integration QA | High | VERIFIED | Confirmed bug |
| M2-001 | 2 Admin moderation | Critical | ALREADY WORKING | Already implemented |
| M2-002 | 2 Admin moderation | Critical | VERIFIED | Confirmed bug |
| M2-003 | 2 Admin moderation | Critical | VERIFIED | UX improvement |
| M2-004 | 2 Admin moderation | Critical | NOT STARTED | Architectural improvement |
| M3-001 | 3 Kashrut status | Critical | ALREADY WORKING | Already implemented |
| M3-002 | 3 Kashrut status | Critical | ALREADY WORKING | Product decision |
| M3-003 | 3 Kashrut status | Critical | NOT STARTED | UX improvement |
| M4-001 | 4 Authentication and security | High | VERIFIED | Confirmed bug |
| QA-002 | Integration QA | Low | VERIFIED | Cleanup |
| V2-D001 | Visual v2 restaurant details | High | VERIFIED | Visual redesign recovery |
| V2-I001 | Visual v2 integration | Medium | VERIFIED | Repeated claim status |
| M4-002 | 4 Authentication and security | High | ALREADY WORKING | Already implemented |
| M4-003 | 4 Authentication and security | High | NOT STARTED | Security risk |
| M4-004 | 4 Authentication and security | High | DEFERRED | Security risk |
| M5-001 | 5 Database integrity | High | NOT STARTED | Reliability risk |
| M5-002 | 5 Database integrity | High | VERIFIED | Confirmed bug and reliability risk |
| M5-003 | 5 Database integrity | High | NOT STARTED | Reliability risk |
| M5-004 | 5 Database integrity | High | NOT STARTED | Reliability risk |
| M6-001 | 6 Search and map | High | NOT STARTED | Reliability risk |
| M6-002 | 6 Search and map | High | NOT STARTED | Architectural improvement |
| M6-003 | 6 Search and map | High | VERIFIED | Reliability risk |
| M6-004 | 6 Search and map | High | NOT STARTED | UX improvement |
| M7-001 | 7 Contributions and points | Medium | ALREADY WORKING | Already implemented |
| M7-002 | 7 Contributions and points | Medium | ALREADY WORKING | Already implemented |
| M7-003 | 7 Contributions and points | Medium | ALREADY WORKING | Already implemented |
| M8-001 | 8 Frontend UX and localization | Medium | ALREADY WORKING | Already implemented |
| M8-002 | 8 Frontend UX and localization | Medium | VERIFIED | UX improvement |
| M8-003 | 8 Frontend UX and localization | Medium | NOT STARTED | UX improvement |
| M8-004 | 8 Frontend UX and localization | Medium | BLOCKED | Product decision |
| M9-001 | 9 External integrations | High before launch | BLOCKED | Unable to verify live |
| M9-002 | 9 External integrations | High before launch | BLOCKED | Unable to verify live |
| M9-003 | 9 External integrations | High before launch | BLOCKED | Unable to verify live |
| M9-004 | 9 External integrations | High before launch | BLOCKED | Unable to verify live |
| M10A-001 | 10A Core end-to-end testing | High before launch | NOT STARTED | Test gap |
| M10B-001 | 10B Submission and admin end-to-end testing | High before launch | NOT STARTED | Test gap |
| M11-001 | 11 Documentation and production readiness | High before launch | NOT STARTED | Readiness gap |

---

## Milestone 1 — Restaurant and certificate submission

Priority: Critical

### M1-001 — Certificate submission may be silently omitted

- **Milestone:** 1
- **Priority:** Critical
- **Status:** VERIFIED
- **Description:** On the new-restaurant form, a certificate photo and the other certificate fields are dropped before the request is sent. The user still sees a successful restaurant submission. The separate add-certificate page is unaffected.
- **Evidence:** `SubmitRestaurantPage` sets `showLevel={false}` and only attaches `teuda` and `photo` when `certificateComplete` is true. That check requires `teuda.kashrutLevel`. `emptyTeudaForm` leaves the level empty, and the level control is not rendered, so `certificateComplete` stays false. `submitRestaurant` in `restaurantApi.ts` appends `teuda` and `photo` only when both are non-null. A photo validation error also fails the same Boolean and does not stop the submit. The success screen uses `result.teuda` to choose the thank-you text, so the user is told the restaurant was sent. `PROGRESS.md` (product update after Milestone 6) already records that a photo on this form is not stored. Reproducible from the code: fill name, address, hechsher, expiration, mashgiach, and a photo, then submit. The multipart body has a restaurant claim and no photo.
- **Root cause:** The form hid the kashrut level because there is no approved hechsher-to-level map, then treated a missing level as "send the restaurant only" instead of storing the evidence or showing an error. The server schema still requires a full teuda (`teudaFieldsSchema.kashrutLevel` is required) whenever a teuda object is present, so the client cannot send a partial certificate without a schema change.
- **Relevant files/functions:** `frontend/src/pages/SubmitRestaurantPage.tsx` (`certificateComplete`, `handleSubmit`); `frontend/src/components/TeudaFields.tsx` (`showLevel`); `frontend/src/api/restaurantApi.ts` (`submitRestaurant`); `backend/src/services/restaurantSubmissionService.js` (`submitRestaurantService`); `backend/src/schemas/teudaSchemas.js` (`teudaFieldsSchema`); `backend/src/controllers/restaurantController.js` (`submitRestaurantController`).
- **Planned solution:** Stop dropping evidence silently. Smallest behavior that matches the desired rules: a restaurant with no certificate fields still submits; a photo or any certificate detail is either stored as pending evidence or the submit is refused with a visible error. Ordinary users stay free of a required kashrut level. Storing a teuda without a level needs an approved additive schema change (`kashrutLevel` is required on `Teuda` today). Existing teuda documents already have a level, so making the field optional on new pending teudot can be compatible if the public status code keeps treating a missing level safely. Do not guess a hechsher-to-level map.
- **Files changed:** `Teuda` model (level, date, photo, and mashgiach optional). `pendingEvidenceSchema`. `teudaSubmissionService.js`, `restaurantSubmissionService.js`. `isTeudaPublic` and `findConflictingTeudot` ignore unclassified evidence. `approveTeudaService` returns 400 until an admin sets the level and expiration, and does not award points. Admin cards explain that and show the photo. Add-certificate uses the same rule.
- **Tests added or modified:** `restaurantSubmissionService.test.js`, `teudaSubmissionService.test.js`, `adminTeudaService.test.js`, `teudaRulesService.test.js`, `kashrutStatusService.test.js`, `submissionSchemas.test.js`, `restaurantSchemas.test.js`, `reportSubmissionService.test.js` (fixture now includes a level), `frontend/src/api/restaurantApi.test.ts`.
- **Verification:** `cd backend; npm test` exit 0, 37 files, 477 tests passed. `cd frontend; npm test` exit 0, 14 files, 90 tests passed. `npm run typecheck` exit 0. `npm run lint` exit 0. `npm run build` exit 0 (bundle about 722 kB; Vite warns above 500 kB). Browser was not opened. Live Cloudinary was not called; upload stays mocked, and a missing Cloudinary config still fails the upload instead of dropping the photo.
- **Blockers:** Decision applied: store partial evidence without a user-chosen level. New or edited Hebrew strings need native-speaker review (M8-004). A real photo upload remains M9-003.

### M1-002 — Simplify the restaurant submission form

- **Milestone:** 1
- **Priority:** Critical
- **Status:** VERIFIED
- **Description:** The user form no longer asks for coordinates, food keywords, or a separate claimed level. It still shows optional food type and categories, phone, website, and a certificate block whose extra fields are discarded (M1-001). The hechsher control sits inside the "optional certificate" section but is required and is saved as `claimedHechsher`.
- **Evidence:** `RestaurantFields` `variant="user"` hides keywords, the claim section, and there is no latitude/longitude input. `AddressSearch` is still used. `SubmitRestaurantPage` copies `teuda.hechsher` into `claimedHechsher` and sends `claimedKashrutLevel: ''`. Backend `restaurantFieldsSchema` still accepts food type, categories, claim, and coordinates because admin edit and search depend on them.
- **Root cause:** The post-Milestone-6 product update removed some questions in the client and left the certificate section in place while the save rule in M1-001 ignores it. Backend fields were correctly kept.
- **Relevant files/functions:** `frontend/src/components/RestaurantFields.tsx`; `frontend/src/pages/SubmitRestaurantPage.tsx`; `frontend/src/components/TeudaFields.tsx`; `backend/src/schemas/restaurantSchemas.js`.
- **Planned solution:** After M1-001's storage decision, make the user form match what is actually saved. Keep hechsher as the required unverified claim, with a clear label. Keep certificate photo, expiration, and mashgiach only if they are stored. Leave food type and categories optional or remove them from the user form only. Do not delete the backend fields, admin form, or search indexes.
- **Files changed:** `SubmitRestaurantPage.tsx` (required hechsher section, optional evidence section, city required). `RestaurantFields.tsx` (user variant hides food type and categories; city required). `TeudaFields.tsx` (optional labels). `SubmitTeudaPage.tsx` (no level). `en.ts` and `he.ts`. Backend food type and categories remain on the admin form and in the schema.
- **Tests added or modified:** Covered with M1-001. `restaurantSchemas.test.js` now requires a city on user submit.
- **Verification:** Same commands as M1-001. Browser was not opened.
- **Blockers:** Hebrew copy needs native-speaker review (M8-004). Food type and categories stay available to admins and to the API.

### M1-003 — Address autocomplete and geocoding

- **Milestone:** 1
- **Priority:** Critical
- **Status:** VERIFIED
- **Description:** Address suggestion and server-side geocoding exist. City is optional. A typed address that the user did not pick is geocoded by taking the first Geoapify hit, with no confidence check. The restaurant form does not send the UI language. Suggestion lists are not keyboard-operable.
- **Evidence:** `AddressSearch` calls `searchAddresses(text)` with no `lang`. `addressQuerySchema` has only `text`. `geocodeAddressService` uses `const [match] = await requestGeoapify('search', text)` and ignores Geoapify rank or confidence. `toSuggestion` keeps results inside `ISRAEL_BOUNDS` and does not rank them. Choosing a suggestion stores street, city, latitude, longitude, and `placeId`. Typing again clears coordinates. City `cityRequired` is false on the user form, and `submitRestaurantSchema` treats city as optional. `LocationField` does pass `lang` and uses Enter to geocode, which again applies the first hit via `geocodePlaceService`. Provider failure sets `available: false` and does not invent coordinates. No live Geoapify call was made.
- **Root cause:** Geocoding was built to fill a pin when possible and to leave coordinates empty on a miss. It treats the first in-bounds hit as the match. The form autocomplete predates the language parameter added for the public location field.
- **Relevant files/functions:** `frontend/src/components/AddressSearch.tsx`; `frontend/src/components/LocationField.tsx`; `frontend/src/api/placesApi.ts`; `backend/src/services/placesService.js` (`requestGeoapify`, `geocodeAddressService`, `geocodePlaceService`); `backend/src/schemas/placesSchemas.js`; `backend/src/schemas/restaurantSchemas.js`.
- **Planned solution:** Pass the active language on the restaurant-form autocomplete. Apply coordinates automatically only when the user picks a suggestion, or when a geocode result is unambiguous by an explicit confidence rule. If the result is ambiguous or the provider fails, save the typed address with no coordinates and say so. Do not invent a point. Keep city optional unless the user decides it is required. Keyboard behavior belongs with M8-003 if it is not finished here.
- **Files changed:** `placesService.js` (`selectUnambiguousPlace`: confidence at least 0.8, match type `full_match`, `inner_part`, or `match_by_building`, and a gap of 0.2 when more than one precise hit). `geocodeAddressService` and `geocodePlaceService` use it. Form autocomplete sends `lang`. City is required on user submit and filled from a picked suggestion. Success text says when the address was saved without a pin.
- **Tests added or modified:** `placesService.test.js`.
- **Verification:** Same commands as M1-001. No live Geoapify call. Mocked tests do not prove real address quality (M9-002). Keyboard use of the suggestion list remains M8-003 and was left for later.
- **Blockers:** Live Geoapify checks stay blocked (M9-002). City is required, as decided, and is filled from the selected address when that address includes a city.

### QA-001 — Undated certificates of the same hechsher collapse into one pending duplicate

- **Milestone:** Integration QA, found before merging `feature/audit-must-fix`
- **Priority:** High
- **Status:** VERIFIED
- **Description:** On the add-certificate flow, two pending certificates with the same hechsher and no expiration date were treated as the same submission. A different mashgiach or a different photo was rejected with 409.
- **Evidence:** `QA_PROGRESS.md` on `feature/qa-testing` at `54d9605`. `submitTeudaService` called `findSimilarPendingTeudaRepo` with `kashrutLevel: null` and `expirationDate: null`, and did not pass the mashgiach or the photo. The QA test `it.fails` showed the two lookup objects were equal.
- **Root cause:** The duplicate key was built for a full certificate that always had a date. After partial evidence was allowed, a missing date made every undated certificate of that hechsher look the same.
- **Relevant files/functions:** `backend/src/services/teudaSubmissionService.js` (`pendingCertificateLookup`, `submitTeudaService`); `backend/src/repositories/teudaRepository.js` (`findSimilarPendingTeudaRepo`); `backend/src/models/Teuda.js`.
- **Planned solution:** Keep the dated key as hechsher plus expiration date, so a retry of the same dated certificate still returns 409. For an undated certificate, also compare mashgiach name, mashgiach phone, and a sha256 of the photo bytes. Store that fingerprint on the certificate. Do not backfill old photos.
- **Files changed:** `teudaSubmissionService.js`, `teudaRepository.js`, `Teuda.js`, `restaurantSubmissionService.js` (stores the same fingerprint when a new restaurant is sent with a photo).
- **Tests added or modified:** `backend/tests/teudaSubmissionService.test.js`, `backend/tests/restaurantSubmissionService.test.js`. After the QA branch was merged, `backend/tests/qaPendingCertificateIdentity.test.js` keeps the same assertion and is a normal `it` on `main`.
- **Verification:** Before integration, `cd backend; npm test` exit 0, 38 files, 489 tests passed. After integration, `cd backend; npm test` exit 0, 40 files, 497 tests passed. `cd frontend; npm test` exit 0, 14 files, 90 tests passed. `npm run lint` exit 0. `npm run typecheck` exit 0. `npm run build` exit 0 (bundle about 724 kB). Mocks only. No live database and no Cloudinary call. The UI screens were not opened in a browser.
- **Blockers:** A pending photo saved before this field exists has no fingerprint. A later undated submission with no photo still matches that older row when the hechsher and mashgiach match, because a missing fingerprint is stored the same way as no photo. New photos are distinct. The QA worktree was left at `54d9605` and still has `it.fails`; `main` has the normal test.

---

## Milestone 2 — Admin moderation

Priority: Critical

### M2-001 — Approval inconsistency

- **Milestone:** 2
- **Priority:** Critical
- **Status:** ALREADY WORKING
- **Description:** An earlier report said approving a pending restaurant from its view/edit screen failed while approval from the pending list worked. Both paths now call the same API, and the detail-page button is outside the edit form.
- **Evidence:** `PendingRestaurantsTab.handleApprove` and `AdminRestaurantPage.handleApprove` both call `approveRestaurant` from `adminApi.ts`, which POSTs `/admin/restaurants/:id/approve`. The detail button is `type="button"` in the Decision section, not inside `<form onSubmit={handleSave}>`. After success the page writes the returned status and reloads. `approveRestaurantService` updates only a PENDING row. The edit form's required food type and category can still block Save; they do not wrap Approve. That required-field trap is recorded under M2-003 and is a plausible cause of the old report if Approve used to submit the form.
- **Root cause:** Not present in the current code. The post-Milestone-4 polish moved the decision buttons out of the edit form. No runtime click was repeated in this audit.
- **Relevant files/functions:** `frontend/src/pages/AdminRestaurantPage.tsx` (`handleApprove`); `frontend/src/components/admin/PendingRestaurantsTab.tsx` (`handleApprove`); `frontend/src/api/adminApi.ts` (`approveRestaurant`); `backend/src/services/adminRestaurantService.js` (`approveRestaurantService`).
- **Planned solution:** No code change for the original inconsistency. During M2, click both buttons once against an isolated database so the static conclusion is confirmed. If a reload after approve fails, `useEffect` replaces the success notice with the load error; fix that only if the click test shows it.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. Not clicked in a browser in this session.
- **Blockers:** none for the code conclusion. Browser confirmation waits for an implementation session with a local database.

### M2-002 — Report resolution consistency

- **Milestone:** 2
- **Priority:** Critical
- **Status:** VERIFIED
- **Description:** `APPLY_PROPOSED` writes the certificate or restaurant claim before the report row is claimed. A concurrent admin can leave the data changed while the report status and points do not match. `CORRECTION_ALREADY_MADE` grants +1 without checking that any field changed. New reports from the current form cannot carry a proposal, so Apply is hidden for them; the API still accepts old `KASHRUT_UPDATE` reports.
- **Evidence:** `resolveReportService` calls `applyProposedCorrection` and only then `resolvePendingReportRepo`, which updates `{ status: 'PENDING' }`. If that update returns null, the service throws 409 and does not undo the teuda or restaurant write. `CORRECTION_ALREADY_MADE` sets `correctionApplied` true whenever the resolution is not `NO_CORRECTION`. `awardPointsForAppliedCorrectionService` then awards +1 from that flag. The award itself is idempotent per `REPORT:<id>`. `SubmitReportPage` sends only a note and optional photo. `submitReportSchema` forces type `GENERAL` and clears proposed fields unless the client sends `KASHRUT_UPDATE`. `PendingReportsTab` shows Apply only when `canApplyProposal` is true.
- **Root cause:** The correction and the status change are two writes. The status write is atomic; the earlier write is not tied to it. Points trust `correctionApplied`, and "already corrected" sets that flag on the admin's word.
- **Relevant files/functions:** `backend/src/services/adminReportService.js` (`applyProposedCorrection`, `resolveReportService`, `buildCorrectionChanges`); `backend/src/repositories/adminReportRepository.js` (`resolvePendingReportRepo`); `backend/src/services/pointsService.js` (`awardPointsForAppliedCorrectionService`); `frontend/src/components/admin/PendingReportsTab.tsx`; `frontend/src/pages/SubmitReportPage.tsx`; `backend/src/services/reportSubmissionService.js`.
- **Planned solution:** Claim the PENDING report first, or apply the correction and the status change in one transaction, and roll back if the report was already taken. Keep +1 idempotent. Do not change the point amounts. Ask before requiring a real field diff for `CORRECTION_ALREADY_MADE`, because that changes when points are awarded. A transaction needs a replica set; do not add `mongodb-memory-server` without approval. Compensating updates are acceptable if they are tested.
- **Files changed:** `backend/src/services/adminReportService.js`, `backend/src/repositories/adminReportRepository.js`.
- **Tests added or modified:** `backend/tests/adminReportService.test.js`. The old test expected the certificate write to run before the claim and to skip the claim when the write failed. That assertion described the bug, so it was replaced: a lost claim does not write, and a failed write reopens the report. `CORRECTION_ALREADY_MADE` still awards +1.
- **Verification:** `cd backend; npm test -- tests/adminReportService.test.js` exit 0, 18 tests passed. Mocks only. No browser. No live database.
- **Blockers:** If reopening the report also fails, the report can stay resolved without the correction. That is logged and the original error is still thrown. A field-diff requirement for `CORRECTION_ALREADY_MADE` still needs approval because it changes who gets +1.

### M2-003 — Admin review experience

- **Milestone:** 2
- **Priority:** Critical
- **Status:** VERIFIED
- **Description:** The dashboard can list, approve, reject, edit, and delete, but review of user submissions is incomplete. Saving an edit of a user restaurant that omitted food type or categories is blocked by the admin form. Report photos are a link, not a preview. There is no before/after view (see M2-004).
- **Evidence:** `AdminRestaurantPage.handleSave` returns early when `categories.length === 0`. `RestaurantFields` sets `required` on food type unless `variant="user"`. User submit allows empty food type and categories (`restaurantFieldsSchema`). Approve is separate and still works. `PendingReportsTab` renders `photoUrl` as "open full" when the URL is http/https. Pending restaurant cards show the claim and duplicate warnings, not a certificate, which matches M1-001 because no certificate was stored.
- **Root cause:** Admin edit reused required fields from the admin-create rules after user submit made those fields optional. Report review was built for structured proposals; the later form is a note plus a photo.
- **Relevant files/functions:** `frontend/src/pages/AdminRestaurantPage.tsx`; `frontend/src/components/RestaurantFields.tsx`; `frontend/src/components/admin/PendingReportsTab.tsx`; `frontend/src/components/admin/PendingRestaurantsTab.tsx`; `frontend/src/components/admin/AdminTeudaCard.tsx`.
- **Planned solution:** Let an admin save an edit of a restaurant that has no food type or category, without forcing those fields, while admin-created restaurants can keep their own required rules. Show the report photo on the pending report card. Keep private notes off the public page.
- **Files changed:** `frontend/src/pages/AdminRestaurantPage.tsx`, `frontend/src/components/RestaurantFields.tsx`, `backend/src/schemas/adminSchemas.js`.
- **Tests added or modified:** `backend/tests/adminSchemas.test.js`. Edit accepts a blank food type and empty categories. Create still rejects that.
- **Verification:** `cd backend; npm test` exit 0, 38 files, 485 tests passed. `cd frontend; npm test` exit 0, 14 files, 90 tests passed. `cd frontend; npm run typecheck` exit 0. `cd frontend; npm run lint` exit 0. The admin screen was not opened in a browser.
- **Blockers:** Report photos stay a link rather than an inline preview. That is cosmetic and was left for later. Before/after history stays M2-004.

### M2-004 — Audit history

- **Milestone:** 2
- **Priority:** Critical
- **Status:** NOT STARTED
- **Description:** Admin actions are not stored as a history. A record has its current status, one rejection reason, one private note, submitter, and `createdAt` / `updatedAt`. There is no actor, no before/after, and no event list.
- **Evidence:** Repository search found no audit, history, or `reviewedBy` field. `Restaurant`, `Teuda`, and `Report` schemas carry `adminNote`, `rejectionReason`, `status`, and timestamps. Deletes remove the documents (`deleteRestaurantService`).
- **Root cause:** Moderation was implemented as in-place updates. `updatedAt` changes on every save, so it is not an approval time.
- **Relevant files/functions:** `backend/src/models/Restaurant.js`; `backend/src/models/Teuda.js`; `backend/src/models/Report.js`; `backend/src/services/adminRestaurantService.js`; `backend/src/services/adminTeudaService.js`; `backend/src/services/adminReportService.js`.
- **Planned solution:** Add an append-only admin event (who, when, action, target, changed fields) if the user wants traceability. That is a new collection or embedded array. Assess compatibility before adding it. Do not rewrite old documents. Show the trail on the admin restaurant page only.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only.
- **Blockers:** Confirm the user wants a stored history before adding a collection. Public pages must not gain this data.

---

## Milestone 3 — Kashrut status and trustworthiness

Priority: Critical

### M3-001 — Centralized status correctness

- **Milestone:** 3
- **Priority:** Critical
- **Status:** ALREADY WORKING
- **Description:** Public status is derived in one service and reused by search, the map, and the restaurant page. Expired is computed from the Israel calendar date and is not stored. Pending certificates are excluded.
- **Evidence:** `buildKashrutSummary` and `applyKashrutFilters` live in `kashrutStatusService.js`. `restaurantDetailsService.js` calls `buildKashrutSummary`. `loadMatches` in `restaurantSearchService.js` calls the same functions for the list and the map. `isTeudaPublic` drops unapproved and older-than-six-months certificates. A claim with hechsher and no level becomes `UNVERIFIED_NO_LEVEL`. A level filter matches `item.kashrutLevel`, so a claim with no level does not satisfy a level filter. That is consistent between card and details because both use the summary.
- **Root cause:** Not a defect. Search can still omit restaurants for a different reason (M6-001): the candidate cap runs before this service.
- **Relevant files/functions:** `backend/src/services/kashrutStatusService.js`; `backend/src/services/teudaRulesService.js`; `backend/src/services/restaurantSearchService.js` (`loadMatches`); `backend/src/services/restaurantDetailsService.js`.
- **Planned solution:** No status rewrite. If a later bug appears, fix the caller so it keeps using this service. Re-run `kashrutStatusService.test.js` and `kashrutFilters.test.js` when nearby code changes.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection plus the existing test file names. Those tests were not re-run in this audit.
- **Blockers:** none

### M3-002 — Verification terminology

- **Milestone:** 3
- **Priority:** Critical
- **Status:** ALREADY WORKING
- **Description:** The four public statuses have stable meanings. This audit does not change their labels.
- **Evidence:** `buildKashrutSummary` maps evidence kind to `VERIFIED`, `UNVERIFIED`, `EXPIRED`, or `UNKNOWN`. English copy in `frontend/src/locales/en.ts` says "Verified certificate", "Unverified claim (no certificate)", and "EXPIRED certificate". The restaurant page states that KosherRadar is not a kashrut authority. `VERIFIED` means an approved certificate whose Israel expiration date is still today or later. `UNVERIFIED` means a stored claim with no matching public certificate. `EXPIRED` means the best public evidence is a certificate that expired within six calendar months. `UNKNOWN` means no public certificate and no claim. Older certificates are admin-only.
- **Root cause:** Labels match the derivation. A visitor can still read "verified" as an endorsement by this site. The page disclaimer is the current mitigation.
- **Relevant files/functions:** `backend/src/services/kashrutStatusService.js`; `frontend/src/locales/en.ts`; `frontend/src/locales/he.ts`; `frontend/src/pages/RestaurantDetailsPage.tsx`; `frontend/src/components/KashrutBadge.tsx`.
- **Planned solution:** Keep the current words until the user approves different public copy. Any Hebrew change needs native-speaker review.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection of the status function and the English strings.
- **Blockers:** Renaming public statuses or badges requires explicit approval.

### M3-003 — Information freshness

- **Milestone:** 3
- **Priority:** Critical
- **Status:** NOT STARTED
- **Description:** Certificate expiration is shown. The page does not show when an admin last reviewed the record, who supplied the claim, or that other reports are waiting. Pending reports correctly stay off the public page.
- **Evidence:** `TeudaCard` shows `expirationDate` and EXPIRED styling from `visibility`. Public serializer fields checked in the details page do not include a review timestamp. `Restaurant.updatedAt` exists but is not a review time. Pending reports are a separate collection and are not an input to `buildKashrutSummary`.
- **Root cause:** Freshness was defined as the certificate date and the six-month window, not as a review log.
- **Relevant files/functions:** `frontend/src/pages/RestaurantDetailsPage.tsx` (`TeudaCard`); `backend/src/services/kashrutStatusService.js` (`toPublicTeuda`); `backend/src/services/publicRestaurantSerializer.js`.
- **Planned solution:** Show the certificate expiration that is already public. Add a "last reviewed" date only if M2-004 stores one. Do not show pending report text publicly. Do not change status labels (M3-002).
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only.
- **Blockers:** A review date depends on M2-004 or another approved field.

---

## Milestone 4 — Authentication and security

Priority: High

### M4-001 — Token invalidation

- **Milestone:** 4
- **Priority:** High
- **Status:** VERIFIED
- **Description:** A successful password reset does not invalidate JWTs that were already issued. Those tokens keep working until `JWT_EXPIRES_IN` (default `24h`).
- **Evidence:** `signTokenService` signs `{ sub, role }` only. `resetPasswordService` updates `passwordHash` and reset-token rows. `User` has no session version or `passwordChangedAt`. `getUserFromTokenService` loads the user and rejects a missing user, then returns the user. It does not compare the token to the password-change time. `PROGRESS.md` Milestone 3 already states this limitation.
- **Root cause:** Stateless JWTs with no version claim. Password hash is not part of the token, so changing it does not affect `jwt.verify`.
- **Relevant files/functions:** `backend/src/services/authService.js` (`signTokenService`, `getUserFromTokenService`); `backend/src/services/passwordResetService.js` (`resetPasswordService`); `backend/src/models/User.js`.
- **Planned solution:** Add a numeric session version or a password-changed timestamp on `User`, put it in new tokens, and reject tokens whose value is older. Existing tokens without the claim can remain valid until they expire, which avoids logging everyone out at deploy. Set the version in the same update as the new password hash. This is an additive field with a default of `0`. No backfill is required if missing means `0`. Do not switch storage to cookies in this fix (M4-004).
- **Files changed:** `backend/src/models/User.js`, `backend/src/services/authService.js`, `backend/src/repositories/userRepository.js`.
- **Tests added or modified:** `backend/tests/authService.test.js`, `backend/tests/userRepository.test.js`. `passwordResetService.test.js` still passed.
- **Verification:** `cd backend; npm test` exit 0, 38 files, 485 tests passed. Mocks only. No live database. Existing tokens with no `tv` stay valid while `tokenVersion` is missing or 0. Logout still only clears localStorage (M4-004).
- **Blockers:** none. A missing `tokenVersion` on an old account is treated as 0, so this deploy does not log everyone out. No backfill.

### QA-002 — Duplicate `tokenVersion` declaration

- **Milestone:** Integration QA, found before merging `feature/audit-must-fix`
- **Priority:** Low
- **Status:** VERIFIED
- **Description:** `User.js` declared `tokenVersion` twice in the same schema object. JavaScript kept the second definition. Both definitions were the same, so sessions were unaffected.
- **Evidence:** `QA_PROGRESS.md` on `feature/qa-testing` at `54d9605`. The field appeared before `points` and again after `awardedPointKeys`.
- **Root cause:** The field was added twice while writing M4-001.
- **Relevant files/functions:** `backend/src/models/User.js`.
- **Planned solution:** Keep the first declaration and its comment. Delete the second.
- **Files changed:** `backend/src/models/User.js`.
- **Tests added or modified:** `backend/tests/models.test.js` expects the default `0` and a single `tokenVersion:` in the model source.
- **Verification:** `cd backend; npm test` exit 0, 38 files, 489 tests passed. No behavior change. No backfill.
- **Blockers:** none

### M4-002 — Authentication and authorization audit

- **Milestone:** 4
- **Priority:** High
- **Status:** ALREADY WORKING
- **Description:** Registration, login, reset, route guards, and admin checks match the intended rules. The gaps that remain are M4-001, M4-003, and M4-004, not a broken login flow.
- **Evidence:** `registerService` creates a user from email and password hash and does not take `role` or `points` from the client. `loginService` compares bcrypt and uses a dummy hash when the email is missing. `authMiddleware` requires `Bearer` and loads the user from the database, so `adminMiddleware` sees the stored role, not a stale role claim. Admin routes sit behind both middleware (covered by `adminRoutes.test.js` historically). Reset request returns without revealing whether the email exists and does not await the send. Reset token is 32 random bytes, stored as SHA-256, and consumed with a filtered update. Frontend `ProtectedRoute` plus `safeReturnPath` keeps the post-login path on this site. `useAuthStore` persists token and user only.
- **Root cause:** Not a defect in the reviewed paths. Logout is client-side deletion of the stored token; the JWT stays valid until expiry even on logout, same family of issue as M4-001.
- **Relevant files/functions:** `backend/src/services/authService.js`; `backend/src/middleware/authMiddleware.js`; `backend/src/middleware/adminMiddleware.js`; `backend/src/services/passwordResetService.js`; `frontend/src/stores/authStore.ts`; `frontend/src/utils/returnPath.ts`.
- **Planned solution:** No redesign. When M4-001 lands, logout can bump the session version only if the user approves ending other sessions. Otherwise leave logout as a local clear.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. Not exercised in a browser in this audit.
- **Blockers:** none

### M4-003 — API security

- **Milestone:** 4
- **Priority:** High
- **Status:** NOT STARTED
- **Description:** CORS is locked to `CLIENT_URL`, `x-powered-by` is off, JSON bodies are limited to 10kb, uploads are limited to 5 MB and checked by file bytes, Zod validates inputs, and production 500s hide the exception message. Security headers, a shared rate-limit store, and proxy IP handling are missing.
- **Evidence:** `server.js` uses `cors({ origin: env.clientUrl })` and `express.json({ limit: '10kb' })`. No `helmet` import and no `trust proxy`. `rateLimiters.js` uses `express-rate-limit` defaults (memory, per process). Limits: auth 30/15 min, submissions 30/hour, uploads 15/hour, search 200/min, forgot-password 5/hour. `uploadMiddleware.js` sets multer `fileSize` to `MAX_IMAGE_BYTES`. `errorMiddleware` returns a generic message when `NODE_ENV` is `production`. `GET /api/health` is public and reports whether MongoDB is connected. These limiters were not driven past their caps in this audit.
- **Root cause:** The API was hardened for a single Node process and a known browser origin. It was not given response security headers or a multi-instance limiter.
- **Relevant files/functions:** `backend/src/server.js`; `backend/src/middleware/rateLimiters.js`; `backend/src/middleware/errorMiddleware.js`; `backend/src/middleware/uploadMiddleware.js`; `backend/src/services/imageUploadService.js` (`checkImageFile`).
- **Planned solution:** Add a small set of security headers. If that needs the `helmet` package, ask first. Document `trust proxy` for a reverse proxy and set it only when the deployment is known. Keep rate limits. A shared store such as Redis is a new dependency and stays out unless approved. Do not weaken CORS or validation.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. Rate limits were not executed.
- **Blockers:** New packages require approval. Production proxy layout is unknown.

### M4-004 — Token storage risk assessment

- **Milestone:** 4
- **Priority:** High
- **Status:** DEFERRED
- **Description:** The JWT and user profile are stored in `localStorage` under `kosherradar-auth`. Any script that runs in the origin can read the token. An HttpOnly cookie migration is deferred until separately approved.
- **Evidence:** `authStore.ts` uses Zustand `persist` with `partialize` saving `token` and `user`. Axios attaches the bearer token (existing `attachToken` test). The server does not set cookies. XSS is not demonstrated in this audit; the risk follows from the storage location. Logout and expiry clear the local copy only (see M4-001).
- **Root cause:** Chosen in Milestone 1 and explicitly retained by the current rules.
- **Relevant files/functions:** `frontend/src/stores/authStore.ts`; `frontend/src/api/axiosInstance.ts`.
- **Planned solution:** Keep localStorage. M4-001 reduces how long a stolen token survives a password reset. A later cookie design needs CSRF protection and an approved storage change. Do not implement it in Milestone 4.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection of the persist config. This assessment does not prove an XSS vulnerability exists.
- **Blockers:** Cookie migration is deferred pending explicit approval. Do not mark this issue verified.

---

## Milestone 5 — Database integrity

Priority: High

### M5-001 — Safe restaurant deletion

- **Milestone:** 5
- **Priority:** High
- **Status:** NOT STARTED
- **Description:** Deleting a restaurant deletes its certificates and reports, then tries to delete Cloudinary images. Points already awarded stay. The writes are sequential and not one transaction. The user's submission list loses those rows because it queries the live documents.
- **Evidence:** `deleteRestaurantService` loads image ids, `deleteTeudotOfRestaurantRepo`, `deleteReportsOfRestaurantRepo`, `deleteRestaurantByIdRepo`, then `deleteImageService` per id. `pointsService` never subtracts points. `listMyRestaurantsRepo` filters `submittedBy` with no tombstone. The UI uses `window.confirm` before calling delete.
- **Root cause:** Deletion was specified as a permanent cascade implemented as separate commands. Image deletion is best-effort (M5-004).
- **Relevant files/functions:** `backend/src/services/adminRestaurantService.js` (`deleteRestaurantService`); `backend/src/repositories/adminTeudaRepository.js`; `backend/src/repositories/adminReportRepository.js`; `frontend/src/pages/AdminRestaurantPage.tsx` (`handleDelete`).
- **Planned solution:** Perform the three database deletes in one transaction when a replica set is available, or document a compensating order and test it. Delete images after the database commit, and record failures for a retry (M5-004). Keep points. Ask before adding tombstones that change what users see in submission history.
- **Files changed:** none
- **Tests added or modified:** none. Existing unit tests mock the repositories.
- **Verification:** Static inspection only.
- **Blockers:** A transaction test needs an approved isolated replica set. Do not run this against a shared or production database.

### M5-002 — Multi-document consistency

- **Milestone:** 5
- **Priority:** High
- **Status:** VERIFIED
- **Description:** Several flows write more than one document without a transaction. One of them is a confirmed defect: password reset marks the token used before the new password is saved. Report resolution is M2-002. Restaurant-plus-certificate submit has a compensating delete.
- **Evidence:** `resetPasswordService` calls `consumeResetTokenRepo` and only then `setUserPasswordHashRepo`. If the password update throws, or the user row is gone, the token is already consumed and the password is unchanged. `submitRestaurantService` creates the restaurant, then the teuda, and deletes the restaurant and photo if the teuda insert fails; those compensations are not atomic. `rejectRestaurantService` rejects the restaurant, then rejects its pending certificates in a separate call that only logs a failure. No `startSession` or `withTransaction` usage was found under `backend/src`.
- **Root cause:** Each step was written to be locally atomic (`findOneAndUpdate` with a status filter) without a multi-document transaction. The reset flow orders the token consume first so the token cannot be reused, and it does not put the password write in that same update.
- **Relevant files/functions:** `backend/src/services/passwordResetService.js`; `backend/src/services/restaurantSubmissionService.js`; `backend/src/services/adminRestaurantService.js` (`rejectRestaurantService`); `backend/src/services/adminReportService.js`.
- **Planned solution:** Consume the reset token and set the password in one transaction, or set the password first and consume the token in a way that still prevents two successful resets. Keep the identical forgot-password response. Fix report resolution under M2-002. Keep the restaurant/teuda compensation unless a transaction is approved and available. Do not install a memory-server package without approval.
- **Files changed:** `backend/src/services/passwordResetService.js`, `backend/src/repositories/passwordResetRepository.js`. The reset token is released when the password hash is not saved. A failure while cancelling other unused links, after the password is saved, does not release the token. Report claiming is M2-002. Restaurant and certificate compensation was left as it was.
- **Tests added or modified:** `backend/tests/passwordResetService.test.js`. A thrown password write releases the token. A missing account releases it. A cleanup failure after a successful save does not.
- **Verification:** `cd backend; npm test` exit 0, 38 files, 485 tests passed. Mocks only. No live database and no email was sent.
- **Blockers:** Restaurant submit and restaurant rejection still use separate writes. Those were not the confirmed defect and stay in the rest of this issue's evidence as later work. No transaction library was added.

### M5-003 — Duplicate handling and indexes

- **Milestone:** 5
- **Priority:** High
- **Status:** NOT STARTED
- **Description:** Duplicate restaurants are a warning, not a unique constraint. Two overlapping submits can both pass the pending check and both insert. Email and reset-token hash are unique.
- **Evidence:** `findPendingRestaurantBySubmitterRepo` runs before `createRestaurantRepo`. There is no unique index on name plus address. `Restaurant` indexes `nameNormalized`, `addressNormalized`, `phoneNormalized`, and sparse `geoapifyPlaceId`, none unique. `findPossibleDuplicatesService` stores at most 10 warnings and never blocks. `User.email` is unique. `PasswordResetToken.tokenHash` is unique. A double click is reduced by disabling the submit button after `setLoading(true)`, which does not cover two browsers.
- **Root cause:** The product rule is "warn, do not block", implemented as a read-then-insert.
- **Relevant files/functions:** `backend/src/services/duplicateService.js`; `backend/src/services/restaurantSubmissionService.js`; `backend/src/models/Restaurant.js`; `backend/src/repositories/restaurantRepository.js`.
- **Planned solution:** Keep non-blocking duplicate warnings. Close the same-user pending race with a unique partial index on submitter plus normalized name and address for `PENDING` only, if that matches the existing 409 rule, and confirm it does not reject two different pending restaurants. Ask before any unique index that would block the public from submitting a similar place.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. The index build was not run.
- **Blockers:** A new unique index needs a compatibility check against existing pending rows. Do not build it on a production cluster from this work without approval.

### M5-004 — External cleanup reliability

- **Milestone:** 5
- **Priority:** High
- **Status:** NOT STARTED
- **Description:** Cloudinary deletes log the error and continue. A failed delete after a successful database delete leaves an orphan image. A failed delete during a failed save can do the same.
- **Evidence:** `deleteImageService` returns immediately when the id is missing or Cloudinary is not configured. On `destroy` failure it `console.error`s and does not throw. Callers in restaurant submit, teuda submit, report submit, admin delete, and admin teuda delete rely on that. There is no retry queue or orphan record.
- **Root cause:** Cleanup is deliberately non-blocking so the user sees the original error. Nothing records the leftover `public_id` for another attempt.
- **Relevant files/functions:** `backend/src/services/imageUploadService.js` (`deleteImageService`); callers in `restaurantSubmissionService.js`, `teudaSubmissionService.js`, `reportSubmissionService.js`, `adminRestaurantService.js`, `adminTeudaService.js`.
- **Planned solution:** Persist the public id of a failed destroy and retry it from an admin or scheduled path. Do not call live Cloudinary while designing this. Do not delete remote files as part of the audit or as an unapproved cleanup.
- **Files changed:** none
- **Tests added or modified:** none. `imageUpload.test.js` mocks the SDK.
- **Verification:** Static inspection only.
- **Blockers:** Retry execution against Cloudinary needs approved test credentials (M9-003).

---

## Milestone 6 — Search and map

Priority: High

### M6-001 — Search result completeness

- **Milestone:** 6
- **Priority:** High
- **Status:** NOT STARTED
- **Description:** The database returns at most 2000 candidate restaurants, sorted by name, and only then applies kashrut filters and relevance. When more than 2000 match, `capped` is true and later names are never scored. The map uses the same path with a 500 cap.
- **Evidence:** `MAX_SEARCH_CANDIDATES` is 2000 and `MAP_MARKER_LIMIT` is 500 in `constants.js`. `findSearchCandidatesRepo` sorts `{ name: 1, _id: 1 }` and limits to `candidateLimit + 1`. `loadMatches` sets `capped` from that length and slices to the cap before `applyKashrutFilters`. Atlas ids are added to the `$or`, then the same name sort and limit still apply, so a fuzzy hit late in the alphabet can be cut off. Paging is correct inside the examined set (`slice` by page, tie-break includes id). This matches the Milestone 4 design note. It was not reproduced with 2000 rows in this audit.
- **Root cause:** Kashrut status depends on another collection and on the date, so it runs in process after a capped query. The cap is ordered by name, not by relevance.
- **Relevant files/functions:** `backend/src/services/restaurantSearchService.js` (`loadMatches`, `searchRestaurantsService`); `backend/src/repositories/restaurantSearchRepository.js` (`findSearchCandidatesRepo`); `backend/src/config/constants.js`.
- **Planned solution:** Keep the cap and the `capped` warning. When text is present, prefer a relevance-oriented candidate order, or apply cheap filters in the query, so the cap does not keep only the alphabetical prefix. Do not raise the cap without a performance check (M6-002). Add a test that a match beyond the cap is reported as capped.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only.
- **Blockers:** none for a unit test with a mocked repository. Real volume needs an isolated database.

### M6-002 — Search relevance and performance

- **Milestone:** 6
- **Priority:** High
- **Status:** NOT STARTED
- **Description:** Name and food prefix indexes exist, and relevance is computed in process. Query cost at a large approved-restaurant count was not measured. Atlas Search is optional and unverified live.
- **Evidence:** Indexes on `status + nameTokens`, `foodTokens`, and `foodGroups` are declared on `Restaurant`. `calculateRelevance` scores exact name, prefix, token, Atlas, and food. Food synonyms live in `config/foodSynonyms.js` and are agent-written and unreviewed. `ATLAS_SEARCH_ENABLED` defaults off. A missing Atlas index returns no extra hits and is handled as a failure only when the command throws.
- **Root cause:** Design is documented. Performance is an open measurement, not a demonstrated timeout.
- **Relevant files/functions:** `backend/src/models/Restaurant.js`; `backend/src/utils/searchFields.js`; `backend/src/services/restaurantSearchService.js`; `backend/src/config/foodSynonyms.js`; `ATLAS_SEARCH_SETUP.md`.
- **Planned solution:** Explain the query with an isolated database before changing indexes. Leave synonym text unchanged unless the team reviews it. Leave Atlas off until M9-001.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. No `explain` was run.
- **Blockers:** Load measurement needs an isolated database. Atlas needs M9-001.

### M6-003 — Coordinate accuracy

- **Milestone:** 6
- **Priority:** High
- **Status:** VERIFIED
- **Description:** Coordinates are optional and are not invented when geocoding misses. A first-hit geocode can still store a precise-looking point for the wrong place. Restaurants without coordinates are omitted from radius and map queries.
- **Evidence:** `Restaurant` leaves `location` unset when latitude or longitude is missing (`pre('validate')`). Schema requires both or neither, inside `ISRAEL_BOUNDS` on input. `geocodeAddressService` returns null when the key is missing, the request fails, or nothing in Israel matches. When it matches, it stores the first hit (M1-003). Map and radius filters use `location`, so missing coordinates drop the restaurant from those views. The list can still show it.
- **Root cause:** Same first-hit behavior as M1-003, plus the intentional map rule that a restaurant without a point is not drawn.
- **Relevant files/functions:** `backend/src/models/Restaurant.js`; `backend/src/services/placesService.js`; `backend/src/repositories/restaurantSearchRepository.js`; `backend/src/utils/geo.js`.
- **Planned solution:** Share the M1-003 rule: store coordinates from an explicit suggestion or an unambiguous match only. Keep the no-coordinates list behavior. Surface "not on the map" anywhere the product already has a place for it, without a new status word (M3-002).
- **Files changed:** Same geocode rule as M1-003. No new public status word.
- **Tests added or modified:** `placesService.test.js`.
- **Verification:** Same commands as M1-001. A restaurant without coordinates still stays off the map. The submit confirmation says when the address was not placed. Live accuracy is still M9-002.
- **Blockers:** Live accuracy is M9-002.

### M6-004 — Map usability and performance

- **Milestone:** 6
- **Priority:** High
- **Status:** NOT STARTED
- **Description:** The map uses Leaflet clustering, a 500-marker cap, debounced bounds, and a list/map toggle. Clustering with many markers, popup actions, and list/map agreement above the cap were not rechecked in this audit.
- **Evidence:** `RestaurantMap.tsx` uses `MarkerClusterGroup` and shows `map.capped` when the API sets `capped`. `findMapRestaurantsService` reuses `loadMatches` with `MAP_MARKER_LIMIT` (500) while the list uses 2000 and is not limited to the viewport. A dense viewport can therefore omit markers the list would still page through, or the reverse when the list is also capped. Milestone 6 browser notes saw one marker, so clustering was not observed. Radius and bounds both apply.
- **Root cause:** List and map share filters and status code, and they use different caps and different geographic constraints. That is documented. The usability gaps are untested at density.
- **Relevant files/functions:** `frontend/src/components/RestaurantMap.tsx`; `backend/src/services/restaurantSearchService.js` (`findMapRestaurantsService`); `frontend/src/utils/mapView.ts`.
- **Planned solution:** Keep clustering. When either response is capped, keep the existing warning. Add a browser check with enough markers to cluster, on a narrow viewport, including select, call, and Waze. Do not add a mapping library.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. Not opened in a browser in this audit.
- **Blockers:** Browser verification needs a running local stack. Do not use production data.

---

## Milestone 7 — Contributions and points

Priority: Medium

### M7-001 — Submission history

- **Milestone:** 7
- **Priority:** Medium
- **Status:** ALREADY WORKING
- **Description:** A signed-in user can see their restaurants, certificates, and reports on the account page, with status, date, rejection reason, and points already awarded. Each list is the newest 50.
- **Evidence:** `GET /api/users/me/submissions` is implemented by `getMySubmissionsService`. Queries select status, rejection reason, and created date, and do not select `adminNote`. `AccountPage` renders `SubmissionsPanel` from `MySubmissionsPage.tsx`. `/account/submissions` redirects to `/account`. Certificates created only on the add-certificate page appear. A photo dropped by M1-001 never creates a teuda row, so it cannot appear here; that is M1-001, not a missing history page.
- **Root cause:** Not a defect. The 50-row cap hides older rows with no next page.
- **Relevant files/functions:** `backend/src/services/userSubmissionsService.js`; `backend/src/repositories/userSubmissionsRepository.js`; `frontend/src/pages/AccountPage.tsx`; `frontend/src/pages/MySubmissionsPage.tsx`.
- **Planned solution:** Leave the page. Add pagination only if the user asks. Fixing M1-001 is what makes a restaurant-form certificate show up.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. The page was not opened in this audit.
- **Blockers:** none

### M7-002 — Rejection feedback

- **Milestone:** 7
- **Priority:** Medium
- **Status:** ALREADY WORKING
- **Description:** Rejection reasons are shown to the submitter. Private admin notes are not selected for that API. Emails are plain text and do not include the admin note.
- **Evidence:** `userSubmissionsRepository.js` selects `rejectionReason` and not `adminNote`. The account panel prints the reason. `emailService.js` documents plain text. `notifyRejectionService` is called with the reason the admin typed. When a restaurant rejection also closes pending certificates, those certificates get the fixed reason `The restaurant was not approved.` That sentence is user-facing and is not an admin note. An admin can still type something private into the reason box; the code does not have a second check for that.
- **Root cause:** Not a leak of `adminNote`. The reason field is intentionally delivered to the user and to email.
- **Relevant files/functions:** `backend/src/services/userSubmissionsService.js`; `backend/src/services/emailService.js`; `backend/src/services/moderationNotificationService.js`; `backend/src/services/adminRestaurantService.js` (`AUTO_REJECT_REASON`); `frontend/src/pages/MySubmissionsPage.tsx`.
- **Planned solution:** No change unless the user wants the reason separated from a private note more strongly. Keep `adminNote` off this API.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only.
- **Blockers:** none

### M7-003 — Points correctness

- **Milestone:** 7
- **Priority:** Medium
- **Status:** ALREADY WORKING
- **Description:** Points are +3, +2, and +1, once per source key, and only for role `USER`. Admins get nothing. The false "+1 without a real edit" case is the `CORRECTION_ALREADY_MADE` rule in M2-002, not a second award path.
- **Evidence:** `pointsService.js` documents the three amounts. `awardOnce` checks the role and `awardPointsOnceRepo`. Keys are `TEUDA:<id>` and `REPORT:<id>`. `getMySubmissionsService` uses the same constants. Approving a restaurant alone does not call the teuda award. The account page shows the user's own total from `/api/users/me`.
- **Root cause:** Not a defect in the award helper. M2-002 can set `correctionApplied` without a field diff, and this helper then awards once, as designed.
- **Relevant files/functions:** `backend/src/services/pointsService.js`; `backend/src/repositories/userRepository.js`; `backend/src/services/adminTeudaService.js`; `frontend/src/pages/AccountPage.tsx`.
- **Planned solution:** Do not change amounts. If M2-002 tightens "already corrected", keep the same +1 helper.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. `pointsService.test.js` was not re-run. The atomic update was not run against a database in this audit.
- **Blockers:** Changing who qualifies for +1 requires approval (see M2-002).

---

## Milestone 8 — Frontend UX and localization

Priority: Medium

### M8-001 — Authentication form usability

- **Milestone:** 8
- **Priority:** Medium
- **Status:** ALREADY WORKING
- **Description:** Login uses a show/hide password control, disables the button while the request runs, and shows the server error in an alert.
- **Evidence:** `LoginPage.tsx` uses `PasswordField`, `loading`, and `role="alert"`. `PasswordField.tsx` toggles `type` between `password` and `text` and sets `aria-pressed` and `aria-label`. Register and reset pages use the same field (import sites). Validation is the browser `required` / `type="email"` plus the API error. There is no per-field error under the email box.
- **Root cause:** Not a defect for the requested controls. Field-level messages are a small leftover, not a broken form.
- **Relevant files/functions:** `frontend/src/pages/LoginPage.tsx`; `frontend/src/components/PasswordField.tsx`; `frontend/src/pages/RegisterPage.tsx`; `frontend/src/pages/ResetPasswordPage.tsx`.
- **Planned solution:** No change required for the toggle or the loading state. Add inline field errors only if a browser pass shows the single alert is unclear.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. The eye button was not clicked in this audit. Milestone 6 notes say it was clicked in an earlier session; this audit does not re-certify that.
- **Blockers:** none

### M8-002 — Form consistency

- **Milestone:** 8
- **Priority:** Medium
- **Status:** VERIFIED
- **Description:** Required and optional are inconsistent on the restaurant form. The certificate heading says optional, while hechsher is required and the other certificate inputs look like normal fields. Their values are kept in React state when the request fails. The submit button is disabled while `loading` is true.
- **Evidence:** `SubmitRestaurantPage` marks name, address, and hechsher invalid and focuses the message in `FormAlert`. `TeudaFields` uses `fieldsRequired={false}` on that page, so expiration and mashgiach are not HTML-required, and the labels do not say optional. Food-type and category labels do not say optional either, while the admin variant marks food type required. Failed submit leaves `restaurant` and `teuda` state in place. Double-submit of the same pending restaurant returns 409 from `findPendingRestaurantBySubmitterRepo` (race: M5-003).
- **Root cause:** One shared field component serves a required claim and an optional certificate, and M1-001 then drops the certificate.
- **Relevant files/functions:** `frontend/src/pages/SubmitRestaurantPage.tsx`; `frontend/src/components/TeudaFields.tsx`; `frontend/src/components/RestaurantFields.tsx`; `frontend/src/locales/en.ts`.
- **Planned solution:** Do this with M1-002 so labels match the saved payload. Mark optional fields in both languages. Keep the in-progress values on error. Keep the disabled submit button.
- **Files changed:** Done with M1-002. Optional certificate labels in both languages. Hechsher is its own required section. Values stay in the form when submit fails. The submit button stays disabled while the request runs.
- **Tests added or modified:** Locale key parity is covered by the existing locales test, which passed with the new keys.
- **Verification:** Same commands as M1-001.
- **Blockers:** Hebrew label edits still need M8-004 review. They are not a reason to reopen this issue.

### M8-003 — Responsive design and accessibility

- **Milestone:** 8
- **Priority:** Medium
- **Status:** NOT STARTED
- **Description:** Milestone 6 recorded no horizontal scroll at 390, 700, 900, and 1280 px. This audit did not repeat that. Address suggestions cannot be used from the keyboard. Delete uses `window.confirm`.
- **Evidence:** `AddressSearch` renders suggestion buttons with no `role="listbox"`, no arrow-key handler, and no `aria-activedescendant`. `LocationField` sets `role="listbox"` and handles Enter as a geocode of the typed text, not as selection of the highlighted option. `AdminRestaurantPage.handleDelete` uses `window.confirm`. Map popups and clustering were not exercised here.
- **Root cause:** Autocomplete was built as a click list. Responsive layout was checked once in Milestone 6 and not locked in with a component test.
- **Relevant files/functions:** `frontend/src/components/AddressSearch.tsx`; `frontend/src/components/LocationField.tsx`; `frontend/src/pages/AdminRestaurantPage.tsx`; `frontend/src/components/RestaurantMap.tsx`.
- **Planned solution:** Add keyboard operation and combobox semantics to both suggestion lists. Keep `window.confirm` unless a shared dialog already exists. Repeat the four widths in the browser when the forms change. There are no frontend component tests today; do not add a test runner.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Static inspection only. Earlier width checks are historical and were not repeated.
- **Blockers:** Browser tools in a later session. No new dependency.

### M8-004 — English/Hebrew localization

- **Milestone:** 8
- **Priority:** Medium
- **Status:** BLOCKED
- **Description:** The two locale files are required to share keys, Hebrew strings are non-empty in the unit test, and Hebrew sets `dir=rtl`. Restaurant names and addresses are not translated. Nobody has signed off the Hebrew as a native speaker, and several hechsher names were written by an agent.
- **Evidence:** `frontend/src/locales/locales.test.ts` is listed in the frontend tests. `language.ts` stores `kosherradar-language` and the app sets `lang` and `dir`. `AddressSearch` does not pass `lang` (M1-003). Server validation messages stay in the language of the API string, which is English. `PROGRESS.md` says the hechsher list and food synonyms are unreviewed.
- **Root cause:** Coverage is tested mechanically. Linguistic review was never recorded as done.
- **Relevant files/functions:** `frontend/src/locales/en.ts`; `frontend/src/locales/he.ts`; `frontend/src/locales/locales.test.ts`; `frontend/src/utils/language.ts`; `backend/src/config/constants.js`.
- **Planned solution:** Do not rewrite Hebrew during feature milestones except for strings those milestones must change. Flag every new or edited Hebrew string for review. Close this issue only when a native speaker has reviewed `he.ts` and the hechsher labels, or the user explicitly waives that review.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** The locale test file exists. It was not run in this audit.
- **Blockers:** Needs a native speaker, or an explicit waiver. Question: who will review the Hebrew UI and the hechsher names before launch?

---

## Milestone 9 — External integration verification

Priority: High before launch

Live services were not called. Mocked unit tests are not evidence that these integrations work.

### M9-001 — MongoDB Atlas

- **Milestone:** 9
- **Priority:** High before launch
- **Status:** BLOCKED
- **Description:** Search, transactions, and Atlas Search behavior against a real Atlas cluster are unverified. Milestone 6 used a local MongoDB on `127.0.0.1:27017`. That is not Atlas.
- **Evidence:** `ATLAS_SEARCH_ENABLED` defaults false. `ATLAS_SEARCH_SETUP.md` exists. `findAtlasNameHitsRepo` is skipped unless the flag is true. No transaction API is used (M5-002). Health check only reports `readyState`.
- **Root cause:** No approved Atlas credentials were used, by the audit rules.
- **Relevant files/functions:** `backend/src/config/env.js`; `backend/src/repositories/restaurantSearchRepository.js`; `ATLAS_SEARCH_SETUP.md`; `backend/src/config/db.js`.
- **Planned solution:** With an approved isolated cluster: connect, run `search:rebuild` if needed, create the index from the setup doc, set the flag, and search a mistyped name. Confirm transactions on that cluster before relying on them. Do not point tests at production.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Not run. Mocked repository tests do not prove Atlas.
- **Blockers:** Needs an approved Atlas connection and permission to create a search index on an isolated cluster. Question: which cluster, if any, may be used?

### M9-002 — Geoapify

- **Milestone:** 9
- **Priority:** High before launch
- **Status:** BLOCKED
- **Description:** Autocomplete, geocoding, Hebrew names, and failure handling are implemented and unit-tested with mocks. No real Geoapify request has been made. First-hit behavior is M1-003.
- **Evidence:** `placesService.js` calls `api.geoapify.com` only when `GEOAPIFY_API_KEY` is set. Without a key the service returns `available: false` and null coordinates. `placesService.test.js` mocks the HTTP call.
- **Root cause:** The audit was forbidden to call Geoapify. A key was not requested.
- **Relevant files/functions:** `backend/src/services/placesService.js`; `backend/tests/placesService.test.js`; `frontend/src/components/AddressSearch.tsx`; `frontend/src/components/LocationField.tsx`.
- **Planned solution:** After M1-003's match rule is coded, run an approved key against a few Hebrew and English addresses and record whether the chosen hit is the right building. Do not treat that sample as a guarantee for every address.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Not run live.
- **Blockers:** Needs an approved Geoapify key and permission to spend quota. Question: may a later session call Geoapify with the project's key?

### M9-003 — Cloudinary

- **Milestone:** 9
- **Priority:** High before launch
- **Status:** BLOCKED
- **Description:** Upload checks bytes and size, then streams to Cloudinary. Missing configuration returns 503 and does not save a certificate. A real upload has not been done. Cleanup failures are M5-004.
- **Evidence:** `imageUploadService.js` and `imageUpload.test.js` (mocked SDK). Milestone 6 recorded a 503 when keys were absent and no certificate document was saved. `backend/.env.example` lists `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- **Root cause:** Live upload was out of scope for the audit.
- **Relevant files/functions:** `backend/src/services/imageUploadService.js`; `backend/src/config/cloudinary.js`; `backend/tests/imageUpload.test.js`.
- **Planned solution:** With an approved test cloud, upload a real JPEG, confirm the URL and public id, approve the certificate in a non-production database, and delete the test image afterward. Record that mocks still do not prove the live API.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Not run live.
- **Blockers:** Needs approved Cloudinary test credentials and permission to upload and delete a test image. Question: which Cloudinary cloud may be used?

### M9-004 — Resend

- **Milestone:** 9
- **Priority:** High before launch
- **Status:** BLOCKED
- **Description:** Rejection and reset mail go through the Resend REST API. Failure does not roll back a moderation decision. Delivery was not attempted. Reset links cannot be completed without the email or a database read of the hash, and the raw token is not stored.
- **Evidence:** `emailService.js` returns `SENT`, `FAILED`, or `NOT_CONFIGURED` and does not throw. `emailService.test.js` mocks `fetch`. `backend/.env.example` documents the sandbox limit: without a verified domain, mail goes only to the account owner.
- **Root cause:** Live send was out of scope. The sandbox rule is documented.
- **Relevant files/functions:** `backend/src/services/emailService.js`; `backend/src/services/passwordResetService.js`; `backend/src/services/moderationNotificationService.js`.
- **Planned solution:** Send one reset and one rejection to an approved recipient on an isolated stack. Confirm the reset link works once and fails the second time. Do not email real users.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Not run live. Mocked tests prove the client builds a request, not that Resend delivers it.
- **Blockers:** Needs approved Resend key, from-address, and a recipient mailbox. Question: which address may receive the test messages?

---

## Milestone 10A — Core end-to-end testing

Priority: High before launch

### M10A-001 — Core browser flows

- **Milestone:** 10A
- **Priority:** High before launch
- **Status:** NOT STARTED
- **Description:** Registration, login, protected routes, session persistence, logout, search, filtering, restaurant details, and basic navigation need a repeatable end-to-end run. There is no Playwright or Cypress project. Milestone 6 did a manual pass against local MongoDB; this audit did not repeat it.
- **Evidence:** `frontend/package.json` scripts are `dev`, `build`, `typecheck`, `test`, `lint`, `preview`. `backend/package.json` scripts are `start`, `dev`, `test`, `seed:admin`, `search:rebuild`. Frontend tests are Vitest on helpers and API builders, not components. No e2e config file was found. `@vitest/browser-playwright` appears only as an optional Vitest dependency in the lockfile, not as a project script.
- **Root cause:** The suite was built as unit and HTTP tests with mocked boundaries.
- **Relevant files/functions:** `frontend/package.json`; `backend/package.json`; `frontend/src/App.tsx`.
- **Planned solution:** Repeat the manual core path on an isolated local database and record it. Add Playwright only after approval. Do not add it in the audit.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Not run in this session.
- **Blockers:** Playwright is a new dependency and needs approval. Question: approve Playwright, or keep manual scripts for 10A and 10B?

---

## Milestone 10B — Submission and admin end-to-end testing

Priority: High before launch

### M10B-001 — Submission and admin browser flows

- **Milestone:** 10B
- **Priority:** High before launch
- **Status:** NOT STARTED
- **Description:** Restaurant submit, certificate upload, admin approve and reject, report submit and resolve, points, submission history, English/Hebrew, and mobile need an end-to-end pass. Certificate upload and points on approval cannot be fully true until Cloudinary works (M9-003).
- **Evidence:** Same missing e2e runner as M10A-001. Manual Milestone 6 coverage included a restaurant with no certificate, rejection, and a report with no correction. It did not include a stored photo, +3/+2 points, or Geoapify. The current restaurant form drops photos (M1-001), so a browser test written against the desired behavior will fail until M1-001 is fixed.
- **Root cause:** No e2e project, plus external services and M1-001.
- **Relevant files/functions:** `frontend/src/pages/SubmitRestaurantPage.tsx`; `frontend/src/pages/AdminDashboardPage.tsx`; `frontend/src/pages/AccountPage.tsx`.
- **Planned solution:** Run this after Milestones 1 and 2 on an isolated stack. Use Cloudinary and Resend only under M9 approvals. Cover Hebrew `dir` and one phone width.
- **Files changed:** none
- **Tests added or modified:** none
- **Verification:** Not run in this session.
- **Blockers:** Depends on M1-001 for an honest certificate assertion, and on M9-003 for a real photo. Same Playwright question as M10A-001.

---

## Milestone 11 — Documentation and production readiness

Priority: High before launch

### M11-001 — Production readiness review

- **Milestone:** 11
- **Priority:** High before launch
- **Status:** NOT STARTED
- **Description:** README, `.env.example`, health check, and the tracking files exist. Logging is `console.error`. There is no monitoring, no backup runbook, and no production checklist that separates local MongoDB from Atlas.
- **Evidence:** `GET /api/health` returns status and database connected/disconnected. `README.md` documents install, scripts, API, and the blocked integrations. `backend/.env.example` and `frontend/.env.example` list variable names without secrets. No APM, structured logger, or backup document was found in the audit search. Frontend production build warns that the bundle is large (historical note in `PROGRESS.md`, about 716 kB). Backend has no compile step.
- **Root cause:** The project is documented as a local/academic stack. Operations for a public deploy were not written.
- **Relevant files/functions:** `README.md`; `backend/src/server.js`; `backend/.env.example`; `frontend/.env.example`; `PROGRESS.md`.
- **Planned solution:** Add a short production checklist: env vars, health check, backup expectation, what "verified" means for Atlas/Cloudinary/Resend/Geoapify, and the tracker status. Do not invent infrastructure. Do not edit `PROJECT_SPEC.md`.
- **Files changed:** none in application code. This audit added `AGENTS.md`, `FIX_TRACKER.md`, and `AUDIT_FINDINGS.md`, and appended to `PROGRESS.md`.
- **Tests added or modified:** none
- **Verification:** File inspection only. Builds were not re-run.
- **Blockers:** Backup and hosting choices need the user. Question: where will this be hosted, and who takes database backups?

---

## Audit session record

### V2-I001 — Remove a redundant status inside claim-only evidence

- **Milestone:** Visual v2 integration and release review (explicit user request).
- **Priority:** Medium.
- **Status:** VERIFIED.
- **Description/evidence:** Actual combined production render `design-screenshots/v2-integration/en-1280-details-unverified.png` repeats "Unverified claim" in the summary, section heading, and record label. The record label is redundant when the whole section already identifies unverified claims.
- **Root cause:** The shared claim record needs its label in mixed certificate/claim sections, but also renders it in claim-only sections.
- **Relevant files/functions:** `RestaurantDetailsPage`, `UnverifiedClaims`.
- **Planned solution:** Suppress only the redundant record status in claim-only sections. Keep the summary, section heading, restaurant attribution, warning, mixed-evidence labels, and existing public terminology.
- **Files changed:** `frontend/src/components/details/UnverifiedClaims.tsx`, `frontend/src/pages/RestaurantDetailsPage.tsx`, its test; this file, `PROGRESS.md`, `REDESIGN_INTEGRATION_PROGRESS.md`.
- **Tests added/modified:** Claim-only component scenario asserts absence of the redundant record label. Existing mixed-evidence test still requires the label and warning beside certificates.
- **Verification:** `cd frontend; npm test -- src/pages/RestaurantDetailsPage.test.tsx` exit 0, 14 tests passed. Final `npm test` exit 0, 26 files / 158 tests; `npm run lint`, `npm run typecheck`, `npm run build` exit 0. JS 766.92 kB; existing >500 kB warning remains. `git -c core.whitespace=cr-at-eol diff --check` exit 0. `cd backend; npm test` exit 0, 40 files / 505 mocked tests (backend unchanged). Backend has no build/lint/typecheck scripts.
- **Browser:** `node design-screenshots/v2-integration/review.mjs` exit 0 against the actual combined production build, installed Chrome and intercepted fixtures: 89 render/geometry records, 26 journey/interaction checks, no app exceptions or horizontal overflow, English/Hebrew at 375/768/1024/1280. Inspected final claim-only screenshots: redundant record label gone; warning/attribution intact. Full results in local ignored `design-screenshots/v2-integration/full-matrix-results.json`; screenshots and final fixture refresh in that directory. Earlier harness failures were selectors, fixture IDs, Chrome sandbox initialization and transient-state waits, not application regressions; corrected without weakening app validation/tests.
- **Blockers/limitations:** No live integrations; native-speaker review remains M8-004.

### V2-D001 — Recover and complete restaurant details redesign

- **Milestone:** Visual v2 restaurant details (explicitly requested recovery; no LATER audit work started).
- **Priority:** High.
- **Status:** VERIFIED.
- **Description/evidence:** Baseline `0140d19` used a large green identity band, equally weighted action pills and multiple card surfaces. Interrupted uncommitted work already replaced this composition; its onboarding incorrectly said implementation had not started. Directions was expanded by default and failed certificate images were removed directly from React's DOM.
- **Root cause:** Interrupted implementation and stale handoff; default-open navigation added visual weight, DOM mutation bypassed React ownership, and a nested bidi isolate prevented the Hebrew heading's automatic direction detection.
- **Relevant files/functions:** `RestaurantDetailsPage`, scoped details components/CSS, `DirectionsControl`, `CertificatePhoto`.
- **Solution/files changed:** Preserved and completed the existing light identity, concise summary, editorial evidence and contact sidebar. Directions becomes a collapsed anchored chooser with keyboard dismissal; failed thumbnail uses state and retains its safe link. Details page, its tests, details components/CSS, `VISUAL_V2_DETAILS_PROGRESS.md`, and tracking notes in `PROGRESS.md` / this file.
- **Tests added/modified:** Existing recovered overview/order/RTL cases retained; added thumbnail failure across language change and Escape/focus behavior.
- **Verification:** `cd frontend; npm test` exit 0, 26 files / 154 tests passed; `npm run lint`, `npm run typecheck`, `npm run build` exit 0. Existing large JS chunk warning persists (~762.44 kB). `git -c core.whitespace=cr-at-eol diff --check` exit 0 (repository CRLF convention). Backend build/tests not applicable to this frontend-only change and not run.
- **Browser:** Production frontend against synthetic local API fixtures, installed Chrome, no new packages: 80 completed renders, English/Hebrew at 390/700/900/1280; zero horizontal overflow. Screenshots visually inspected. Server-error retry, keyboard directions, clipboard fallback with native sharing unavailable, and both logged-out contribution redirects passed. Local ignored screenshots/results in `design-screenshots/details-v2/`.
- **Blockers/limitations:** New Hebrew labels await native-speaker review (M8-004). No real services, external destinations, native share sheet, phone calls, or backend integration tested. Existing untracked temporary preview config preserved outside the checkpoint. Other worktrees/branches untouched; no merge/push.

### Original audit record

- **Date:** 12 October 2026
- **Application code modified:** no
- **Tests executed:** none (read-only audit)
- **Live Cloudinary, Resend, Geoapify, or Atlas calls:** none

## Accepted V2 local-main merge verification — 13 October 2026

User accepted V2 and authorized local-main promotion. No new identified issue or status/count change. Merge `406dd65b254333fa86d2f771554545e25c380406` incorporates accepted `548743ec9c0084c5dda6db30603eb4b43a6ebed3` into pre-merge main `539303733b887f499dbbeaf49db3e3dff55b2eeb` with no conflicts; tracked tree equals accepted integration. V2-I001/V2-D001 remain VERIFIED. No application code fix or redesign during promotion.

Actual post-merge main commands: frontend `npm run lint`, `npm run typecheck`, `npm test` (26 files / 158 passed), `npm run build`; backend `npm test` (40 files / 505 passed); `git -c core.whitespace=cr-at-eol diff 5393037 HEAD --check`: all exit 0. Backend has no lint/typecheck/build scripts. Existing bundle warning persists (JS 766.92 kB). Tests mocked; no live database/services, production data, email or upload. No browser rerun; prior accepted browser evidence remains in integration worktree. Public trust terminology, moderation and administrator authority/zero-point rules unchanged. Native-speaker Hebrew review and live-service/production-readiness issues remain as tracked.

Only post-merge documentation files updated: this file, PROGRESS.md, REDESIGN_INTEGRATION_PROGRESS.md. Main's untracked PRE_PUSH_REVIEW.md preserved unchanged and excluded from commit. No source branch/worktree edit, push, deploy, branch/worktree deletion, reset or clean. Exact next step: stop; accepted local merge complete.
## Search and location reliability ? Agent 2, 13 October 2026

Explicit user assignment supersedes historical stop instructions for this worktree. Existing issue statuses unchanged.

### SEARCH-001 ? Out-of-order location lookups

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1/P2 per assignment.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** Typed lookup has no generation guard or rejection catch.
- **Relevant files/functions:** Assigned search/location files in pasted request.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** LocationField.tsx; LocationField.test.tsx.
- **Tests added or modified:** LocationField.test.tsx: stale success/failure, current rejection and clear invalidation (4 passing).
- **Verification:** frontend npm test -- src/components/LocationField.test.tsx exit 0, 4/4 passed. npm run typecheck and npm run lint exit 0. Build pending batch verification. jsdom component tests; browser and live services not tested.
- **Blockers/limitations:** No live service/data testing authorized.

### SEARCH-002 ? Failed URL location removes geography

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1/P2 per assignment.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** failedNear ends loading but search enablement only checks locationPending.
- **Relevant files/functions:** useSearchCriteria.ts, HomePage.tsx, their tests.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** useSearchCriteria.ts, HomePage.tsx, useSearchCriteria.test.tsx, HomePage.test.tsx.
- **Tests added or modified:** unavailable, ambiguous, not-found, rejection/retry/privacy hook cases; list/map gating UI cases.
- **Verification:** npm test -- src/hooks/useSearchCriteria.test.tsx exit 0 (11 passed); npm test -- src/pages/HomePage.test.tsx exit 0 (2 passed); npm run typecheck and npm run lint exit 0. Previous frontend build exit 0, existing bundle warning. jsdom/mocks; browser and live services not tested.
- **Blockers/limitations:** No live service/data testing authorized.

### SEARCH-004 ? Candidate caps omit eligible and nearest results

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1/P2 per assignment.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** alphabetical limit/slice before shared kashrut filtering and distance/relevance ranking.
- **Relevant files/functions:** restaurantSearchRepository.load candidates; restaurantSearchService.loadMatches, list/map; Restaurant indexes.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** restaurantSearchRepository.js, restaurantSearchService.js, constants.js, Restaurant.js, search repository/service/map tests.
- **Tests added or modified:** late eligible/nearest candidates beyond 2000, stable pages, map filtering beyond 500, keyset/deadline, Atlas overflow with zero eligible results. Old cap expectation intentionally changed because preliminary truncation is the confirmed defect; map output cap remains.
- **Verification:** backend npm test -- tests/restaurantSearchService.test.js tests/restaurantSearchRepository.test.js tests/mapSearchService.test.js exit 0, 3 files/57 passed. node --check service exit 0. Backend has no build/lint/typecheck. Mocks only; no live DB/Atlas/browser.
- **Blockers/limitations:** All candidates read in 2000-row keyset batches, certificates fetched per batch, best K retained; memory O(batch + page*20), total cost O(matching candidates), each DB query maxTimeMS 10000. Added nonunique status/_id index: compatible with existing records, no migration/backfill; not applied live; rollback removes this new index declaration/index. Atlas fuzzy hits remain bounded at 100 with overflow detection and truthful capped/completeness reasons; totals then lower bounds. Map caps only final ranked markers. Pagination deterministic for unchanged data; concurrent edits are not snapshot-isolated. Production performance/index compatibility unverified.

### SEARCH-005 ? Missing zero-result completeness warning

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1/P2 per assignment.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** capped warning was nested inside nonempty list rendering.
- **Relevant files/functions:** HomePage.tsx result warning.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** HomePage.tsx; HomePage.test.tsx.
- **Tests added or modified:** Zero-match partial results in intro and searched directory.
- **Verification:** frontend npm test -- src/pages/HomePage.test.tsx exit 0 (4 passed); npm run typecheck/lint exit 0. No browser/live integrations.
- **Blockers/limitations:** No live service/data testing authorized.

### SEARCH-006 ? Admin address/location identity consistency

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1/P2 per assignment.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** admin full-field mapping omitted provider ID and never geocoded missing/obsolete coordinates; selecting a suggestion without city retained old city; city edits allowed stale suggestions.
- **Relevant files/functions:** adminRestaurantService.toRestaurantChanges/updateRestaurantByAdminService; new adminRestaurantLocationService; AddressSearch; AdminRestaurantPage; adminApi.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** adminRestaurantService.js, adminRestaurantLocationService.js, their tests; AddressSearch.tsx/test; AdminRestaurantPage.tsx; adminApi.ts.
- **Tests added or modified:** typed match/failure, stale carried pin, selected replacement, explicit manual coordinates, unchanged identity; missing-city pick and stale city lookup. Old never-touch-provider-ID assertion updated because that behavior caused stale identity.
- **Verification:** backend npm test -- tests/adminRestaurantService.test.js tests/adminRestaurantLocationService.test.js exit 0, 29 passed. Frontend npm test -- src/components/AddressSearch.test.tsx exit 0, 2 passed; npm run typecheck/lint exit 0. Mocks/jsdom only; no browser/live geocoding.
- **Blockers/limitations:** Shared adminRestaurantService changes limited to import, location-field mapping and update function; report/delete/points workflows untouched. Placement failure saves address text with no invented pin and displays existing bilingual warning. Explicit new admin coordinates retain authority; unchanged location identity preserved. No added Hebrew strings. Integration may conflict with Agent 1 imports/function context.

### SEARCH-007 ? Pending duplicate identity omits city

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1/P2 per assignment.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** pending lookup and unique index identify submitter/name/address without locality.
- **Relevant files/functions:** Restaurant prevalidate/index; restaurantRepository.findPendingRestaurantBySubmitterRepo; restaurantSubmissionService.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** Restaurant.js; restaurantRepository.js; restaurantSubmissionService.js; models/submission/pending-identity tests; SEARCH_LOCATION_INDEX_ROLLOUT.md.
- **Tests added or modified:** normalized city derived, city-aware index, preflight city argument, distinct-city legacy rows allowed and same-city legacy rows detected.
- **Verification:** backend npm test -- tests/restaurantPendingIdentity.test.js tests/restaurantSubmissionService.test.js tests/models.test.js exit 0, 3 files/34 passed. Backend has no lint/typecheck/build. Mocked queries and in-memory model validation only; live uniqueness/index replacement not tested.
- **Blockers/limitations:** Existing DB requires approved replacement of pending_submitter_name_address with pending_submitter_name_address_city. No database/index operations performed; old index will still block cross-city branches until replaced. Read-time legacy normalization avoids a required record backfill. Partial new index excludes missing legacy cityNormalized; use coordinated single-version rollout. Rollback old broader index may fail after legitimate cross-city submissions; never delete records to resolve that. Review SEARCH_LOCATION_INDEX_ROLLOUT.md before deployment.

### SEARCH-008 ? City search versus precise address geocoding

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1/P2 per assignment.
- **Status:** NOT STARTED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** Pending investigation.
- **Relevant files/functions:** Assigned search/location files in pasted request.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** None yet.
- **Tests added or modified:** Pending verification.
- **Verification:** Not run yet.
- **Blockers/limitations:** No live service/data testing authorized.

### SEARCH-009 ? Confidence boundary and competing candidates

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1/P2 per assignment.
- **Status:** NOT STARTED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** Pending investigation.
- **Relevant files/functions:** Assigned search/location files in pasted request.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** None yet.
- **Tests added or modified:** Pending verification.
- **Verification:** Not run yet.
- **Blockers/limitations:** No live service/data testing authorized.

### SEARCH-010 ? Geoapify request deadlines

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1/P2 per assignment.
- **Status:** NOT STARTED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** Pending investigation.
- **Relevant files/functions:** Assigned search/location files in pasted request.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** None yet.
- **Tests added or modified:** Pending verification.
- **Verification:** Not run yet.
- **Blockers/limitations:** No live service/data testing authorized.
