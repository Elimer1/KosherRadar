# KosherRadar — UX functionality progress

Work packages 1A and 1B: search-state contract, then live search.

This file is the handoff for `feature/ux-functionality`. Shared `PROGRESS.md` and `FIX_TRACKER.md` were not modified. The design, QA, UI, and UX-review worktrees were not modified.

## Current position

- Branch: `feature/ux-functionality`
- Worktree: `C:\FS\projects\KosherRadar-ux-functionality`
- Baseline: `main` at `3bbb1e2da84215e62c82010de755be2b574aa6bf` (`main` had not moved; it was 12 commits ahead of `origin/main`)
- Package: **2 — Authentication and admin navigation**
- Checkpoint: **1A, 1B, 1C, and 2 complete**
- Next package: **3 — Localization and minor UX**

## NEXT AGENT ONBOARDING

Resume in `C:\FS\projects\KosherRadar-ux-functionality` on `feature/ux-functionality`. Read this file before changing code. Do not edit the design, QA, UI, or UX-review worktrees. Do not merge, rebase, or push.

Work Packages 1A through 2 are implemented. Do not rewrite the search-state model. The next task is Work Package 3.

### Exact next task (Work Package 3)

1. When the interface is Hebrew and `nameHe` is stored, use it as the heading on cards, suggestions, the map popup, and the restaurant page. Show the other stored name second. Do the same for English and `nameEn`. Do not invent a translation.
2. Under the kashrut badge, list each unverified claim with the existing `details.claimSays` and `details.claimNote` sentences. Keep certificates in their own list. Do not change status words.
3. Restore the previous document title when a page that set one unmounts, so Back to search does not keep the restaurant name in the tab.
4. Hebrew added in earlier packages still needs native-speaker review. Do not change kashrut status labels.

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
| `draftQuery` / `setDraftQuery(text)` | replace after `DRAFT_COMMIT_DELAY_MS` (350) | Local typing, capped at 100, not trimmed. The pause calls `commitDraftQuery`. A newer keystroke cancels the previous pause and does not clear the box |
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

`SearchFiltersPanel` still emits a full filters object. `HomePage` passes that object to `updateFilters` and ignores `next.q`, because the hook flushes `draftQuery`. `updateFilters`, place changes, and clear actions cancel a pending pause first, then keep the latest draft.

Live list and map requests take an `AbortSignal`. A cancelled response is ignored. It does not set an error and it does not change `draftQuery`. HTTP 429 uses `home.rateLimited` in the active language. The Hebrew string needs native-speaker review. The results region has one polite status line for searching, the count, the empty state, and errors. The visible "Searching..." line and `aria-busy` stay on the results section.

## Files

- `frontend/src/search/searchCriteria.ts`
- `frontend/src/search/searchCriteria.test.ts`
- `frontend/src/search/searchReturn.ts`
- `frontend/src/search/searchReturn.test.ts`
- `frontend/src/hooks/useSearchCriteria.ts`
- `frontend/src/hooks/useSearchCriteria.test.tsx`
- `frontend/src/hooks/useRestaurantSearch.test.tsx`
- `frontend/src/hooks/useRestaurantSearch.ts`
- `frontend/src/api/errors.ts`
- `frontend/src/api/searchApi.ts`
- `frontend/src/locales/en.ts`
- `frontend/src/locales/he.ts`
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

### Independent recheck (12 October 2026)

A second session opened this branch on its own frontend at `http://localhost:5181`, with `VITE_API_URL=http://localhost:5181/api` and an uncommitted Vite proxy to the API already running on port 5000. The proxy file is `frontend/vite.proxy.config.ts`. It is not part of the feature and must not be committed. The page origin has to match that API URL (`localhost`, not `127.0.0.1`), because those are different browser origins.

No product regression was found. The title staying on the restaurant name after Back to search is the known document-title bug (Work Package 3), not a search-state failure. A full reload of the results page restored the home title.

| Action | Observed |
| --- | --- |
| Type `pizza` without Search | URL stayed `/`. Input stayed `pizza`. Both restaurants stayed listed. |
| Check Meat | URL became `/?q=pizza&foodType=MEAT` in one step. Meat was checked. The list became the empty state. |
| Search with only spaces | URL became `/?foodType=MEAT`. The input was empty. Meat stayed checked. Claimed Grill was the only result. `sessionStorage` `kosherradar-search-return` was `/?foodType=MEAT`. |
| Open Claimed Grill, then Back to search | Details URL, then `/?foodType=MEAT` with Meat checked and Claimed Grill. |
| Browser Back, then Forward | Restaurant page, then `/?foodType=MEAT` with Meat and Claimed Grill. |
| Refresh results | `/?foodType=MEAT`, empty input, Meat checked, Claimed Grill. Tab title returned to the home title. |
| List and Map | URL stayed `/?foodType=MEAT`. List still showed Claimed Grill. |
| `/?nocache=1` | Replaced with `/`. Meat unchecked. Both restaurants listed. |
| Hebrew query, then language switch | Search applied `/?q=%D7%A4%D7%99%D7%A6%D7%94`. One result, Pizza Place. After Hebrew, `dir` was `rtl`, the query and the word `פיצה` stayed, and the result line was Hebrew. |
| Direct restaurant link | After clearing `kosherradar-search-return` and reloading the restaurant URL, Back to search pointed at `/`. |

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

## Work Package 1B

`setDraftQuery` waits 350 ms, then `commitDraftQuery` (`replace`). A filter, place, or clear action cancels that wait and flushes the draft. Cancelling the wait does not empty the box.

`searchRestaurants` and `searchRestaurantsInBounds` accept an `AbortSignal`. `useRestaurantSearch` and `RestaurantMap` abort the previous request. Cancellation is not shown as a failure. HTTP 429 uses `home.rateLimited` instead of the English server sentence. Loading still shows "Searching..." / the map loading line. A polite `role="status"` announces the list state.

### Browser (12 October 2026, `http://localhost:5181`)

| Action | Observed |
| --- | --- |
| Type `pizza` and wait | The URL stayed `/` in the snapshot taken as typing finished, then became `/?q=pizza`. The input stayed `pizza`. The status line said "1 restaurant found". Only Pizza Place remained. |
| Replace that text with `zzzz`, then check Meat before the pause ended | The input stayed `zzzz`. The URL became `/?q=zzzz&foodType=MEAT` in one step. The status line said "No restaurants match your search." |

Device geolocation and the live geocoder were not used. HTTP 429 was checked in the hook test with a mocked Axios 429, not by exhausting the real limiter.

### Tests after 1B

| Command | Exit | Result |
| --- | --- | --- |
| `npm test` | 0 | 18 files, 116 tests passed |
| `npm run lint` | 0 | oxlint, no warnings |
| `npm run typecheck` | 0 | `tsc -b` |
| `npm run build` | 0 | Vite build. JS chunk about 735.23 kB. The existing chunk-size warning remains. |

New tests: the 350 ms commit, a filter flushing a pending draft without clearing the box, a cancelled search leaving the newer result and an empty error, and the 429 message.

## Work Package 1C

Clear actions stay on the existing filter panel and the result line. There is no separate chip row.

- A group **Clear** button appears for kashrut level, hechsher, food type, category, and distance when that group has a choice. It clears only that group. Location already had its own clear. The two checkboxes still turn off by themselves.
- **Clear search and filters** sits next to the result count when a query or filter is active, and above the map in map view. The empty-state button remains.
- When results are showing and unknown places are still excluded, the result line uses `home.unknownHidden`. That English sentence is the second sentence of the existing no-match text. The Hebrew is the same existing sentence. Default exclusion is unchanged.
- `filters.hideExpired` now says the filter hides restaurants whose only public evidence is an expired certificate. The Hebrew label needs native-speaker review. `filters.clearGroup` ("ניקוי") also needs that review.
- Opening a restaurant stores `{ path, scrollY, restaurantId }` in `sessionStorage` key `kosherradar-search-scroll`. The path is passed through `safeSearchReturnPath`, so coordinates are not stored. On the next list render for that same path, the restaurant link is focused when it is in the first page. Otherwise the saved scroll offset is used. The memory is then removed. Load More pages are not restored.

### Browser (12 October 2026, `http://localhost:5181`)

| Action | Observed |
| --- | --- |
| Home with no extra filter | Both restaurants. The unknown-kashrut sentence was visible. No clear-all button, because nothing beyond the default was selected. The expired checkbox read "Hide restaurants that only have an expired certificate". |
| Check Meat | URL `/?foodType=MEAT`. Claimed Grill only. A food-type **Clear** button and **Clear search and filters** were both present. |
| Food-type Clear | URL returned to `/`. Meat unchecked. Both restaurants returned. The group Clear button went away. |
| Open Claimed Grill | `kosherradar-search-scroll` was `{"path":"/","scrollY":0,"restaurantId":"6acc84e0953576757dad2141"}`. No coordinates. |
| Back to search | The Claimed Grill link was focused. The scroll memory was removed. The tab title stayed on the restaurant name; that remains Work Package 3. |

### Tests after 1C

| Command | Exit | Result |
| --- | --- | --- |
| `npm test` | 0 | 18 files, 118 tests passed |
| `npm run lint` | 0 | oxlint, no warnings |
| `npm run typecheck` | 0 | `tsc -b` |
| `npm run build` | 0 | Vite build. JS chunk about 738.33 kB. The existing chunk-size warning remains. |

New tests: scroll memory strips coordinates, and a non-search path or a bad restaurant id is not stored.

## Work Package 2

Login and registration reuse `safeReturnPath` (`readInternalPath`). No second validator.

- `ProtectedRoute` and `AdminRoute` pass `pathname` plus `search` as `from`.
- When that path is a known page, login says why an account is needed: add a restaurant, add a certificate, report a problem, open the account, or open the admin area. Other internal paths use a general sentence. A direct visit to login says nothing extra.
- Sign up receives the same `from` state. After a successful registration it opens that path. With no return path it still opens `/account`. The register page shows the same sentence, and its log-in link keeps the path.
- The Hebrew sentences need native-speaker review.
- Admin tabs are `?tab=` with `restaurants`, `teudot`, `reports`, `expiring`, or `manage`. The default restaurants tab omits the parameter. Any other value is replaced with `/admin`. Choosing a tab pushes a history entry. Links from a tab to a restaurant carry `adminTab` in router state, and Back to dashboard uses that tab. Browser Back still returns to the dashboard URL that held the tab.
- Report fields, roles, and who may open admin were not changed.

### Browser (12 October 2026, `http://localhost:5181`)

| Action | Observed |
| --- | --- |
| Open Add a restaurant while logged out | Login showed "An account is required to add a restaurant." |
| Sign up from that login page | Register showed the same sentence. |
| Open `/login` directly | No extra sentence. |
| Open `/admin?tab=reports` while logged out | Login showed "An account is required to open the admin area." |

The admin dashboard itself was not opened. This browser has no admin session, and creating one would write to the shared database. Tab parsing is covered by `adminTab.test.ts`.

### Tests after 2

| Command | Exit | Result |
| --- | --- | --- |
| `npm test` | 0 | 20 files, 122 tests passed |
| `npm run lint` | 0 | oxlint, no warnings after removing the unused tab type |
| `npm run typecheck` | 0 | `tsc -b` |

## Later packages

1. **3 — Localization and minor UX.** Restaurant display names, existing claim copy, document titles.

## Commits

- `03293d47e06ca1c8a4342dd74bae791d432690a8` — `feat(ux-1a): persist applied search in the URL`
- `6382a0d` — `docs(ux-1a): record the search-state checkpoint hash`
- `f182009` — `docs(ux-1a): record the independent search-state browser recheck`
