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
