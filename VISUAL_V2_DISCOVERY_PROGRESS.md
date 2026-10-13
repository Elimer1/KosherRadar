# Visual v2 — discovery progress

This file is the handoff for the wave 1 visual rebuild of the shared design system, homepage, search, and restaurant results.

The assignment prompt is the visual source of truth. Historical design documents stay in the repo. They are not deleted.

## Worktree

- Worktree: `C:\FS\projects\KosherRadar-visual-v2-discovery`
- Branch: `redesign/v2-discovery`
- Implementation commit: `a75b82b9de770169320d129efdaa2dbd96b1ed65`
- Baseline: `0140d195474c44011dbfd285b4b47338dab73451`
- Source branch inspected: `redesign/wave-1-integration` (same commit)
- Other agents' worktrees, branches, and progress files were not modified.
- Not merged. Not pushed.

## Historical visual instructions superseded

These documents still describe business rules, APIs, accessibility, Hebrew/English support, and kashrut wording. Their visual directions below are superseded by this rebuild:

| Document | Superseded visual instruction |
| --- | --- |
| `REDESIGN_SPEC.md` | Deep-green header, cream wordmark, cream sign-up pill, deep-green home band, white search sheet overlapping that band, 1.5rem card radius, pale-green location button, verified blocks and dashed amber claim boxes as the result composition. |
| `REDESIGN_AGENT_1.md` | Same green-bar header and overlapping search sheet. |
| `DESIGN_PROGRESS.md` | Forest `#174B3A` as the primary surface, mist-green chips, and "unchanged palette". |
| `UI_PROGRESS.md` | Light green-gray page built around white cards, shared shadow on every search box and result card, green-700 pills. |
| `DESIGN_INTEGRATION_HANDOFF.md` | Treating the previous redesign tokens and shell as the visual system to keep. |
| `AGENTS.md` notes that say to preserve an existing visual style | Ignored for color, layout, and silhouette only. Security, validation, authorization, and data rules still apply. |

Preserved: search URL state, geolocation only after an explicit action, filter values and immediate apply, list/map persistence, kashrut wording, no invented photos/ratings/hours, English and Hebrew, Leaflet selector names, and `formStyles.ts` export names.

## What changed structurally

- The header is a light 68px bar. Sign up is a compact green button. Log in and Add a restaurant are text actions. The mobile row keeps the brand, language switch, and menu. Auth rules are unchanged.
- The landing page is a two-column introduction on `#F8F7F3`: dark headline, horizontal search module, three text-led methods, and a decorative list of those methods. It is not a green hero and not a search sheet.
- After a search, a saved map view, or an applied location, the page switches to a directory: query context, result count when the API returned rows, list/map switch, 240px filter sidebar from 1024px, and hairline result rows.
- Result rows are not separate rounded cards. Name, secondary name, and address stack on the start side. Food is quiet text. Kashrut is a worded status with its own color and icon. View details is a text action. Call and Waze appear only when the record can support them.
- The unfiltered catalog is still requested, but it is not painted under the introduction. Submitting search, choosing a place, or opening the map shows it. This avoids putting a marketing block above a long list.

## Copy not added to locale files

Locale files were not edited. Short new lines live in `frontend/src/components/discovery/discoveryCopy.ts`.

Proposed keys, for a later integration:

- `home.lead`
- `home.methodNameTitle` / `home.methodNameBody`
- `home.methodAreaTitle` / `home.methodAreaBody`
- `home.methodNearTitle` / `home.methodNearBody`

Hebrew in that file needs native-speaker review.

The headline and supporting sentence still use `home.heading` and `home.intro`.

## Shared token effect

`index.css` remaps the existing Tailwind names (`canvas`, `ink`, `forest`, and the rest) onto the v2 hex values and defines `--v2-*`. `formStyles.ts` export names are unchanged. Ordinary controls lost their default shadow and use a 12px radius. `pageTitleClassName` size was left as it was so the details title does not jump. Map pin selectors in `index.css` keep their geometry and now use `#176348`. `RestaurantMap.tsx` and `frontend/src/components/map/*` were not edited. `RestaurantDetailsPage.tsx` was not edited. `KashrutBadge` is shared, so details and map popups pick up the new status surfaces.

## Files changed

- `frontend/src/index.css`
- `frontend/src/components/formStyles.ts`
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/SearchBar.tsx`
- `frontend/src/components/LocationField.tsx`
- `frontend/src/components/SearchFiltersPanel.tsx`
- `frontend/src/components/DiscoveryFilterDialog.tsx`
- `frontend/src/components/RestaurantCard.tsx`
- `frontend/src/components/KashrutBadge.tsx`
- `frontend/src/components/discovery/discoveryCopy.ts`
- `frontend/src/components/discovery/DiscoveryMethods.tsx`
- `frontend/src/components/discovery/DiscoveryPreview.tsx`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/discovery.behavior.test.tsx`
- `VISUAL_V2_DISCOVERY_PROGRESS.md`

## Verification

Commands from `C:\FS\projects\KosherRadar-visual-v2-discovery\frontend` on 13 October 2026:

| Command | Result |
| --- | --- |
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0, 26 files, 152 tests passed |
| `npm run build` | exit 0. JS bundle about 762 kB. Existing size warning above 500 kB. |

Browser, `http://localhost:5211/`, against an isolated fixture on `127.0.0.1:5199` (not production, not Geoapify, Atlas, Cloudinary, or Resend). No horizontal overflow at 1280, 768, or 375 in English or Hebrew (`scrollWidth` matched the viewport). Measured on the English desktop introduction: background `rgb(248, 247, 243)`, headline 48px weight 750 color `rgb(24, 42, 36)`, header background white, header height about 69px.

Screenshots, gitignored under `design-screenshots/` as local design evidence:

- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-1280-intro.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-1280-results.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-1280-empty.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-1280-error.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-1280-autocomplete.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-768-intro.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-768-results.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-375-intro.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-375-results.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-en-375-filters.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-he-1280-intro.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-he-1280-results.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-he-768-intro.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-he-375-intro.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-he-375-results.png`
- `C:\FS\projects\KosherRadar-visual-v2-discovery\design-screenshots\v2-discovery-he-375-filters.png`

The four kashrut statuses were inspected in the English and Hebrew result screenshots. The mobile filter sheet was open in both languages. Autocomplete showed a suggestion list. Empty and error states were inspected.

## Known limitations

- The landing page does not paint the unfiltered catalog until the visitor submits search, applies a location, or the saved view is map.
- New Hebrew sentences in `discoveryCopy.ts` need native-speaker review.
- A checked filter row was not given its own screenshot. The selected style is `kr-choice:has(input:checked)` using `--v2-green-soft`, and the sheet open/close control was inspected.
- Shared screens inherit the new tokens, radius, and shadow removal. Their layouts were not individually browsed.
- `KashrutBadge` on the details page and in map popups uses the new status surfaces. Those layouts were not edited.

## NEXT AGENT ONBOARDING

### Current position

- Branch: `redesign/v2-discovery`
- Worktree: `C:\FS\projects\KosherRadar-visual-v2-discovery`
- Implementation commit: `a75b82b9de770169320d129efdaa2dbd96b1ed65`
- Baseline: `0140d195474c44011dbfd285b4b47338dab73451`
- Current issue: visual v2 discovery rebuild implemented and verified in this worktree
- Next outstanding issue: none for this assignment. Do not start another milestone. Do not merge or push.

### Completed work

- Light header, warm introduction, horizontal search, three discovery methods, directory results, status surfaces, and filter sidebar/sheet.
- Tests listed above passed.
- Screenshots listed above were inspected.

### Incomplete work

- No uncommitted application changes are intended after the checkpoint commit.
- Hebrew copy in `discoveryCopy.ts` is awaiting native-speaker review.
- Locale files were deliberately not edited.

### Instructions for the next agent

Read this file and `git status` in `C:\FS\projects\KosherRadar-visual-v2-discovery` before doing anything. Do not redo the discovery layout. Do not edit map components, restaurant details, locale files, or another agent's worktree. Do not merge or push.

Exact next action: stop. Integration should read this file and `REDESIGN_SPEC.md` only for the business rules that were preserved, not for the old green hero.
