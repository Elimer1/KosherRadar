# KosherRadar design progress

Branch: `feature/design-overhaul`  
Worktree: `C:\FS\projects\KosherRadar-design`  
Base: `main` at `3bbb1e2`  
Tip: the docs commit that contains this file, on top of `08127e7`, `ac1181b`, and `c09bae2`. Confirm with `git log -5` in this worktree.

This file is the only progress log for the design overhaul. Do not edit `PROGRESS.md`, `FIX_TRACKER.md`, `AUDIT_FINDINGS.md`, `QA_PROGRESS.md`, `UI_PROGRESS.md`, or `UX_FUNCTIONALITY_PROGRESS.md`.

## Coordination

Agent 1 owns `feature/ux-functionality` in `C:\FS\projects\KosherRadar-ux-functionality`.

Inspected on 12 October 2026 with read-only Git:

- Committed HEAD was `7945748` (`feat(ux-1c): clear one filter at a time and restore search focus`).
- `UX_FUNCTIONALITY_PROGRESS.md` says Work Packages 1A, 1B, and 1C are complete. The search contract is `useSearchCriteria` (`SearchCriteriaApi`).
- That worktree also had uncommitted Work Package 2 edits in auth, admin tabs, and `locales/en.ts` / `locales/he.ts`. Those files were not edited in this discovery pass.
- `git diff main...feature/ux-functionality --stat` touches the discovery files listed under Agent 1 integration below.

This branch was not reset. It was not merged, rebased, cherry-picked, or pushed. Agent 1's worktree was not checked out or edited.

The discovery screens on this branch still call the pre-1A search props (`text`, `onSearch`, `onChange`, `navigate`). Visual classes were applied around that existing behavior. Integration must re-apply those classes onto Agent 1's components. Do not copy Agent 1's hook into this branch.

## Design system

Unchanged palette and type. No new font, icon library, or dependency.

| Token | Value | Use |
| --- | --- | --- |
| `forest` | `#174B3A` | Primary buttons, verified border, map pin, selected view |
| `forest-deep` | `#103528` | Primary hover, verified text |
| `grove` | `#2C6B56` | Secondary text links |
| `canvas` | `#F7F8F4` | Page background, unknown status fill |
| `soft` | `#DCEAE4` | Borders |
| `mist` | `#EEF4F1` | Selected filter row, verified fill, food chip |
| `ink` | `#24342F` | Body text |
| `muted` | `#4E5E58` | Supporting text |
| `amber-ink` | `#6B4A1F` | Unverified claim text and dashed border only |

Verified evidence uses forest on mist, with the words "Verified certificate". An unverified claim stays on white with a dashed amber border and the words "Unverified claim (no certificate)". Expired uses the existing red text and an ✕. Unknown uses muted text and a "?". Status is never color alone.

Shared classes in `frontend/src/components/formStyles.ts`: inputs, buttons, panels, `filterChipClassName`, plus `metaChipClassName`, `quietChipClassName`, `choiceClassName`, `warningNoticeClassName`, and `errorNoticeClassName`.

`filterChipClassName` is still unused. Agent 1's 1C did not add a chip row. It added per-group Clear buttons and a result-line clear. Those buttons are not on this branch. Do not invent a second removal path.

No new translation keys. The homepage title now uses the existing `home.heading` (English and Hebrew were already present). New Hebrew from the earlier independent-page pass still needs native-speaker review; this pass did not add Hebrew.

## Earlier stage (already committed before this session)

`c32efd7` and `61a05a1`, recorded in the previous handoff: tokens, header, footer, login, registration, password reset, submission forms, account, and admin. `displayName.ts` chooses a stored name or address and does not translate. It is still not wired. Agent 1's package 3 owns restaurant-name selection.

## Discovery stage

### Restaurant cards — `08127e7`

`RestaurantCard` and `KashrutBadge`. Name and address use `dir="auto"` and wrap. A missing address no longer leaves a leading comma. Food is a mist chip. Categories are quiet outlined chips, not the verified green. Distance is a mist chip. Call and Waze stay on the existing link builders. No photo placeholder.

### Restaurant details — `ac1181b`

Identity, kashrut, contact, and help are section cards. The back control uses `details.back` and a chevron that mirrors in RTL (`scaleX(-1)` measured on the Hebrew page). Phone numbers and websites are in `bdi dir="ltr"`.

Unverified items already on `kashrut.items` are listed with the existing `details.claim`, `details.claimSays`, and `details.claimNote`. They use the dashed amber treatment, separate from certificates. This does not change status rules. Live Pizza Place had one unverified claim and no certificate, and that section rendered.

### Homepage, filters, and map — `c09bae2`

Search field, suggestion list, location field, filter panel, list/map toggle, empty and no-match states, and map frame use the same surfaces. Selected filter rows use `.kr-choice:has(input:checked)` (mist fill, weight 600, 44px row). The list/map selected button is forest with white text and `aria-pressed`. The map container stays `direction: ltr`. Popup text follows the page. The radius circle uses `#174B3A`. Leaflet's popup close control is enlarged toward a 44px target.

Search state, debounce, URL params, and map requests were not changed.

## Files modified in this session

- `frontend/src/components/RestaurantCard.tsx`
- `frontend/src/components/KashrutBadge.tsx`
- `frontend/src/components/formStyles.ts`
- `frontend/src/pages/RestaurantDetailsPage.tsx`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/SearchBar.tsx`
- `frontend/src/components/SearchFiltersPanel.tsx`
- `frontend/src/components/LocationField.tsx`
- `frontend/src/components/RestaurantMap.tsx`
- `frontend/src/index.css`
- `.gitignore` (`design-screenshots/` ignored)
- `DESIGN_PROGRESS.md`

Not modified: backend, hooks, API clients, locales, `SearchBar` behavior, `displayName.ts`, and Agent 1's branch.

## Tests and results

Run from `C:\FS\projects\KosherRadar-design\frontend`. `node_modules` was already present. No package was installed.

Baseline on `d3d69fd` before edits:

| Command | Exit | Result |
| --- | --- | --- |
| `npm test` | 0 | 15 files, 94 tests passed |
| `npm run lint` | 0 | oxlint, no findings |
| `npm run typecheck` | 0 | `tsc -b` |

After the discovery edits, including the popup close-control CSS:

| Command | Exit | Result |
| --- | --- | --- |
| `npm test` | 0 | 15 files, 94 tests passed |
| `npm run lint` | 0 | oxlint, no findings |
| `npm run build` | 0 | `tsc -b` then Vite. JS `730.52 kB` (gzip `213.70 kB`), CSS `46.54 kB` (gzip `13.00 kB`). The existing chunk warning above 500 kB remains. |

The previous design build on this branch was JS `728.37 kB` (gzip `213.19 kB`) and CSS `48.86 kB` (gzip `13.41 kB`). No dependency was added. Tests do not assert CSS class names.

## Browser verification

Dev server: `http://localhost:5179/` from this worktree, with an uncommitted `frontend/vite.design.config.ts` that proxied `/api` to the already-running local API on port 5000. `VITE_API_URL` was `http://localhost:5179/api` for that process only. The proxy file was deleted and was not committed. Reads only. `kosherradar_qa` and `kosherradar_agent2_test` were not used. Geoapify was not called (the location field was not submitted). OpenStreetMap tiles are the existing Leaflet layer: 12 tiles loaded and the map container stayed `direction: ltr`.

The Cursor browser pane was about 220px wide, so pixel screenshots are that narrow slice. Layout at 375, 768, and 1280 was measured with the layout viewport (`scrollWidth` versus `clientWidth`, card width, control height). At 220px the language control overflowed by about 6px. At 375, 768, and 1280, overflow was 0 in both languages.

Live local records used: Claimed Grill (unverified, phone, coordinates), Pizza Place (Hebrew stored name, unverified claim, no certificate), and the unknown kitchens when Include unknown was not required for the default list. The default list showed the two unverified restaurants.

A temporary `/design-states` route rendered the real card, badge, and certificate components with long English and Hebrew names, a verified badge that also mentions an expired certificate, an expired badge, an unknown card with no phone and no coordinates, and valid versus expired certificate rows. That route and `vite.design.config.ts` were removed before the commits.

## Coverage matrix

Widths: 375, 768, and 1280 were measured for overflow and structure in English and Hebrew. Screenshots are the ~220px pane. Equivalent layouts are grouped.

| Screen | State | English | Hebrew | Notes |
| --- | --- | --- | --- | --- |
| Cards | Default | VERIFIED | VERIFIED | Live Claimed Grill and Pizza Place. 375 card width 343px. 1280 card width 648px. |
| Cards | Hover/focus | VERIFIED | VERIFIED | Focus outline is the global forest ring. A details link took focus. Hover is CSS only. |
| Cards | Selected | NOT APPLICABLE | NOT APPLICABLE | No selected-card state exists. |
| Cards | Loading | VERIFIED | VERIFIED | "Searching..." / "מחפש..." with the spinner. |
| Cards | Empty | VERIFIED | NOT TESTED | English no-match for `zzzz-no-match`, including Clear search and filters. Hebrew empty copy was not opened. |
| Cards | Error | NOT TESTED | NOT TESTED | The alert markup exists. The API did not fail. |
| Cards | Edge | VERIFIED | VERIFIED | Fixture route: long names wrap (English heading 124px tall at 375, no overflow). Unknown card has no Call or Waze. Verified badge includes "+2 more" and the expired sentence. Expired badge uses the expired words. |
| Details | Default | VERIFIED | VERIFIED | Pizza Place. Hebrew `dir=rtl`. Back chevron sits at the inline start and is mirrored. |
| Details | Hover/focus | VERIFIED | NOT TESTED | English back and actions use the shared focus ring. |
| Details | Selected | NOT APPLICABLE | NOT APPLICABLE | The page is one restaurant. |
| Details | Loading | NOT TESTED | NOT TESTED | Spinner markup exists. Navigation was too fast to record it. |
| Details | Empty | VERIFIED | VERIFIED | No certificate on Pizza Place. The unverified claim block and the unknown sentence path are separate. Unknown Kitchen was not opened. |
| Details | Error / not found | NOT TESTED | NOT TESTED | Not-found and error cards are styled. A bad id was not opened. |
| Details | Edge | VERIFIED | VERIFIED | Fixture certificate rows: valid with photo and mashgiach phone, expired without photo. Live claim uses dashed amber, not forest. |
| Homepage/search | Default | VERIFIED | VERIFIED | `home.heading` in both languages. Search control 52px, button 44px at 375. |
| Homepage/search | Hover/focus | VERIFIED | NOT TESTED | Search field uses the forest focus ring. |
| Homepage/search | Selected | NOT APPLICABLE | NOT APPLICABLE | The query is text, not a selected token. |
| Homepage/search | Loading | VERIFIED | VERIFIED | Seen while results were requested. |
| Homepage/search | Empty | VERIFIED | NOT TESTED | English no-match. |
| Homepage/search | Error | NOT TESTED | NOT TESTED | Rate-limit and server-error copy were not triggered. |
| Homepage/search | Suggestions | NOT TESTED | NOT TESTED | The dropdown is styled. A suggestion list was not opened. |
| Filters | Default | VERIFIED | VERIFIED | Hidden behind the Filters button below 1024px. Visible at 1280 (aside 288px). |
| Filters | Hover/focus | VERIFIED | VERIFIED | Checked row was focused. |
| Filters | Selected | VERIFIED | VERIFIED | Meat / בשרי: background `rgb(238, 244, 241)`, weight 600, row 44px. |
| Filters | Loading | NOT APPLICABLE | NOT APPLICABLE | Options arrived with the page. There is no separate filter loader. |
| Filters | Empty | NOT APPLICABLE | NOT APPLICABLE | The distance note shows when no location is chosen. That note was visible. |
| Filters | Error | NOT APPLICABLE | NOT APPLICABLE | Filter choices are local. |
| Filters | Chips | NOT APPLICABLE | NOT APPLICABLE | This branch has no chip row. Agent 1's group Clear buttons are the removal UI. See integration. |
| Map/list | Default | VERIFIED | VERIFIED | List pressed by default. Map pressed switches the view and keeps the URL behavior of this branch. |
| Map/list | Selected | VERIFIED | VERIFIED | `aria-pressed` on List and Map. |
| Map/list | Loading | NOT TESTED | NOT TESTED | The map badge exists. The snapshot moved on before it could be read. |
| Map/list | Empty | VERIFIED | VERIFIED | Hebrew empty-area sentence appeared before the marker arrived. English empty-area sentence appeared on return to the map. |
| Map/list | Error | NOT TESTED | NOT TESTED | Zoom-in and load-error notices are styled. They were not triggered. |
| Map/list | Popup | VERIFIED | VERIFIED | Hebrew popup: Claimed Grill, address, meat, unverified words, details, call, Waze, share. Action height 44px. Map container `direction: ltr`. 12 OSM tiles loaded. Marker clustering and bounds were not changed and were not retested as behavior. |

## Screenshot paths

Ignored by Git (`design-screenshots/`):

- `C:\FS\projects\KosherRadar-design\design-screenshots\home-en-narrow.png`
- `C:\FS\projects\KosherRadar-design\design-screenshots\card-en-narrow.png`
- `C:\FS\projects\KosherRadar-design\design-screenshots\details-en-narrow.png`
- `C:\FS\projects\KosherRadar-design\design-screenshots\details-kashrut-en.png`
- `C:\FS\projects\KosherRadar-design\design-screenshots\details-he-narrow.png`

These are the ~220px pane, not 375/1280 pixel captures. Wider layouts were measured, not screenshotted, because device-metric screenshots in this browser tiled the same pane.

## Accessibility and RTL

- Focus ring remains the global 2px forest outline.
- Unverified, expired, verified, and unknown each have words and a symbol.
- Filter rows and the main actions measured 44px at 375.
- `dir="auto"` on names, addresses, and hechsher lines. Phones use `bdi dir="ltr"`.
- Hebrew back chevron: inline start, `transform: matrix(-1, 0, 0, 1, 0, 0)`.
- Map tiles and pins are not mirrored. Popup text was `direction: rtl` on the Hebrew page.
- At about 220px the header language control overflowed by 6px. That is below the 375 target, where overflow was 0. The header was not restyled in this pass.

## AGENT 1 INTEGRATION DEPENDENCIES

Do not reimplement these. After `feature/ux-functionality` is integrated, put this branch's classes back onto Agent 1's elements.

| File | Agent 1 contract to keep | Design classes to re-apply |
| --- | --- | --- |
| `frontend/src/hooks/useSearchCriteria.ts` | `applied`, `draftQuery`, `setDraftQuery`, `commitDraftQuery`, `updateFilters`, `setLevel`, `toggleHechsher`, `toggleFoodType`, `toggleCategory`, `setHideExpired`, `setIncludeUnknown`, `setRadiusKm`, `pickLocation`, `clearLocation`, `clearQuery`, `clearFilters`, `clearAll`, `filters`, `locationPending`, `locationSource`, `returnPath`, `restaurantState`, `openRestaurant(id, background?)` | None. Do not add a second store. |
| `frontend/src/pages/HomePage.tsx` | Search box uses `draftQuery` / `setDraftQuery` / `commitDraftQuery`. Filters go through `updateFilters` (ignore `next.q`). Location uses `pickLocation` / `clearLocation` and `key={`${locationSource ?? 'none'}:${applied.near}`}`. Cards and the map receive `returnState` and `onOpenRestaurant`. Clear-all calls `clearAll`. | `pageTitleClassName` on the `home.heading` title. View toggle `kr-view-toggle` with selected `bg-forest text-white` and unselected `text-ink hover:bg-mist`. Result count `text-muted`. Empty panel `rounded-2xl border-dashed border-soft`. Notices `warningNoticeClassName` and `errorNoticeClassName`. |
| `frontend/src/components/RestaurantCard.tsx` | Optional `returnState` and `onOpenRestaurant(id, background)`. Both links keep `state` and `onClick`. | Card surface `kr-card rounded-2xl border-soft`. Name link `text-ink` with `dir="auto"`. Address `dir="auto"`. `metaChipClassName` / `quietChipClassName`. |
| `frontend/src/components/RestaurantMap.tsx` | Same `returnState` and `onOpenRestaurant`. Abort and `getSearchErrorMessage` stay. | Popup `w-64`, name and address `dir="auto"`. Frame `rounded-2xl border-soft bg-mist`. Circle `#174b3a`. Status notices as on the list. |
| `frontend/src/pages/RestaurantDetailsPage.tsx` | Back links use `to={backTo}` and `state={backState}` from `resolveSearchReturnPath` / `readRememberedLocation`. | `kr-back` and `kr-back-mark` on those same links. Section cards. Claim list from `kashrut.items` where `kind === 'UNVERIFIED'`. |
| `frontend/src/components/LocationField.tsx` | Props `appliedLabel`, `locationSource`, `onPickLocation`, `onClearLocation`. Do not restore `onChange`. | `secondaryButtonClassName` on the current-location button. Suggestion rows `min-h-11` and `hover:bg-mist`. Clear uses `quietActionClassName`. |
| `frontend/src/components/SearchFiltersPanel.tsx` | Group Clear buttons call `onChange` with that group emptied (`level: ''`, `hechsher: []`, and the same for food, category, and radius). Checkbox handlers stay. | Panel `panelClassName`. Labels `choiceClassName`. Checkbox `size-5`. Replace the group Clear class `text-sm font-medium text-green-800 underline` with `quietActionClassName`. |
| `frontend/src/components/SearchBar.tsx` | Agent 1 had not changed this file in the committed diff. Keep `text`, `onTextChange`, `onSearch`, `onPickSuggestion`. Home passes the hook methods above. | Forest search shell and mist suggestion rows already on this branch. |
| Locales | Agent 1 added `home.rateLimited`, `home.unknownHidden`, `filters.clearGroup`, and a longer `filters.hideExpired`. Uncommitted WP2 also edits both locale files. | Do not duplicate those keys. `home.heading` is already in both files and is what the title uses. |
| `frontend/src/utils/displayName.ts` | Package 3 owns which stored name is chosen. | When a name is chosen, render it with `dir="auto"`. Do not translate it. |

Pending behavior this branch did not build:

- URL search params, draft debounce, and request cancellation.
- Per-group Clear and the result-line clear. The empty-state button already calls the local `handleClearAll` and is styled.
- Removable chips. If a later change adds them, use `filterChipClassName` and Agent 1's clear action for that one filter.
- `localizedRestaurantName` / `localizedAddress`. Cards still show `restaurant.name` and the stored address fields.

## Potential merge conflicts

High, because both branches edit the same JSX:

- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/RestaurantCard.tsx`
- `frontend/src/components/RestaurantMap.tsx`
- `frontend/src/pages/RestaurantDetailsPage.tsx`
- `frontend/src/components/SearchFiltersPanel.tsx`
- `frontend/src/components/LocationField.tsx`

Low:

- `frontend/src/components/SearchBar.tsx`, `KashrutBadge.tsx`, `formStyles.ts`, `index.css` (not in Agent 1's committed diff).
- Locales were not edited here. Agent 1's committed and uncommitted locale edits should be kept.

On conflict, keep Agent 1's handlers, props, and hook calls, and keep this branch's class names.

## NEXT DESIGN AGENT ONBOARDING

**Current position**

- Branch `feature/design-overhaul`, worktree `C:\FS\projects\KosherRadar-design`.
- Discovery presentation is committed: `08127e7` cards, `ac1181b` details, `c09bae2` search, filters, and map, then the docs commit that contains this file.
- Do not start another design branch. Do not merge or push.

**Completed screens**

Restaurant cards, restaurant details, homepage and search presentation, filter appearance, and map/list controls. The independent pages from `c32efd7` / `61a05a1` remain.

**Remaining**

- Re-apply classes after Agent 1 lands. The table above is the checklist.
- Browser cases marked NOT TESTED: suggestion dropdown, details loading, not-found, search error, map load error, Hebrew no-match.
- Location autocomplete was not opened, so Geoapify was not called.
- `displayName.ts` stays unwired until Agent 1's package 3 chooses the name.
- Header overflow at about 220px only. No change at 375.

**Design system**

`frontend/src/index.css` tokens and `frontend/src/components/formStyles.ts`.

**Tests last run**

`npm test`, `npm run lint`, and `npm run build` in `frontend`, all exit 0. 94 tests. JS `730.52 kB`.

**Browser**

`http://localhost:5179/` during this session. The proxy config was deleted. Screenshots are listed above and are gitignored.

**Exact next step**

1. Read this file and `git status` on this worktree only.
2. Read `C:\FS\projects\KosherRadar-ux-functionality\UX_FUNCTIONALITY_PROGRESS.md` without editing it.
3. If integrating, keep Agent 1's `useSearchCriteria` and re-apply the classes in the table. Do not add a second search store.
4. Do not edit Agent 1's uncommitted auth, admin, or locale files from this worktree.
5. Do not merge, rebase, or push.
