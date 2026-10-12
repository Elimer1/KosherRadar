# KosherRadar — Progress

Authoritative requirements: `PROJECT_SPEC.md` (do not edit without approval). Requirement status: `REQUIREMENTS_CHECKLIST.md`.

## Active milestone

**Milestone 5 — Maps, location and interface polish** (DONE and merged to `main`; waiting for your approval before Milestone 6). Scope from `PROJECT_SPEC.md` section 16: Leaflet visible-bounds queries and clustering, Geoapify for the map and for search-by-address, Waze / Google Maps / share, English and Hebrew with RTL/LTR, responsive layout across four width ranges, list/map view preference, UI integration. Kashrut status and filters keep using `kashrutStatusService.js` and `restaurantSearchService.js`.

Milestones 1 to 5 are merged to `main`. Real-database, Atlas Search, Cloudinary, Resend and Geoapify checks are still BLOCKED (see "Blockers"). Local `main` is ahead of `origin/main`; it has not been pushed in this milestone.

Milestone 4 (`main` and its three feature branches) has been pushed to `origin`. Milestone 5 has not been pushed.

Before this milestone started, the leftover working-tree change on `main` (deleted `project.zip`, a snapshot archive that had been committed by mistake) was committed, and `main` plus the Milestone 3 feature branches were pushed to `origin`. The six duplicate-detection files had already been committed in an earlier "share snapshot" commit, so they are no longer uncommitted.

## Comment convention for new code (requested by the team)

Applies to everything added from Milestone 3 onward. Existing Milestone 1 and 2 code is not retro-commented.

- **Mark new code as new.** Every new file starts with a short header comment, and every new function or block added to an existing file gets a one-line marker. Format: `// NEW (Milestone N): <what it is>`.
- **Add a Hebrew line next to it.** Directly below the English marker: `// חדש (אבן דרך N): <תיאור קצר בעברית>`. Hebrew comments are also added to non-obvious logic in the new code (security, dates, filtering, kashrut rules).
- **Keep it short.** `PROJECT_SPEC.md` (section on code style) says comments explain *why* and must not narrate self-evident code. So the markers go on files, functions and blocks, not on every line.
- Use `//` in JS/TS and `{/* ... */}` in JSX. Hebrew in comments only; UI strings still go through the translation files in Milestone 5.

Example:

```js
// NEW (Milestone 3): approve a pending restaurant (admin only)
// חדש (אבן דרך 3): אישור מסעדה ממתינה (למנהלים בלבד)
export async function approveRestaurant(id, adminId) { /* ... */ }
```

## Feature ownership (Milestone 5)

Recorded before implementation, per section 19. `--author` follows the responsible teammate. The code is AI-generated and must be reviewed by its owner. Merge order: `feature/map-discovery`, then `feature/location-search` (the location field recenters the map), then `feature/bilingual-ui` (it translates the map and location UI as well as the older pages), then the docs branch.

| Feature branch | Responsible teammate | Scope |
| --- | --- | --- |
| `feature/map-discovery` | Eli Mermelstein | Public map bounds API (same search filters and kashrut rules, visible bounds, radius still applies, capped marker payload), Leaflet map with branded markers and clustering, list/map toggle saved in localStorage, map popups (Call, Waze, details), share button on the restaurant page and in popups, tests |
| `feature/location-search` | Moshe Silber | Separate location field on the home page (not parsed out of the name/food box): public Geoapify autocomplete and manual geocode fallback, current-location button, radius stays in the filters, localized place names when Geoapify returns them, tests |
| `feature/bilingual-ui` | Moshe Silber | English and Hebrew for the whole interface, persistent language toggle, RTL/LTR, labels for levels/food/categories/hechsher (hechsher names come from the existing option list), responsive layout across the four width ranges, page title and description, tests that the two languages cover the same keys |
| `feature/milestone-5-docs` | Eli Mermelstein | Progress and checklist files, README and `.env.example` updates |

## Feature ownership (Milestone 4)

Recorded before implementation, per section 19. Same rules as below: `--author` follows the responsible teammate, the code is AI-generated and must be reviewed by its owner. Merge order: `feature/restaurant-search`, then `feature/restaurant-details` (it reuses the status component built in the search feature), then the docs branch.

| Feature branch | Responsible teammate | Scope |
| --- | --- | --- |
| `feature/restaurant-search` | Eli Mermelstein | Search fields and bilingual food synonyms on the restaurant, Atlas Search + Mongoose fallback, `ATLAS_SEARCH_SETUP.md`, public search and suggestions API (kashrut filters, location radius, 20 per page), home page search UI with autocomplete, filters, Load More and result cards, tests |
| `feature/restaurant-details` | Moshe Silber | Public restaurant detail API and serializer (approved only, no admin data), `/restaurants/:id` page with full kashrut evidence, links to add a certificate / report a problem, tests |
| `feature/milestone-4-docs` | Eli Mermelstein | Progress and checklist files, README and `.env.example` updates |

## Feature ownership (Milestone 3)

Recorded before implementation, per section 19. Same rules as below: `--author` follows the responsible teammate, the code is AI-generated and must be reviewed by its owner. Merge order: the first four branches in the order listed, then the docs branch.

| Feature branch | Responsible teammate | Scope |
| --- | --- | --- |
| `feature/kashrut-status-rules` | Eli Mermelstein | Verified / unverified / recent-expired / unknown derivation, primary preview and `+N more`, public teuda serializer (no admin-only data), conflict warning, tests |
| `feature/moderation-notifications-points` | Eli Mermelstein | Resend email service and rejection emails (failure never rolls back a decision), idempotent contribution points (+3 / +2 / +1), tests |
| `feature/admin-moderation` | Moshe Silber | Admin API (pending lists, expiring soon, manage search, approve / reject / edit / delete, admin-created approved records, report resolution, private notes), admin dashboard UI, tests |
| `feature/password-reset` | Moshe Silber | Forgot / reset password endpoints (hashed single-use token, Resend email), forgot / reset pages, tests |
| `feature/milestone-3-docs` | Eli Mermelstein | Progress and checklist files, README and `.env.example` updates |

## Feature ownership (Milestone 2)

Recorded before implementation, per section 19. Commits use `--author` for the responsible teammate; the code was generated by an AI agent and must be reviewed by the owner. It must not be described as personally typed.

| Feature branch | Responsible teammate | Scope |
| --- | --- | --- |
| `feature/teuda-submission` | Moshe Silber | Hechsher options, Cloudinary upload + image validation, teuda date rules, submit-teuda endpoint, submit-teuda page, tests |
| `feature/restaurant-submission` | Eli Mermelstein | Restaurant model changes, duplicate warning, submit-restaurant endpoint (optionally with a teuda), submit-restaurant page, tests |
| `feature/report-submission` | Moshe Silber | Report endpoint, report page, tests |
| `feature/milestone-2-docs` | Eli Mermelstein | Progress and checklist files, README and `.env.example` updates |

## Feature ownership (Milestone 1)

| Feature branch | Responsible teammate | Scope |
| --- | --- | --- |
| `feature/project-foundation` | Eli Mermelstein | `PROJECT_SPEC.md`, progress/checklist/style docs, repo setup |
| `feature/authentication` | Eli Mermelstein | Backend package, config, Mongoose models, auth endpoints, middleware, seed-admin, Vitest tests |
| `feature/frontend-auth-session` | Moshe Silber | Frontend package, Axios instance + interceptors, persisted Zustand auth, login/register/account pages, protected routes, frontend tests |
| `feature/milestone-1-docs` | Eli Mermelstein | Root `README.md`, updated progress and checklist files |

## Work log

### Milestone 1

- Repository was empty (`main` with no commits). Initial commit adds `.gitignore`.
- `PROJECT_SPEC.md` saved at the root; it matches the supplied `prompt.md` byte-for-byte (after trimming).
- `CODING_STYLE_NOTES.md`: no verified JS/TS samples for either developer (see file).
- `feature/authentication` and `feature/frontend-auth-session` were merged into `main` with `--no-ff`.
- `review/all-code` is a throwaway review snapshot ("do not merge"). It was not merged.
- `prompt.md` at the repo root is untracked and was left as is.

### Milestone 2

- Ownership was recorded first (commit on `feature/milestone-2-docs`), then the three feature branches were built and merged into `main` with `--no-ff`, in this order: `feature/teuda-submission`, `feature/restaurant-submission`, `feature/report-submission`. `feature/milestone-2-docs` is merged last. Feature branches were not deleted.
- **Backend** (`backend/src`): `utils/israelDate.js` (date-only values, Israel calendar date, calendar-month math), `services/teudaRulesService.js` (VALID / RECENT_EXPIRED / ADMIN_ONLY, six-month rule), `services/imageUploadService.js` + `config/cloudinary.js` + `utils/imageType.js` (real file-type check, 5 MB, Cloudinary upload, cleanup of orphaned photos), `middleware/uploadMiddleware.js` / `parseJsonFields.js` / `validateObjectId.js`, rate limiters for submissions and uploads, Zod schemas in `schemas/{common,teuda,restaurant,report}Schemas.js`, services/repositories/controllers/routes for restaurants, teudot and reports, `services/duplicateService.js`, and `GET /api/options`.
- **Frontend** (`frontend/src`): `SubmitRestaurantPage`, `SubmitTeudaPage`, `SubmitReportPage`, shared `TeudaFields`, `RestaurantFields`, `FormAlert`, hooks `useFormOptions` and `usePhotoField`, client-side photo check, API functions, navbar and home links.

### Design decisions made in Milestone 2 (please review)

- **One request for "new restaurant + certificate"**: multipart with `restaurant` JSON, optional `teuda` JSON and a `photo`. If the teuda cannot be saved after the restaurant was created, the restaurant and the uploaded photo are removed again. Teuda has a new field `submittedWithNewRestaurant`; Milestone 3 can use it to decide +3 (new restaurant with teuda) versus +2 (teuda for an existing restaurant).
- **A teuda can only be added to an APPROVED restaurant** (404 otherwise, so pending restaurants are not revealed). The same applies to reports.
- **Everything is PENDING, even when an ADMIN submits.** "Admin-created records approved immediately" belongs to the admin milestone.
- **Coordinates are optional** on the Restaurant model and form (spec: never invent coordinates). A restaurant without them has no `location` and cannot appear on the map until an admin adds them. The form accepts latitude/longitude only inside a rough box around Israel.
- **New certificates must be valid** (expire today in Israel or later, at most 5 years ahead). Old or recently expired certificates would be entered by admins in Milestone 3.
- **Expiration dates** are stored at UTC midnight of the calendar date; comparisons use the Israel calendar date. "Recently expired" includes exactly six calendar months ago; one day earlier is admin-only.
- **Hechsher options** are a list in `backend/src/config/constants.js` served by `GET /api/options` (English and Hebrew labels), plus `OTHER` with required free text. **The names in this list were written by the agent and have not been verified by the team.**
- **Duplicate warning** (only recorded for admins on `possibleDuplicates`, never blocks): same Geoapify place id, same normalized phone, same normalized address (with or without a similar name), or a similar name within 300 m. It uses indexed exact lookups plus one `$geoWithin` query, each capped. Normalized copies of name/address/phone are stored on the restaurant for this.
- **Entry points**: certificate and report pages have no link yet because there is no restaurant page or search until Milestone 4. They are reachable at `/restaurants/:restaurantId/add-teuda` and `/restaurants/:restaurantId/report` and need an APPROVED restaurant.
- The submission pages are English only; translations and RTL are Milestone 5.

### Milestone 3

- Ownership was recorded first (`feature/milestone-3-docs`). Then four feature branches were built and merged into `main` with `--no-ff`, in this order: `feature/kashrut-status-rules` (Eli), `feature/moderation-notifications-points` (Eli), `feature/admin-moderation` (Moshe), `feature/password-reset` (Moshe). `feature/milestone-3-docs` is merged last. Branches were not deleted. All code is AI-generated and must be reviewed by its owner.
- **Kashrut rules** (`services/kashrutStatusService.js`): one place derives VERIFIED / UNVERIFIED / EXPIRED / UNKNOWN, the primary item, `+N more`, the public teuda serializer and the same-level conflict warning. Expired is derived on Israel calendar dates and never stored.
- **Email and points**: `services/emailService.js` (Resend REST API through `fetch`, never throws, returns SENT / FAILED / NOT_CONFIGURED, plain text only), `services/pointsService.js` (+3 / +2 / +1, once per source through an atomic `awardedPointKeys` update on the user).
- **Admin API** (`/api/admin/*`, all behind login + ADMIN): pending lists, expiring soon (30 days), manage/search, details with a public preview, approve / reject / edit / delete for restaurants and certificates, admin-created approved records, report resolve / reject. New files: `admin*Repository.js`, `admin*Service.js`, `admin*Controller.js`, `adminSchemas.js`, `adminSerializerService.js`, `moderationNotificationService.js`, `middleware/validateQuery.js`, `utils/pagination.js`.
- **Admin UI**: `/admin` (five tabs), `/admin/restaurants/new`, `/admin/restaurants/:id`, `/admin/restaurants/:id/add-teuda`, `AdminRoute`, an "Admin" navbar link for admins only.
- **Password reset**: `POST /api/auth/forgot-password` and `/reset-password`, `passwordResetService.js`, `passwordResetRepository.js` (uses the existing `PasswordResetToken` model), pages `/forgot-password` and `/reset-password`, a link on the login page.
- **Existing files touched**: `TeudaFields.tsx` (optional `hidePhoto`), `App.tsx`, `Navbar.tsx`, `LoginPage.tsx`, `authApi.ts`, `authController.js`, `authRoutes.js`, `authSchemas.js`, `rateLimiters.js`, `userRepository.js`, `User.js` (`awardedPointKeys`), `env.js` and `.env.example` (Resend), `constants.js`, `israelDate.js`, `teudaRulesService.js`, `restaurantSchemas.js`.

### Design decisions made in Milestone 3 (please review)

- **Approving a restaurant gives no points.** Points are given when its certificate is approved: +3 if the certificate was sent together with the new restaurant (`submittedWithNewRestaurant`) and the same user sent both, +2 for a certificate added to an existing restaurant, +1 when a report's correction is really applied. A restaurant without a certificate earns nothing; admins never collect points; deleting something never takes points back.
- **A certificate cannot be approved while its restaurant is not approved** (the only hard rule). A same-level conflict only warns ("Approve anyway").
- **Rejecting a restaurant also closes its pending certificates.** Rejecting needs a reason (at least 3 characters) that is saved and emailed. The decision is saved first; a failed or missing email only changes the `emailStatus` shown to the admin.
- **Approve and reject are atomic and repeatable**: they only change a PENDING record, so two admins clicking together, or a double click, cannot double-apply or award points twice.
- **Admin-created records are approved at once and earn no points.** Admin dates may be in the past (from 2000-01-01, up to 5 years ahead) so old evidence can be recorded.
- **Report resolution** has three outcomes: `APPLY_PROPOSED` (changes only the proposed hechsher / level on the named certificate, or on the restaurant claim when no certificate is named), `CORRECTION_ALREADY_MADE`, and `NO_CORRECTION`. Only the first two with a real correction give +1.
- **Deleting a restaurant is permanent**: it removes its certificates, its reports and the Cloudinary photos. The UI asks for confirmation.
- **Password reset**: the token is 32 random bytes (64 hex characters), valid 60 minutes, only its SHA-256 hash is stored, consumed in one atomic update. Requesting a new link cancels older unused ones. A request for an unknown email answers exactly like a known one, and the email is not awaited so response time does not give it away. **Limitation: a reset does not log out sessions that already exist** (JWTs stay valid until they expire in 24 hours; there is no token-version field).
- **Query validation**: Express 5 makes `req.query` read-only, so validated query values are in `req.validatedQuery`, and a repeated query key answers 400.
- **The admin screens are English only**; translation is Milestone 5. The hechsher names are still the unreviewed agent-written list from Milestone 2.

### Milestone 4

- Ownership was recorded first (`feature/milestone-4-docs`). Then `feature/restaurant-search` (Eli) and `feature/restaurant-details` (Moshe) were built and merged into `main` with `--no-ff`, in that order; `feature/milestone-4-docs` is merged last. Branches were not deleted. All code is AI-generated and must be reviewed by its owner. The merge commits carry the git-configured identity, not `--author`.
- **Search backend**: `config/foodSynonyms.js`, `utils/searchFields.js` (word splitting, search-field building, query parsing), `utils/geo.js`, `repositories/restaurantSearchRepository.js` (candidate query, optional Atlas `$search`, certificates for the candidates in one query), `services/restaurantSearchService.js` (kashrut summary and filters through `kashrutStatusService.js`, relevance, sorting, paging), `services/publicRestaurantSerializer.js`, `schemas/searchSchemas.js`, `searchFieldsRebuildService.js` + `scripts/rebuildSearchFields.js`, `searchRateLimiter`. `Restaurant` got `nameTokens`, `foodTokens`, `foodGroups` (rebuilt on every save) and three indexes. `kashrutStatusService.js` got `withoutExpiredEvidence` and `applyKashrutFilters`.
- **Details backend**: `GET /api/restaurants/:restaurantId` (`restaurantDetailsService.js`, `toPublicRestaurantDetails`, `utils/safeUrl.js`). `toPublicTeuda` now also re-checks `photoUrl` as http/https.
- **Frontend**: the home page is now the public search (`HomePage`, `SearchBar`, `SearchFiltersPanel`, `RestaurantCard`, `KashrutBadge`, `useRestaurantSearch`, `useDebouncedValue`) and `/restaurants/:restaurantId` is the public restaurant page (`RestaurantDetailsPage`). Helpers: `kashrutText`, `navigationLinks`, `safeUrl`, `searchResults`.
- **Docs**: `ATLAS_SEARCH_SETUP.md`, README (API table, search rules, `search:rebuild`), `backend/.env.example` (`ATLAS_SEARCH_ENABLED`, `ATLAS_SEARCH_INDEX`).

### Design decisions made in Milestone 4 (please review)

- **Status filters cannot be done in MongoDB alone** (they depend on dates and on another collection). The database narrows to at most 2000 candidates (APPROVED, text, food type, category, radius), then the shared kashrut service filters and sorts in JavaScript. If more than 2000 match, the answer has `capped: true` and the page warns that the list may be incomplete. This is a limit to revisit with real data volumes.
- **Search fields are stored, not computed per query**: `nameTokens`, `foodTokens`, `foodGroups` are rebuilt on every save. **Restaurants that existed before Milestone 4 are not found until `cd backend; npm run search:rebuild` has run once.**
- **Food synonyms** live in `config/foodSynonyms.js` (about 24 one-word groups, Hebrew and English). **Written by the agent, not reviewed by the team.** Typed words of 3+ letters also match groups by prefix.
- **Atlas Search is optional** (`ATLAS_SEARCH_ENABLED=true`). Its hits are added to the plain search results, never replace them; on any error the plain search answers and `search.atlasUnavailable` is true. A missing index silently finds nothing, so `ATLAS_SEARCH_SETUP.md` explains how to test with a typo. **Never run against a real Atlas cluster.**
- **Relevance and order**: exact name 1, name starts with the text 0.9, a name word 0.7, Atlas hit ×0.85, food only 0.4, +0.05 for name and food. With a location: nearest first (restaurants without coordinates last), then relevance, name, id. Without one: relevance when there is text, else A-Z. Ties always end on the id, so paging never repeats or skips a restaurant.
- **Kashrut filters**: the level and the hechsher must match the same certificate or claim; "hide expired" removes expired evidence (a restaurant with only expired evidence disappears); unknown restaurants only appear with "include unknown" and never match a kashrut filter.
- **Public output is whitelisted** in `publicRestaurantSerializer.js`. A pending, rejected or missing restaurant gives the same 404. Links (website, Kosharot, certificate photo) are checked as http/https when saved and again when sent.
- **Location**: the API supports `lat`, `lng` and a radius of 1/5/10/25/50 km. The UI only offers "Use my current location" and a radius; a typed address (Geoapify) is Milestone 5.
- **Add certificate / Report a problem** links are always shown on the restaurant page; anonymous visitors reach the login page through the existing `ProtectedRoute`.
- **Kosharot link** is shown only when an admin added `kosharotUrl`. The page states that KosherRadar is not a kashrut authority.
- **English only** until Milestone 5. The hechsher names and the synonym list are agent-written and unreviewed.

### MVP polish (after Milestone 4, not a new milestone)

Committed on `feature/form-account-polish` and merged to `main` before Milestone 5, so it would not be mixed into later features. AI-generated; it still needs a review (the admin-screen part touches Moshe Silber's admin pages). This is form, account and admin-screen polish, not Milestone 5 (no map, no translations).

- **Admin approval.** Approving or rejecting on `/admin/restaurants/:id` shows the result under the Decision buttons and updates the status immediately. Approve and Reject then disappear, and the restaurant leaves the pending list. The page stays open so a pending certificate on that page can be approved next. The pending-list button still calls the same `approveRestaurant` function.
- **Restaurant form (users).** `RestaurantFields` has a `user` variant. Latitude and longitude boxes, the kashrut claim, and "What do they serve?" are off that form. The certificate fields and photo are always on the same form (no checkbox). They may all be left empty. If any certificate field or the photo is filled in, the rest of the certificate and the photo are required. City is required on a user submission only (`submitRestaurantSchema`). Admin create and edit still have food keywords and the kashrut claim, and city stays optional there, so an old restaurant with no city can still be saved.
- **Address search.** `GET /api/places/autocomplete` (login required) calls Geoapify and keeps the key on the server (`GEOAPIFY_API_KEY` in `backend/.env.example`). Results are limited to Israel. Choosing one fills street, city, latitude, longitude and `geoapifyPlaceId`. A typed address that was not chosen is still accepted. If both coordinates are missing, `submitRestaurantService` asks Geoapify to geocode it; a miss is saved with no coordinates. Coordinates are never invented. Without a key, or if Geoapify fails, the form says so and the typed address still submits.
- **Passwords and points.** Login, registration and reset password use one field with an eye button. The account page shows the points total and the existing +3 / +2 / +1 rules. Award logic is unchanged: admins still earn nothing.
- **My submissions.** `GET /api/users/me/submissions` and `/account/submissions` list the logged-in user's restaurants, certificates and reports (newest first, up to 50 each) with date, status and rejection reason. Approved certificates and applied reports also show the points already stored in `awardedPointKeys`. No admin notes. The original spec said not to build a contributions page; this page was added anyway. Thank-you screens link to it.
- **New files:** `placesService.js`, `placesController.js`, `placesRoutes.js`, `placesSchemas.js`, `userSubmissionsService.js`, `userSubmissionsRepository.js`, `AddressSearch.tsx`, `PasswordField.tsx`, `placesApi.ts`, `submissionsApi.ts`, `MySubmissionsPage.tsx`, `types/mySubmissions.ts`. Tests: `placesService.test.js`, `userSubmissionsService.test.js`.

### Design decisions in this polish (please review)

- **The certificate is the only kashrut input on the user form.** Restaurant-level claimed hechsher and claimed level stay in the database and on the admin edit form, because existing unverified listings and `kashrutStatusService.js` still use them. A user cannot set them on a new submission.
- **Food keywords stay on the admin form.** Search uses them when the food word is not in the restaurant name. Users no longer type them.
- **A half-filled certificate is rejected in the browser** before it is sent. The server still accepts a restaurant with no certificate.
- **Home-page location search was unchanged at the time of this polish.** "Use my current location" was still the only location control on the search page. Milestone 5 later added the typed location field and the map (see the Milestone 5 work log).

#### Milestone 5

- Ownership was recorded first (`feature/milestone-5-docs`, not merged until this docs update). Then three feature branches were built and merged into `main` with `--no-ff`, in this order: `feature/map-discovery` (Eli), `feature/location-search` (Moshe), `feature/bilingual-ui` (Moshe). `feature/bilingual-ui` was branched from `feature/location-search`, so it already contained the location commit; merging location first, then bilingual, kept the history. `feature/milestone-5-docs` is merged last. Branches were not deleted. All code is AI-generated and must be reviewed by its owner. Feature commits use `--author` for the responsible teammate. The merge commits carry the git-configured identity.
- **Map API**: `GET /api/restaurants/map` (registered before `/:restaurantId`). Same filters as the list, plus `north`, `south`, `east`, `west`. `findMapRestaurantsService` reuses `loadMatches` in `restaurantSearchService.js`, so kashrut filters cannot diverge. The box is `$geoWithin` `$box` in `[lng, lat]`. A radius is still applied with `$and` when a search location is set. Restaurants without coordinates are omitted. The payload is capped at 500 markers (`capped: true` when the cap is hit). Boxes that cross the date line are rejected.
- **Map UI**: `RestaurantMap.tsx` (Leaflet, OpenStreetMap tiles, branded div markers, clustering). List and map are mutually exclusive. The choice is saved in `localStorage` (`kosherradar-view`); anything other than `map` is the list. Moving the map does not change the search location. A radius is drawn and still filters the viewport. Bounds requests are debounced and stale answers are ignored.
- **Location field**: a separate box from the name/food search. `GET /api/places/suggest` and `GET /api/places/geocode` are public and rate-limited; the form autocomplete stays login-only. The key stays on the server. A miss or a missing key returns no coordinates and the UI says nothing was guessed. Current location is optional.
- **Share**: Web Share API, with clipboard fallback. Cancelling the share sheet does not copy. Waze stays on the list and the map popup; Google Maps stays on the restaurant page.
- **Languages**: `frontend/src/locales/en.ts` and `he.ts`, `i18next`. The choice is saved (`kosherradar-language`). Default is the saved choice, otherwise Hebrew when the browser language starts with `he`, otherwise English. `lang` and `dir` are set before React loads and again when the language changes. Hechsher names use the existing `labelEn` / `labelHe`. Restaurant names and addresses are not translated. Messages that the server itself returns (validation text) stay in the language the API sent.
- **Page title**: `usePageMeta` sets the document title and description. A crawler that does not run JavaScript only sees the generic title in `index.html`.

### Design decisions made in Milestone 5 (please review)

- **The map does not use the 20-row list.** It asks for every approved match in the visible box, up to 500. The list stays at 20 per page. While the map is showing, the list request is not sent.
- **Radius and the visible box both apply.** Choosing "5 km around Jerusalem" and then panning to Tel Aviv shows only restaurants that are inside both. The map says that moving it does not change the search location.
- **A location is never parsed out of the name box.** "pizza Jerusalem" is a food/name search, not a place.
- **Public place search is separate from the login-only form autocomplete**, so browsing does not require an account, and the Geoapify key still never reaches the browser.
- **English stays the fallback language** so the existing kashrut and admin label tests keep passing without setting a language first.

## Corrections to earlier statements

- Earlier in this milestone I said `PROGRESS.md` contained stray line-number markers. That was wrong: they were only an artifact of how the file was displayed to me; the file has none.
- The six duplicate-detection files that earlier versions of this file listed as "uncommitted team changes" were already committed in a "share snapshot" commit, so nothing in the working tree is waiting for the team any more.

## Tests and builds

Run on `main` after the Milestone 4 feature merges (the docs branch changes only `.md` files):

| Command | Result |
| --- | --- |
| `cd backend; npm test` | 34 test files, 448 tests passed (Milestone 3 ended with 24 files / 324 tests) |
| `cd frontend; npm run typecheck` | passed |
| `cd frontend; npm test` | 11 test files, 76 tests passed (Milestone 3 ended with 7 files / 40 tests) |
| `cd frontend; npm run build` | passed |
| `cd frontend; npm run lint` | passed (no findings) |

Run again after the MVP polish above (build was not re-run):

| Command | Result |
| --- | --- |
| `cd backend; npm test` | 36 test files, 453 tests passed |
| `cd frontend; npm run typecheck` | passed |
| `cd frontend; npm test` | 11 test files, 76 tests passed |
| `cd frontend; npm run lint` | passed (no findings) |

The login and registration pages were opened in the browser: the eye button showed the typed password and switched to "Hide password". The API did not start in that session (MongoDB Atlas rejected this computer's IP), so the restaurant form, address search, approval buttons and My Submissions were not clicked against a live server. Geoapify itself was not called.

Run on `main` after the Milestone 5 feature merges (this docs commit only changes tracking files and the README):

| Command | Result |
| --- | --- |
| `cd backend; npm test` | 37 test files, 466 tests passed |
| `cd frontend; npm test` | 14 test files, 89 tests passed |
| `cd frontend; npm run build` | passed (the production JavaScript bundle is over 500 kB; Vite only warns) |
| `cd frontend; npm run lint` | passed (no findings) |

The home page was opened in the browser on the Vite dev server. Hebrew was selected, `dir` became `rtl`, and the choice survived a reload. The map view was selected, Leaflet and OpenStreetMap tiles loaded, the choice survived a reload, and switching back to the list hid the map. At a 390px-wide viewport the page did not scroll sideways. Login and the invalid reset-link screen were in Hebrew. The map request then failed with the Hebrew "cannot reach the server" message, and an earlier list response was an empty approved set; neither Geoapify nor a restaurant popup was exercised. Clustering, Call, Waze and Share inside a popup were not seen, because no markers were returned.

New Milestone 5 backend tests: `mapSearchService`, bounds cases in `restaurantSearchRepository` and `geo`, map cases in `searchRoutesHttp`, public suggest/geocode cases in `placesService`. New frontend tests: `mapView`, `language`, `locales` (the two languages have the same keys and Hebrew strings are not empty), share cases in `navigationLinks`.

New Milestone 4 backend tests: `searchFields`, `geo`, `searchSchemas`, `kashrutFilters`, `restaurantSearchService`, `restaurantSearchRepository` (the built query, repository mocked), `searchRoutesHttp` (real HTTP, service mocked), `restaurantDetailsService`, `restaurantDetailsRoutesHttp`, `safeUrl`. New frontend tests: `searchApi`, `kashrutText`, `navigationLinks`, `safeUrl`.

Done once and not kept: the search page and the restaurant page (loaded, 404 state, filters, Load More, autocomplete) were opened in a browser against a throwaway stub API (`.scratch/`, git-ignored via `.git/info/exclude`). This proves the screens render and the requests are shaped as the stub expects; it does **not** prove anything about the real backend, MongoDB or Atlas Search. There are no frontend component tests.

Milestone 3 notes that still apply:

New Milestone 3 backend tests: `kashrutStatusService`, `emailService` (mocked `fetch`), `pointsService`, `adminSchemas`, `adminTeudaService`, `adminRestaurantService`, `adminReportService`, `adminRoutes` (middleware order on every route), `adminRoutesHttp` (real HTTP, services mocked), `passwordResetService`, `passwordResetRoutesHttp`. New frontend tests: `adminLabels`, `adminForms`, `resetToken`.

Not run in Milestone 3: any server against a real MongoDB, a real Resend email, a real Cloudinary upload (admin-created certificates and certificate deletion), and **none of the admin or password reset pages in a browser**. The frontend tests cover pure functions only, no components. The real-database behavior of the atomic updates (approve / reject, award points, consume reset token) is only covered by mocked unit tests.

Also done once and not kept: a throwaway Express app with the real multer, JSON-field, Zod and image-check middleware, called over HTTP with `fetch`. It returned 200 for a valid upload, 400 for a script renamed to `.jpg`, 413 for a file over 5 MB, 400 for a missing photo, 400 for broken JSON and a field error for a missing "other" hechsher text.

Not run: either server against a real MongoDB, a real Cloudinary upload, and the frontend in a browser. Backend tests use mocked repositories and a mocked Cloudinary SDK; frontend tests cover pure functions and payload builders only (no component tests).

## Blockers / setup needed

- **BLOCKED (Milestone 1 and 2):** the real frontend -> Express -> MongoDB flow was NOT verified: register, login, `/auth/me`, `/users/me`, admin check, expired-token logout, and the new submissions (restaurant, certificate, report). It needs a MongoDB Atlas connection string, `JWT_SECRET` and the seed-admin credentials in `backend/.env`. No MongoDB, Docker or `backend/.env` exists in this environment.
- **UNVERIFIED:** Cloudinary. Needs `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `backend/.env`. Without them the photo upload answers 503 and nothing is saved.
- **UNVERIFIED:** the MongoDB queries behind the duplicate check (`$or` on indexed fields, `$geoWithin`) and the 2dsphere index with restaurants that have no coordinates. Rate limits and CORS were not exercised against a running server.
- Seed-admin was not run against a real database (its service logic is covered by unit tests).
- **BLOCKED (Milestone 3):** Resend. Needs `RESEND_API_KEY` and `EMAIL_FROM` in `backend/.env`. No email (rejection or password reset) was ever sent. Without a verified domain Resend only sends to your own account address (see README).
- **UNVERIFIED (Milestone 3):** the whole admin flow against a real database and the admin and password reset pages in a browser. Sessions are not revoked by a password reset (see design decisions).
- **BLOCKED (Milestone 4):** Atlas Search. Needs a real Atlas cluster, the index from `ATLAS_SEARCH_SETUP.md` and `ATLAS_SEARCH_ENABLED=true`. The `$search` pipeline and the index JSON were never run; only the fallback is tested.
- **UNVERIFIED (Milestone 4):** every MongoDB query behind search and details (the candidate `$or` query, `$geoWithin $centerSphere`, the new indexes, the one-query certificate lookup, `npm run search:rebuild`) and the search and restaurant pages against the real backend. Performance with real data (2000-candidate cap) is unknown.
- **UNVERIFIED:** Geoapify. The submission form calls it through `GET /api/places/autocomplete` (login required) and, for a typed address with no coordinates, through geocoding in `submitRestaurantService`. The home-page location field calls `GET /api/places/suggest` and `GET /api/places/geocode` (public). Needs `GEOAPIFY_API_KEY` in `backend/.env`. Without a key, or if Geoapify fails, no coordinates are invented. No real Geoapify request has been made.
- **UNVERIFIED (Milestone 5):** the map bounds query against a real MongoDB (`$geoWithin` `$box`, combined with a radius, restaurants that have no coordinates). The Leaflet map was opened and tiles loaded; clustering and popups were not seen because the search returned no restaurants. Share was not clicked. Widths other than 390px were not measured.

To finish the Milestone 4 blocked items: run `cd backend; npm run search:rebuild`, start both servers, search a restaurant by name, by an English and a Hebrew food word, and with each filter, open its page, then create the Atlas index, set `ATLAS_SEARCH_ENABLED=true`, restart, and search a mistyped name (steps in `ATLAS_SEARCH_SETUP.md`).

To finish the Milestone 3 blocked items: fill in `backend/.env` (including Resend), run `cd backend; npm run seed:admin`, start both servers, log in as the admin, open `/admin`, then send a restaurant with a certificate from a normal account and approve it, reject another with a reason, check the contributor's points in Atlas (`users.points`, `awardedPointKeys`), and try `/forgot-password` with your own address.

To finish the blocked items: copy `backend/.env.example` to `backend/.env`, fill in the values, run `cd backend; npm run seed:admin`, start `npm run dev` in both `backend/` and `frontend/`, register, log in, open `/submit-restaurant` and send a restaurant with and without a certificate photo, then check the documents in Atlas (`restaurants`, `teudas`, `reports`) and the image in Cloudinary. To try the certificate and report pages, set one restaurant's `status` to `APPROVED` in Atlas (admin approval arrives in Milestone 3) and open `/restaurants/<its id>/add-teuda`.

## Next milestone

Milestone 6 — Full verification and fixes (needs your explicit approval, in a fresh conversation). Spec section 16: end-to-end checks against real services, a security and data-leak review, README completion and a reconciliation of the requirements. It depends on a real MongoDB, and on Cloudinary, Resend, Atlas Search and Geoapify if those checks are in scope. Do not treat the Milestone 5 browser pass as proof that search, the map markers or Geoapify work.

## Continuation prompt (copy into a new Cursor Agent conversation)

> Read the complete repository-root `PROJECT_SPEC.md` (authoritative master specification), `PROGRESS.md`, `REQUIREMENTS_CHECKLIST.md`, and the recent Git commits. Do not modify `PROJECT_SPEC.md` without my approval. Implement **only Milestone 6** from section 16, preserving all existing functionality. Work autonomously within that milestone; test, fix, update both tracking files, make real incremental, appropriately attributed feature-branch commits and merge verified work as specified in section 19, then STOP and ask for approval before the next milestone. Do not claim untested integrations work (MongoDB, Atlas Search, Cloudinary, Resend and Geoapify were never verified; see "Blockers"). Reuse `kashrutStatusService.js` and `restaurantSearchService.js` for every public status and filter. Follow the "Comment convention for new code" section in `PROGRESS.md`.
