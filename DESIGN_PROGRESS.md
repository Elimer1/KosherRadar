# KosherRadar design progress

Branch: `feature/design-overhaul`  
Worktree: `C:\FS\projects\KosherRadar-design`  
Base: `main` at `3bbb1e2` (`test(qa-001): keep the undated certificate regression as a normal test`)

This file is the only progress log for the design overhaul. Do not edit `PROGRESS.md`, `FIX_TRACKER.md`, `AUDIT_FINDINGS.md`, `QA_PROGRESS.md`, `UI_PROGRESS.md`, or `UX_FUNCTIONALITY_PROGRESS.md`.

## Coordination

Agent 2 owns `feature/ux-functionality` in `C:\FS\projects\KosherRadar-ux-functionality`.

Checked again on 12 October 2026, after the independent-page pass: `git worktree list` still shows `C:\FS\projects\KosherRadar-ux-functionality` at `3bbb1e2` on `feature/ux-functionality`. `UX_FUNCTIONALITY_PROGRESS.md` is not in that worktree. Work Package 1A is not committed. Do not merge, rebase, or cherry-pick that branch.

Until Agent 2 commits the search-state hook and action interface, do not substantially edit:

- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/SearchBar.tsx`
- `frontend/src/components/SearchFiltersPanel.tsx`
- `frontend/src/components/RestaurantCard.tsx`
- `frontend/src/pages/RestaurantDetailsPage.tsx`
- `frontend/src/components/RestaurantMap.tsx`
- `frontend/src/components/LocationField.tsx`
- `frontend/src/components/KashrutBadge.tsx`
- `frontend/src/hooks/useRestaurantSearch.ts`

Those files are unchanged on this branch. The homepage still renders and still runs the existing search. Global shell changes (canvas, header, footer) are visible there.

Integration order: UX functionality first, design overhaul second. When discovery work starts, consume Agent 2's hook. Do not add a second search-state store, URL sync, debounce, or filter-removal implementation.

## Current stage

Stage 1 foundation is in place. Independent pages (authentication, forms, account, admin) have the new visual system. Discovery redesign has not started.

## Design direction

Modern, restrained restaurant discovery. Deep green carries actions. Amber is only a warning accent. The page canvas is warm off-white so white cards read as surfaces.

| Token | Value | Use |
| --- | --- | --- |
| `forest` | `#174B3A` | Primary buttons, header mark, footer |
| `forest-deep` | `#103528` | Primary hover |
| `grove` | `#2C6B56` | Secondary text links |
| `canvas` | `#F7F8F4` | Page background |
| `soft` | `#DCEAE4` | Borders, quiet fills |
| `mist` | `#EEF4F1` | Soft highlights |
| `ink` | `#24342F` | Body text |
| `muted` | `#4E5E58` | Supporting text |
| `amber-ink` | `#6B4A1F` | Warning text |

White on `#174B3A` is the primary button pair. `#2C6B56` is slightly darker than the suggested `#347B66` so small link text stays nearer AA. Amber `#C48B47` is used in the mark only, not for small text.

Typography stays on the system stack already in the app (`Segoe UI`, `Noto Sans Hebrew`, Arial). No new font package.

Shared classes live in `frontend/src/components/formStyles.ts`: inputs, labels, primary and secondary buttons, quiet actions, text links, panels, section cards, danger buttons, and `filterChipClassName`.

`filterChipClassName` is presentation only. Nothing renders a chip yet. Agent 2 owns when a chip is created or removed.

## Completed work

- Design tokens and focus, selection, map pin, and cluster colors in `frontend/src/index.css`. Leaflet stays left-to-right.
- Header: one language control on the logo row, with a visible `EN` / `עב` label for the language it switches to. The accessible name is still `nav.switchLanguage`. Page width stays `max-w-5xl` so the untouched homepage grid does not reflow.
- Footer uses the forest bar and the existing disclaimer.
- Login, register, forgot-password, reset-password, and the missing page use the same card, title, and link treatment. Forgot-password and reset-password were given that card in a follow-up after the first visual pass.
- Account shows the existing points sentences (`account.pointsHint`, `points3`, `points2`, `points1`, `pointsPrivate`).
- Submission rows use the same card surface. A resolved report shows `forms.correctionApplied` when points were awarded and `forms.closedWithoutChange` otherwise. That reads the existing `points` field. It does not add a restaurant link.
- Restaurant submission explains that food type is added during review (`forms.foodReviewed`). Fields, payloads, and the rule that users do not choose a kashrut level are unchanged.
- Report form shows two examples under the note (`forms.reportExamples`). It does not add a certificate picker or a proposed hechsher.
- Certificate photo inputs use a dashed upload area. Upload behavior is unchanged.
- Admin tabs are a text tab bar with a forest underline. Approve and reject controls meet a taller touch height. Pending restaurants show a warning when food type or coordinates are missing. Approval is not blocked.
- `localizedRestaurantName` / `localizedAddress` in `frontend/src/utils/displayName.ts` choose a stored name or address for the active language and do not translate. They are not wired into cards, suggestions, or the details page yet.

## Files modified

- `frontend/src/index.css`
- `frontend/src/components/formStyles.ts`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/FormAlert.tsx`
- `frontend/src/components/PasswordField.tsx`
- `frontend/src/components/RestaurantFields.tsx`
- `frontend/src/components/TeudaFields.tsx`
- `frontend/src/components/AddressSearch.tsx`
- `frontend/src/components/ShareButton.tsx`
- `frontend/src/components/admin/*` presentation classes
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/pages/ForgotPasswordPage.tsx`
- `frontend/src/pages/ResetPasswordPage.tsx`
- `frontend/src/pages/NotFoundPage.tsx`
- `frontend/src/pages/AccountPage.tsx`
- `frontend/src/pages/MySubmissionsPage.tsx`
- `frontend/src/pages/SubmitRestaurantPage.tsx`
- `frontend/src/pages/SubmitTeudaPage.tsx`
- `frontend/src/pages/SubmitReportPage.tsx`
- `frontend/src/pages/AdminDashboardPage.tsx`
- `frontend/src/pages/AdminRestaurantPage.tsx`
- `frontend/src/pages/AdminCreateRestaurantPage.tsx`
- `frontend/src/pages/AdminAddTeudaPage.tsx`
- `frontend/src/locales/en.ts`
- `frontend/src/locales/he.ts`
- `frontend/src/utils/displayName.ts`
- `frontend/src/utils/displayName.test.ts`
- `DESIGN_PROGRESS.md`

Not modified: backend, API clients, hooks, stores, search pages, restaurant cards, restaurant details, the map, and `LocationField.tsx`.

## Tests and results

Run from `C:\FS\projects\KosherRadar-design\frontend`. Dependencies are a junction to the main checkout's `frontend/node_modules`. No package was installed.

| Command | Exit code | Result |
| --- | --- | --- |
| `npm test` | 0 | 15 files, 94 tests passed |
| `npm run lint` | 0 | No findings |
| `npm run typecheck` | 0 | Passed |
| `npm run build` | 0 | JS `728.37 kB` (gzip `213.19 kB`), CSS `48.86 kB` (gzip `13.41 kB`). Vite still warns above 500 kB. |

Earlier notes recorded about `718 kB` after UI polish and about `722 kB` after the audit fixes. This build was not compared with a fresh baseline build of `3bbb1e2` in the same session. The increase is small and there is no new dependency. These tests do not assert CSS class names.

## Screens inspected

Dev server: `http://127.0.0.1:5176/` from this worktree. The API was not reachable, so the homepage showed the existing server-error alert. No restaurant records were loaded.

Inspected:

- English login and forgot-password at a desktop width: mark, visible `עב` language control, card, forest primary button, footer contrast. Login also shows the password reveal.
- Hebrew login at about 390px: `dir=rtl`, logo on the right, `EN` on the logo row, two header rows, form and footer.
- Hebrew register: heading, password hint, confirm field.
- English homepage after switching language back: existing search, filters, list/map controls still present. The error sentence stayed in Hebrew until a new request because that string was already stored. That behavior was not changed.

Not inspected with a signed-in session or real records:

- Account points block and submission history.
- Restaurant, certificate, and report forms after login.
- Admin dashboard and the missing-food / missing-pin warning.
- A populated restaurant card or details page (intentionally not restyled yet).

## Hebrew strings for native-speaker review

Rendered in this pass:

- `forms.foodReviewed`: `סוג האוכל נוסף במהלך הבדיקה, לפני שאפשר למצוא את המקום בחיפוש לפי אוכל.`
- `forms.reportExamples`: `לדוגמה: טלפון או שעות שגויים, או שהתעודה מציגה הכשר שונה ממה שמופיע בדף.`
- `forms.correctionApplied`: `התיקון הוחל`
- `forms.closedWithoutChange`: `נסגר בלי שינוי בדף`
- `desk.missingFood`: `אין עדיין סוג אוכל. חיפוש לפי אוכל לא ימצא את המקום עד שיוסף.`
- `desk.missingPin`: `אין עדיין מיקום על המפה. המקום לא יופיע במפה עד שיתווספו קואורדינטות.`

Prepared for the discovery pass and not rendered yet:

- `home.heading`: `מצאו מסעדות ואת הראיות לכשרות שלהן`
- `home.unknownExcluded`: `מקומות שכשרותם אינה ידועה נשארים מוסתרים, אלא אם תבחרו לכלול אותם.`
- `home.appliedFilters`: `מסננים פעילים`
- `map.scoped`: `המפה מציגה התאמות באזור שעל המסך. חיפוש לפי שם אינו מזיז את המפה.`
- `common.removeFilter`: `הסרת {{name}}`

English admin tab `admin.tabTeudot` is now `Pending certificates`. The Hebrew label was already `תעודות ממתינות` and was left as it is.

## Requests for the functionality agent

Do not implement these here:

- Remember search text and filters in the address, and restore them on Back to search (UX-001).
- Include the current search-box text when a filter changes (UX-002).
- Pass the login return path through registration (UX-006).
- Restore the document title when leaving a restaurant page (UX-010).
- Report certificate picker or proposed hechsher (UX-005 beyond the hint already shown).
- Links from certificate and report history rows. Those payloads have no restaurant id.
- Fitting the map to text-search results, and hiding the empty-map line while the first bounds request is pending (UX-012).

`displayName.ts` is ready for Hebrew and English stored names. Wire it only when the discovery files are safe to edit, using Agent 2's components if those components own the name rendering.

## Visual QA of the independent pages

Dev server for this worktree: `http://127.0.0.1:5177/` (port 5176 was already taken). The API was not required for these screens. Account and admin were not opened because that needs a signed-in session, and a new account was not created against the local database.

Checked in the browser:

- English login at 390px: no horizontal overflow. Language control sits on the logo row and shows `עב`. The log-in button label is centered. Email and password fields are labeled.
- Hebrew login at 390px and 375px: `dir="rtl"`. Logo is on the right, `EN` is on the left. No horizontal overflow. The show-password control stays at the inline end of the field.
- Hebrew register at 1280px: heading `יצירת חשבון`, no horizontal overflow.
- Hebrew forgot-password at 390px: heading and reset action are present, no horizontal overflow.
- Hebrew missing page at 768px: heading `הדף לא נמצא`, no horizontal overflow.
- Hebrew home at 390px and 1440px: the shell does not overflow. The search controls are still the previous interface. They were not restyled.

Not checked: a signed-in account page, the admin dashboard, certificate upload with a real file, and a populated restaurant card.

## How discovery should use Agent 2's interface

Do not invent a parallel store while the interface is missing. When `UX_FUNCTIONALITY_PROGRESS.md` names the hook and its actions:

- Read search text, filters, and the list/map choice from that hook. Do not add another `useState` for them.
- Render applied filters with `filterChipClassName`. Removal calls the documented clear action for that filter, not a local copy of the filter object.
- Pass the stored restaurant through `localizedRestaurantName` and `localizedAddress` in the card, suggestion, and details title. Do not translate names that were not stored.
- Keep Leaflet `direction: ltr`. Popup text can follow the page.
- Leave list/map side-by-side and a mobile filter drawer undocumented as implementations until the actions exist and a side-by-side layout is approved.

## Deferred until Work Package 1A is committed

- Homepage composition, search field, filters, applied-filter chips, result cards, details page, and map/list layout.
- Side-by-side list and map. Not approved. It would change Leaflet bounds, clustering, and selection. Do not build it without approval.
- A mobile filter drawer. Opening it must not reset filters. Do not build it until Agent 2's filter actions exist.
- Using `home.heading` and the unused discovery strings above.

## Potential merge conflicts

Likely if Agent 2 also edits presentation in the same files:

- Medium: `Navbar.tsx`, `Layout.tsx` if navigation markup moves.
- Medium: `locales/en.ts` and `locales/he.ts` (new keys were added in parallel places).
- Low: `formStyles.ts`, `index.css` if Agent 2 does not import them.
- Admin and form pages were restyled in place. Conflicts should keep Agent 2's handlers and this branch's classes.

`frontend/node_modules` is a directory junction and must not be committed. `frontend/dist` is generated. `frontend/scripts/apply-independent-design.mjs` is a one-off coder script and must not be committed.

## NEXT DESIGN AGENT ONBOARDING

**Current position**

- Branch `feature/design-overhaul`, worktree `C:\FS\projects\KosherRadar-design`.
- Stage 1 and the independent pages are committed (`c32efd7`, `61a05a1`) and checked with tests, lint, typecheck, build, and the browser notes above.
- Discovery screens are the next stage. They stay blocked while `feature/ux-functionality` has no committed interface.

**Exact next step**

1. Read this file. Reconcile it with `git status` and `git log` on this worktree only.
2. Read `C:\FS\projects\KosherRadar-ux-functionality\UX_FUNCTIONALITY_PROGRESS.md` if it exists. Do not edit it.
3. If Work Package 1A is not committed, do not start homepage, filters, cards, details, or the map. Continue only with leftover visual polish on auth, forms, account, and admin.
4. If Work Package 1A is committed, read the hook and action names, then restyle discovery by calling that interface. Use `filterChipClassName` and `displayName.ts`. Do not copy search state into this branch.
5. Re-run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` in `frontend`.
6. Look at login, register, account (if a session exists), and admin in English and Hebrew around 390px and 1280px.

**Do not repeat**

- Do not add URL search params, debounce, or a second filter store.
- Do not change who is included by the unknown-kashrut default.
- Do not rename public kashrut statuses.
- Do not merge, rebase, or push.
