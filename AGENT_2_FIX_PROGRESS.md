# Agent 2 ? Search and location reliability

13 October 2026. Branch fix/search-location; clean baseline dc5dc24 confirmed. SEARCH-001 generation guards/rejection feedback implemented; tests pending. See FIX_TRACKER.md for all assigned statuses. Dependencies copied from existing main node_modules, no installs or manifest changes. No live service calls.

SEARCH-001 verified: 4 jsdom component regressions passed, typecheck/lint exit 0. Generation invalidation covers edits, picks, clearing, deliberate geolocation and unmount. No keyboard or locale changes. Initial test harness mock lacked initReactI18next; mocked activeLanguage, then tests passed. Next SEARCH-002.

SEARCH-002 verified: failed geography blocks list and map, error offers retry/clear. Existing bilingual strings reused, canonical near/radius URL and history-only coordinates preserved. Hook tests 11 passed; HomePage tests 2 passed; lint/typecheck pass. Test fixture corrected from API radiusKm to canonical URL radius. SEARCH-001 checkpoint be20298; frontend build exit 0 (existing 500 kB warning). Next SEARCH-004.
