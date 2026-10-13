# Agent 1 — discovery redesign

## Current position

- Branch: `redesign/agent-1-discovery`
- Worktree: `C:\FS\projects\KosherRadar-agent-1`
- Baseline: `539303733b887f499dbbeaf49db3e3dff55b2eeb`
- Milestone: shared visual foundation and public discovery experience
- Status: implementation is in this worktree and has been checked. Not merged. Not pushed.
- Next action: none for this milestone. Wait for integration. Do not start another milestone.

## VISUAL CHANGES

What a visitor sees, compared with the baseline at `5393037`:

- The header is a deep green bar with a cream wordmark and cream links. Sign up is a cream pill. The old header was a white bar with green text, and the old footer was a solid green band. The footer is now a quiet warm line under the page.
- The homepage opens with a large cream title and the existing introduction on that same deep green, then a white search sheet that sits across the bottom edge of the green. The old page was a small centered heading on a pale background.
- Search, a city or neighborhood field, and “Use my current location” are the three visible ways in. The location action is a pale green button, not a small outline button under the form. Geolocation still runs only after that press.
- Below 1024px, filters open as a bottom sheet with Hide filters, Escape, and immediate effect. There is no Apply button. At 1024px and wider they are a plain column with a vertical rule, not a boxed sidebar.
- List and Map are underline tabs in a results bar. Only one is selected. The saved preference is unchanged.
- Restaurant rows share one white surface, divided by hairlines. The name is large. Kashrut sits beside the name from the medium breakpoint and below it on a phone. Distance, food, and category appear only when the record has them. Call and Waze appear only when those links exist. There is no photo, rating, review, or hours slot.
- Verified certificates use a pale green block with a solid green edge. Unverified claims stay on a warm white block with a dashed amber border. Expired and unknown keep their own words, symbols, and colors.
- Loading, empty, no-match, offline error with Try again, Atlas warning, and capped-results warning still use the existing sentences.

## Completed tasks

- Visual specification in `REDESIGN_SPEC.md`.
- Warm token palette in `index.css`, with map and Leaflet selectors kept. Leaflet stays left-to-right.
- Discovery homepage, header, search, location, filters, cards, and kashrut preview restyled.
- Shared `formStyles.ts` export names kept. `pageTitleClassName` text is unchanged so the details title does not jump.
- `SearchFiltersPanel` gained optional `showHeading` (default `true`).
- No new translation keys. No locale patch file.
- No new Hebrew copy. Native-speaker review is not required for new wording.

## Files modified

- `REDESIGN_SPEC.md`
- `REDESIGN_AGENT_1.md`
- `frontend/src/index.css`
- `frontend/src/components/formStyles.ts`
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/SearchBar.tsx`
- `frontend/src/components/LocationField.tsx`
- `frontend/src/components/SearchFiltersPanel.tsx`
- `frontend/src/components/RestaurantCard.tsx`
- `frontend/src/components/KashrutBadge.tsx`
- `frontend/src/components/DiscoveryFilterDialog.tsx` (new)
- `frontend/src/hooks/useMinWidth.ts` (new)
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/discovery.behavior.test.tsx` (new)

Not modified: map component, restaurant details page, locales, `PROGRESS.md`, `FIX_TRACKER.md`, Agent 2 and Agent 3 worktrees, and the original `main` checkout.

## Design decisions

- Home is the only full-bleed route. Other screens stay in the centered column so this change does not stretch admin and forms.
- Token names are unchanged. Other screens inherit the warmer green and paper through existing classes. That is an intended integration adaptation, recorded in `REDESIGN_SPEC.md`.
- Map pin color follows the new green. Pin shape, clustering, popups, and `direction: ltr` on `.leaflet-container` were not changed. Agent 2 may replace the pin.
- No gold badge and no extra public trust label. Admin-created records are not styled differently.

## Verification

Commands from `C:\FS\projects\KosherRadar-agent-1\frontend`:

| Command | Result |
| --- | --- |
| `npm run lint` | exit 0, no warnings |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0, 23 files, 131 tests passed |
| `npm run build` | exit 0, JS bundle about 755 kB (existing size warning above 500 kB) |

Browser, `http://localhost:5181/`, Cursor browser, 13 October 2026:

- Hebrew, 375px: no horizontal overflow (`scrollWidth` 375). Dark header, large title, overlapping search sheet, stacked location action. Filter sheet opened and closed; focus returned to Filters. List was pressed and Map was released.
- Hebrew, 1280px: no horizontal overflow (`scrollWidth` 1265). Header computed color `rgb(15, 61, 45)`. Title 48px white. Filter column present, filter button absent.
- English, 768px: `dir=ltr`, `lang=en`, no horizontal overflow. Header links in the bar (menu button hidden). Filter column absent, Filters button present.
- The API was not running, so the list showed the existing offline sentence and Try again. Restaurant rows with real results were not on screen. Geoapify, Atlas, Cloudinary, and Resend were not called. OpenStreetMap tiles can load with the map; the map component itself was not edited.

Screenshots from that pass: `discovery-he-375.png`, `discovery-he-375-filters.png`, `discovery-he-1280.png`, `discovery-en-768.png` under the local Cursor screenshot temp folder. They are not committed.

## Remaining tasks

None for this milestone.

## Known limitations

- Populated restaurant rows were not seen in the browser because the API was down.
- Form option lists were empty in that same pass for the same reason. The controls and their labels were present.
- Shared screens (login, submit, admin, details) pick up the new tokens, rounder controls, wider column, and lighter footer. Their layouts were not individually browsed.
- `KashrutBadge` on the details page and in map popups uses the new status surfaces. Agent 3 owns the details page layout.

## Uncommitted changes

See git status after the checkpoint commit for this handoff. The implementation and this file are meant to be committed together on `redesign/agent-1-discovery`.

## Exact next action

Stop. Do not merge or push. Integration should read `REDESIGN_SPEC.md` before adopting the tokens on the map and details branches.
