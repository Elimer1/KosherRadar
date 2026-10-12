# Design integration handoff

Staging branch: `integration/design-merge`
Staging worktree: `C:\FS\projects\KosherRadar-design-merge`

## Current position

| Item | Value |
|---|---|
| MAIN_BEFORE | `36cf869fd132e6acbe800c9d1d78bcadb1e25035` |
| Design tip | `34950bd0c1284acb7f3f61897830e28e98daff93` |
| Backup | `backup/main-pre-design-merge` → `36cf869` |
| Preflight commit | `bf47636936d973478588f0a16f958255daffcad3` |
| Design merge | `f3d3db0f470c189934301341eeb046c4451b87ce` |
| Merge parents | `bf47636` then `34950bd` |
| Merge status | Complete. 19 textual conflicts resolved. |
| Backend diff vs MAIN_BEFORE | Empty |
| Promotion | Fast-forward only, after this documentation commit, and only if `main` is still `36cf869` |

## Milestone 1 — Preflight

Passed. UX tip `c897ed6` is an ancestor of `main`. UX merge `cfdf7fc` has second parent `c897ed6`. Backend tip `bca1b3a` is an ancestor. Backend docs commit `36cf869` was `main` HEAD. `main` was clean. Design tip had not moved past `34950bd`. Design backend diff from merge base `3bbb1e2` was empty. No package or lockfile changes. No external font URLs.

Other worktrees were not modified.

## Milestone 2 — Baselines

| Suite | Command | Exit | Result |
|---|---|---|---|
| Main backend | `npm test` in `backend` | 0 | 40 files, 505 passed, 0 skipped |
| Main frontend | `npm test` | 0 | 22 files, 127 passed |
| Main frontend | `npm run lint` | 0 | clean |
| Main frontend | `npm run typecheck` | 0 | clean |
| Main frontend | `npm run build` | 0 | JS `index-CgoqH5I2.js` 742.89 kB; CSS `index-Bn9lzhWN.css` 46.62 kB |
| Design tip frontend | `npm test` in `_kr_design_tip_check` | 0 | 15 files, 94 passed |
| Design tip frontend | lint, typecheck, build | 0 | JS `index-GENanuxW.js` 730.52 kB; CSS `index-B48AREoM.css` 46.54 kB |

Backend has no lint script. Database-gated tests were not run. No `.env` was loaded.

## Milestone 3 and 4 — Overlap and resolution

Merge base `3bbb1e2`. 19 conflicts plus one clean overlap (`AdminDashboardPage.tsx`). No wholesale file selection. Main behavior kept. Design presentation applied.

| File | Main behavior | Design change | Intended combined result | Verified |
|---|---|---|---|---|
| `frontend/src/components/Layout.tsx` | `PageMetaProvider`, session alert | Forest footer, amber-ink alert, 44px dismiss | Both | Yes |
| `frontend/src/components/LocationField.tsx` | Device location and `location.current` | `quietActionClassName`, `dir=auto` | Both | Yes |
| `frontend/src/components/RestaurantCard.tsx` | `returnState`, `onOpenRestaurant`, `restaurantDisplayNames` | `kr-card`, chips, `placeLine` | Both | Yes |
| `frontend/src/components/RestaurantMap.tsx` | Same open callback and names | Popup width, address, forest loading chip, `role=status` | Both | Yes |
| `frontend/src/components/SearchBar.tsx` | Existing props and bilingual suggestions | Forest search field, mist suggestion rows | Both | Yes |
| `frontend/src/components/SearchFiltersPanel.tsx` | Group clear buttons | `choiceClassName`, `panelClassName`, one-column categories on small screens | Clears restyled with `quietActionClassName` | Yes |
| `frontend/src/components/admin/ExpiringSoonTab.tsx` | `state.adminTab = expiring` | Grove link | Both | Yes |
| `frontend/src/components/admin/ManageRestaurantsTab.tsx` | `adminTab = manage` | Grove link | Both | Yes |
| `frontend/src/components/admin/PendingReportsTab.tsx` | `adminTab = reports` | Grove link | Both | Yes |
| `frontend/src/components/admin/PendingRestaurantsTab.tsx` | `adminTab = restaurants` | Grove link | Both | Yes |
| `frontend/src/components/admin/PendingTeudotTab.tsx` | `adminTab = teudot` | Grove link | Both | Yes |
| `frontend/src/locales/en.ts` | UX keys including `home.unknownHidden` | `unknownExcluded`, `appliedFilters` | Union. 518 keys, no duplicates, none dropped | Yes |
| `frontend/src/locales/he.ts` | Same UX keys | Same two additions | Parity with English. New Hebrew needs native review | Yes |
| `frontend/src/pages/AdminAddTeudaPage.tsx` | `location.state` on return links | Grove links | Both | Yes |
| `frontend/src/pages/AdminDashboardPage.tsx` | `?tab=` state | Forest tab styles | Auto-merge reviewed. Tab URL kept | Yes |
| `frontend/src/pages/AdminRestaurantPage.tsx` | `dashboardPath` and add-certificate state | Grove links | Both | Yes |
| `frontend/src/pages/HomePage.tsx` | `useSearchCriteria`, location pending, clear, unknown note | Page title, view toggle, notices | Both. Clears use `quietActionClassName` | Yes |
| `frontend/src/pages/LoginPage.tsx` | Reason sentence and register return state | Soft card, forest link | Both | Yes |
| `frontend/src/pages/RegisterPage.tsx` | Reason sentence and login return state | Soft card, forest link | Both | Yes |
| `frontend/src/pages/RestaurantDetailsPage.tsx` | `resolveSearchReturnPath`, bilingual title | Sections, `kr-back`, dashed amber claim | One claim block, not two. Sentences kept | Yes |

`frontend/src/utils/displayName.ts` came from the design branch and is not imported by the app. Names still come from `restaurantDisplayNames`.

A duplicate plain claim list that the merge had concatenated was removed. The remaining claim block uses the dashed amber treatment and still shows `details.claimSays` and `details.claimNote`.

## Milestone 5 — Automated verification on staging

| Command | Exit | Result |
|---|---|---|
| `npm test` backend | 0 | 40 files, 505 passed |
| `npm test` frontend | 0 | 23 files, 131 passed |
| `npm run lint` frontend | 0 | clean |
| `npm run typecheck` frontend | 0 | clean |
| `npm run build` frontend | 0 | JS 749.63 kB (`index-BNhbbtpQ.js`), CSS 47.29 kB (`index-CLDEltFl.css`) |

No main test file was deleted. Design added `frontend/src/utils/displayName.test.ts`. No test selectors were changed.

Bundle delta versus main: JS +6.74 kB, CSS +0.67 kB.

Locale check: English and Hebrew each have 518 keys, no duplicate keys, no key present on only one side, no key from pre-merge `main` removed.

## Milestone 6 — Browser verification

App: `http://127.0.0.1:5203` with `VITE_API_URL=http://127.0.0.1:5202/api`.
Mock: `C:\Users\elime\AppData\Local\Temp\kr-design-mock\server.mjs` (not in the repo). Place search returns unavailable. No Cloudinary, Geoapify, or Atlas calls.

Fixtures: verified cafe with a valid certificate and a long Hebrew name; unverified grill with no phone and no certificate; expired bakery with no coordinates; unknown kitchen with no address. Unknown stays hidden until `includeUnknown=true`.

| Check | 375 | 768 | 1280 | Notes |
|---|---|---|---|---|
| Homepage/search, EN | PASS | PASS | PASS | No horizontal overflow. Filters visible at 1280 |
| Homepage/search, HE | PASS | PASS | PASS | `dir=rtl`, `lang=he`, no overflow |
| Restaurant cards, EN | PASS | PASS | PASS | Verified solid mist, unverified dashed amber, expired words |
| Restaurant cards, HE | PASS | PASS | PASS | Hebrew primary names |
| Restaurant details, EN | PASS | PASS | PASS | Verified and unverified pages |
| Restaurant details, HE | PASS | PASS | PASS | Titles and claim sentences in Hebrew |
| Filters, EN | PASS | PASS | PASS | Meat sets `?foodType=MEAT` and leaves one result |
| Filters, HE | PASS | PASS | PASS | Include-unknown checkbox checked from the URL |
| List/map control, EN and HE | PASS | PASS | PASS | Pressed state. URL does not gain a view param |
| Horizontal overflow, EN and HE | PASS | PASS | PASS | `scrollWidth` equals the emulated width |
| Status labels, EN and HE | PASS | PASS | PASS | Words plus symbol. Not color alone |

Functional sampling:

| Check | EN | HE |
|---|---|---|
| Search query and filter persistence | PASS `?foodType=MEAT` | PASS `?q=nomatch` kept in the field |
| Return from details to the same search | PASS back to `?foodType=MEAT` | PASS back link is "חזרה לחיפוש" |
| Clear filters | PASS button present with an active filter | PASS "ניקוי החיפוש והמסננים" |
| Language-dependent names and titles | PASS "Cafe Verified - KosherRadar" | PASS long Hebrew title |
| Verified vs unverified | PASS "Verified certificate" vs "Unverified claim (no certificate)" plus both claim sentences | PASS "תעודה מאומתת" vs "טענה לא מאומתת (אין תעודה)" plus both Hebrew sentences |
| Empty results | PASS | PASS "אין מסעדות שתואמות לחיפוש." |
| Map popup | BLOCKED | BLOCKED |
| Protected login message | PASS "An account is required to add a certificate." | PASS "צריך חשבון כדי להוסיף תעודה." |

State and accessibility:

| Check | Result |
|---|---|
| Loading indicator | PASS on the restaurant page before details arrived |
| Restaurant not found | NOT EXERCISED in the browser. The merged not-found state keeps `backTo` |
| Search error | NOT EXERCISED. The merged error notice and retry button remain in `HomePage` |
| Map error | NOT EXERCISED. Map empty-area copy was shown |
| Suggestion dropdown | NOT EXERCISED |
| Selected filters | PASS Meat checked, Filters (1), clear group button |
| Keyboard and focus | PASS search field focuses with a forest border and 2px ring. A Tab press in the embedded browser did not move off the email field |
| Reduced motion | PASS after the CSS order fix. `.kr-spinner` computed `animation-name: none` when `prefers-reduced-motion: reduce` |
| OpenStreetMap tiles | PASS 12 tiles loaded. Popup not opened |
| Geocoding | NOT APPLICABLE. Mock reports place search unavailable |

Map popup is blocked because the visible Israel bounds in this session did not show the fixture markers, so there was nothing to open. The map container is `direction: ltr`. Zoom controls and the Hebrew empty-area sentence rendered.

Screenshots outside the repo:

- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\staging-en-natural-home.png` (host pane, about 183px)
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\staging-en-1280-home.png`
- `C:\Users\elime\AppData\Local\Temp\kr-design-integration-shots\staging-en-1280-clip.png`

Emulated 1280 captures tiled because the host pane is narrower than the emulated layout. They are evidence of the forest filters and cards, not a layout bug. Overflow was measured from `scrollWidth`.

## Milestone 7 — Promotion readiness

- Design work is on staging.
- Overlap table reviewed.
- One search store: `useSearchCriteria`.
- UX test files remain. Backend tests remain. Backend diff is empty.
- Kashrut wording checked in English and Hebrew.
- No new automated failures versus the baselines.
- Browser matrix has no unresolved release-blocking failure. Map popup is blocked and documented.
- Other worktrees were not modified.
- Promote only with `git merge --ff-only integration/design-merge` from the `main` worktree, and only if `main` is still `36cf869`.

## Known limits

- Hebrew from the design pass, plus `home.unknownExcluded` and `home.appliedFilters`, needs native-speaker review.
- `displayName.ts` is unused.
- Geocoding, Atlas, Cloudinary, and paid tiles were not used.
- Live concurrency tests were not run.
