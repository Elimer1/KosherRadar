# Design integration handoff

Staging branch: `integration/design-merge`
Staging worktree: `C:\FS\projects\KosherRadar-design-merge`
This file lives only on the staging branch until promotion.

## Current position

| Item | Value |
|---|---|
| MAIN_BEFORE | `36cf869fd132e6acbe800c9d1d78bcadb1e25035` |
| Staging HEAD | `36cf869fd132e6acbe800c9d1d78bcadb1e25035` (same as MAIN_BEFORE; merge not started) |
| Design tip | `34950bd0c1284acb7f3f61897830e28e98daff93` (`feature/design-overhaul`) |
| Backup ref | `backup/main-pre-design-merge` → `36cf869fd132e6acbe800c9d1d78bcadb1e25035` |
| Merge base | `3bbb1e2da84215e62c82010de755be2b574aa6bf` |
| Merge status | Not started |
| `main` worktree | `C:\FS\projects\KosherRadar` still at MAIN_BEFORE, clean |

Do not restart the merge if a later agent finds it in progress. Do not reset staging. Do not touch other worktrees.

## Milestone 1 — Preflight and prerequisites

Git: `2.46.0.windows.1`. Strategy available: `ort`. `git merge-tree --write-tree` is available (preview only; exit 1 means conflicts).

Checked and passed:

- UX tip `c897ed6ccbe471d6877f9938379a36c2484e50e0` is an ancestor of `main`.
- UX merge `cfdf7fc1c2306cdeee38dfa8bd6ba8b0fb4ce2c9` is an ancestor of `main`. Parents: `3bbb1e2da84215e62c82010de755be2b574aa6bf` then `c897ed6ccbe471d6877f9938379a36c2484e50e0`. Second parent is the UX tip.
- Backend tip `bca1b3a1597d2905ae604fe3c26c34bb5137541e` is an ancestor of `main`.
- Backend integration documentation commit is current `main` HEAD `36cf869fd132e6acbe800c9d1d78bcadb1e25035`. Backend merge commit on `main`: `07c6a3f`.
- `main` porcelain was empty. No unresolved merge.

Design tip has not moved past `34950bd`. Unique commits on the design branch since the merge base:

`34950bd`, `d2b0384`, `c09bae2`, `ac1181b`, `08127e7`, `d3d69fd`, `61a05a1`, `c32efd7`.

All are design documentation or presentation. `git diff --stat 3bbb1e2 feature/design-overhaul -- backend` is empty. No `package.json` or lockfile changes. No external font or icon URLs. System font stack in design `index.css` includes `Segoe UI`, `Noto Sans Hebrew`, and `Arial Hebrew`.

Worktrees recorded and left untouched:

| Worktree | HEAD | Status |
|---|---|---|
| `C:/FS/projects/KosherRadar` | `36cf869` main | clean |
| `C:/FS/projects/KosherRadar-design-merge` | `36cf869` integration/design-merge | this staging tree |
| backend-qa | `bca1b3a` | clean |
| design | `34950bd` | clean |
| qa | `54d9605` | clean |
| ui | `e479f31` | clean |
| ux-review | `7d2a1a6` | untracked `UX_REVIEW.md` only |
| ux-functionality | `c897ed6` | clean |
| workflow | `7811ca2` | clean |

Temporary detached worktree for the design baseline: `C:\FS\projects\_kr_design_tip_check` at `34950bd`. Its `frontend\node_modules` is a junction to the main frontend `node_modules` because the lockfile is unchanged. Remove the junction with `cmd /c rmdir` (no `/s`) before `git worktree remove`. Do not `rmdir /s` that junction.

## Milestone 2 — Baselines

No unexplained failures. Database-gated backend tests were not run. No `.env` files were loaded. Backend has no lint script.

### Current main (`36cf869`)

| Command | Directory | Exit | Result |
|---|---|---|---|
| `npm test` | `backend` | 0 | 40 files, 505 passed, 0 failed, 0 skipped |
| `npm test` | `frontend` | 0 | 22 files, 127 passed |
| `npm run lint` | `frontend` | 0 | oxlint clean |
| `npm run typecheck` | `frontend` | 0 | `tsc -b` clean |
| `npm run build` | `frontend` | 0 | JS `index-CgoqH5I2.js` 742.89 kB (gzip 217.62 kB); CSS `index-Bn9lzhWN.css` 46.62 kB (gzip 13.01 kB). Chunk-size warning only. |

### Design tip (`34950bd`, detached worktree)

| Command | Directory | Exit | Result |
|---|---|---|---|
| `npm test` | `_kr_design_tip_check/frontend` | 0 | 15 files, 94 passed |
| `npm run lint` | same | 0 | oxlint clean |
| `npm run typecheck` | same | 0 | `tsc -b` clean |
| `npm run build` | same | 0 | JS `index-GENanuxW.js` 730.52 kB (gzip 213.70 kB); CSS `index-B48AREoM.css` 46.54 kB (gzip 13.00 kB). 235 modules vs main 242. |

Main is larger because it already contains UX and backend-docs frontend code. Design is the older functional base plus presentation.

## Milestone 3 — Overlap inventory

Merge base: `3bbb1e2da84215e62c82010de755be2b574aa6bf`.

`git merge-tree --write-tree --messages main feature/design-overhaul` exits 1 and names 19 textual conflicts. One additional file is in both change sets and merges without a conflict marker: `frontend/src/pages/AdminDashboardPage.tsx`.

Resolution rule: keep `main` hooks, props, URL search state, admin tab state, login return sentences, stored bilingual names, and kashrut wording. Apply design classes and markup onto that structure. Do not restore design-branch search props (`text`, `onSearch`, `onChange`, `navigate`). Do not add a second search store. Do not wholesale accept either side of a source conflict.

Design class sources (design `frontend/src/components/formStyles.ts` and `index.css`): `quietActionClassName`, `panelClassName`, `sectionCardClassName`, `pageTitleClassName`, `filterChipClassName` (unused on the design branch; do not invent a chip row), `metaChipClassName`, `quietChipClassName`, `choiceClassName` (`kr-choice`), `warningNoticeClassName`, `errorNoticeClassName`, `secondaryButtonClassName`, `primaryButtonClassName`, `kr-card`, `kr-back`, `kr-back-mark`, `bg-forest`, `kr-view-toggle`.

| File | Main behavior | Design change | Intended combined result | Verified |
|---|---|---|---|---|
| `frontend/src/components/Layout.tsx` | UX page chrome and language/dir | Forest/mist layout shell | Main structure, design shell classes | No |
| `frontend/src/components/LocationField.tsx` | `appliedLabel`, `locationSource`, `onPickLocation`, `onClearLocation` | Field styling | Main props, design field classes | No |
| `frontend/src/components/RestaurantCard.tsx` | `returnState`, bilingual names, status wording | `kr-card` hierarchy | Main data/callbacks, design card | No |
| `frontend/src/components/RestaurantMap.tsx` | `returnState`, `onOpenRestaurant` | Map chrome, LTR map, forest radius | Main callbacks, design chrome | No |
| `frontend/src/components/SearchBar.tsx` | `useSearchCriteria` / URL applied search | Search field layout | Main hook contract, design layout | No |
| `frontend/src/components/SearchFiltersPanel.tsx` | Draft/applied filters, group clear | Filter control styling, `choiceClassName` | Main filter behavior, design controls | No |
| `frontend/src/components/admin/ExpiringSoonTab.tsx` | Admin tab URL state | Admin visual system | Main tab behavior, design classes | No |
| `frontend/src/components/admin/ManageRestaurantsTab.tsx` | Admin tab URL state | Admin visual system | Main tab behavior, design classes | No |
| `frontend/src/components/admin/PendingReportsTab.tsx` | Admin tab URL state | Admin visual system | Main tab behavior, design classes | No |
| `frontend/src/components/admin/PendingRestaurantsTab.tsx` | Admin tab URL state | Admin visual system | Main tab behavior, design classes | No |
| `frontend/src/components/admin/PendingTeudotTab.tsx` | Admin tab URL state | Admin visual system | Main tab behavior, design classes | No |
| `frontend/src/locales/en.ts` | UX keys (`home.rateLimited`, `home.unknownHidden`, `filters.clearGroup`, longer `filters.hideExpired`, `auth.need*`) | Wording/presentation strings only | Union of keys; do not drop UX keys or claim explanations | No |
| `frontend/src/locales/he.ts` | Same UX keys in Hebrew | Wording/presentation strings only | Key parity with English; flag new Hebrew for native review | No |
| `frontend/src/pages/AdminAddTeudaPage.tsx` | Existing add-certificate flow | Form visual system | Main flow, design form classes | No |
| `frontend/src/pages/AdminDashboardPage.tsx` | Admin `?tab=` state | Dashboard visual system | Auto-merge must be reviewed; keep tab URL | No |
| `frontend/src/pages/AdminRestaurantPage.tsx` | Admin restaurant actions | Page visual system | Main actions, design page classes | No |
| `frontend/src/pages/HomePage.tsx` | `useSearchCriteria`, debounce, cancel, map/list | Homepage layout, view toggle | Main search state, design layout | No |
| `frontend/src/pages/LoginPage.tsx` | Return destination and reason sentence | Login visual system | Main auth return, design layout | No |
| `frontend/src/pages/RegisterPage.tsx` | Return destination | Register visual system | Main auth return, design layout | No |
| `frontend/src/pages/RestaurantDetailsPage.tsx` | Back-to-search, bilingual title, claim sentences | Details sections, verified/unverified treatments | Main behavior and claim copy, design sections | No |

## Completed tasks

1. Prerequisites verified.
2. Backup ref created without overwriting.
3. Staging branch and worktree created at MAIN_BEFORE.
4. Main and design-tip baselines recorded. No unexplained failures.
5. Overlap list computed (19 conflicts + 1 clean overlap).

## Pending actions

1. Commit this handoff on `integration/design-merge`.
2. From the staging worktree: `git merge --no-ff feature/design-overhaul`.
3. Resolve the 19 conflicts using the rule above. Review `AdminDashboardPage.tsx`.
4. Run backend `npm test` and frontend test, lint, typecheck, and build on staging.
5. Confirm `git diff --stat 36cf869 HEAD -- backend` is empty.
6. Browser matrix on a mock API. Preferred ports 5202 and 5203.
7. Update this file after each milestone and commit documentation checkpoints only when the merge is complete.
8. Promote with `git merge --ff-only integration/design-merge` from the main worktree only after verification, and only if `main` is still `36cf869`.

## Known problems

None yet. Browser checks and conflict resolution are not started.
