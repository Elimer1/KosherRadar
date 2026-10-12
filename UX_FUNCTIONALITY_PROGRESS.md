# KosherRadar — UX functionality progress

Work package 1A: search-state contract, URL persistence, and navigation.

This file is the handoff for `feature/ux-functionality`. Shared `PROGRESS.md` and `FIX_TRACKER.md` were not modified. The design, QA, UI, and UX-review worktrees were not modified.

## Current position

- Branch: `feature/ux-functionality`
- Worktree: `C:\FS\projects\KosherRadar-ux-functionality`
- Baseline: `main` at `3bbb1e2da84215e62c82010de755be2b574aa6bf` (`main` had not moved; it was 12 commits ahead of `origin/main`)
- Package: **1A — Search-state contract, URL persistence, and navigation**
- Checkpoint: **complete for 1A**
- Next package: **1B — Live search**. Do not start it until a new session is asked to.

## NEXT AGENT ONBOARDING

Resume in `C:\FS\projects\KosherRadar-ux-functionality` on `feature/ux-functionality`. Read this file before changing code. Do not edit the design, QA, UI, or UX-review worktrees. Do not merge, rebase, or push.

Work Package 1A is implemented and verified. The next session should start **Work Package 1B** only when asked. Do not rewrite the search-state model.

### Exact next task (Work Package 1B)

1. Debounce draft text by about 350 ms, then call `commitDraftQuery`. That already uses `replace`.
2. If a filter changes while a debounce is pending, flush the latest draft through `updateFilters` (already commits the draft and the filter together). Do not clear `draftQuery` when cancelling the timer.
3. Cancel obsolete HTTP requests with `AbortController`. Cancellation must not drop typed text.
4. Handle errors and HTTP 429, loading, and aria-live announcements.
5. Keep the URL contract in `frontend/src/search/searchCriteria.ts`.

### Do not repeat

- Do not put `lat`, `lng`, `page`, or `view` in the browser URL.
- Do not store precise coordinates in `sessionStorage` or `localStorage`.
- Do not use `navigate(-1)` for Back to search.
- Do not add a second internal-path validator. Reuse `readInternalPath`.
- Do not commit `frontend/vite.proxy.config.ts`. That file was a temporary verification proxy and should not exist after this session.

## Reproduction

Checked against the baseline code at `3bbb1e2`, then confirmed in the browser on this branch. The independent review is `C:\FS\projects\KosherRadar-ux\UX_REVIEW.md` (read-only).

| ID | Status | Evidence |
| --- | --- | --- |
| WP1A-001 / UX-001 | VERIFIED | Baseline: `HomePage` kept `text` and `filters` in `useState`. `RestaurantDetailsPage` linked Back to search to `/`. Unmounting the home page dropped the search. After the fix, opening Claimed Grill from `/?foodType=MEAT` and using Back to search restored that URL, the Meat checkbox, and the first result. Refresh of the details page and a direct restaurant link were also checked. |
| WP1A-002 / UX-002 | VERIFIED | Baseline: filters called `setFilters` immediately, while `filters.q` changed only on Search or Enter. After the fix, typing `pizza` left the URL at `/` and still showed both restaurants. Clicking Meat then produced `/?q=pizza&foodType=MEAT` in one transition and searched that pair. |

Root cause: applied search had no URL representation, and a filter update did not include the text still sitting in the box.

## URL parameter contract

Implemented in `frontend/src/search/searchCriteria.ts`.

The browser URL is the applied, shareable search. It is not the API query string. `buildSearchParams` still sends the existing API names, including `lat`, `lng`, and `radiusKm`, and still joins multi-select values with commas.

Parameter order:

1. `q` — trimmed query, maximum 100 characters. The first `q` wins. Whitespace-only is omitted.
2. `foodType` — repeated. `MEAT`, `DAIRY`, `PAREVE`. A comma inside one value is accepted, then emitted as repeated parameters. Duplicates are removed. Order follows the allow-list.
3. `level` — `RABBANUT` or `MEHADRIN`. The first allowed value wins.
4. `hechsher` — repeated. `LOCAL_RABBANUT`, `BADATZ_EDAH_HACHAREDIS`, `BADATZ_BEIT_YOSEF`, `BADATZ_MACHPUD`, `RABBI_LANDAU`, `RABBI_RUBIN`, `CHUG_CHATAM_SOFER`, `OTHER`.
5. `category` — repeated. `RESTAURANT`, `CAFE`, `BAKERY`, `HOTEL`, `CATERING`, `FAST_FOOD`, `FOOD_TRUCK`, `ICE_CREAM`, `GROCERY`.
6. `hideExpired` — present as `true` when any value is exactly `true`. Omitted when off.
7. `includeUnknown` — same rule as `hideExpired`.
8. `near` — trimmed place label, 2 to 200 characters. Control characters, backslashes, and `://` are rejected. This is not a new backend place id.
9. `radius` — integer `1`, `5`, `10`, `25`, or `50`. Written only when `near` is present. Other numbers are omitted, not snapped.

Never written to the URL: `lat`, `lng`, `page`, `view`, device coordinates, or unknown parameters. Parsing does not throw. `page` stays an API argument for Load More. The list/map choice stays in `localStorage` (`kosherradar-view`).

Equivalent searches serialize to the same string.

### Location and privacy

- A named place is `near` in the URL. Coordinates for that place live in the current React Router history state (`searchLocation`), not in the URL and not in storage.
- On a full load, if `near` is present and the history state does not already match that label, the existing `geocodePlace` lookup fills coordinates. Until that succeeds, `locationPending` is true and radius is not sent. A failed lookup sets `failedNear` and leaves radius unused.
- Device coordinates and a device-only radius stay in history state. They are not written to the URL, `localStorage`, or `sessionStorage`. A copied or shared URL does not include them.
- A radius without `near` and without a device location in history state is ignored.
- Choosing a named place replaces the device location on the new history entry. Browser Back removes `near` from the URL but does not restore device coordinates that were never in the URL.
- Clearing a device-only location does not add a history entry when the URL does not change.
- Browser verification did not grant device geolocation and did not call the live geocoder. Those paths are covered by the hook with `geocodePlace` mocked as unavailable, plus the device-coordinate unit test.

### History

- Committing search text uses `replace`. The same canonical URL does not add another entry.
- Filter, place, and clear actions use `push` when the canonical URL changes. If only the draft text changes with a filter, both are committed and the new URL is pushed.
- A whitespace-only Search clears the field and omits `q`. A non-empty commit may keep a trailing space in the field when the trimmed text already matches `q`, so a later debounce does not jump the cursor.
- Work Package 1B should call `commitDraftQuery` after its debounce.

### Back to search

`safeSearchReturnPath` uses `readInternalPath` in `frontend/src/utils/returnPath.ts` (shared with login's `safeReturnPath`). Search return paths may be up to 2048 characters. The pathname must be exactly `/`. The result is parsed and serialized again, so coordinates and unknown parameters are stripped.

Fallback, in `resolveSearchReturnPath`:

1. Router state `{ from }` when it is a valid search path.
2. `sessionStorage` key `kosherradar-search-return`, which stores only that sanitized path.
3. `/`

External URLs, protocol-relative URLs, backslashes, and encoded variants of those are rejected. `openRestaurant` writes the return path before navigating. A modified click (`background: true`) stores the path and does not navigate, so a new tab can still use the same-tab fallback only in the tab that stored it.

### Pagination

The home page uses Load More, not numbered pages. `useRestaurantSearch` resets to page 1 when the filter key changes. That is covered by `useRestaurantSearch.test.tsx`. The loaded window and scroll position are not restored after opening a restaurant. Returning to the first result window is the accepted limitation. Scroll and focus restoration stay in Work Package 1C.

The browser data set had two restaurants, so Load More was not on screen. Changing from the unfiltered list to Meat plus `pizza` replaced the results with the empty state, then a later criteria change showed one restaurant. That is a new first page, not an appended page.

### View preference

List and Map still use `readSavedView` / `saveView` and `kosherradar-view`. In the browser, switching to Map and back to List left `/?foodType=MEAT` unchanged.

## Hook interface

Implemented and wired. Module: `frontend/src/hooks/useSearchCriteria.ts`. Type: `SearchCriteriaApi`.

| Member | History | Behavior |
| --- | --- | --- |
| `applied` | — | Parsed from the URL |
| `draftQuery` / `setDraftQuery(text)` | none | Local typing, capped at 100, not trimmed |
| `commitDraftQuery(text?)` | replace, or none if unchanged | Trim into `q`. A blank result clears the field |
| `updateFilters(patch)` | push when the URL changes | Commits the latest draft with the patch. Does not read a stale `q` from the filter panel |
| `setLevel` / `toggleHechsher` / `toggleFoodType` / `toggleCategory` / `setHideExpired` / `setIncludeUnknown` / `setRadiusKm` | same as `updateFilters` | Thin wrappers |
| `pickLocation({ source, label, latitude, longitude })` | push when the URL changes | Named: `near` in the URL, coordinates in history state. Device: coordinates in history state only |
| `clearLocation()` | push when `near` is removed | Clears history coordinates |
| `clearQuery()` | push when `q` was present | Clears text, keeps filters and location |
| `clearFilters()` | push | Clears filters, `near`, and location. Keeps the flushed draft as `q` |
| `clearAll()` | push | Clears text, filters, and location |
| `filters` | — | `SearchFilters` for the existing search and map requests. Radius is omitted until a location is ready |
| `locationPending` / `locationSource` | — | Geocode wait, and `named`, `device`, or null |
| `returnPath` | — | Canonical `/` or `/?...` |
| `restaurantState` | — | `{ from, searchLocation? }` for links that need it |
| `openRestaurant(id, background?)` | replace the search entry when needed, then push the restaurant unless `background` | 24-hex id only. Writes `kosherradar-search-return` |

`SearchFiltersPanel` still emits a full filters object. `HomePage` passes that object to `updateFilters` and ignores `next.q`, because the hook flushes `draftQuery`.

## Files

- `frontend/src/search/searchCriteria.ts`
- `frontend/src/search/searchCriteria.test.ts`
- `frontend/src/search/searchReturn.ts`
- `frontend/src/search/searchReturn.test.ts`
- `frontend/src/hooks/useSearchCriteria.ts`
- `frontend/src/hooks/useSearchCriteria.test.tsx`
- `frontend/src/hooks/useRestaurantSearch.test.tsx`
- `frontend/src/utils/returnPath.ts`
- `frontend/src/utils/returnPath.test.ts`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/RestaurantDetailsPage.tsx`
- `frontend/src/components/LocationField.tsx`
- `frontend/src/components/RestaurantCard.tsx`
- `frontend/src/components/RestaurantMap.tsx`
- `UX_FUNCTIONALITY_PROGRESS.md`

## Design-agent notes

`feature/design-overhaul` should import `useSearchCriteria` instead of adding a second search-state store.

Both agents touch these files. This branch changed behavior only:

- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/LocationField.tsx` — props are now `appliedLabel`, `locationSource`, `onPickLocation`, and `onClearLocation`. The home page remounts it with `key={`${locationSource ?? 'none'}:${applied.near}`}` when Back/Forward changes the place.
- `frontend/src/components/RestaurantCard.tsx` and `RestaurantMap.tsx` — optional `returnState` and `onOpenRestaurant(id, background)`.
- `frontend/src/pages/RestaurantDetailsPage.tsx` — Back to search uses `resolveSearchReturnPath`.

List/map layout, filter chips, the filter drawer, cards, and CSS stay with the design agent. No new Hebrew UI strings were added.

Integration order: this branch first, then the design branch consuming this interface, then combined verification.

## Browser evidence

Observed on 12 October 2026 in Cursor's browser at `http://localhost:5174`. The API on port 5000 allows only `http://localhost:5173`, and 5173 was already in use, so verification used a temporary uncommitted Vite proxy (`frontend/vite.proxy.config.ts`) and `VITE_API_URL=http://localhost:5174/api`. That proxy file is not part of the feature.

| Action | URL | Search input | Selected filters | Results / pagination |
| --- | --- | --- | --- | --- |
| Initial search | Stayed `/` while `pizza` was typed. Both restaurants still listed. | `pizza` | none | 2 restaurants. Draft was not applied. |
| Apply filter | `/?q=pizza&foodType=MEAT` immediately on Meat | `pizza` | Meat checked | Then "No restaurants match". First page, not an appended page. |
| Whitespace Search | `/?foodType=MEAT` | Cleared to empty after the follow-up fix (an earlier try left a space; rechecked after the fix) | Meat checked | 1 restaurant, Claimed Grill |
| Open restaurant | `/restaurants/6acc84e0953576757dad2141` | — | — | Claimed Grill details. `sessionStorage` `kosherradar-search-return` was `/?foodType=MEAT` |
| Back to search | `/?foodType=MEAT` | empty | Meat checked | 1 restaurant, Claimed Grill |
| Browser Back | `/restaurants/6acc84e0953576757dad2141` | — | — | Claimed Grill |
| Browser Forward | `/?foodType=MEAT` | empty | Meat checked | 1 restaurant, Claimed Grill |
| Refresh results | `/?foodType=MEAT` | empty | Meat checked | 1 restaurant, Claimed Grill |
| Refresh restaurant details | `/restaurants/6acc84e0953576757dad2141` | — | — | Back to search `href` was `/?foodType=MEAT`. Clicking it restored Meat and Claimed Grill |
| Direct restaurant link | Assigned the restaurant URL after clearing `kosherradar-search-return` | — | — | Back to search `href` was `/`. Clicking it showed `/`, empty input, Meat unchecked, 2 restaurants |
| Hebrew query and language switch | `/?q=%D7%A4%D7%99%D7%A6%D7%94` before and after switching to Hebrew | `פיצה` | none | 1 restaurant, Pizza Place. Labels switched to Hebrew. The query stayed. |
| List / Map | `/?foodType=MEAT` for both | empty | Meat checked | Map showed the existing empty-location message for this result. List returned to Claimed Grill. URL unchanged. |
| Unknown parameter | `/?nocache=1` was replaced with `/` | empty | none | Home list loaded |

Device geolocation was not granted in the browser. Named-place geocoding was not exercised against the live places service.

## Tests

Run in `frontend` on 12 October 2026:

| Command | Exit | Result |
| --- | --- | --- |
| `npm test` | 0 | 18 files, 112 tests passed |
| `npm run lint` | 0 | oxlint, no warnings |
| `npm run typecheck` | 0 | `tsc -b` |
| `npm run build` | 0 | Vite build. JS chunk about 733.89 kB. The existing chunk-size warning remains. |

Baseline before this work was 14 files and 90 tests. New tests cover parsing and serialization, Hebrew and mixed text, whitespace, long queries, duplicates, unknown parameters, radius without `near`, draft versus applied state, filter flush with history, device coordinates staying out of the URL, pagination reset, and return-path rejection.

## Limitations

- Load More's extra pages and the scroll position are not restored. Return shows the first page.
- Device coordinates survive only in the history entry that holds them. A shared URL, a new tab, or a navigation that drops history state cannot recover them. Reload of that same history entry may keep them in Chrome because history state survives refresh; that was not separately measured for a device location.
- Named-place reload depends on `geocodePlace`. If it fails, the label remains and distance filtering stays off.
- The logo still links to `/`, which is the home page rather than Back to search.
- No new clear-all control was added. The existing empty-state button calls `clearAll`.

## Later packages (do not start in the 1A session)

1. **1B — Live search.** Debounce about 350 ms via `commitDraftQuery` (`replace`). Flush draft on filter changes. Abort stale HTTP. Errors and 429. Loading. Aria-live.
2. **1C — Filter actions and navigation polish.** Per-filter clear, clear-all control, best-effort scroll and focus restoration, browser verification with the design visuals.
3. **2 — Authentication and admin navigation.** Reuse `readInternalPath`. Do not add a second validator.
4. **3 — Localization and minor UX.** Restaurant display names, existing claim copy, document titles.

## Commits

Recorded after the commit at the bottom of this section. The commit hash is filled in once `git rev-parse HEAD` returns it.
