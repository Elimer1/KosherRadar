# KosherRadar UI progress

Branch: `feature/ui-polish`  
Worktree: `C:\FS\projects\KosherRadar-ui`  
Base: `main` at `430d4e2` (not the functionality agent's `feature/audit-must-fix` branch)

This file is the handoff for visual work. Do not merge this branch into `main` from here. Do not edit `PROGRESS.md`, `FIX_TRACKER.md`, or `AUDIT_FINDINGS.md` on this branch.

## Changes completed

Public discovery and shared presentation only. No API, hook, store, validation, or status-calculation changes.

- Page background is a light green-gray so white cards and the header read as surfaces.
- Shared controls live in `frontend/src/components/formStyles.ts`. Primary buttons use green-700 (`#15803d`) with white text. Green-600 did not meet WCAG AA for white text; green-700 does (about 5:1).
- Keyboard focus: links and buttons get a green outline. Text fields keep their own ring. Checkboxes use the brand green.
- Header stays above the Leaflet map (`z-[1100]`), with the wordmark and language control on one row on small screens and the links beside them from `sm` up.
- Search box, result cards, filter panel, list/map switch, empty and error states, map frame, restaurant page sections, login, register, and the missing-page card share the same radius, border, and shadow.
- Search, distance chips, and the map loading badge use logical CSS (`inset-x`, `start`) so Hebrew RTL does not pin them to the physical left.
- Restaurant cards show food type and categories as chips. The same facts are still shown; nothing is calculated differently.
- Kashrut badges still spell the status in words and keep the same symbols. Only padding, radius, and the unknown-status text color changed.

## Files modified

- `frontend/src/index.css`
- `frontend/src/components/formStyles.ts`
- `frontend/src/components/FormAlert.tsx`
- `frontend/src/components/KashrutBadge.tsx`
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/RestaurantCard.tsx`
- `frontend/src/components/RestaurantMap.tsx`
- `frontend/src/components/SearchBar.tsx`
- `frontend/src/components/SearchFiltersPanel.tsx`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/NotFoundPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/pages/RestaurantDetailsPage.tsx`
- `UI_PROGRESS.md`

Not modified, on purpose: backend, API clients, hooks, stores, auth logic, schemas, models, submission forms, certificate field components, admin editing screens, and the project tracking files. `LocationField.tsx` was left alone because the functionality agent has already changed it.

## Tests and results

Run from `C:\FS\projects\KosherRadar-ui\frontend` after `npm ci` (the worktree had no `node_modules`).

| Command | Exit code | Result |
| --- | --- | --- |
| `npm test` (`vitest run`) | 0 | 14 files, 89 tests passed |
| `npm run lint` (`oxlint`) | 0 | No findings. Re-run after the nav fix also exited 0. |
| `npm run typecheck` (`tsc -b`) | 0 | Passed, including the re-run after the nav fix. |
| `npm run build` (`tsc -b && vite build`) | 0 | Built. Vite reported the existing large-chunk warning (718 kB JS). No new dependency. |

These tests do not assert CSS class names. They do not prove the layout.

## Visual verification

Dev server: `http://127.0.0.1:5174/` from this worktree. The API was not running, so lists showed the existing "cannot reach the server" message. No restaurant records were available.

Inspected:

- English home: header, hero, joined search field, location row, list/map switch, searching spinner, error card, map frame with rounded corners.
- Hebrew (`dir=rtl`) desktop: logo on the right, search button on the inline end, list/map switch aligned to the start.
- Hebrew at 390px width: one language button (a second globe was visible until the base `inline-flex` class was removed from the hidden button), stacked links, search, filters panel open and right-aligned.
- Hebrew login card and Hebrew missing-page card.

Not inspected with real data:

- A populated restaurant card (chips, distance pill, call/Waze).
- A restaurant details page with certificates.
- The wide (`lg`) two-column filter sidebar. The inspected width still showed the collapsed Filters button.
- Admin screens. They pick up the shared input and primary-button classes only.

## Remaining visual improvements

- `LocationField.tsx` still draws its own green-600 outline button. Leave it until the functionality agent is finished with that file, then point it at `secondaryButtonClassName`.
- The home "Try again" control is still a small red outline button.
- On a 390px Hebrew header, "Sign up" wraps onto its own row. Acceptable, but the link row could be tightened later.
- Account, forgot-password, reset-password, and admin pages were not given their own cards. Forgot/reset/admin buttons that already use `primaryButtonClassName` inherit the darker green.
- Restaurant details certificate rows were only restyled (radius and contrast). A native speaker should still review any Hebrew that was already in the product; this pass did not add Hebrew UI strings.

## Deferred because it would change behavior

- Translating or shortening the English server-error sentence so it does not look odd inside a Hebrew RTL alert. The string comes from the existing error helper.
- Skeleton result cards instead of the "Searching…" sentence. The sentence stays so the loading state remains announced.

## Potential merge conflicts

This branch was cut from `main`, not from `feature/audit-must-fix`. The functionality agent is editing that other branch and working tree. Likely overlap if both branches touch the same lines:

- Low: `formStyles.ts` and `index.css` (not in the audit diff seen at the start of this work). Importers of `inputClassName` / `primaryButtonClassName` will look different but should not conflict unless those files are edited too.
- Medium: `RestaurantDetailsPage.tsx`, `RestaurantMap.tsx`, `HomePage.tsx`, `SearchBar.tsx`, `Navbar.tsx` if later audit commits restyle them.
- Avoided files the audit branch had already changed: `RestaurantFields.tsx`, `TeudaFields.tsx`, `AddressSearch.tsx`, `LocationField.tsx`, `AdminRestaurantPage.tsx`, admin teuda/report components, `locales/en.ts`, `locales/he.ts`, submission pages, and API/types.

`node_modules` and `frontend/dist` exist in the worktree and must not be committed.

## Instructions for integrating after the functionality work

1. Finish and commit `feature/audit-must-fix`. Do not merge `feature/ui-polish` first.
2. Rebase or merge `feature/ui-polish` onto the updated main only when the functionality branch is stable.
3. On conflicts in class names, keep the functionality branch's logic, handlers, and text, and keep this branch's shared classes (`formStyles.ts`, focus rules, green-700 buttons).
4. Re-run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` in `frontend`.
5. Look at home, a restaurant card, restaurant details, login, and a missing URL in English and Hebrew, at about 390px and at a width over 1024px.
6. Do not merge until that review. This branch does not merge itself.

## Integrated on main

Merged into `main` as `226e0bc` after `feature/audit-must-fix` was fast-forwarded to `7c5fe29`. No class-name conflicts. Frontend lint, typecheck, tests, and build passed on the combined tree. The browser look in step 5 was not done in that session. This UI worktree was not edited.
