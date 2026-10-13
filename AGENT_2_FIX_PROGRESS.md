# Agent 2 ? Search and location reliability

13 October 2026. Branch fix/search-location; clean baseline dc5dc24 confirmed. SEARCH-001 generation guards/rejection feedback implemented; tests pending. See FIX_TRACKER.md for all assigned statuses. Dependencies copied from existing main node_modules, no installs or manifest changes. No live service calls.

SEARCH-001 verified: 4 jsdom component regressions passed, typecheck/lint exit 0. Generation invalidation covers edits, picks, clearing, deliberate geolocation and unmount. No keyboard or locale changes. Initial test harness mock lacked initReactI18next; mocked activeLanguage, then tests passed. Next SEARCH-002.

SEARCH-002 verified: failed geography blocks list and map, error offers retry/clear. Existing bilingual strings reused, canonical near/radius URL and history-only coordinates preserved. Hook tests 11 passed; HomePage tests 2 passed; lint/typecheck pass. Test fixture corrected from API radiusKm to canonical URL radius. SEARCH-001 checkpoint be20298; frontend build exit 0 (existing 500 kB warning). Next SEARCH-004.

SEARCH-004 verified: 57 tests/3 files passed, service syntax check passed. Read all basic candidates in 2000-row keyset batches; 10-second per-query database deadlines, per-batch certificate reads, top-K retention and exact count. Final map marker cap retained after ranking/filtering. Atlas overflow probe (101) reports partial results with completeness reasons, even for zero matches. Additive nonunique status/_id index needs no record backfill; no live index creation done, rollback removes added index. Cost scales with matching candidates; live performance/Atlas unverified. Updated former preliminary-cap test because it asserted the defective truncation. SEARCH-002 checkpoint a997409. Next SEARCH-005.

SEARCH-005 verified: incomplete-results warning visible for zero-match intro/directory. HomePage tests 4 passed; typecheck/lint passed. Existing bilingual copy reused. SEARCH-004 checkpoint 0578a6d. Next SEARCH-006.
