# Agent 2 ? Search and location reliability

13 October 2026. Branch fix/search-location; clean baseline dc5dc24 confirmed. SEARCH-001 generation guards/rejection feedback implemented; tests pending. See FIX_TRACKER.md for all assigned statuses. Dependencies copied from existing main node_modules, no installs or manifest changes. No live service calls.

SEARCH-001 verified: 4 jsdom component regressions passed, typecheck/lint exit 0. Generation invalidation covers edits, picks, clearing, deliberate geolocation and unmount. No keyboard or locale changes. Initial test harness mock lacked initReactI18next; mocked activeLanguage, then tests passed. Next SEARCH-002.

SEARCH-002 verified: failed geography blocks list and map, error offers retry/clear. Existing bilingual strings reused, canonical near/radius URL and history-only coordinates preserved. Hook tests 11 passed; HomePage tests 2 passed; lint/typecheck pass. Test fixture corrected from API radiusKm to canonical URL radius. SEARCH-001 checkpoint be20298; frontend build exit 0 (existing 500 kB warning). Next SEARCH-004.

SEARCH-004 verified: 57 tests/3 files passed, service syntax check passed. Read all basic candidates in 2000-row keyset batches; 10-second per-query database deadlines, per-batch certificate reads, top-K retention and exact count. Final map marker cap retained after ranking/filtering. Atlas overflow probe (101) reports partial results with completeness reasons, even for zero matches. Additive nonunique status/_id index needs no record backfill; no live index creation done, rollback removes added index. Cost scales with matching candidates; live performance/Atlas unverified. Updated former preliminary-cap test because it asserted the defective truncation. SEARCH-002 checkpoint a997409. Next SEARCH-005.

SEARCH-005 verified: incomplete-results warning visible for zero-match intro/directory. HomePage tests 4 passed; typecheck/lint passed. Existing bilingual copy reused. SEARCH-004 checkpoint 0578a6d. Next SEARCH-006.

SEARCH-006 verified: admin address update resolves missing/stale pin, replaces/clears provider identity, preserves supplied admin coordinates and status. UI shows existing notPlaced/unavailable warning after save. Address suggestion without city clears old city; city edits invalidate pending suggestions. 29 backend + 2 frontend tests pass; lint/typecheck pass. No new Hebrew copy. Shared adminRestaurantService edit limited to import, mapping and update function; possible Agent 1 integration conflict there. SEARCH-005 checkpoint 65945b0. Next SEARCH-007.

SEARCH-007 code verified: normalized city in model/query/unique index; legacy city normalized at read time without backfill. 34 tests/3 files pass. Existing databases MUST replace old pending_submitter_name_address index; not performed or live verified. Concrete rollout/rollback assessment in SEARCH_LOCATION_INDEX_ROLLOUT.md. Keep code verification distinct from operational rollout. SEARCH-006 checkpoint 8c828ac. Next SEARCH-008.

SEARCH-008 verified: city-level public search supported; city/street/coarse results cannot become precise typed restaurant pins or address suggestions. Public place suggestions use separate service. 13 mocked provider tests pass, no live accuracy claims. SEARCH-007 checkpoint 8923a3a. Next SEARCH-009.

SEARCH-009 verified: exact 0.2 gap tolerates only floating-point machine rounding; near-tied candidates below eligibility threshold or coarse matches still compete. Invalid/missing confidence conservatively refuses selection. 20 mocked provider tests pass. SEARCH-008 checkpoint 7883208. Next SEARCH-010.

SEARCH-010 verified: server fetch/body bounded at 5 seconds with abort plus Promise.race; client /places requests bounded at 10 seconds, existing uploads and explicit overrides preserved. Controlled stalled headers/body and fake XHR tests pass: 23 backend/13 frontend tests, lint/typecheck pass. SEARCH-009 checkpoint 166e551. Next full suites/build/final review.

## Completion and handoff

Final batch: frontend npm test exit 0 (30 files / 174 passed); npm run lint, npm run typecheck, npm run build exit 0. Production JS 768.71 kB, existing >500 kB warning. Backend npm test exit 0 (42 files / 534 passed); no backend lint/typecheck/build scripts. Final completeness follow-up: backend npm test -- tests/restaurantSearchService.test.js tests/restaurantSearchRepository.test.js tests/mapSearchService.test.js exit 0 (57 passed). Git CRLF-aware diff check exit 0. Tests mocked/jsdom; browser and live services not tested.

Implementation checkpoints:

be20298 fix(search-001): ignore obsolete location lookups and show failures
a997409 fix(search-002): block searches when URL location restoration fails
0578a6d fix(search-004): evaluate candidates in bounded batches before ranking
65945b0 fix(search-005): show partial-result warnings for empty lists
8c828ac fix(search-006): keep admin address and provider location consistent
8923a3a fix(search-007): include normalized city in pending branch identity
7883208 fix(search-008): separate city search areas from precise restaurant pins
166e551 fix(search-009): compare all geocoding candidates at confidence boundaries
64457fc fix(search-010): bound provider and client location request deadlines

Final SEARCH-004 metadata follow-up also reports incomplete Atlas fallback. ATLAS_SEARCH_SETUP.md refreshed to match batch/cap semantics.

Changed tracked files:

- `AGENT_2_FIX_PROGRESS.md`
- `ATLAS_SEARCH_SETUP.md`
- `FIX_TRACKER.md`
- `PROGRESS.md`
- `SEARCH_LOCATION_INDEX_ROLLOUT.md`
- `backend/src/config/constants.js`
- `backend/src/controllers/placesController.js`
- `backend/src/models/Restaurant.js`
- `backend/src/repositories/restaurantRepository.js`
- `backend/src/repositories/restaurantSearchRepository.js`
- `backend/src/services/adminRestaurantLocationService.js`
- `backend/src/services/adminRestaurantService.js`
- `backend/src/services/placesService.js`
- `backend/src/services/restaurantSearchService.js`
- `backend/src/services/restaurantSubmissionService.js`
- `backend/tests/adminRestaurantLocationService.test.js`
- `backend/tests/adminRestaurantService.test.js`
- `backend/tests/mapSearchService.test.js`
- `backend/tests/models.test.js`
- `backend/tests/placesService.test.js`
- `backend/tests/restaurantPendingIdentity.test.js`
- `backend/tests/restaurantSearchRepository.test.js`
- `backend/tests/restaurantSearchService.test.js`
- `backend/tests/restaurantSubmissionService.test.js`
- `frontend/src/api/adminApi.ts`
- `frontend/src/api/axiosInstance.ts`
- `frontend/src/api/locationDeadline.test.ts`
- `frontend/src/components/AddressSearch.test.tsx`
- `frontend/src/components/AddressSearch.tsx`
- `frontend/src/components/LocationField.test.tsx`
- `frontend/src/components/LocationField.tsx`
- `frontend/src/hooks/useSearchCriteria.test.tsx`
- `frontend/src/hooks/useSearchCriteria.ts`
- `frontend/src/pages/AdminRestaurantPage.tsx`
- `frontend/src/pages/HomePage.test.tsx`
- `frontend/src/pages/HomePage.tsx`

Additional risks investigated by local code/document inspection: near-tied candidates confirmed and fixed under SEARCH-009; Atlas fallback regression passes but live index compatibility (including multi-name autocomplete mapping/query) remains unverified under M9-001; no live service called. Map uses existing chunked clustering, shared filters, bounds cancellation and capped status; no mobile/browser regression confirmed by this session and none claimed tested. Cloudinary is not called by the location resolver; uploads retain prior timeout settings and remain subject to existing integration limitations.

Required operational rollout: SEARCH_LOCATION_INDEX_ROLLOUT.md, mandatory old pending index replacement on approved resource; no backfill required due legacy read compatibility. No real indexes changed. Integration conflicts may occur in adminRestaurantService.js (import/mapping/update only), its tests, Restaurant.js and shared tracking documents. Existing bundle warning persists. No added Hebrew UI strings.

Exact next step: stop; no pending code work. Do not merge, push, deploy, access real data or apply index changes without separate approval. Final documentation/metadata checkpoint recorded by git log.
