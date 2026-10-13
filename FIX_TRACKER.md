# KosherRadar — fix tracker

Single source of truth for problems found in the 12 October 2026 read-only audit and for their later resolution.

Counts below are derived from the issue statuses in this file.

| Status | Count |
| --- | ---: |
| NOT STARTED | 10 |
| ALREADY WORKING | 8 |
| BLOCKED | 4 |
| DEFERRED | 1 |
| VERIFIED | 44 |
| Other | 1 |
| **Total** | **68** |

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

M2-004, M3-003, M4-003, M4-004, M6-001, M6-002, M6-004, M8-003, M8-004, M9-001, M9-002, M9-003, M9-004, M10A-001, M10B-001, M11-001.

M6-003 is verified with M1-003: the same unambiguous-match rule covers restaurant submit and the search location field. Live Geoapify accuracy stays blocked under M9-002. M8-002 is verified with M1-002: optional certificate fields are labeled, and the required hechsher is no longer inside the optional certificate block.

Classification of those 36 issues: **4 confirmed bugs**, **12 risks**, **12 improvement or readiness items**, **8 already working**. Confirmed bugs are M1-001, M2-002, M4-001, and the token-ordering defect inside M5-002. Details and evidence are in `AUDIT_FINDINGS.md`.

Blocked and deferred issues are not counted as verified. The sentence above is the audit classification; current statuses are in the tables.

QA-001 and QA-002 were found on 12 October 2026 while checking `feature/qa-testing` at `54d9605`. They are not part of the original 36. Both are verified. That earlier batch did not start LATER work; the explicit Agent 1 request on 13 October authorizes the assigned integrity follow-ups below.

## Milestone index

| ID | Milestone | Priority | Status | Class |
| --- | --- | --- | --- | --- |
| EP-001 | Email/password recovery (explicit request) | High | VERIFIED | Delivery/templates |
| EP-002 | Email/password recovery (explicit request) | High | VERIFIED | Recovery and notification safety |
| EP-003 | Email/password recovery (explicit request) | High | VERIFIED | Localized recovery UX and token privacy |
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
| MAP-001 | Dedicated map tiles fix | High | VERIFIED | Blocked upstream tiles (implementation verified; live rendering pending) |
| M4-002 | 4 Authentication and security | High | ALREADY WORKING | Already implemented |
| M4-003 | 4 Authentication and security | High | NOT STARTED | Security risk |
| M4-004 | 4 Authentication and security | High | DEFERRED | Security risk |
| M5-001 | 5 Database integrity | High | VERIFIED | Reliability risk |
| M5-002 | 5 Database integrity | High | VERIFIED | Confirmed bug and reliability risk |
| M5-003 | 5 Database integrity | High | VERIFIED | Reliability risk |
| M5-004 | 5 Database integrity | High | VERIFIED | Reliability risk |
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
| M9-004 | 9 External integrations | High before launch | VERIFIED | Authorized live Gmail recovery/delivery/browser checks |
| M10A-001 | 10A Core end-to-end testing | High before launch | NOT STARTED | Test gap |
| M10B-001 | 10B Submission and admin end-to-end testing | High before launch | NOT STARTED | Test gap |
| M11-001 | 11 Documentation and production readiness | High before launch | NOT STARTED | Readiness gap |
| A1-001 / SEC-002 | Agent 1 admin/data integrity | P1 | VERIFIED | Admin submission separation |
| A1-002 / SEC-001 | Agent 1 admin/data integrity | P1 | VERIFIED | Atomic corrections/awards |
| A1-R1 / SEC-010 | Agent 1 admin/data integrity | P1 | VERIFIED | Atomic cascades/creation |
| A1-R2 | Agent 1 admin/data integrity | P1 | VERIFIED | Atomic rejection |
| A1-R4 | Agent 1 admin/data integrity | P1 | VERIFIED | Unique-index enforcement |

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

- **Current Agent 1 follow-up:** A1-002 / SEC-001 (b106482) replaces claim/reopen compensation with atomic correction/report/award. Four real MongoDB regressions pass, including premature retry awards, award rollback, idempotency/ADMIN zero points and abrupt worker death/recovery. Older evidence/verification above are historical. Existing inconsistent records need an approved data review.

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
- **Status:** VERIFIED
- **Description (original audit; superseded by follow-up below):** Deleting a restaurant deletes its certificates and reports, then tries to delete Cloudinary images. Points already awarded stay. The writes are sequential and not one transaction. The user's submission list loses those rows because it queries the live documents.
- **Original audit evidence:** `deleteRestaurantService` loads image ids, `deleteTeudotOfRestaurantRepo`, `deleteReportsOfRestaurantRepo`, `deleteRestaurantByIdRepo`, then `deleteImageService` per id. `pointsService` never subtracts points. `listMyRestaurantsRepo` filters `submittedBy` with no tombstone. The UI uses `window.confirm` before calling delete.
- **Root cause:** Deletion was specified as a permanent cascade implemented as separate commands. Image deletion is best-effort (M5-004).
- **Relevant files/functions:** `backend/src/services/adminRestaurantService.js` (`deleteRestaurantService`); `backend/src/repositories/adminTeudaRepository.js`; `backend/src/repositories/adminReportRepository.js`; `frontend/src/pages/AdminRestaurantPage.tsx` (`handleDelete`).
- **Planned solution:** Perform the three database deletes in one transaction when a replica set is available, or document a compensating order and test it. Delete images after the database commit, and record failures for a retry (M5-004). Keep points. Ask before adding tombstones that change what users see in submission history.
- **Historical files changed:** none; see current follow-up
- **Historical tests added or modified:** none. Existing unit tests mock the repositories.
- **Historical verification:** Static inspection only.
- **Historical blockers (current limits below):** A transaction test needs an approved isolated replica set. Do not run this against a shared or production database.

- **Current verified follow-up/files/tests/verification/limitations:** A1-R1 / SEC-010 (351f9d6) now commits cascades and cleanup jobs atomically, serializes concurrent children and retains points. Targeted 117 / full 510 backend tests and 7 real isolated MongoDB regressions pass (exit 0); external SDK mocked. Replica set and approved cleanup index provisioning required. No tombstones/status changes.

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

- **Current Agent 1 follow-up:** Creation compensation is replaced by a transaction in A1-R1 (351f9d6); rejection is atomic in A1-R2 (6faa1a2); report correction/outcome/award is atomic in A1-002 (b106482). Earlier description, files, verification and separate-write blockers above are historical. Password-reset behavior was outside Agent 1 scope and preserved. No packages/backfill.

### M5-003 — Duplicate handling and indexes

- **Milestone:** 5
- **Priority:** High
- **Status:** VERIFIED
- **Description (original audit; superseded by follow-up below):** Duplicate restaurants are a warning, not a unique constraint. Two overlapping submits can both pass the pending check and both insert. Email and reset-token hash are unique.
- **Original audit evidence:** `findPendingRestaurantBySubmitterRepo` runs before `createRestaurantRepo`. There is no unique index on name plus address. `Restaurant` indexes `nameNormalized`, `addressNormalized`, `phoneNormalized`, and sparse `geoapifyPlaceId`, none unique. `findPossibleDuplicatesService` stores at most 10 warnings and never blocks. `User.email` is unique. `PasswordResetToken.tokenHash` is unique. A double click is reduced by disabling the submit button after `setLoading(true)`, which does not cover two browsers.
- **Root cause:** The product rule is "warn, do not block", implemented as a read-then-insert.
- **Relevant files/functions:** `backend/src/services/duplicateService.js`; `backend/src/services/restaurantSubmissionService.js`; `backend/src/models/Restaurant.js`; `backend/src/repositories/restaurantRepository.js`.
- **Planned solution:** Keep non-blocking duplicate warnings. Close the same-user pending race with a unique partial index on submitter plus normalized name and address for `PENDING` only, if that matches the existing 409 rule, and confirm it does not reject two different pending restaurants. Ask before any unique index that would block the public from submitting a similar place.
- **Historical files changed:** none; see current follow-up
- **Historical tests added or modified:** none
- **Historical verification:** Static inspection only. The index build was not run.
- **Historical blockers (current limits below):** A new unique index needs a compatibility check against existing pending rows. Do not build it on a production cluster from this work without approval.

- **Current verified follow-up/files/tests/verification/limitations:** Existing pending-identity indexes at baseline dc5dc24 now receive read-only actual-enforcement verification at startup under A1-R4. Four isolated MongoDB regressions pass (exit 0), including actual duplicate rejection for all model identities and missing/incompatible indexes. Pending report legacy rows without fingerprint remain outside their partial index; no backfill. Application indexes require separately approved provisioning.

### M5-004 — External cleanup reliability

- **Milestone:** 5
- **Priority:** High
- **Status:** VERIFIED
- **Description (original audit; superseded by follow-up below):** Cloudinary deletes log the error and continue. A failed delete after a successful database delete leaves an orphan image. A failed delete during a failed save can do the same.
- **Original audit evidence:** `deleteImageService` returns immediately when the id is missing or Cloudinary is not configured. On `destroy` failure it `console.error`s and does not throw. Callers in restaurant submit, teuda submit, report submit, admin delete, and admin teuda delete rely on that. There is no retry queue or orphan record.
- **Root cause:** Cleanup is deliberately non-blocking so the user sees the original error. Nothing records the leftover `public_id` for another attempt.
- **Relevant files/functions:** `backend/src/services/imageUploadService.js` (`deleteImageService`); callers in `restaurantSubmissionService.js`, `teudaSubmissionService.js`, `reportSubmissionService.js`, `adminRestaurantService.js`, `adminTeudaService.js`.
- **Planned solution:** Persist the public id of a failed destroy and retry it from an admin or scheduled path. Do not call live Cloudinary while designing this. Do not delete remote files as part of the audit or as an unapproved cleanup.
- **Historical files changed:** none; see current follow-up
- **Historical tests added or modified:** none. `imageUpload.test.js` mocks the SDK.
- **Historical verification:** Static inspection only.
- **Historical blockers (current limits below):** Retry execution against Cloudinary needs approved test credentials (M9-003).

- **Current verified follow-up/files/tests/verification/limitations:** A1-R1 (351f9d6) adds persistent ImageCleanup jobs, explicit deletion outcomes and an operator retry command. Seven real MongoDB tests cover jobs/rollback/external failure/acknowledgement retry (Cloudinary SDK mocked), exit 0. Live Cloudinary remains M9-003. Upload-before-durable-record crash window and unavailable-database compensation require provider/operator reconciliation.

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

### M9-004 — Live email delivery (Gmail; historically Resend)

**Agent 4 FINAL LIVE VERIFICATION — 13 October 2026:** VERIFIED within authorized Gmail/reset/password-changed scope. Actual dedicated local DB empty before one regular browser-created USER/zero points, no admin/copied data/original DB access. Actual frontend/Express/MongoDB/Chrome/Gmail (no mocks). Browser reset request/success, initial/baseline old login, post-reset old rejection/new login, JWT invalidation/local login clearing, actual used-link browser/API rejection, hash-only storage/~60-minute unused expiry and mismatch/weak/malformed/unknown errors passed. User confirmed five reset emails and specifically latest changed notification in Inbox; latest reset/changed SMTP accepted. Combined 33 passing checks. Harness cwd/ESM observer/timestamp/same-document-language issues caused exit-1 interruptions and extra authorized mail; same single account preserved, no application defect/source changes. Main final run passed core then failed extra Hebrew check; display-only retry exit 0, finalization exit 0. Seven observed acceptances across runs (four reset/three changed) plus first unobserved reset, not two emails total; not every extra notification delivery confirmed. Exact command/exit/evidence in EMAIL_PASSWORD_MILESTONE_PROGRESS.md. All app/browser processes stopped; encrypted password checkpoint removed, isolated DB retains one USER, three consumed/zero unused tokens. Actual elapsed expiry/concurrency/TTL, moderation email, email-client link click/rendering remain untested. No secret output/screenshots/commit or merge/push/deploy.

**Agent 4 authorized live run — 13 October 2026:** Status now IN PROGRESS. User approved dedicated recipient, one USER creation, reset/changed email and password/login/reuse testing. Emptiness rechecked before actual browser registration; exactly one regular USER/zero points, initial and known-baseline browser login passed. Real app/backend/MongoDB/Gmail, no fixtures or mocked transport. Latest actual reset SMTP acceptance/hash-only token/unused ~60-minute expiry passed; inbox confirmation gate pending. Main reset/reuse/new-old login/changed notification pending. Harness-only cwd/CommonJS-vs-ESM observer/exact timestamp errors corrected; extra recovery emails sent on the same account, no application defect/source edits. Ignored sanitized results/private Windows-DPAPI state, no screenshots/secret output. Detailed active session 57022/gate instructions in EMAIL_PASSWORD_MILESTONE_PROGRESS.md. No original database/admin/copy/merge/push/deploy.

**Agent 4 approved database isolation verified — 13 October 2026:** User approved exact dedicated local URI/worktree configuration and one regular USER once email supplied; mail/reset/password tests await separate permission. Only testing worktree ignored backend/.env MONGODB_URI applied. Sanitized helper command restricted exit 1/configuration-stage failure, expanded-permission retry exit 0. Read-only check: approved database kosherradar_email_e2e_20261013_agent4 at 127.0.0.1:27017, zero collections/documents before and after actual backend startup. Live server mongoose connection host/name inspected; health HTTP 200/database connected. autoCreate/autoIndex disabled in verification process to prevent schema writes; backend then stopped. Original app environment/database untouched; no records/account/token/email/password operations. Isolation/current emptiness now VERIFIED as a subcheck; M9-004 overall remains BLOCKED pending recipient/final live-send/password/login authorization. Recheck emptiness before account creation and stop/ask if populated. Detailed evidence and next step in EMAIL_PASSWORD_MILESTONE_PROGRESS.md; no source/test/dependency changes, no merge/push/deploy.

**Agent 4 database isolation review — 13 October 2026:** Sanitized app-loader inspection exit 0: host 127.0.0.1:27017, database kosherradar. This is the original application's configured target, not an independently isolated email-test database; treat as application data. No DB connection/query/write or secret output. Proposed NOT APPLIED local target kosherradar_email_e2e_20261013_agent4 on the same loopback server; verify target/freshness before any authorized writes, use a different unique name if populated. Existing app registration creates regular USER/bcrypt password/zero points without signup email; fresh account creation awaits explicit permission. No code defect/fix/test changes. M9-004 stays BLOCKED for database/account/live-send/password/login authorization. Handoff and rollback in EMAIL_PASSWORD_MILESTONE_PROGRESS.md; prior actual SMTP authentication passed, delivery/account flows still unperformed.

**Agent 4 verification — 13 October 2026:** User resumed Phases 1/2 on test/email-verification at 1fa1c54. Missing ignored env/dependency copies restored from original checkout, source lockfile hashes match. Sanitized config passes; origins match. Non-sending Nodemailer verify first exit 1 / sandbox EDNS, expanded-network retry exit 0 / SMTP_VERIFY_PASSED. Actual Gmail connection/authentication now passed; no email/recipient acceptance/inbox test. Backend npm test exit 0 / 42 files / 534 mocks with live-service credentials disabled/non-listening DB URI. Frontend npm test retry exit 0 / 27 files / 170 tests after sandbox EPERM; lint/typecheck/build exit 0, existing bundle/jsdom warnings. Frontend startup/HTTP 200 confirmed, then stopped. Backend startup deferred pending database isolation (loopback listener alone insufficient). No live account/reset/reuse/login/password-change-notification checks or database operations. No confirmed code defect, new tests or source edits. M9-004 stays BLOCKED pending dedicated recipient, send/password/login authorization and isolated local database/account permission. Tracking docs updated only; current evidence/handoff in EMAIL_PASSWORD_MILESTONE_PROGRESS.md; historical notes below preserved. No merge/push/deployment.

**13 October follow-up (user postponed live testing):** Sanitized application preflight recognizes local Gmail credentials as configured/format-valid; required backend configuration passes. Non-sending Nodemailer verify exited 1 / EDNS under restricted network access, so SMTP authentication/connection remain unverified; no retry after postponement and no conclusion that credentials are invalid. Loopback MongoDB TCP listener exists; database authentication/isolation not checked, no app services started. No approved recipient/account, email, password change, token generation or database read/write. Actual delivery, live browser recovery/login, token reuse rejection and password-changed notification remain pending. Status stays BLOCKED; no verified counts change. Documentation-only follow-up; exact resumption steps in EMAIL_PASSWORD_MILESTONE_PROGRESS.md. Historical automated results below were not rerun.

- **Milestone:** 9
- **Priority:** High before launch
- **Status:** VERIFIED
- **Description:** Authorized real Gmail recovery delivery, browser password reset/login/session invalidation and single-use token checks passed against the dedicated isolated local database. EP-001 replaced historical Resend REST with Gmail/Nodemailer at the user's explicit request. SENT means SMTP acceptance; recipient separately confirmed reset delivery and latest changed notification Inbox receipt. A stored reset hash cannot reconstruct the raw token.
- **Evidence:** Original 12 October audit: emailService.js used Resend, tests mocked fetch, and .env.example documented Resend sandbox restrictions. Current 13 October evidence: emailTransport.js uses Gmail and EMAIL_USER/EMAIL_APP_PASSWORD, tests mock Nodemailer; four bilingual templates and safe diagnostics are covered by EP-001 through EP-003. No live SMTP/inbox test occurred.
- **Root cause:** Previously no approved isolated live-mail resources/recipient. Dedicated loopback database, one regular USER and recipient/send/password authorization supplied for this live verification; Resend configuration no longer needed.
- **Relevant files/functions:** backend/src/services/emailService.js, emailTransport.js, emailTemplates.js, passwordResetService.js, moderationNotificationService.js; EMAIL_SETUP.md.
- **Planned solution:** Completed user-authorized reset/password-changed sends and recipient confirmation, actual browser reset/new-old login and used-link rejection on isolated stack. Historical rejection-email live test was outside this authorization and remains untested; no other real user contacted.
- **Files changed:** Provider/template/security changes tracked under EP-001 through EP-003; this entry records the current live-verification boundary and preserves original audit evidence.
- **Tests added or modified:** See EP entries for mocked verification.
- **Verification:** Live combined 33 checks plus recipient reset/latest changed Inbox confirmations; final display-only and metadata-finalization commands exit 0. Main core checks passed before extra-display harness failure; earlier harness exit-1 interruptions/extra emails documented above and in milestone progress. Phase 1 backend npm test exit 0 / 534 in 42 files; frontend npm test exit 0 / 170 in 27 files, lint/typecheck/build exit 0 (existing warnings). No source changed; no rerun needed. Mock suites distinct from real browser/Gmail/database evidence.
- **Blockers/limitations:** No blocker remains for authorized recovery scope. Native-speaker Hebrew review, actual elapsed expiry/concurrency/TTL/index verification, mail-client rendering/link click and approval/rejection live delivery remain outside this run. No production access or merge/push/deploy authorized. Test account/token records retained; cleanup requires separate authorization.

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

### EP-003 — Localized V2 recovery and token privacy

- **Milestone:** Email/password recovery, 13 October 2026.
- **Priority:** High.
- **Status:** VERIFIED.
- **Evidence/root cause:** Forgot page displayed English API success text in Hebrew mode; reset page retained query token in URL, used generic English server failures and did not clear the existing local login. Recovery panels did not match the accepted login panel. No component tests covered these forms.
- **Relevant files/solution:** Recovery pages, auth API/error helpers, locale/reset-token utilities and index.html; fragment links prevent new tokens reaching frontend HTTP logs; same-origin validated legacy query links retained. Remove token from URL into component memory, no referrers, localized success/errors, explicit expired-link/retry paths, busy feedback, password validation/show-hide, clear current login after successful reset, accepted V2 form styling. No redesign of other pages.
- **Files changed:** Those frontend files; PasswordRecovery.test.tsx/resetToken.test.ts; backend reset-link builder/template validation and corresponding tests; README.md, EMAIL_SETUP.md, scripts/reviewPasswordRecovery.mjs and tracking docs.
- **Tests:** 11 component scenarios (parameterized to 11 executions) plus 3 reset-token tests cover EN/HE, pending requests, errors, retries, successful/failed reset, mismatch/byte bound, URL cleanup, current-login clear, expired/malformed links and language switching. Template tests accept new fragment/legacy links. Existing security tests preserved.
- **Verification:** `cd frontend; npm test -- src/pages/PasswordRecovery.test.tsx src/utils/resetToken.test.ts` exit 0 / 2 files / 14 tests. Full frontend `npm test` exit 0 / 27 files / 170 tests. `npm run lint`, `npm run typecheck`, `npm run build` all exit 0; production JS 769.34 kB, existing >500 kB warning. Full backend `npm test` exit 0 / 42 files / 534 tests. Backend has no build/lint/typecheck scripts. `git -c core.whitespace=cr-at-eol diff --check` exit 0.
- **Browser:** `node scripts/reviewPasswordRecovery.mjs` exit 0, production build plus intercepted API fixtures, installed Chrome; English/Hebrew at 375/768/1024/1280, 88 renders across 8 journeys. Loading, neutral confirmation, repeat request, rate/offline feedback, show/hide, mismatch, invalid/expired links, fragment/legacy cleanup, reset success and navigation to login passed; zero app exceptions, horizontal overflow or outgoing referrer headers. Screenshots visually inspected. Local ignored evidence: design-screenshots/email-password/results.json and PNGs. First sandbox attempt timed out before Page.enable; expanded process permissions resolved it. Explicit viewport clipping corrected Chrome's full-page RTL screenshot offset; application unchanged.
- **Limitations:** Live Gmail and real database behavior not tested. No real login with a newly saved password in browser; API responses are fixtures. Hebrew needs native review M8-004. Token is intentionally lost on refresh of cleaned URL; reopen email. Legacy query URLs can still enter host access logs on their initial request; newly generated fragments cannot. No analytics exist today; future scripts must exclude recovery tokens. EP-002 crash/queue/concurrency limitations remain. Native devices/email-client rendering not tested.

### EP-002 — Recovery privacy and saved-decision notifications

- **Milestone:** Email/password recovery, 13 October 2026.
- **Priority:** High.
- **Status:** VERIFIED.
- **Evidence/root cause:** forgotPasswordController awaited account lookup/token writes and said mail was sent; no confirmation/approval notifications. resetPasswordService threw if cleanup failed after password save. Shared new-password validation limited characters, not bcrypt's UTF-8 byte length.
- **Relevant files/solution:** Auth controller/routes/schemas, reset service, moderation notification service, restaurant/certificate approval services. Return neutral response without awaiting account processing; sanitize detached failures, no-store recovery responses, enforce 72 UTF-8 bytes, keep existing 60-minute hashed random tokens, atomic consume/release and tokenVersion invalidation. Best-effort password-changed email and cleanup. Approval mail only for winning PENDING transition, skip admins and retries; public rejection data only. Points/authority rules unchanged.
- **Files changed:** Those backend files; emailTemplates.js (Hebrew report grammar); passwordResetService/RoutesHttp, adminRestaurant/Teuda test files; new passwordResetRepository.test.js and moderationNotificationService.test.js; tracking notes.
- **Tests:** Route response parity for known/unknown/processing failure; response while lookup pending; actual five-per-IP limiter; bcrypt multibyte bound; atomic expiration/unused filter; modeled concurrent winner; confirmation and saved-approval delivery failures; no repeated approval mail. Existing JWT/session tests retained. Updated cleanup-failure expectation because saved passwords now correctly report success; retained failed-write release assertions.
- **Verification:** targeted eight-file run exit 0 / 94 tests; expanded routes exit 0 / 10 tests; full `cd backend; npm test` exit 0 / 42 files / 534 tests. Gmail/database mocked, local HTTP used. Backend has no build/lint/typecheck scripts. Frontend/browser pending EP-003.
- **Limitations:** In-process background recovery can be lost on process termination (no durable queue). IP limiter is single-process memory; distributed/email-wide throttling is not implemented. MongoDB atomic filter is inspected/mocked, not verified on a live database. Crash between token consumption and save can still burn a link; release failure also can. Concurrent issuance of distinct links is not serialized. Delivery has no durable retry/outbox, intentionally avoids duplicate retries. No migrations/backfills or auth-storage change.

### EP-001 — Gmail transport and branded bilingual email

- **Milestone:** Email/password recovery, explicitly authorized 13 October 2026.
- **Priority:** High.
- **Status:** VERIFIED.
- **Evidence/root cause:** Verified main dc5dc24 uses Resend REST, has no Nodemailer, and renders English plain text only; request explicitly requires Gmail/Nodemailer and bilingual HTML/text. Existing transport logs provider response text that could expose sensitive content.
- **Relevant files/planned solution:** emailService.js/env.js; separate Gmail transport, safe templates and caller-compatible services.
- **Files changed:** backend/src/services/emailTransport.js, emailTemplates.js, emailService.js, config/env.js, backend/.env.example, backend/package.json/package-lock.json, backend/tests/emailService.test.js, EMAIL_SETUP.md and tracking documents.
- **Tests:** Replaced outdated Resend-specific assertions because the explicitly requested provider is now Gmail. Preserved original missing config, successful/failed delivery, public reason, kind and reset content scenarios; expanded escaping, Hebrew, trusted links, recipient acceptance and secret-free diagnostics.
- **Verification:** `cd backend; npm test -- tests/emailService.test.js` exit 0, 1 file / 22 tests passed. Gmail fully mocked; no real mail/database. No backend build/lint/typecheck scripts; frontend unchanged in this fix. Full milestone checks/browser pending EP-003.
- **Limitations:** SMTP acceptance is not inbox delivery; Gmail credentials/live test not used. Hebrew copy needs native-speaker review M8-004. No migration/backfill; provider request overrides historical Resend requirements without modifying PROJECT_SPEC.md. Historical M9-004 evidence remains Resend-specific; live Gmail is equally unverified.

### MAP-001 — Replace blocked OpenStreetMap volunteer tiles

- **Milestone:** Dedicated map tiles fix (explicit user request).
- **Priority:** High.
- **Status:** VERIFIED.
- **Description/evidence:** User reports OSM policy-block tile images. `RestaurantMap` hard-coded OSM volunteer subdomain tiles through `mapChrome.ts`.
- **Root cause:** Access denied by the upstream basemap service; exact enforcement trigger cannot be established from repository evidence. Restaurant data fetching is separate.
- **Relevant files/functions:** `RestaurantMap`, `mapChrome`, `mapTiles`, frontend environment and README setup.
- **Planned solution:** Geoapify osm-carto raster tiles, separate public origin-restricted browser key; preserve backend private geocoding key and existing Leaflet behavior. No blocked-server fallback.
- **Files changed:** `frontend/src/components/RestaurantMap.tsx` and new `RestaurantMap.test.tsx`, `frontend/src/components/map/mapChrome.ts`, `mapChrome.test.ts`, new `mapTiles.ts`/`mapTiles.test.ts`, locale files, `frontend/.env.example`, `README.md`, this file, `PROGRESS.md`, `MAP_TILES_FIX_PROGRESS.md`.
- **Tests added/modified:** Replace obsolete hard-coded OSM assertion with missing-key, encoding, Geoapify URL, zoom and attribution tests. Marker/panel behavior tests retained.
- **Verification:** `cd frontend; npm ci --no-audit --no-fund` exit 0 (existing lockfile, 142 packages). Final `npm test` exit 0, 28 files / 166 tests; `npm run lint`, `npm run typecheck`, `npm run build` each exit 0. Build JS 767.42 kB; existing >500 kB warning. Initial attempts exited 1 due to missing dependencies; intermediate component test/typecheck failures were incorrect synthetic fixture fields and absent jsdom dimensions, corrected without changing application behavior or weakening assertions. Real Leaflet rendered in jsdom, bounds API mocked, clustering wrapper mocked; tile URLs/attribution, marker selection and bilingual missing-key behavior pass. Backend unchanged/not tested; browser/live integration not tested.
- **Blockers/limitations:** No real env files read; public map key availability unconfirmed. No live tiles/browser verified. New Hebrew notice needs native-speaker review (M8-004). No new dependencies/backend changes.

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
## Agent 1 admin authority and data integrity — 13 October 2026

Explicit request authorizes this assigned batch, including the listed historical LATER integrity risks.

### A1-001 / SEC-002 — Administrator public submissions
- **Milestone:** Agent 1 admin authority and data integrity.
- **Priority:** P1.
- **Status:** VERIFIED.
- **Evidence/root cause:** Both public endpoints accept ADMIN; services hardcode PENDING. Existing restaurant test explicitly expects that obsolete behavior.
- **Relevant files/solution:** Public routes and services reject ADMIN before upload/persistence; navigation and bookmarked forms redirect to existing full-validation admin forms. USER moderation preserved.
- **Files changed:** userSubmissionMiddleware, public submission services/routes, Navbar, RestaurantActions, App, UserSubmissionRoute and regression tests; isolated runner/authority integration test.
- **Tests:** Replace obsolete ADMIN-PENDING expectation because the explicit business requirements prohibit it; retain ordinary-user/admin validation/zero-point cases.
- **Verification:** Backend targeted npm test (4 files / 88 tests), HTTP npm test (1 file / 2 tests), frontend npm test -- src/components/UserSubmissionRoute.test.tsx (4 tests), npm run lint/typecheck/build, disposable database node integration/runAgent1Isolated.mjs --run-isolated (1 real MongoDB test): all exit 0. Existing ~767 kB build warning. Backend has no build/lint/typecheck scripts. Browser not run; external services not called. First isolated test failed because assertion used contributionPoints instead of actual points; corrected test field and rerun passed. Sandbox cache/listener restrictions required approved escalated check runs.
- **Blockers/limitations:** No browser/live-service verification. No Hebrew strings changed.

### A1-002 / SEC-001 — Premature correction awards
- **Milestone:** Agent 1 admin authority and data integrity.
- **Priority:** P1.
- **Status:** VERIFIED.
- **Evidence/root cause:** RESOLVED/correctionApplied is written before proposal application; concurrent retry/process interruption can award prematurely.
- **Relevant files/solution:** Investigate adminReportService, adminReportRepository, pointsService and existing database/test infrastructure for atomic completion/recovery.
- **Files changed/tests/verification:** Transaction helper/report service; unit abort expectation updated; real MongoDB concurrency/rollback tests added. Baseline exit 1: 1 pass / 2 fail, reproducing premature +1 and partial state. npm test -- tests/adminReportService.test.js tests/pointsService.test.js tests/transaction.test.js: exit 0, 3 files / 34 tests. node integration/runAgent1Isolated.mjs --run-isolated agent1Corrections.integration.mjs: exit 0, 4 real MongoDB tests including concurrent failure, concurrent success/idempotency/ADMIN zero points, award rollback/retry and abrupt worker termination/recovery. Browser/frontend not rerun for this backend-only fix; backend has no build/lint/typecheck scripts. No external services.
- **Blockers/limitations:** Requires a replica-set/sharded deployment; explicit 503 on standalone. No migration/backfill. Historical inconsistencies need separately approved data review; no live Atlas tested.

Only post-merge documentation files updated: this file, PROGRESS.md, REDESIGN_INTEGRATION_PROGRESS.md. Main's untracked PRE_PUSH_REVIEW.md preserved unchanged and excluded from commit. No source branch/worktree edit, push, deploy, branch/worktree deletion, reset or clean. Exact next step: stop; accepted local merge complete.

### A1-R1 / SEC-010 — Partial database deletion and creation compensation
- **Milestone:** Agent 1 admin authority and data integrity.
- **Priority:** P1.
- **Status:** VERIFIED.
- **Evidence/root cause:** Separate database writes and best-effort compensation (M5-001/M5-002).
- **Relevant files/solution:** Investigate adminRestaurantService, adminTeudaService, restaurantSubmissionService; separate database atomicity from external cleanup.
- **Files changed/tests/verification:** Atomic creation/cascade services, internal parent serialization counter/repository, durable ImageCleanup outbox/repository/service, retry operator script and real failure-injection regressions. Baseline exit 1, 0 pass / 3 fail. Targeted npm test: exit 0, 7 files / 117 tests. Full backend npm test with services disabled: exit 0, 42 files / 510 tests. node integration/runAgent1Isolated.mjs --run-isolated agent1Integrity.integration.mjs: exit 0, 7 real MongoDB tests covering cascade/unlink/final-delete rollback, cleanup outbox rollback, mocked external failure/acknowledgement loss/retry, concurrent parent/child and certificate/report races, USER/ADMIN creation failures. Diff check exit 0. Frontend/browser not rerun (backend-only); backend has no build/lint/typecheck scripts. Cloudinary SDK mocked; no live services.
- **Blockers/limitations:** Replica set/sharded MongoDB required. Additive internal counter/outbox collection, no record migration/backfill. Cloudinary live behavior unverified; upload-to-durable-record interruption window requires provider/operator reconciliation. Unknown commit retains image; unreachable DB compensation logs id. No existing application data touched.

### A1-R2 — Pending certificates after rejection
- **Milestone:** Agent 1 admin authority and data integrity.
- **Priority:** P1.
- **Status:** VERIFIED.
- **Evidence/root cause:** Restaurant rejection precedes best-effort certificate rejection.
- **Relevant files/solution:** Investigate adminRestaurantService/repositories for atomic or retryable behavior.
- **Files changed/tests/verification:** adminRestaurantService rejection transaction; unit failure expectation updated; isolated rejection/race regression. Baseline exit 1, 1 pass / 1 fail. npm test -- tests/adminRestaurantService.test.js: exit 0, 23 tests. node integration/runAgent1Isolated.mjs --run-isolated agent1Rejection.integration.mjs: exit 0, 2 real MongoDB failure/retry and concurrent approve/reject regressions. Diff check exit 0. No build/lint/typecheck scripts in backend; frontend/browser not rerun; email unconfigured, no real email sent.
- **Blockers/limitations:** Replica-set/sharded MongoDB required; old inconsistent rejected records need separately authorized review/backfill. Notifications run only after commit; live delivery unverified.

### A1-R4 — Unique-index enforcement
- **Milestone:** Agent 1 admin authority and data integrity.
- **Priority:** P1.
- **Status:** VERIFIED.
- **Evidence/root cause:** connectDb previously accepted requests before index builds completed and did not check actual enforcement. Mongoose autoIndex default was relied on.
- **Relevant files/solution:** Review models, database initialization, isolated harnesses; no application-data index migration.
- **Files changed/tests/verification:** db startup, indexIntegrityRepository, verification/provisioning operator scripts and isolated index tests. node integration/runAgent1Isolated.mjs --run-isolated agent1Indexes.integration.mjs: exit 0, 3 real MongoDB tests (missing indexes/no startup writes, actual duplicate enforcement across all models, incompatible nonunique index). Final backend npm test: exit 0, 42 files / 510 tests. Frontend npm test: exit 0, 27 files / 162 tests; lint/typecheck/build exit 0. Combined isolated database run: exit 0, 18 tests. Final index script rerun: exit 0, 4 tests including explicit provision/verify/no-flag paths, geospatial/TTL declarations and wrong partial filter. Diff check exit 0. Browser not run; external SDK mocked.
- **Blockers/limitations:** Existing application database untouched; missing indexes/new cleanup collection require operator-approved provisioning before deployment. Legacy report rows without fingerprint stay outside partial index; no backfill.

Only post-merge documentation files updated: this file, PROGRESS.md, REDESIGN_INTEGRATION_PROGRESS.md. Main's untracked PRE_PUSH_REVIEW.md preserved unchanged and excluded from commit. No source branch/worktree edit, push, deploy, branch/worktree deletion, reset or clean. Exact next step: stop; accepted local merge complete.
## Search and location reliability ? Agent 2, 13 October 2026

Explicit user assignment supersedes historical stop instructions for this worktree. Original audit statuses unchanged; nine assigned SEARCH issues added. All nine code fixes verified with mocks, subject to documented live rollout limits.

Final batch: frontend npm test exit 0 (30 files / 174 passed); npm run lint, npm run typecheck, npm run build exit 0. Production JS 768.71 kB, existing >500 kB warning. Backend npm test exit 0 (42 files / 534 passed); no backend lint/typecheck/build scripts. Final completeness follow-up: backend npm test -- tests/restaurantSearchService.test.js tests/restaurantSearchRepository.test.js tests/mapSearchService.test.js exit 0 (57 passed). Git CRLF-aware diff check exit 0. Tests mocked/jsdom; browser and live services not tested.

### SEARCH-001 ? Out-of-order location lookups

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1.
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
- **Priority:** P1.
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
- **Priority:** P1.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** alphabetical limit/slice before shared kashrut filtering and distance/relevance ranking.
- **Relevant files/functions:** restaurantSearchRepository.load candidates; restaurantSearchService.loadMatches, list/map; Restaurant indexes.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** restaurantSearchRepository.js, restaurantSearchService.js, constants.js, Restaurant.js, search repository/service/map tests.
- **Tests added or modified:** late eligible/nearest candidates beyond 2000, stable pages, map filtering beyond 500, keyset/deadline, Atlas overflow with zero eligible results. Old cap expectation intentionally changed because preliminary truncation is the confirmed defect; map output cap remains.
- **Verification:** backend npm test -- tests/restaurantSearchService.test.js tests/restaurantSearchRepository.test.js tests/mapSearchService.test.js exit 0, 3 files/57 passed. node --check service exit 0. Backend has no build/lint/typecheck. Mocks only; no live DB/Atlas/browser.
- **Blockers/limitations:** All candidates read in 2000-row keyset batches, certificates fetched per batch, best K retained; memory O(batch + page*20), total cost O(matching candidates), each DB query maxTimeMS 10000. Added nonunique status/_id index: compatible with existing records, no migration/backfill; not applied live; rollback removes this new index declaration/index. Atlas fuzzy hits remain bounded at 100 with overflow detection and truthful capped/completeness reasons; totals then lower bounds. Atlas fallback also marks completeness false with atlas_unavailable. Map caps only final ranked markers. Pagination deterministic for unchanged data; concurrent edits are not snapshot-isolated. Production performance/index compatibility unverified.

### SEARCH-005 ? Missing zero-result completeness warning

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P2.
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
- **Priority:** P2.
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
- **Priority:** P2.
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
- **Priority:** P2.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** public geocode shared building-only selector while address autocomplete trusted coarse city results; full_match alone did not exclude city result types.
- **Relevant files/functions:** placesService city/coarse classification, public geocode and separate suggestion/address autocomplete; placesController.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** placesService.js, placesController.js, placesService.test.js.
- **Tests added or modified:** public match_by_city/full_match city acceptance versus precise address refusal, autocomplete separation, competing cities ambiguity.
- **Verification:** backend npm test -- tests/placesService.test.js exit 0, 13 passed. Backend has no build/lint/typecheck. Fetch mocked; no live provider accuracy/browser verification.
- **Blockers/limitations:** No live service/data testing authorized.

### SEARCH-009 ? Confidence boundary and competing candidates

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P2.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** binary subtraction makes 1 - 0.8 less than 0.2; filtering competitors before comparing confidence allowed near-tied weaker or coarse matches to disappear.
- **Relevant files/functions:** placesService.selectUnambiguousPlace.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** placesService.js; placesService.test.js.
- **Tests added or modified:** exact gap boundary versus just below; low-confidence/coarse competitors; invalid/unknown confidence.
- **Verification:** backend npm test -- tests/placesService.test.js exit 0, 20 passed. Mocks only; no live accuracy/browser testing. Backend has no build/lint/typecheck.
- **Blockers/limitations:** No live service/data testing authorized.

### SEARCH-010 ? Geoapify request deadlines

- **Milestone:** Agent 2 search/location reliability.
- **Priority:** P1.
- **Status:** VERIFIED
- **Evidence:** Pasted implementation audit; reconcile with baseline dc5dc24.
- **Root cause:** server fetch/body parsing had no deadline and public client location calls inherited Axios timeout 0.
- **Relevant files/functions:** placesService.requestGeoapify; axiosInstance location request interceptor.
- **Planned solution:** Focused compatible fix with mocked regressions.
- **Files changed:** placesService.js/test; axiosInstance.ts; locationDeadline.test.ts.
- **Tests added or modified:** stalled headers/body, aborted signal, deadline cleanup, fake stalled XHR Axios timeout, unchanged upload and explicit longer timeout settings.
- **Verification:** backend npm test -- tests/placesService.test.js exit 0, 23 passed. Frontend npm test -- src/api/locationDeadline.test.ts src/api/axiosInstance.test.ts exit 0, 13 passed; npm run typecheck/lint exit 0. Provider/XHR mocked with controlled timers; no live integration/browser.
- **Blockers/limitations:** Five-second server deadline covers fetch and JSON body, abort plus Promise.race bounds even noncompliant transport. Ten-second client timeout scoped to /places/; uploads unchanged. Live infrastructure timeout behavior unverified.

## Agent 3 assigned reliability fixes (13 October 2026)

### SEARCH-003 - Certificate-photo validation race

- **Milestone:** User-assigned Submission & Application Reliability.
- **Priority:** P1.
- **Status:** VERIFIED.
- **Evidence/root cause:** Five failing baseline hook regressions; photo cleared before signature read and stale results accepted; consumers did not coordinate validation.
- **Solution/files changed:** Versioned pending state, synchronous submit guard, catch read errors, preserve latest valid evidence and block failed replacements; usePhotoField.ts, five photo-consuming submission pages, TeudaFields.tsx, en.ts/he.ts. imageCheck protections unchanged.
- **Tests added:** usePhotoField.test.tsx (7); photoSubmission.test.tsx (5 forms).
- **Actual verification:** focused frontend tests exit 0, 19 passed including existing imageCheck tests. Full suite before final test cleanup exit 0, 28 files/170 passed. Frontend lint/typecheck/build exit 0; existing chunk warning. Backend unchanged.
- **Limitations:** Mocked APIs, no browser/live upload; Hebrew strings need native-speaker review. Details and next task: AGENT_3_FIX_PROGRESS.md.

### A1-003 - Contribution outcome independent of points

- **Milestone:** User-assigned Submission & Application Reliability.
- **Priority:** P2.
- **Status:** VERIFIED.
- **Evidence/root cause:** 3 backend and 2 frontend failing baseline regressions; report projection omitted correctionApplied and UI inferred outcome from awards.
- **Solution/files changed:** Read and expose stored outcome with legacy false default; render independently of awards. userSubmissionsRepository.js, userSubmissionsService.js, MySubmissionsPage.tsx, mySubmissions.ts and locale notice for the existing 50-record limit. Photo Hebrew encoding correction included. No admin correction/points writes or authorization changes.
- **Tests:** qaSubmissionHistory.test.js expanded; userSubmissionsRepository.test.js, userSubmissionsRoutesHttp.test.js, MySubmissionsPage.test.tsx added. Covers applied/admin/failed award, legacy/no-change, authenticated scoping, projection/limit and UI points independence.
- **Verification:** backend focused history command (four files, exact command in AGENT_3_FIX_PROGRESS.md) exit 0, 13 passed. Frontend history/locales/photo form tests exit 0, 11 passed; lint/typecheck/build exit 0, existing chunk warning. Backend has no build/lint/typecheck scripts.
- **Limitations:** Mocked dependencies, loopback HTTP only; no live DB, award write integration or browser. No schema/backfill required. Hebrew notice needs native review.

### SEC-011 - Health endpoint database readiness

- **Milestone:** User-assigned Submission & Application Reliability.
- **Priority:** P2.
- **Status:** VERIFIED.
- **Evidence/root cause:** Legacy handler always returned 200 even for readyState 0; baseline HTTP regression exit 1, 6 failed after behavior-preserving extraction.
- **Solution/files changed:** server.js mounts healthRoutes.js; /api/health and /ready return 503 unless readyState 1; /live provides independent liveness. Safe generic payload, no-store caching; connected legacy shape preserved. README documents semantics.
- **Tests:** healthRoutesHttp.test.js added, 6 cases with loopback HTTP and mocked Mongoose states 0/1/2/3/unknown/recovery.
- **Verification:** focused health tests exit 0, 6 passed; full backend npm test exit 0, 43 files/517 passed. Backend has no build/lint/typecheck scripts. Frontend unchanged for this fix.
- **Limitations:** Readiness checks connection state, not an active query. Startup continues to wait for initial connection. No real database/external integrations.

### APP3-001 - Browser detail-page certificate expiry rollover

- **Milestone:** User-assigned secondary Submission & Application Reliability.
- **Priority:** P2.
- **Status:** VERIFIED.
- **Evidence/root cause:** Loaded details never refreshed merely because Israel calendar date changed. Baseline page tests exit 1, 3 failed/14 passed.
- **Solution/files:** useIsraelDay.ts; RestaurantDetailsPage.tsx and test. Detect day changes every minute/on foreground return and refetch server-derived details; hide stale previous-day evidence and use existing error/retry flow. No public terminology/rules changes.
- **Tests/verification:** Four new page regressions; full frontend npm test exit 0, 29 files/178 passed; lint/typecheck/build exit 0, existing chunk warning. Backend unchanged; no browser/live services tested.
- **Limitations:** Normal timers can delay refresh up to one minute; suspended tabs refresh upon foreground return. Browser clock is only a refresh trigger.

### APP3-002 - Explicit photo clearing and error recovery

- **Milestone:** User-assigned secondary Submission & Application Reliability.
- **Priority:** P2.
- **Status:** VERIFIED.
- **Evidence/root cause:** Invalid/read-failed selection blocked sending but native file inputs offered no consistent explicit clear action. Pending clear also must invalidate asynchronous validation.
- **Solution/files:** Shared PhotoFieldRecovery.tsx and hook clearPhoto; reset file input and invalidate validation without clearing text fields; wired into all five consuming forms. Localized Clear photo selection, disabled only during submission. Submission guard also holds until rendered pending state clears.
- **Tests:** usePhotoField.test.tsx clear case; five additional real form clear-during-validation regressions in photoSubmission.test.tsx.
- **Verification:** final frontend npm test exit 0, 29 files/183 passed; lint/typecheck/build exit 0, existing chunk warning. Backend unchanged since npm test exit 0, 43 files/517 passed. CRLF-aware diff check exit 0.
- **Limitations:** jsdom/mocked APIs; browser and live uploads not tested; Hebrew labels require native review.

Agent 3 final result: all three assigned IDs and two scoped follow-up IDs verified; full commands/results, changed files, checkpoints and integration dependencies in AGENT_3_FIX_PROGRESS.md. No points/classification/auth write changes, schema migrations, dependencies, live services, merges, pushes or deployments.

## Completed-agent integration ? 13 October 2026

### INT-001 - Legacy index bypasses the integrated startup compatibility gate

- **Milestone:** Completed-agent local integration.
- **Priority:** High deployment compatibility.
- **Status:** VERIFIED.
- **Description/evidence:** After merging A1-R4 and SEARCH-007, startup accepts both city-aware and older broader pending indexes; the old constraint still rejects valid cross-city branches. Corrected disposable baseline: index suite exit 1, 6 passed / 1 failed (Missing expected rejection). Initial fixture order failed at building old index after cross-city inserts; moved fixture before those inserts, without deleting records or weakening assertions.
- **Root cause:** Startup checks required schema indexes but not the obsolete constraint; new declarations cannot remove old indexes automatically.
- **Relevant files/functions:** indexIntegrityRepository.assertUniqueIndexesRepo; agent1Indexes.integration.mjs; SEARCH_LOCATION_INDEX_ROLLOUT.md.
- **Planned solution:** Read-only startup rejection of old broader pending unique constraint, identified by keys as well as name; never automatically drop/repair. Update outdated Agent 1 real regressions to the new city-aware definition and add cross-city/concurrent/legacy tests.
- **Files changed:** backend/src/repositories/indexIntegrityRepository.js; backend/integration/agent1Indexes.integration.mjs; tracking/docs.
- **Tests added or modified:** New real MongoDB legacy-index startup gate, normalized same-city concurrency, cross-city acceptance and legacy read/save compatibility; existing weakened-uniqueness/wrong-filter regressions retained against current definition.
- **Verification:** node integration/runAgent1Isolated.mjs --run-isolated agent1Authority.integration.mjs agent1Corrections.integration.mjs agent1Integrity.integration.mjs agent1Rejection.integration.mjs agent1Indexes.integration.mjs: exit 0, 21 real MongoDB tests passed; includes actual rollback/concurrency/crash recovery, zero ADMIN points and all seven index checks. Fresh disposable replica set and validated cleanup only; no live external services. Backend has no build/lint/typecheck scripts. Browser not tested.
- **Blockers/limitations:** Existing database index replacement still requires target/operator approval; none performed.

### SEC-006 / EMAILAUD-001 - Account-level recovery races permit password overwrite

**Main incorporation (13 October 2026):** Explicitly authorized --no-ff merge 2091732 incorporates SEC-006 and UIAUD-001 from verified integration 8a86104 with identical tree/no conflicts. Existing combined checks below remain evidence for unchanged application. No new issue/status change, live service/database or deployment claim. Final main checkpoint/normal push remote equality is confirmed in the promotion report; see latest INTEGRATION_PROGRESS.md entry.

**Current integration verification (13 October 2026):** Source fb31498da640d1686fd669726106093addbff0af incorporated as 4a958dc on integration/p1-security-admin-navigation, based on fetched main 1931d45. Full combined backend `npm test`: exit 0, 684 passed/51 files. Disposable `node integration/runAgent1Isolated.mjs --run-isolated passwordResetConcurrency.integration.mjs passwordResetAudit.integration.mjs`: exit 0, 16 passed/0 failed; new temporary loopback database only, mail disabled. Combined frontend 246 passed/39 files, lint/typecheck/build exit 0. No existing data/index/migration changes or live service verification. Full review and limitations in INTEGRATION_PROGRESS.md; source results below are historical branch evidence. VERIFIED locally, main promotion pending explicit approval.

- **Milestone:** User-assigned SEC-006 password-reset concurrency remediation, 13 October 2026.
- **Priority:** P1; confirmed security defect, now verified in this fix branch; not deployed.
- **Status:** VERIFIED.
- **Description/evidence:** Historical integration diagnostics reproduced concurrent issuance leaving two consumable legacy token rows; the user supplied an independent five-path audit. Before changing application code here, a deterministic real MongoDB regression forced delete/delete/create/create, then distinct-token resets: exit 1, 0 passed/1 failed, two successful account password changes where one was required. The exact regression passes after the fix. Original diagnostic results remain in historical integration documents.
- **Root cause:** Issuance delete/create and redemption consume/unconditional password update/cleanup/release were separate writes. Per-hash consumption and hash uniqueness did not establish account authority, prevent late issuance, or constrain compensation.
- **Relevant files/functions:** User; passwordResetRepository.authorizeResetTokenRepo/resetAuthorizedPasswordRepo; passwordResetService.requestPasswordResetService/resetPasswordService. Legacy PasswordResetToken model retained for compatibility/TTL, unused by recovery. Authentication/JWT version checks preserved.
- **Planned and implemented solution:** Hidden optional current hash/expiry on User identifies the recovery generation. Issuance replaces authority only against the captured credential tokenVersion (missing legacy epoch = zero). Redemption atomically checks current hash and MongoDB server-time expiry, writes password, clears authority and increments tokenVersion with majority acknowledgement. No transaction, process mutex, cleanup or compensating release; no application retry of uncertain writes. Mail follows acknowledged writes. No migration/backfill or new dependency; no authentication storage change.
- **Files changed:** backend/src/models/User.js; backend/src/repositories/passwordResetRepository.js; backend/src/services/passwordResetService.js; backend/tests/passwordResetService.test.js; backend/tests/passwordResetRepository.test.js; backend/integration/passwordResetConcurrency.integration.mjs; backend/integration/sec006ResetWorker.mjs; backend/integration/passwordResetAudit.integration.mjs; SEC006_FIX_PROGRESS.md; PROGRESS.md; FIX_TRACKER.md; INTEGRATION_DEPLOYMENT_CHECKLIST.md.
- **Tests added or modified:** Retained random/hash/expiry/neutral response/password hashing/email/language/invalid link contracts while replacing assertions of vulnerable delete/create/release behavior. Real disposable MongoDB tests cover concurrent issuance, distinct-token and same-token resets, separate backend processes, delayed issuance, obsolete-reset failure after successful recovery, cleanup/release failures, expiration at write time, sequential recovery, pre-write failure, committed writes with lost acknowledgements, legacy accounts/rows, hidden authority and real login/JWT invalidation. Old known-vulnerability diagnostic entry point now runs fixed-design compatibility checks, with its original evidence preserved in history.
- **Actual verification:** Backend `npm test -- tests/passwordResetService.test.js tests/passwordResetRepository.test.js tests/passwordResetRoutesHttp.test.js` exit 0, 3 files/33 passed. Full backend `npm test` exit 0, 49 files/586 passed. `node integration/runAgent1Isolated.mjs --run-isolated passwordResetConcurrency.integration.mjs passwordResetAudit.integration.mjs` exit 0, 16 real MongoDB tests passed. Full frontend `npm test` exit 0, 37 files/223 passed; `npm run lint`, `npm run typecheck`, `npm run build` exit 0; existing bundle-size warning. Backend has no build/lint/typecheck scripts. CRLF-aware diff check exit 0. Browser not tested. Email mocked/disabled; no live external service or existing application database accessed. Initial missing-dependency attempt exited 1; lockfile-only `npm ci --ignore-scripts` succeeded for both packages without manifest/lock changes.
- **Blockers/limitations:** No remaining implementation blocker. Old collection links fail closed and require fresh requests; accounts need no migration. Recovery must use only fixed backend instances; disable recovery for rollback rather than restore the vulnerable version. Majority acknowledgement loss can leave a committed password despite an error, but cannot restore authority. Failure tests inject errors before/after actual writes; multi-node failover/live SMTP/browser are unverified. Hash lookup currently scans User without a new index; existing reset rate limiting retained. Expired authority is inert until overwritten, never authorizes recovery. Full design, rollout cautions and handoff in SEC006_FIX_PROGRESS.md. This verifies SEC-006 only, not overall production readiness or other outstanding issues.

## Final integrated verification (13 October 2026)

All five source histories incorporated locally in integration/agent-fixes; source tips/main untouched. Full backend npm test exit 0, 49 files/580 passed; frontend npm test exit 0, 35 files/215 passed; frontend npm run lint (oxlint), npm run typecheck and npm run build exit 0. Backend has no build/lint/typecheck scripts. Actual disposable MongoDB regression set exit 0, 21 passed; final strengthened authoritative admin restaurant/certificate success assertions exit 0, 1 passed with required photo bytes and SDK upload mocked. First added fixture omitted required photo and failed 0/1; corrected fixture only, validation retained. Reset diagnostic exit 0, 2 checks confirms SEC-006 unresolved; not a security fix. Browser node scripts/reviewPasswordRecovery.mjs exit 0, 88 fixture renders/8 EN/HE recovery journeys, no exceptions/referrer headers. Other browser workflows/live services not rerun; historical source evidence remains attributed. CRLF-aware full integration whitespace exit 0. Details, source hashes and rollout/rollback in INTEGRATION_PROGRESS.md and INTEGRATION_DEPLOYMENT_CHECKLIST.md. No main merge/push/deploy/existing database or user files touched.

Independent-audit follow-up verification (13 October 2026): targeted npm test -- tests/passwordResetService.test.js tests/passwordResetRepository.test.js tests/passwordResetRoutesHttp.test.js exit 0, 3 files/27 passed with mocks/local HTTP; disposable node integration/runAgent1Isolated.mjs --run-isolated passwordResetAudit.integration.mjs exit 0, 2 diagnostic checks reconfirm SEC-006. All five Agent 4 paths are attributed to the user-supplied independent in-memory audit report; only concurrent issuance and same-token consumption were executed here. Application/schema/tests unchanged. Prior full suites/build/browser evidence retained, not rerun for documentation. SEC-006 remains CONFIRMED P1 and DEFERRED from integration implementation, blocking production. No issue status/count changes.

### UIAUD-001 - Stale admin edit form can mutate a different restaurant

**Current integration verification (13 October 2026):** Source 587bac18bc02c0ff68dbf6eb8bf839462d44b060 incorporated as c454188 on integration/p1-security-admin-navigation with prior ADMINCERT-001 payload normalization preserved. Combined frontend `npm test`: exit 0, 246 passed/39 files, including 19 routed navigation regressions. `npm run lint`, `npm run typecheck`, `npm run build`: exit 0. `node scripts/reviewAdminNavigation.mjs`: exit 0, four Chrome scenarios, zero exceptions, every API write intercepted and remote traffic blocked. Full backend 684 passed/51 files. Initial frontend test/typecheck generated-file writes failed with sandbox EPERM; authorized retries passed without code changes. Source results below are historical evidence. VERIFIED locally, main promotion pending explicit approval.

- **Milestone:** User-assigned UIAUD-001 administrator navigation safety fix, 13 October 2026.
- **Priority:** P1.
- **Status:** VERIFIED.
- **Description/evidence:** Original production build independently reproduced in Chrome with delayed GET B: Save emitted PUT B carrying A fields/extras, fully intercepted without database writes. Same final 19 regression cases against baseline 220365d exited 1: 17 failed, 2 passed.
- **Root cause:** Route parameter changes retained unbound details/form/extras/cards and certificate-add photo state; mutation IDs came from the new route. Read responses and mutation completions lacked lifetime invalidation.
- **Relevant files/functions:** AdminRestaurantPage/RestaurantEditor load and all mutation handlers; AdminTeudaCard.run; AdminAddTeudaPage/CertificateCreator load/submit/progress; adminApi.getRestaurantDetails; existing App edit/add parameter routes and payload builders.
- **Planned solution/implemented:** Route-keyed form ownership with loaded-record ID validation, optional AbortSignal plus response invalidation, layout lifetime guards, synchronous mutation locks and original-ID/payload snapshots. Guard all restaurant and certificate actions and detached completions. No rules, auth, dependency or backend changes.
- **Files changed:** Four application files above; AdminRestaurantPage.test.tsx, scripts/reviewAdminNavigation.mjs, UIAUD001_FIX_PROGRESS.md, PROGRESS.md and this tracker.
- **Tests added or modified:** 19 new routed component regressions exercise real forms/API builders with intercepted Axios methods and assert outgoing IDs/payloads. Cover delayed/failed/out-of-order loads, identity mismatch, Save while loading, in-flight navigation, all adjacent mutations, back navigation, language reload, duplicate events, StrictMode normal Save and certificate upload/reset. No existing tests loosened.
- **Verification:** Final frontend npm test exit 0, 38 files/242 passed; npm run lint/typecheck/build exit 0. Chrome baseline node scripts/reviewAdminNavigation.mjs --expect-vulnerable exit 0 confirms defect; fixed script exit 0, four scenarios/zero exceptions. CRLF-aware diff check exit 0. Actual command/setup/baseline evidence in UIAUD001_FIX_PROGRESS.md. Backend unchanged, no backend checks rerun.
- **Blockers/limitations:** No remaining UIAUD-001 blocker. All HTTP/database/external responses mocked or intercepted; accepted original-record writes can finish after navigation but cannot affect the new page. Existing build size/jsdom diagnostics remain. Unsaved drafts reset on route changes. Other issues remain separately tracked; this is no blanket production approval. No merge/push/deploy/live services/other worktree changes.


## Main promotion outstanding issue reports - 13 October 2026

### ADMINCERT-001 - Reported administrator certificate hechsherOther validation failure

- **Milestone:** User-assigned dedicated admin certificate validation fix.
- **Priority:** High; outstanding pre-production workflow issue.
- **Status:** VERIFIED.
- **Description/evidence:** User-reported teuda.hechsherOther 400 independently reproduced: baseline schema/HTTP regressions exit 1, 38 failed/60 passed; valid admin add/initial/edit return 400 for blank optional custom name. Frontend baseline serialization tests exit 1, 4 failed.
- **Root cause:** Admin payload builder spreads form values, including blank hechsherOther. Admin and pending-evidence schemas reject blank strings before conditional OTHER validation and standard-name removal. Shared admin add/initial/edit paths affected; public builders already omit blank names.
- **Relevant files/functions:** AdminAddTeudaPage, AdminCreateRestaurantPage, TeudaFields, adminApi certificate payload builders, backend adminSchemas/Teuda model/adminTeudaService. Exact failing payload path requires focused reproduction.
- **Planned solution:** Normalize only blank custom-name strings in shared certificate schemas and omit them in shared admin serialization; keep conditional OTHER requirement, type/length checks, required certificate/photo validation and authority/zero points unchanged.
- **Files changed:** backend/src/schemas/commonSchemas.js, adminSchemas.js, teudaSchemas.js; frontend/src/api/adminApi.ts; three new test files and tracking/report docs. Models/repositories/services unchanged.
- **Tests added or modified:** certificateHechsherSchemas.test.js (80 across five request workflows/all standard options); adminCertificateValidationHttp.test.js (18 through real admin validation/controller/services with mocked persistence/uploads); adminApi.test.ts (4 serialization tests). Covers authority/public VERIFIED/zero points, required OTHER, malformed names/data/photos, authorization and edit clearing.
- **Verification:** Focused backend exit 0, 7 files/203 passed; focused frontend exit 0, 3 files/19 passed. Full backend npm test exit 0, 51 files/678 passed; frontend npm test exit 0, 36 files/219 passed; frontend npm run lint/typecheck/build exit 0. Backend has no build/lint/typecheck scripts. CRLF-aware whitespace check exit 0. Exact commands/evidence in ADMIN_CERTIFICATE_FIX_PROGRESS.md.
- **Blockers/limitations:** No live browser/database/external-service verification. Real local HTTP, mocks and jsdom only; existing bundle warning remains. No schema/backfill/dependency/UI text/rule changes. Ready for separately authorized integration; no merge/push/deployment here.

### MAPTILE-001 - Observed OpenStreetMap tile HTTP 403

- **Milestone:** Authorized final integration promotion/handoff.
- **Priority:** High; observed map availability limitation.
- **Status:** FIXED — UNVERIFIED.
- **Description/evidence:** User reports OpenStreetMap tiles return HTTP 403 in the observed environment. No live tile request in promotion; fixture/mocked map tests do not verify real tile availability.
- **Root cause:** Reported upstream OSM volunteer tile block; exact trigger unknown. MAP-001 replaces that endpoint with Geoapify, but actual browser-key/provider availability remains unverified.
- **Relevant files/functions:** Public map tile layer/configuration and map UI; inspect request origin/headers/provider requirements without credentials or production data.
- **Planned solution:** User explicitly authorized cherry-pick of dc826fc. Provider replacement integrated; configure separate public origin-restricted VITE_GEOAPIFY_MAPS_API_KEY and verify live rendering separately, without committing a key.
- **Files changed:** See MAP-001 and MAP_TILES_FIX_PROGRESS.md for source files; cherry-picked e8e952d and integration tracking notes.
- **Tests added or modified:** Source provider contracts and real Leaflet jsdom tile/attribution/marker/missing-key regressions incorporated; obsolete OSM URL assertion replaced under explicit provider-change request.
- **Verification:** Integrated frontend npm test exit 0, 37 files/223 passed; npm run lint/typecheck/build exit 0. Fake keys/mocked API, no live tile requests. Backend/package manifests unchanged; prior 580 backend tests remain evidence.
- **Blockers/limitations:** MAP-001 implementation verified only; actual tile recovery/live rendering unverified. Missing browser key deliberately leaves blank basemap with localized notice. Real key not read/set/committed, no live requests. New Hebrew copy needs native review.

Authorized main promotion verification - 13 October 2026: main --no-ff merge f252e4c incorporates integration a9c2b0e with history preserved/no conflicts. Post-merge backend npm test exit 0 (580/49 files), frontend npm test exit 0 (215/35 files), npm run lint/typecheck/build exit 0; CRLF-aware whitespace exit 0. No issue resolution/status changes from promotion. SEC-006, UIAUD-001, ADMINCERT-001 and MAPTILE-001 remain outstanding. Final main/normal-push remote confirmation reported after tracking checkpoint. Production/database/hosting actions remain unauthorized.

ADMINCERT-001 integrated verification - 13 October 2026: exact source 16f4738 cherry-picked e5dffb9 on clean branch from current main 220365d. Full backend npm test exit 0, 51 files/678 passed; frontend npm test exit 0, 38 files/227 passed; frontend lint/typecheck/build and CRLF-aware whitespace exit 0. Request-schema matrix verifies every standard hechsher accepts absent/blank/whitespace custom name, OTHER still requires valid bounded text; real HTTP/service tests with mocked persistence prove direct/combined admin certificates APPROVED/public VERIFIED with no points call. Malformed names, date/photo/authorization checks preserved. Source historical results above retained; these are current combined results. No real database/services/browser exercised. No schema/index/data migration or dependency change. SEC-006/UIAUD-001 and live Geoapify limitation remain.
