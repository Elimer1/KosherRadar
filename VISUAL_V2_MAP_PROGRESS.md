# Visual v2 map progress

## Audit of historical design documents

Read on 13 October 2026 from baseline `0140d195474c44011dbfd285b4b47338dab73451`:

- `AGENTS.md` — engineering, tracking, and safety rules. Still in force for process.
- `PROJECT_SPEC.md` — business rules, search, and map behavior. Functional source. Not a visual target.
- `REDESIGN_SPEC.md` — Wave 1 warm directory and forest tokens. Superseded as a visual target for this map.
- `DESIGN_PROGRESS.md`, `UI_PROGRESS.md`, `UX_FUNCTIONALITY_PROGRESS.md` — historical UI notes. Used only for behavior that the current code still implements.
- `REDESIGN_AGENT_2.md` — previous map: tall teardrop pins, rounded-square clusters, docked card, equal action pills. That composition is the one this rebuild replaces.
- `REDESIGN_INTEGRATION_PROGRESS.md` — Wave 1 merge notes. Token names there (`--color-forest` and the rest) are not the v2 map contract.

The v2 map uses the agreed fallback tokens (`--v2-bg`, `--v2-surface`, `--v2-ink`, `--v2-muted`, `--v2-green`, `--v2-green-dark`, `--v2-green-soft`, `--v2-line`, `--v2-amber`, `--v2-red`) and the `kr-v2-map-` selector prefix. Layout follows the map container width, not the browser width.

Preserved from the current map implementation: bounds search, filters, clustering, marker selection without moving the map, search-location recentering, details navigation, Call, Waze, Share, loading, error, retry, Hebrew and English, and no automatic geolocation prompt.

## Recovery and completion — 13 October 2026

Recovered this exact worktree on `redesign/v2-map`, HEAD `0140d195474c44011dbfd285b4b47338dab73451`. The interrupted agent had eight modified map files and this untracked document; all changes belonged to the redesign and were preserved. The earlier onboarding below was stale: implementation and frontend dependencies were already present. Read AGENTS, PROGRESS, FIX_TRACKER, and the relevant specification and audit verification commands before proceeding. No replacement worktree was created.

Completed the circular place markers and numeric clusters, selected-marker ring, v2 token fallbacks, scoped selectors, loading bar, notices, and container-driven panel layout: sheet below 560px, centered dock from 560–799px, 320px side panel from 800px. The side panel mirrors in Hebrew; Leaflet tiles retain LTR direction. Details remains primary, Waze and Call secondary, and Share quiet. Existing names, evidence, public status wording, navigation callbacks, return state, and missing-contact handling are retained. No locale text was introduced or changed.

Browser verification uncovered clipped actions on a short map: the original three-row grid kept an intrinsic-height header and footer inside a percentage-capped panel. The panel now scrolls restaurant information as one region and keeps actions outside that region. On short maps the heading scrolls with the evidence; this avoids hiding any content or action. Wide-map notices are placed beside an open panel so capped-result warnings remain visible.

### Actual verification

All commands below ran from `frontend/` after the implementation changes:

- `npm run lint`: exit 0.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0, 26 files and 152 tests passed. Includes popup actions, modified-click navigation, missing contact data, bilingual names/statuses, panel width boundaries, place formatting, marker/cluster contracts, and evidence summaries. jsdom emitted its navigation-not-implemented notice; no test failed.
- `npm run build`: exit 0, 257 modules transformed. Existing large-chunk warning remains; JS is about 761 kB before gzip, 223 kB gzipped.
- `node node_modules/.cache/map-review.mjs`: exit 0. A temporary local Vite harness mounts the actual RestaurantMap with synthetic restaurant responses; native Chrome DevTools automation uses the installed browser without adding dependencies. Mock tiles are intercepted before external requests. Eight combinations at map container widths 375, 600, 900, and 1280px, English and Hebrew, passed inside a 1400px viewport, confirming container-driven rather than viewport-driven placement. Verified circular clusters, selected panel focus, no marker movement on selection, Escape dismissal, panel containment, and no horizontal panel overflow. Short-height English/Hebrew checks confirm actions stay contained while the body scrolls. Error, retry recovery, empty results, and capped notices were exercised with mocked responses.
- Screenshots captured at `design-screenshots/v2-map/{en,he}-{375,600,900,1280}.png`, plus `{en,he}-375-short.png`. Visually inspected the Hebrew dock, English side panel, and short English sheet. Geometry results are in `design-screenshots/v2-map/results.json`. This directory is already Git-ignored; evidence stays local.
- Backend code was not modified. Its dependencies are absent in this worktree, so backend tests were not run. Backend has no lint, TypeScript, or build scripts. No live database or external integration was accessed. Mock browser verification does not certify live API or tile delivery, native sharing, telephone dialing, or Waze launch.

Files completed: `RestaurantMap.tsx`, and map-owned `MapNotices.tsx`, `MapPopupCard.tsx`, `MapPopupCard.test.tsx`, `map.css`, `mapChrome.ts`, `mapChrome.test.ts`, `mapIcons.ts`, plus this document. No shared discovery, details, integration, backend, or other-worktree files changed.

## NEXT AGENT ONBOARDING

**Current position**

- Worktree: `C:\FS\projects\KosherRadar-visual-v2-map`
- Branch: `redesign/v2-map`
- Baseline: `0140d195474c44011dbfd285b4b47338dab73451`; completion is checkpointed on the existing map branch.
- Git status at recovery start: eight modified map files and this untracked document, all preserved and completed.
- Current issue: visual v2 map rebuild (not a FIX_TRACKER id)
- Current status: completed and verified within the map-only scope. No outstanding implementation issue.
- Next step: stop; await a separately authorized integration review. Reconcile `git status` and `git log` before further work. Do not restart from a new branch.

**Completed work**

- All eight interrupted map files completed; behavior and verification are recorded above.
- Frontend lint, TypeScript, all 152 tests, and production build passed.
- Actual component browser checks passed across eight width/language combinations and short map heights; local screenshots recorded above.

**Incomplete work**

- No partially implemented map change or failing frontend check remains.
- Live external integrations were not tested. Backend tests were not run because dependencies are absent; backend was unchanged.
- Existing build chunk warning remains. Historical Hebrew native-speaker review is still outstanding; this redesign reuses existing UI strings.

**Instructions for the next agent**

- Edit only map-owned files and this progress file.
- Do not modify `main`, the integration branch, or another worktree.
- Do not merge or push.
- After implementation, run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` from `frontend/`.
- Browser-check container widths 375, 600, 900, and 1280 in English and Hebrew.
- The temporary browser harness is local at `frontend/node_modules/.cache/map-review.mjs`; screenshots are ignored local evidence. It launches headless Chrome and shuts down only its own Chrome process and Vite server. No Playwright or dependency was installed.
- Do not repeat the redesign or reintroduce the clipped three-row panel. Do not claim these mocked checks prove real integrations.
