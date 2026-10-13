# KosherRadar — Progress

Authoritative requirements: `PROJECT_SPEC.md` (do not edit without approval). Requirement status: `REQUIREMENTS_CHECKLIST.md`.

## Active milestone

**Milestone 7 — Hebrew academic project book** (DONE and merged to `main`). Scope from `PROJECT_SPEC.md` section 16: `PROJECT_BOOK.md` in Hebrew from the actual implementation. It does not claim Atlas Search, Cloudinary, Resend or Geoapify were verified. The local MongoDB checks in Milestone 6 are not Atlas. No application behavior was changed. Kashrut status and filters stay in `kashrutStatusService.js` and `restaurantSearchService.js`.

Milestones 1 to 7 are merged to `main`, including the later product update on public forms and the account page (`e483c2e`). This milestone has not been pushed. Cloudinary, Resend, Geoapify and Atlas Search are still without credentials (see "Blockers").

## Feature ownership (Milestone 7)

Recorded before implementation, per section 19. `--author` follows the responsible teammate. The book is AI-generated and must be reviewed by its owner. It is documentation of the whole system, not new application code. Merge order: `feature/project-book`, then this docs branch.

| Feature branch | Responsible teammate | Scope |
| --- | --- | --- |
| `feature/project-book` | Eli Mermelstein | `PROJECT_BOOK.md` in Hebrew: goals, roles, architecture, schemas, data flow, REST endpoints, auth and security, kashrut rules, external services, tests, setup, limitations, and screenshot placeholders where no images exist |
| `feature/milestone-7-docs` | Eli Mermelstein | Progress and checklist files, and a README pointer to the book |

## Feature ownership (Milestone 6)

Recorded before implementation, per section 19. `--author` follows the responsible teammate. The code is AI-generated and must be reviewed by its owner. Merge order: `feature/public-response-review`, then `feature/interface-verification`, then the docs branch.

| Feature branch | Responsible teammate | Scope |
| --- | --- | --- |
| `feature/public-response-review` | Eli Mermelstein | Security and data-leak review of public versus admin responses. Keep the internal kashrut sort key off the public restaurant page payload, rate-limit the public submission-context route the same way as the other public reads, and reject a login return path that is not a path inside this site. Tests for those checks |
| `feature/interface-verification` | Moshe Silber | Fixes found while checking English, Hebrew, right-to-left layout and the four width ranges. The restaurant page's "back to search" link is translated. The map stays usable when the page is right-to-left |
| `feature/milestone-6-docs` | Eli Mermelstein | Progress and checklist files, README completion, and an honest record of what was verified against a local database versus what is still blocked |

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

### Milestone 6

- Ownership was recorded first (`feature/milestone-6-docs`, not merged until this docs update). Then `feature/public-response-review` (Eli) and `feature/interface-verification` (Moshe) were built and merged into `main` with `--no-ff`, in that order. `feature/milestone-6-docs` is merged last. Branches were not deleted. All code is AI-generated and must be reviewed by its owner. Feature commits use `--author` for the responsible teammate. The merge commits carry the git-configured identity.
- **Security review.** Public restaurant details, search cards and suggestions already go through `publicRestaurantSerializer.js` and `toPublicTeuda`. Admin notes, submitter ids, rejection reasons, duplicate lists, search-token fields and Cloudinary ids are not in those shapes. The internal kashrut sort number `rank` was still copied onto the public details payload; it is now omitted. `GET /api/restaurants/:id/submission-context` is public and now uses the same rate limiter as the other public reads. After login, the return path is accepted only when it is a path inside this site (`safeReturnPath`). A normal user gets 403 from `/api/admin/check`. Registration ignores `role` and `points`. The password hash and award keys are not in `/api/users/me`. CORS sends `Access-Control-Allow-Origin` set to `CLIENT_URL`, not `*` and not the caller's origin. Express 5 does not turn `?q[$gt]=` into a nested operator; Zod drops that key and the search answers the normal list. That behavior was already covered by `searchRoutesHttp.test.js` and was seen again against the running API.
- **Fixes.** The loaded restaurant page said "Back to search" in English even when the rest of the page was Hebrew. It now uses the existing translation. Leaflet measures tiles from the left, so a right-to-left page was given `direction: ltr` on `.leaflet-container`. The words inside a popup still follow the page language.
- **Local database checks** (API against the MongoDB above, then the Vite app in the browser against that API). Register, login, wrong password, `/api/users/me`, admin 403, seed-admin a second time (`unchanged`), admin-created approved restaurants, a restaurant with no coordinates, English and Hebrew food search (`pizza` and `פיצה`), unknown restaurants hidden unless included, a level filter matching an unverified claim and not an unknown restaurant, a 5 km radius keeping Jerusalem and a 1 km Tel Aviv search dropping it, map bounds including a placed restaurant and omitting one without coordinates, public details hiding the admin note and `rank`, the same 404 for a missing id and a pending restaurant, approving a restaurant with no certificate leaving points at 0, a same-name restaurant nearby saved as a duplicate warning and not blocked, rejection requiring a reason and returning `emailStatus: NOT_CONFIGURED` while the rejection stayed saved, a report resolved with `NO_CORRECTION` awarding no points, forgot-password giving the same answer for a known and an unknown email, a bad reset token rejected, a certificate photo answered 503 with Cloudinary unset and no certificate document saved, place lookup with no Geoapify key returning `available: false` and no coordinates, and `npm run search:rebuild` leaving the pizza restaurant findable.
- **Browser.** Hebrew set `lang=he` and `dir=rtl`, and that choice was still there on the login page. Searching "pizza" left only the matching restaurant. The map showed one marker; its popup was Hebrew and right-to-left (details, call, Waze, share) while the map container stayed left-to-right. The restaurant page title was the restaurant name, the back link was "חזרה לחיפוש", and the page states that KosherRadar is not a kashrut authority. No horizontal scrolling at 390, 700, 900 and 1280 px. At 1280 the filters sit in a sidebar and the Filters button is hidden. At 700 and 900 the Filters button is shown. Clustering was not seen, because the filtered map had one marker. The share button was not clicked. Geoapify suggestions were not typed, because there is no key.

### Design decisions made in Milestone 6 (please review)

- **The local MongoDB is not Atlas.** Something on this computer was already listening on `127.0.0.1:27017`. The API used that server. A Docker MongoDB container was started and then removed; Node never wrote to it, because `127.0.0.1:27017` was the other process. Atlas Search cannot be turned on against this server.
- **The verification left data in that local database:** restaurants named Pizza Place, No Map Diner, Unknown Kitchen, Claimed Grill and Secret Pending Grill, a rejected duplicate, one report, password-reset token documents, a user created for the checks, and an admin `admin@kosherradar.local`. The admin password is only in gitignored `backend/.env`. Dropping the `kosherradar` database removes all of it.
- **`rank` stays inside `kashrutStatusService.js`.** Search and filters still sort with it. Only the public details payload stopped sending it.
- **A login return path that is not a site path becomes `/`.** Protected routes still pass `location.pathname`, which is already a site path. The guard is there so a later change cannot send the browser to another site.
- **Certificate points (+3 / +2) and a completed password reset were not run end to end.** Both need a step this environment cannot finish: Cloudinary for a real certificate photo, and Resend (or reading the reset token out of the database) for a real reset link. The unit tests for those rules are unchanged. The 503 upload and the `NOT_CONFIGURED` rejection email were run for real.

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

Run on `main` after the Milestone 6 feature merges (this docs commit only changes tracking files and the README):

| Command | Result |
| --- | --- |
| `cd backend; npm test` | 37 test files, 466 tests passed |
| `cd frontend; npm test` | 15 test files, 91 tests passed |
| `cd frontend; npm run typecheck` | passed |
| `cd frontend; npm run lint` | passed (no findings) |
| `cd frontend; npm run build` | passed (the production JavaScript bundle is over 500 kB; Vite only warns) |

The same `main` was then exercised against the local MongoDB described in the Milestone 6 work log, and the home page, map popup and restaurant page were used in the browser. New tests: `returnPath` (a login return path must stay inside the site). The public-details leak test now also rejects a `"rank"` field. The submission-route test expects the rate limiter on the submission-context route.

Run again on 12 October 2026 while writing the project book (documentation only; application code was not changed):

| Command | Result |
| --- | --- |
| `cd backend; npm test` | 37 test files, 466 tests passed |
| `cd frontend; npm test` | 14 test files, 89 tests passed |
| `cd frontend; npm run typecheck` | passed |
| `cd frontend; npm run lint` | passed (no findings) |
| `cd frontend; npm run build` | passed (the production JavaScript bundle is about 716 kB; Vite warns above 500 kB) |

New Milestone 5 backend tests: `mapSearchService`, bounds cases in `restaurantSearchRepository` and `geo`, map cases in `searchRoutesHttp`, public suggest/geocode cases in `placesService`. New frontend tests: `mapView`, `language`, `locales` (the two languages have the same keys and Hebrew strings are not empty), share cases in `navigationLinks`.

New Milestone 4 backend tests: `searchFields`, `geo`, `searchSchemas`, `kashrutFilters`, `restaurantSearchService`, `restaurantSearchRepository` (the built query, repository mocked), `searchRoutesHttp` (real HTTP, service mocked), `restaurantDetailsService`, `restaurantDetailsRoutesHttp`, `safeUrl`. New frontend tests: `searchApi`, `kashrutText`, `navigationLinks`, `safeUrl`.

Done once and not kept: the search page and the restaurant page (loaded, 404 state, filters, Load More, autocomplete) were opened in a browser against a throwaway stub API (`.scratch/`, git-ignored via `.git/info/exclude`). This proves the screens render and the requests are shaped as the stub expects; it does **not** prove anything about the real backend, MongoDB or Atlas Search. There are no frontend component tests.

Milestone 3 notes that still apply:

New Milestone 3 backend tests: `kashrutStatusService`, `emailService` (mocked `fetch`), `pointsService`, `adminSchemas`, `adminTeudaService`, `adminRestaurantService`, `adminReportService`, `adminRoutes` (middleware order on every route), `adminRoutesHttp` (real HTTP, services mocked), `passwordResetService`, `passwordResetRoutesHttp`. New frontend tests: `adminLabels`, `adminForms`, `resetToken`.

Not run in Milestone 3: any server against a real MongoDB, a real Resend email, a real Cloudinary upload (admin-created certificates and certificate deletion), and **none of the admin or password reset pages in a browser**. The frontend tests cover pure functions only, no components. The real-database behavior of the atomic updates (approve / reject, award points, consume reset token) is only covered by mocked unit tests.

Also done once and not kept: a throwaway Express app with the real multer, JSON-field, Zod and image-check middleware, called over HTTP with `fetch`. It returned 200 for a valid upload, 400 for a script renamed to `.jpg`, 413 for a file over 5 MB, 400 for a missing photo, 400 for broken JSON and a field error for a missing "other" hechsher text.

Not run: either server against a real MongoDB, a real Cloudinary upload, and the frontend in a browser. Backend tests use mocked repositories and a mocked Cloudinary SDK; frontend tests cover pure functions and payload builders only (no component tests).

## Blockers / setup needed

- **Verified in Milestone 6 against a local MongoDB** (`127.0.0.1:27017`, database `kosherradar`), not against Atlas: register, login, profile, admin rejection of a normal user, seed-admin run twice, search (including a Hebrew food word), filters, radius, map bounds, public details, submit and approve a restaurant with no certificate, duplicate warning, reject with no email provider, a report with no correction, forgot-password's identical answer, a 503 photo upload, and `npm run search:rebuild`. The browser then used that API (see the Milestone 6 work log). This does not prove Atlas Search, Cloudinary, Resend or Geoapify.
- **BLOCKED:** Atlas Search. Needs a real Atlas cluster, the index from `ATLAS_SEARCH_SETUP.md` and `ATLAS_SEARCH_ENABLED=true`. The local MongoDB used above cannot serve an Atlas Search index. Search answered with `search.mode: BASIC`.
- **BLOCKED:** Cloudinary. Needs `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. With them missing, a real JPEG upload answered 503 and no certificate was saved. A real upload, and therefore +3 / +2 points on certificate approval, was not run.
- **BLOCKED:** Resend. Needs `RESEND_API_KEY` and `EMAIL_FROM`. A rejection was saved and the admin response was `emailStatus: NOT_CONFIGURED`. No email was sent. A password reset link was not opened, because the raw token is only put in that email.
- **BLOCKED:** Geoapify. Needs `GEOAPIFY_API_KEY`. With it missing, `GET /api/places/suggest` answered `available: false` and did not invent coordinates. No real Geoapify request has been made.
- **UNVERIFIED:** rate limiters were not driven past their limits on the running server. Password-reset sessions are still not revoked (JWTs stay valid until they expire). Clustering was not seen in the browser (the filtered map had one marker). The share button was not clicked. Widths were measured at 390, 700, 900 and 1280, which sit in the four ranges; not every pixel width was measured.
- The local database still holds the restaurants, user and admin created for these checks. See the Milestone 6 design decisions for the names and how to remove them.

To finish the remaining blocked items: put a real Atlas connection string in `backend/.env` (and allow this computer's IP), run `cd backend; npm run seed:admin` and `npm run search:rebuild`, create the Atlas Search index from `ATLAS_SEARCH_SETUP.md`, set `ATLAS_SEARCH_ENABLED=true`, and search a mistyped name. Add Cloudinary keys and upload a certificate photo, then approve it and check `users.points`. Add Resend keys and use `/forgot-password` with your own address. Add a Geoapify key and choose a place in the location field.

## Product update (after Milestone 6)

Requested in one session and applied on the working tree. This is not a new milestone. The hechsher-to-level map is still waiting for the team, so it was not guessed.

- **Login length.** A session that is still open after about 15 hours matches the rule: tokens last 24 hours (`JWT_EXPIRES_IN`, default `24h`). Nothing was changed. A password reset still does not end sessions that are already open.
- **Search captions.** The gray "Optional…" line under the location box and the gray line under "Using: …" are gone. The location box, current-location button, and Clear location stay.
- **Admin create form.** Hebrew and English name and address are not on the create form. The private note and the Kosharot link stay. The edit form still has the four language fields.
- **Who approved a restaurant.** The public list, map, and restaurant page still do not name the admin. There is no "approved by" field. The admin dashboard still shows "Sent by" to admins only.
- **Account page.** The points total stays. The earning rules, the "only you can see this" line, the email row, and the role row are gone. Submissions are listed on this page. `/account/submissions` opens the account page. "My submissions" is gone from the navbar. The email in the navbar is still the link to the account.
- **Language.** The English / Hebrew button pair is a globe in the corner of the bar. Clicking it still switches the language and saves the choice.
- **Address completion.** Typing an address on the restaurant form and in the search location box already asks for suggestions. The lists stay empty until `GEOAPIFY_API_KEY` is set. A typed address that is not in the list can still be submitted.
- **Restaurant submit.** The only required fields are name, address, and hechsher. City, food type, categories, phone, website, certificate photo, expiration, and mashgiach are optional. A missing required field is named, and that input is marked red. The hechsher is saved as an unverified claim. The level is not asked, because the map from hechsher to Rabbanut or Mehadrin is not set yet. An admin can set the level on the restaurant. A full certificate is stored only when the level, expiration, mashgiach, and photo are all present, so a photo on this form is not stored until that map exists. The add-certificate page still asks for a level. The admin create form still requires food type and a category.
- **Report a problem.** The form is a required note and an optional certificate photo. The type menu, certificate picker, and proposed hechsher and level are gone. The photo is stored like other certificate photos when Cloudinary is configured. Without those keys the note can still be sent and a photo answers 503.
- **Unverified claim.** The restaurant page says it once, in the kashrut status. The second dashed box is gone.
- **Google Maps.** The button searches the restaurant name and address, so Google can open the business. Waze still routes to the coordinates.

Checks after this update: `cd backend; npm test` (37 files, 466 tests passed), `cd frontend; npm test` (14 files, 89 tests passed; the two report-payload tests were removed with that payload), `cd frontend; npm run typecheck` passed, `cd frontend; npm run lint` passed.

### Milestone 7

- Ownership was recorded first (`feature/milestone-7-docs`, not merged until this docs update). Then `feature/project-book` (Eli) was written and merged into `main` with `--no-ff`. `feature/milestone-7-docs` is merged last. Branches were not deleted. The book is AI-generated and must be reviewed by its owner. The feature commit uses `--author` for Eli Mermelstein. The merge commits carry the git-configured identity.
- **`PROJECT_BOOK.md`** is in Hebrew and follows the code on `main`, including the form and account changes after Milestone 6. It covers goals, roles, architecture, the five Mongoose models, data flow, the central routes, auth and security, kashrut rules and points, search and the map, external services, the test commands from this session, setup, and limitations.
- **Screenshots.** There are no image files in the repository. Section 14 of the book is a table of placeholders. It does not pretend those screens were captured for the book.
- **Not claimed.** Atlas Search, a real Cloudinary upload, Resend delivery, and a real Geoapify lookup stay blocked. The Milestone 6 local MongoDB run is described as local MongoDB, not Atlas. The user restaurant form does not ask for a kashrut level, so a photo on that form is not stored; the hechsher is an unverified claim. The separate add-certificate page still asks for a level.
- No application source was changed. The suites above were run again and still pass.

## Next milestone

Section 16 has no Milestone 8. Do not start new product work. The book is waiting for the team's review. Atlas Search, Cloudinary, Resend and Geoapify are still blocked until credentials exist (see "Blockers").

## Continuation prompt (copy into a new Cursor Agent conversation)

> Read `PROJECT_SPEC.md`, `PROGRESS.md`, `REQUIREMENTS_CHECKLIST.md`, and `PROJECT_BOOK.md`. Milestones 1 to 7 are done. Do not modify `PROJECT_SPEC.md` without approval, and do not start a new feature. If asked to correct the Hebrew book, change only `PROJECT_BOOK.md` so it still matches the code, and do not claim Atlas Search, Cloudinary, Resend or Geoapify were verified. A local MongoDB was used in Milestone 6; that is not Atlas.

## Code audit (12 October 2026)

Read-only audit of the application. No application code, tests, schemas, dependencies, configuration, or database data were changed. Live Cloudinary, Resend, Geoapify, and Atlas were not called. `.env` files were not read. The historical milestones above stay as they were. This section is the current position for the improvement program.

Standing rules for later sessions are in `AGENTS.md`. Issue status is only in `FIX_TRACKER.md`. Evidence is in `AUDIT_FINDINGS.md`. Counts below are copied from the tracker at the end of the audit (36 issues: 22 `NOT STARTED`, 8 `ALREADY WORKING`, 5 `BLOCKED`, 1 `DEFERRED`, 0 `VERIFIED`).

### Current position

- **Current milestone:** audit complete. Implementation has not started. Milestone 1 is next only after the user reviews the findings and answers the M1-001 question.
- **Current issue:** none in progress.
- **Last verified fix:** none from this audit. Eight investigations are `ALREADY WORKING` in the tracker (M2-001, M3-001, M3-002, M4-002, M7-001, M7-002, M7-003, M8-001). That means the suspected gap was not in the code. It is not a new test run.
- **Next outstanding issue:** M1-001, after approval.

### What the audit found

Four confirmed defects:

- **M1-001.** The new-restaurant form hides kashrut level and then sends the certificate and photo only when that level is set. It never is, so the photo and the other certificate fields are dropped and the user still sees success. The hechsher is saved as an unverified claim. The add-certificate page still asks for a level and still uploads.
- **M2-002.** Applying a proposed report correction writes the teuda or claim before the report row is claimed. A lost race does not roll the data write back.
- **M4-001.** Password reset does not invalidate existing JWTs. They last until `JWT_EXPIRES_IN` (default 24h).
- **M5-002.** The reset token is consumed before the new password is saved. A failed password write burns the link.

The old "approve from the restaurant screen does nothing" report does not match the current code: both approve buttons call `approveRestaurant`, and the detail button is outside the edit form (M2-001). Saving that edit can still be blocked when a user left food type or categories empty (M2-003). Public kashrut status is still derived only in `kashrutStatusService.js` (M3-001). Do not rename verified / unverified / expired / unknown without approval (M3-002).

### Blockers and decisions

Do not start Milestone 1 until the user chooses how M1-001 should behave: store a pending certificate with no kashrut level (additive schema, no backfill expected), or refuse the photo with a visible error. Do not invent a hechsher-to-level map.

Other questions are listed in `AUDIT_FINDINGS.md`: city optional (current code says yes), points for "already corrected" without a field change, admin history, Hebrew native-speaker review, which isolated Atlas / Geoapify / Cloudinary / Resend resources may be used, whether to add Playwright, and who backs up the database. `helmet`, `mongodb-memory-server`, and Playwright are not approved. HttpOnly cookies stay deferred (M4-004).

### Verification commands

Not run in this audit. From the package scripts: `cd backend; npm test`. `cd frontend; npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. The backend has no lint, typecheck, or build script. There is no end-to-end script. Full table: `AUDIT_FINDINGS.md`, "Verification commands".

### Handoff for the next agent

Read `AGENTS.md`, this file, and `FIX_TRACKER.md`. Check Git status. Application source should match this audit; only `AGENTS.md`, `FIX_TRACKER.md`, `AUDIT_FINDINGS.md`, and this progress section were added for the audit.

Exact next task after the user says to start: Milestone 1 only, beginning with M1-001 using the approved storage rule. Then M1-002 and M1-003. Stop at the end of Milestone 1. Do not call live Geoapify, Cloudinary, Resend, or Atlas. Do not install packages. Hebrew UI text that you add must be flagged for native-speaker review.

### Next recommended action

The MUST FIX NOW list is complete. Do not start LATER issues unless the user asks.

## Acceleration (12 October 2026)

The user asked to finish important fixes and to leave low-impact work, cosmetic work, end-to-end infrastructure, and production hardening for later. `FIX_TRACKER.md` now has MUST FIX NOW and LATER. Issue IDs were kept.

Decisions applied without another question:

- Partial certificate evidence is stored as PENDING. The user does not choose a kashrut level. An admin sets the level and expiration before approval. Until then it is not public and points are not awarded. Approval still uses the existing +3 / +2 helper, once.
- City is required on a user submission and is filled from a picked address when that address includes a city.
- The user form no longer asks for food type or categories. Those fields stay on the admin form and in the API.
- A typed address is pinned only when Geoapify returns one precise hit (confidence at least 0.8 and match type `full_match`, `inner_part`, or `match_by_building`) or one precise hit at least 0.2 ahead of the next. Otherwise the text is saved with no coordinates. A picked suggestion is trusted. No live Geoapify call was made.
- `CORRECTION_ALREADY_MADE` still awards +1. That points rule was not changed.

Hebrew strings added or edited in this pass need native-speaker review (M8-004). The form was not opened in a browser.

Verification for M1-001, M1-002, M1-003, M6-003, and M8-002:

| Command | Result |
| --- | --- |
| `cd backend; npm test` | exit 0, 37 files, 477 tests passed |
| `cd frontend; npm test` | exit 0, 14 files, 90 tests passed |
| `cd frontend; npm run typecheck` | exit 0 |
| `cd frontend; npm run lint` | exit 0 |
| `cd frontend; npm run build` | exit 0 (bundle about 722 kB; Vite warns above 500 kB) |

Close-out verification on `feature/audit-must-fix`, after every MUST FIX NOW change was committed:

| Command | Result |
| --- | --- |
| `cd backend; npm test` | exit 0, 38 files, 485 tests passed |
| `cd frontend; npm test` | exit 0, 14 files, 90 tests passed |
| `cd frontend; npm run typecheck` | exit 0 |
| `cd frontend; npm run lint` | exit 0 |

The admin restaurant screen was not opened in a browser. No live Geoapify, Cloudinary, Resend, or Atlas call was made.

Integration check on 12 October 2026, before QA-001 and QA-002, on a clean `feature/audit-must-fix` that was 6 commits ahead of `main` (`430d4e2`) and 0 behind:

| Command | Result |
| --- | --- |
| `cd backend; npm test` | exit 0, 38 files, 485 tests passed |
| `cd frontend; npm test` | exit 0, 14 files, 90 tests passed |
| `cd frontend; npm run lint` | exit 0 |
| `cd frontend; npm run build` | exit 0 (bundle about 722 kB; Vite warns above 500 kB) |

`git merge-tree` of `feature/audit-must-fix` into `main` was clean. The branch can fast-forward. It was not merged.

QA-001 and QA-002 were then fixed on this branch. See the onboarding section. Backend tests were run again: exit 0, 38 files, 489 tests passed. Frontend files were not changed by those two fixes, so the frontend results above still apply.

## Integration (12 October 2026)

The user approved integrating the completed functionality, UI, and QA work. Done on the primary worktree only. The UI, QA, and UX worktrees were not modified. Nothing was pushed.

- `feature/audit-must-fix` fast-forwarded `main` from `430d4e2` to `7c5fe29`. No unrelated uncommitted files were present.
- `feature/ui-polish` (`e479f31`) merged as `226e0bc`. No conflicts. Visual classes and the functionality fixes are both on `main`.
- `feature/qa-testing` (`54d9605`) merged as `dbf5672`. No conflicts.
- QA-001's regression in `backend/tests/qaPendingCertificateIdentity.test.js` is a normal `it`. The assertion is unchanged: the two undated lookups must not be equal.

Checks on the combined tree:

| Command | Result |
| --- | --- |
| `cd backend; npm test` | exit 0, 40 files, 497 tests passed |
| `cd frontend; npm test` | exit 0, 14 files, 90 tests passed |
| `cd frontend; npm run lint` | exit 0 |
| `cd frontend; npm run typecheck` | exit 0 |
| `cd frontend; npm run build` | exit 0 (JavaScript bundle about 724 kB; Vite warns above 500 kB) |

The home page, restaurant page, login, and missing-page screens were not opened in a browser after the UI merge. `UI_PROGRESS.md` still asks for that look at about 390px and above 1024px, in English and Hebrew.

## Integration: feature/ux-functionality (12 October 2026)

Merged on the primary worktree only. Nothing was pushed. `feature/backend-qa-fixes`, `feature/design-overhaul`, and `feature/workflow-verification` were not merged, rebased, or edited.

The request named tip hashes as the placeholders `<MAIN_HASH>` and `<UX_HASH>`. The real tips were `main` `3bbb1e2da84215e62c82010de755be2b574aa6bf` and `feature/ux-functionality` `c897ed6ccbe471d6877f9938379a36c2484e50e0`. `UX_FUNCTIONALITY_PROGRESS.md` already recorded that `main` hash as the branch baseline. `c897ed6` is one documentation commit on top of `2a8a9f5`: it only replaces the Work Package 3 line in `UX_FUNCTIONALITY_PROGRESS.md` with the feature commit hash. That commit is compatible, so the merge continued.

- Backup ref: `backup/main-pre-ux-merge` at `3bbb1e2da84215e62c82010de755be2b574aa6bf`
- Merge commit: `cfdf7fc1c2306cdeee38dfa8bd6ba8b0fb4ce2c9`
- Parents: `3bbb1e2da84215e62c82010de755be2b574aa6bf` (`main`) and `c897ed6ccbe471d6877f9938379a36c2484e50e0` (`feature/ux-functionality`)
- Conflicts: none. `git merge --no-ff` completed with the `ort` strategy.
- Locale files: no conflict and no duplicate keys. The feature branch added the same new keys in English and Hebrew (`home.rateLimited`, `home.unknownHidden`, `filters.clearGroup`, and the `auth.need*` sentences). `filters.hideExpired` changed in both languages as part of that branch, not as a merge disagreement. `frontend/src/locales/locales.test.ts` passed after the merge.
- `package-lock.json` was not changed. No install was run.
- Backend tests were not run. `git diff --name-only 3bbb1e2..cfdf7fc -- backend` is empty.
- `git diff --stat 3bbb1e2..cfdf7fc` is the 44 frontend and progress files from the UX branch. Nothing outside that scope changed.
- `git merge-base --is-ancestor` exits 1 for `feature/backend-qa-fixes` (`bca1b3a`), `feature/design-overhaul` (`34950bd`), and `feature/workflow-verification` (`7811ca2`). Those tips are not ancestors of `main`.

The UX tip was tested from a temporary detached checkout, not from `C:\FS\projects\KosherRadar-ux-functionality`. That worktree was not modified.

| Command | `main` before merge | UX tip `c897ed6` | `main` after merge |
| --- | --- | --- | --- |
| `cd frontend; npm test` | exit 0, 14 files, 90 tests | exit 0, 22 files, 127 tests | exit 0, 22 files, 127 tests |
| `cd frontend; npm run lint` | exit 0 | exit 0 | exit 0 |
| `cd frontend; npm run typecheck` | exit 0 | exit 0 | exit 0 |
| `cd frontend; npm run build` | exit 0, JS about 724.25 kB | exit 0, JS about 742.89 kB | exit 0, JS about 742.89 kB |

The 14 test files on pre-merge `main` are still present. The post-merge list is the UX list: the original 14 plus `usePageMeta.test.tsx`, `useRestaurantSearch.test.tsx`, `useSearchCriteria.test.tsx`, `searchCriteria.test.ts`, `searchReturn.test.ts`, `adminTab.test.ts`, `loginReason.test.ts`, and `restaurantName.test.ts`. No test file or test count disappeared, and no new failure appeared.

| Requirement | Evidence | Result |
| --- | --- | --- |
| `useSearchCriteria` and `SearchCriteriaApi` present | `frontend/src/hooks/useSearchCriteria.ts` exports both. `useSearchCriteria.test.tsx` passed. | Pass |
| Search and filter persistence intact | `searchCriteria.test.ts` ("commits draft text with the filter in one transition") and `useSearchCriteria.test.tsx` ("applies the latest draft together with a filter and can navigate back"). Browser on `http://localhost:5191` with a local mock API on port 5192: typing `pizza` became `/?q=pizza`; checking Meat became `/?q=pizza&foodType=MEAT` with Meat checked; Back to search restored that URL, the text, and Filters (1). | Pass |
| Authentication return destinations work | `loginReason.test.ts` ("names the contribution page that required an account") and `returnPath.test.ts`. Browser: opening `/restaurants/6acc84e0953576757dad2141/add-teuda` while logged out landed on `/login` and showed "An account is required to add a certificate." | Pass |
| Localized restaurant names preserved | `restaurantName.test.ts` (submitted name, stored Hebrew heading, stored English heading). Browser: English heading `Pizza Place` with `מקום פיצה` under it; after the language switch the heading was `מקום פיצה`, the second line was `Pizza Place`, and the title was `מקום פיצה - KosherRadar`. | Pass |
| Unverified-claim explanations still visible | No component test renders the sentences. The page uses `details.claimSays` and `details.claimNote` in `RestaurantDetailsPage.tsx`. Browser, mock restaurant with one `UNVERIFIED` item and no certificate list: English "The restaurant says: Badatz Machpud, Mehadrin." and "No certificate has been checked for this. Please ask the restaurant to show its certificate." Hebrew: "המסעדה אומרת: בד״ץ מחפוד, מהדרין." and "לא נבדקה תעודה עבור זה. בקשו מהמסעדה להציג את התעודה." | Pass |
| Other worktrees untouched | Compared immediately before the merge and after it. See the worktree note below. | Pass |

Worktrees. At the start of this session the design worktree was `d3d69fd` with uncommitted edits. Before the merge it was already `34950bd` and clean. This merge did not do that. The snapshot taken immediately before `git merge` matches the snapshot after it:

| Worktree | HEAD before and after | Status before and after |
| --- | --- | --- |
| `KosherRadar-backend-qa` | `bca1b3a` | clean |
| `KosherRadar-design` | `34950bd` | clean |
| `KosherRadar-qa` | `54d9605` | clean |
| `KosherRadar-ui` | `e479f31` | clean |
| `KosherRadar-ux` | `7d2a1a6` | untracked `UX_REVIEW.md` |
| `KosherRadar-ux-functionality` | `c897ed6` | clean |
| `KosherRadar-workflow` | `7811ca2` | clean |

Follow-up, not changed here: Hebrew strings added in Work Packages 1B, 1C, and 2 still need native-speaker review. The design branch is still separate and should import `useSearchCriteria` rather than a second search store. The map popup, device geolocation, and a live geocoder were not used in this check. The mock API was local only.

## Backend Concurrency Integration — 12 October 2026

`feature/backend-qa-fixes` was merged into local `main`. Nothing was pushed. `feature/design-overhaul`, `feature/workflow-verification`, and `feature/ux-review` were not merged.

The reported hashes matched the repository: pre-merge `main` `bbe81cf42804f7aa512784a366e501940d315484`, backend tip `bca1b3a1597d2905ae604fe3c26c34bb5137541e`, merge base `3bbb1e2da84215e62c82010de755be2b574aa6bf`. The six commits unique to the backend branch are the restaurant, certificate, and report race tests and their fixes. No other product area was changed on that branch. `git merge-tree --write-tree` reported no conflicts. The real merge also had none.

- Backup ref: `backup/main-pre-backend-merge` at `bbe81cf42804f7aa512784a366e501940d315484`
- Merge commit: `07c6a3f0e8f1fb4d0f4436e0c6acb6ea3dc137d2`
- Parents: `bbe81cf42804f7aa512784a366e501940d315484` (`main`) and `bca1b3a1597d2905ae604fe3c26c34bb5137541e` (`feature/backend-qa-fixes`)
- `git diff --stat bbe81cf..07c6a3f -- frontend` is empty. UX files were not changed.
- Readiness procedure: `docs/BACKEND_INDEX_READINESS.md`

### Tests

Backend has no lint script. Vitest reported no skipped tests. The concurrency files use `node:test` and are not part of `npm test`.

| Command | `main` before | Backend tip `bca1b3a` | `main` after |
| --- | --- | --- | --- |
| `cd backend; npm test` | exit 0, 40 files, 497 passed, 0 failed, 0 skipped | exit 0, 40 files, 505 passed, 0 failed, 0 skipped | exit 0, 40 files, 505 passed, 0 failed, 0 skipped |
| `cd frontend; npm test` | exit 0, 22 files, 127 passed, 0 failed, 0 skipped | not run (backend-only tip) | exit 0, 22 files, 127 passed, 0 failed, 0 skipped |
| `cd frontend; npm run lint` | exit 0 | not run | exit 0 |
| `cd frontend; npm run typecheck` | exit 0 | not run | exit 0 |
| `cd frontend; npm run build` | exit 0, JS about 742.89 kB | not run | exit 0, JS about 742.89 kB |

The backend tip was tested from a temporary detached worktree, then removed. Agent 2's worktree was not used for tests. `node --test integration/assertSafeAgent2Database.check.mjs` on the merged tree: exit 0, 3 passed, 0 failed, 0 skipped. It does not open a database.

### Live concurrency tests

Not executed. The harness in `backend/integration/assertSafeAgent2Database.mjs` accepts only `mongodb://127.0.0.1:27017/kosherradar_agent2_test` and rejects every other database name, including `kosherradar_backend_integration_test`. There is no URI override. Running the three files would write Agent 2's existing database. Tracked source was not edited to retarget them.

The unrun cases are the `node:test` names in:

- `backend/integration/concurrentRestaurantSubmission.integration.mjs` (10 tests, including "two concurrent identical submissions leave one pending restaurant")
- `backend/integration/concurrentCertificateSubmission.integration.mjs` (12 tests, including "two concurrent dated certificates for the same restaurant collapse to one" and "two concurrent identical undated certificates collapse to one")
- `backend/integration/concurrentReportSubmission.integration.mjs` (9 tests, including "two concurrent identical reports leave one pending report and award no points")

Unit coverage that did run: `models.test.js` ("keeps one pending submission per user, normalized name, and address", "keeps one pending dated certificate per user, restaurant, hechsher, and date", "stores a short pending identity and does not index the description"); `restaurantSubmissionService.test.js` ("answers 409 when a concurrent insert loses the pending identity index", "does not treat a different duplicate key as a pending restaurant conflict"); `teudaSubmissionService.test.js` ("answers 409 when a concurrent insert loses a pending certificate index"); `reportSubmissionService.test.js` ("answers 409 when a concurrent insert loses the pending report index", "does not treat a different duplicate key as a pending report conflict"). Those tests mock the database.

Duplicate-key mapping uses `keyPattern`, not the index name. A non-matching code 11000 is rethrown. `errorMiddleware` still turns every uncaught 11000 into 409 "This value is already in use". That generic path was already documented for an admin save that collides with the restaurant index. It was not changed.

### Indexes and startup

On empty local database `kosherradar_backend_integration_test` at `127.0.0.1:27017`, additive `createIndexes()` succeeded. MongoDB server version was 7.0.22. Atlas was not contacted. No documented minimum server version was found in the README. Atlas compatibility is unverified.

Observed unique indexes:

| Name | Keys | Partial filter |
| --- | --- | --- |
| `pending_submitter_name_address` | `submittedBy`, `nameNormalized`, `addressNormalized` | `{ status: "PENDING" }` |
| `pending_dated_certificate_identity` | `restaurant`, `submittedBy`, `hechsher`, `hechsherOther`, `kashrutLevel`, `expirationDate` | `{ status: "PENDING", expirationDate: { $type: "date" } }` |
| `pending_undated_certificate_identity` | `restaurant`, `submittedBy`, `hechsher`, `hechsherOther`, `kashrutLevel`, `mashgiachName`, `mashgiachPhone`, `photoFingerprint` | `{ status: "PENDING", expirationDate: null }` |
| `pending_report_identity` | `submittedBy`, `restaurant`, `pendingReportFingerprint` | `{ status: "PENDING", pendingReportFingerprint: { $type: "string" } }` |

A separate empty local database, `kosherradar_backend_legacy_scratch`, received synthetic pending documents and no personal data. Two pending reports with no fingerprint: `createIndexes()` succeeded, and `pending_report_identity` was present. Two pending restaurants for the same submitter with no normalized fields: `createIndexes()` failed with code 11000. Two undated pending certificates with no photo fingerprint: `createIndexes()` failed with code 11000. Those databases were left in place. They were not dropped.

Mongoose's default `autoIndex` is true (`mongoose/lib/mongoose.js`). `connectDb` awaits `mongoose.connect` and does not await `Model.init()`. `server.js` then calls `listen`. Index creation is therefore not finished before the process accepts submissions. A failed automatic build emits `error` on the model. `server.js` does not handle that event and does not exit because an index is missing.

Importing the models loaded `backend/.env` through `dotenv` (`injected env (1)`). The external-service flags read after that load were all unset. The script connected with an explicit loopback URI and checked the database name before writing. The `.env` file was not read or printed.

### Still not resolved

Carried forward from `BACKEND_QA_FIX_PROGRESS.md`. This merge does not close them.

- NEEDS PRODUCT DECISION: a legacy undated certificate with no photo fingerprint still matches a later no-photo submission.
- NEEDS PRODUCT DECISION: `CORRECTION_ALREADY_MADE` still awards +1 without a field diff.
- DEFERRED: an uncaught register email 11000 uses the generic middleware sentence.
- DEFERRED: search candidate cap (M6-001).
- BLOCKED: restaurant deletion is not one transaction (standalone MongoDB, no new dependency).
- BLOCKED: Cloudinary delete failures (M5-004), no credentials.
- BLOCKED / DEFERRED: security headers (M4-003) and cookie auth (M4-004).
- Reopening a resolved report can fail the new index if an identical pending report already exists.
- Old reports without `pendingReportFingerprint` are not backfilled.
- Production and Atlas were not scanned.

### Worktrees and excluded branches

Immediate before/after status of the other worktrees matched: backend-qa `bca1b3a` clean, design `34950bd` clean, QA `54d9605` clean, UI `e479f31` clean, UX review `7d2a1a6` with untracked `UX_REVIEW.md`, UX functionality `c897ed6` clean, workflow `7811ca2` clean.

`git merge-base --is-ancestor` exits 1 for `feature/design-overhaul` (`34950bd`) and `feature/workflow-verification` (`7811ca2`). Both still have commits that are not in `main`. `feature/ux-review` (`7d2a1a6`) was already an ancestor of pre-merge `main`; this merge did not add its commits. The design branch remains independent.

## Visual Design Integration — 12 October 2026

`feature/design-overhaul` was merged on staging and promoted to `main` by fast-forward only. No push.

| Item | Hash |
|---|---|
| Pre-integration `main` (`MAIN_BEFORE`) | `36cf869fd132e6acbe800c9d1d78bcadb1e25035` |
| Design tip | `34950bd0c1284acb7f3f61897830e28e98daff93` |
| Backup | `backup/main-pre-design-merge` → `36cf869fd132e6acbe800c9d1d78bcadb1e25035` |
| Design merge | `f3d3db0f470c189934301341eeb046c4451b87ce` (parents: preflight `bf47636`, design tip `34950bd`) |
| Promoted `main` | The fast-forward target is the staging tip that contains this section. The agent report records that hash after promotion. |

19 textual conflicts. 20 overlapping files reviewed, including `AdminDashboardPage.tsx`, which merged without a conflict marker. Resolution kept `main` search, admin-tab, login-return, and bilingual-name behavior, and applied the design classes. No second search store. `git diff 36cf869 HEAD -- backend` is empty. Backend concurrency commit `07c6a3f` remains an ancestor.

No new dependencies, lockfile changes, icon libraries, or external font URLs. The font stack is the system stack, including Segoe UI, Noto Sans Hebrew, and Arial Hebrew.

Frontend bundle after integration: JS `index-BNhbbtpQ.js` 749.63 kB (gzip 219.16 kB), CSS `index-CLDEltFl.css` 47.29 kB (gzip 13.13 kB). Against pre-integration main (JS 742.89 kB, CSS 46.62 kB) that is about +6.74 kB of JavaScript and +0.67 kB of CSS. The existing chunk-size warning remains. No new dependency explains it.

One design CSS order bug was corrected on staging: the reduced-motion block in `frontend/src/index.css` now follows `.kr-spinner`, so `animation: none` wins. Before that, the later spinner rule kept the spin under `prefers-reduced-motion: reduce`.

Full overlap table, commands, and the browser matrix are in `DESIGN_INTEGRATION_HANDOFF.md`.

Screenshot notes (not committed): `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\` and `C:\Users\elime\AppData\Local\Temp\kr-design-integration-shots\`. The embedded browser pane is about 183px wide, so full-frame captures of an emulated 1280px layout tiled. Layout was measured with emulated viewports.

Deferred: native-speaker review of Hebrew copy, including design strings and the added `home.unknownExcluded` / `home.appliedFilters` keys. Geocoding was not exercised; the mock reports place search unavailable. Map tiles loaded from OpenStreetMap. A map popup was not opened because the visible map bounds did not contain the fixture markers in this session. Live Atlas, Cloudinary, Geoapify, and database-gated concurrency tests were not run.

## NEXT AGENT ONBOARDING

**Agent 2 assignment ? current for this worktree, 13 October 2026**

Branch fix/search-location, clean baseline dc5dc24 confirmed. Explicit scope SEARCH-001/002/004/005/006/007/008/009/010; one search/location milestone, sequential fixes. SEARCH-001 verified: 4 jsdom regressions, typecheck/lint exit 0; LocationField.tsx and its test. SEARCH-002 verified: URL failure is visible, list/map blocked until retry/clear; 11 hook and 2 page tests pass, lint/typecheck pass. SEARCH-004 verified: 57 mocked tests, bounded keyset batches preserve late eligible/nearest results. Nonunique status/_id index additive, no record migration; Atlas partial results reported. SEARCH-005 verified: warning appears independently of result count (4 page tests, lint/typecheck pass). SEARCH-006 verified: scoped location helper, 29 backend/2 frontend tests, lint/typecheck pass. SEARCH-007 code verified: 34 tests pass; city-aware identity and legacy read compatibility. Existing DB requires approved index replacement per SEARCH_LOCATION_INDEX_ROLLOUT.md, no live operations performed. SEARCH-008 verified: public city search separated from restaurant geocoding/autocomplete, 13 mocked tests pass. SEARCH-009 verified: all competitors considered, machine-rounding gap boundary fixed, 20 mocked tests pass. Next SEARCH-010: bounded provider and client location requests. No browser/live verification. Details in FIX_TRACKER.md and AGENT_2_FIX_PROGRESS.md. Existing dependencies copied locally without installation. No other worktree changes, merges, push or live services.

**Accepted V2 merge into local main — 13 October 2026 (current handoff; supersedes historical worktree instructions below)**

The user accepted the integrated V2 redesign and explicitly authorized its local merge into main. Worktree `C:/FS/projects/KosherRadar`, branch `main`; pre-merge main `539303733b887f499dbbeaf49db3e3dff55b2eeb`. Integration was clean and exactly at accepted commit `548743ec9c0084c5dda6db30603eb4b43a6ebed3`. Main had no tracked edits and only untracked `PRE_PUSH_REVIEW.md`. Its SHA256 before/after merge and validation: `D987D0DD2FBA7D1D2E9F94F3B1C70BEF6552594C6A99134DAA5A7D03ACA69E24`; preserved and excluded from commits.

Merge commit `406dd65b254333fa86d2f771554545e25c380406`, parents pre-merge main and accepted integration. `--no-ff`, no conflicts. The resulting tracked tree exactly equals accepted integration; no source code merge fixes or new redesign. Source integration remains at `548743e`, clean; source branches/worktrees were not modified. No reset, clean, deletion, push or deployment.

Post-merge checks from main: frontend `npm run lint`, `npm run typecheck`, `npm test` (26 files / 158 passed), `npm run build`, backend `npm test` (40 files / 505 passed), CRLF-aware diff check all exit 0. Build JS 766.92 kB / 224.38 kB gzip, CSS 70.70 kB; existing >500 kB chunk warning persists. Backend has no lint/typecheck/build scripts. Backend tests mocked; live service credentials disabled in that test process and MongoDB URI set to non-listening loopback test address. No database or live integration accessed. Browser not rerun in this promotion: accepted browser evidence remains in the integration worktree; source and production build outputs match the accepted version.

Review: no confirmed functional/security regression. Backend, API clients, auth/authorization/storage, search-state/navigation helpers, public status derivation/locale terminology, moderation/points, package manifests and lockfiles unchanged from pre-merge main. New UI keeps safe URL checks, text escaping, explicit geolocation, map request cancellation, route return state and separate trust/evidence states. Existing tests preserved; four component/map test files added. No new issue or partially implemented fix; tracker statuses unchanged.

Files modified after merge: documentation only (`PROGRESS.md`, `REDESIGN_INTEGRATION_PROGRESS.md`, `FIX_TRACKER.md`). The main documentation commit containing this handoff is final main HEAD; get exact hash with `git rev-parse main`. Historical integration prohibitions on merging main were superseded by the user's explicit acceptance/merge request; push/deploy prohibitions remain.

Exact next step: stop. V2 is accepted and integrated locally. Do not redesign, remerge, start LATER work, push, deploy, or delete branches/worktrees. Preserve untracked `PRE_PUSH_REVIEW.md`. Remaining limitations: native-speaker Hebrew review M8-004, existing bundle warning, and unverified live integrations/production readiness in FIX_TRACKER. These were not closed by this merge.


**Worktree-specific handoff — V2 integration, 13 October 2026 (supersedes details/main handoffs below for this checkout)**

Current milestone: COMPLETE — explicitly requested V2 integration and release review in `C:/FS/projects/KosherRadar-redesign-integration`, branch `redesign/wave-1-integration`. Clean starting HEAD `0140d19`; discovery `baff0d6` (includes expected implementation `a75b82b`), map `17b4a62`, and details `d45317b` merged with preserved histories as `bca213b`, `ab71efa`, `6d13d2d`. No textual conflicts. Source worktrees untouched; details' untracked temporary preview config preserved. Nothing merged into main or pushed.

Current fix: `V2-I001` VERIFIED, suppress redundant status inside claim-only evidence, preserving the warning, section heading, summary and mixed-evidence labels. Files: `UnverifiedClaims.tsx`, `RestaurantDetailsPage.tsx`, its test; tracking in `FIX_TRACKER.md`, this document and `REDESIGN_INTEGRATION_PROGRESS.md`. Details tests 14/14 pass; final frontend lint, typecheck, all 158 tests in 26 files, and production build pass (exit 0). Backend tests: 505/505 in 40 files, exit 0, existing dependencies copied locally without installation/lockfile changes; mocks only. Backend/API/auth/points/admin workflows unchanged; existing tests cover immediately authoritative admin records and no admin points.

Combined production browser review uses installed Chrome DevTools and intercepted local fixtures, including mocked tiles/certificate images; external requests blocked. Matrix English/Hebrew at 375/768/1024/1280 passed without horizontal overflow. Final post-fix browser command exit 0: 89 render/geometry records and 26 journey checks, zero app exceptions and horizontal overflow; local ignored evidence and harness in `design-screenshots/v2-integration/`. Browser checks include search/filter URL state, list/map/details/return journeys, all four trust statuses, responsive navigation, language switch, directions keyboard/focus, thumbnail failure, login redirects, error retry, short-map actions, and explicit geolocation with mocked denial. Full details in `REDESIGN_INTEGRATION_PROGRESS.md`.

Verified application checkpoint: `a34130d`. Final browser command exit 0, 81 page renders plus 8 geometry records / 26 checks; final fixture refresh exit 0, 47 records / 20 checks. No app exceptions or horizontal overflow. Final results: `design-screenshots/v2-integration/full-matrix-results.json` and `results.json`; 91 local ignored PNGs. Full final handoff in `REDESIGN_INTEGRATION_PROGRESS.md`. No partial application changes or failing checks remain. Exact next step: stop; ready for final human visual review. The documentation commit containing this handoff is final integration HEAD (`git rev-parse HEAD`). Native-speaker review remains M8-004 (`discoveryCopy.ts`, details `labels.ts`, existing locale/hechsher text). Existing >500 kB bundle warning remains. No live services, database writes, email, uploads, external directions/phone launches or native device permission dialog tested. Do not start LATER work, remerge source branches, edit their worktrees, merge main or push.

**Worktree-specific handoff — Visual v2 details, 13 October 2026**

This checkout is `C:/FS/projects/KosherRadar-visual-v2-details`, branch `redesign/v2-details`, recovered from `0140d19`. The user explicitly requested completing and committing the interrupted restaurant details redesign. `V2-D001` is verified; see `FIX_TRACKER.md` and `VISUAL_V2_DETAILS_PROGRESS.md` for files, decisions, and evidence. The existing light editorial redesign was preserved and completed with a collapsed keyboard-operable directions chooser and React-managed thumbnail failure handling. Frontend: 154 tests in 26 files, lint, typecheck, and build passed (exit 0). Browser: 80 synthetic fixture renders across four widths and both languages, no horizontal overflow; retry, directions keyboard controls, clipboard fallback, and login redirects passed. No live integration or backend verification was performed. New Hebrew labels need native-speaker review. All changes are local; no merge or push. Exact next step: stop after this checkpoint; preserve the untracked temporary preview config and do not modify other worktrees. Historical global-project onboarding below remains for context and is not this checkout's branch state.

**Current position**

- Branch: `main` (not pushed). It is ahead of `origin/main`.
- Current batch: MUST FIX NOW, QA-001, QA-002, `feature/ui-polish`, `feature/qa-testing`, `feature/ux-functionality`, and `feature/backend-qa-fixes` are on `main`. This was not a walk through all 11 milestones.
- Last verified fixes: the design integration merge `f3d3db0`, after the backend concurrency merge `07c6a3f` and the UX merge `cfdf7fc`. See "Visual Design Integration — 12 October 2026".
- Next issue: none until the user asks. Do not start a LATER issue. Do not merge `feature/workflow-verification` unless the user asks.
- Tracker counts: 11 VERIFIED, 8 ALREADY WORKING, 13 NOT STARTED, 5 BLOCKED, 1 DEFERRED. Total 38.

**Integration check**

- `main` contains `7c5fe29`, then merge `226e0bc` (`feature/ui-polish` at `e479f31`), then merge `dbf5672` (`feature/qa-testing` at `54d9605`). Not pushed.
- The UI worktree `C:/FS/projects/KosherRadar-ui` is still checked out on `feature/ui-polish` at `e479f31`. The QA worktree `C:/FS/projects/KosherRadar-qa` is still on `feature/qa-testing` at `54d9605`, where the QA-001 case is still `it.fails`. Those worktrees were not edited. On `main` that case is a normal `it`.
- `feature/ux-review` in `C:/FS/projects/KosherRadar-ux` is `7d2a1a6` and was not part of this integration. It was clean and was left alone.

**Completed work**

Certificate submission (M1-001, M1-002, M1-003, M6-003, M8-002), commit `5fb9a10`:

- A user can submit a photo or partial certificate details as PENDING evidence. The user does not choose a kashrut level. `kashrutLevel` sent by a user is stripped.
- An admin must set the kashrut level and expiration before approve. Until then the evidence is not public and does not award points. Approval still uses the existing +3 / +2 helper, once.
- Hechsher alone does not create a certificate. A photo without a hechsher is rejected. Mashgiach name and phone are optional on admin edit so photo-only evidence can be classified.
- User restaurant form requires name, address, city, and hechsher. Phone, website, photo, expiration, and mashgiach are optional. City is filled from a picked address when that suggestion includes a city. Food type and categories were removed from the user form only. Admin create still requires them.
- A typed address is pinned only when Geoapify returns one precise hit: confidence at least 0.8 and match type `full_match`, `inner_part`, or `match_by_building`, or one precise hit at least 0.2 ahead of the next. Otherwise the text is saved with no coordinates. A picked suggestion is trusted. The first hit is never used. Autocomplete and submit pass `lang` `en` or `he`.

Report corrections (M2-002), commit `8875a90`, with a small unset follow-up inside `b6e87ff`:

- `resolveReportService` checks that Apply has a real proposal, then claims the PENDING report, then writes the certificate or restaurant claim.
- If another admin already claimed it, the write does not run and the caller gets 409.
- If the write fails, `reopenResolvedReportRepo` sets the report back to PENDING, `correctionApplied` false, and unsets `adminNote`.
- `CORRECTION_ALREADY_MADE` still awards +1. That points rule was not changed.

Admin save (M2-003), commit `e43e699`:

- `AdminRestaurantPage` no longer refuses to save when categories are empty. The edit form does not require food type.
- `adminEditRestaurantSchema` no longer requires food type or categories. `adminCreateRestaurantSchema` still does.
- Report photos remain a link. Before/after history remains M2-004.

Password reset sessions (M4-001), commit `f87e665`:

- `User.tokenVersion` is additive, default 0. Missing on an old account means 0. No backfill.
- New JWTs include `tv`. `getUserFromTokenService` rejects a token whose `tv` does not match. A missing `tv` means 0, so this deploy does not log everyone out.
- `setUserPasswordHashRepo` sets `passwordHash` and `$inc` `tokenVersion` in one update.

Reset link (M5-002), commit `b6e87ff`:

- The reset token is still consumed before the password write, so two requests cannot both succeed.
- If hashing or saving the password fails, or the user row is gone, `releaseResetTokenRepo` sets `usedAt` back to null.
- If cancelling other unused links fails after the password was saved, the link stays used.

Undated certificate identity (QA-001):

- A dated pending certificate is still the same submission when the hechsher and expiration date match. That retry still returns 409.
- An undated pending certificate also has to match mashgiach name, mashgiach phone, and a sha256 of the photo. Different mashgichim or different photos are stored as separate PENDING rows.
- The fingerprint is an optional field on `Teuda`. Old photos are not backfilled. A missing fingerprint matches a submission that has no photo, so an older undated photo can still block a later no-photo submission with the same hechsher and mashgiach.
- A new restaurant submitted with a photo stores the same fingerprint. Points and public status labels were not changed.

Duplicate schema field (QA-002):

- The second `tokenVersion` block in `User.js` was removed. The remaining field is still `{ type: Number, default: 0, min: 0 }`. Session behavior is unchanged.

**Files a next agent should read first**

- `FIX_TRACKER.md` for status. `AUDIT_FINDINGS.md` for the original evidence. `QA_PROGRESS.md` on `feature/qa-testing` for QA-001 and QA-002.
- Certificate path: `backend/src/services/teudaSubmissionService.js`, `restaurantSubmissionService.js`, `placesService.js`, `adminTeudaService.js`, `frontend/src/pages/SubmitRestaurantPage.tsx`, `SubmitTeudaPage.tsx`.
- Reports: `backend/src/services/adminReportService.js`, `backend/src/repositories/adminReportRepository.js`.
- Admin edit: `frontend/src/pages/AdminRestaurantPage.tsx`, `backend/src/schemas/adminSchemas.js`.
- Auth: `backend/src/models/User.js`, `backend/src/services/authService.js`, `backend/src/services/passwordResetService.js`, `backend/src/repositories/userRepository.js`, `backend/src/repositories/passwordResetRepository.js`.

**Tests executed**

- Before QA-001 and QA-002: `cd backend; npm test` exit 0, 38 files, 485 tests passed. `cd frontend; npm test` exit 0, 14 files, 90 tests passed. `cd frontend; npm run lint` exit 0. `cd frontend; npm run build` exit 0, bundle about 722 kB.
- After QA-001 and QA-002: `cd backend; npm test` exit 0, 38 files, 489 tests passed. Mocks only.
- After the three branches were on `main`: `cd backend; npm test` exit 0, 40 files, 497 tests passed. `cd frontend; npm test` exit 0, 14 files, 90 tests passed. `cd frontend; npm run lint` exit 0. `cd frontend; npm run typecheck` exit 0. `cd frontend; npm run build` exit 0, bundle about 724 kB.
- Browser was not used. Live Geoapify, Cloudinary, Resend, and Atlas were not called.

**Do not repeat**

- Do not require a kashrut level from users, and do not show pending evidence as verified.
- Do not accept the first Geoapify hit.
- Do not change point amounts, public status labels, or who gets +1 for `CORRECTION_ALREADY_MADE`.
- Do not install packages, add a transaction library, or switch auth storage to cookies.
- Do not read or commit `.env` files.
- Do not modify `feature/ui-polish` or `feature/qa-testing`.

**Known limits**

- If reopening a report fails, the report can stay resolved without the correction. The original error is still thrown and the reopen failure is logged.
- If releasing a reset token fails, the password error is still returned and the link can stay used.
- Restaurant submit still compensates by deleting the restaurant when the certificate insert fails. Restaurant rejection still rejects certificates in a later call. Restaurant deletion is still a sequence of deletes. Those are LATER (M5-001 and the rest of M5-002).
- Logout still only clears the token in the browser. It does not bump `tokenVersion`.
- Hebrew strings added on the certificate form need native-speaker review (M8-004). That does not block the code.
- The admin restaurant screen was not opened in a browser.
- Pending photos saved before `photoFingerprint` have no hash. A later undated submission with no photo can still be treated as the same certificate when the hechsher and mashgiach match.

**Remaining work**

LATER, do not start unless the user asks: M2-004, M3-003, M4-003, M4-004, M5-001, M5-003, M5-004, M6-001, M6-002, M6-004, M8-003, M8-004, M9-001, M9-002, M9-003, M9-004, M10A-001, M10B-001, M11-001.

If the user asks to continue, the next priority is M4-003 (security headers without a new package unless they approve `helmet`). After that, M5-001 (restaurant deletion writes) only if they want more data-integrity work. Do not add Playwright, `helmet`, or `mongodb-memory-server` without approval.

The QA-001 case on `main` is already a normal `it`. The QA worktree still has `it.fails` at `54d9605` and was left that way on purpose.

**Exact next task**

Stop. The design branch is integrated. Do not push unless the user asks. Do not start a LATER issue. Do not merge `feature/workflow-verification` (`7811ca2`) unless the user asks. Hebrew copy still needs native-speaker review. Live concurrency tests still must not be pointed at `kosherradar_agent2_test`.
