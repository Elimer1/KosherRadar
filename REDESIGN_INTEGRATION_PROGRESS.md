# Wave 1 integration progress

## 1. Branch and integration worktree

- Worktree: `C:\FS\projects\KosherRadar-redesign-integration`
- Branch: `redesign/wave-1-integration`
- Started from Agent 1: `effec1fe94ba99b08cf74e194789d06a31eade65`
- Integration commit: `14b140712cdd5f9023318a1899a72fb08845a7c6`
- Not merged into `main`. Not pushed.

## 2. Baseline commit

`539303733b887f499dbbeaf49db3e3dff55b2eeb` — `chore(frontend): remove unused restaurant display helper`

`main` in `C:\FS\projects\KosherRadar` stayed at that commit. Its only untracked file is still `PRE_PUSH_REVIEW.md`.

## 3. Source branches and commits

| Agent | Branch | Worktree | Commit |
| --- | --- | --- | --- |
| 1 | `redesign/agent-1-discovery` | `C:\FS\projects\KosherRadar-agent-1` | `effec1fe94ba99b08cf74e194789d06a31eade65` |
| 2 | `redesign/agent-2-map` | `C:\FS\projects\KosherRadar-redesign-agent-2` | `b00a7024f333fa7088c438ac55b77d715e54f02c` |
| 3 | `redesign/agent-3-details` | `C:\FS\projects\KosherRadar-agent-3` | `aebb16b9edc3a4742d20c7e03a9d849ab974cd02` |

Each source branch is one commit on the shared baseline. All three source worktrees were clean and were not modified.

## 4. Completed integration steps

- Merged `redesign/agent-2-map` as `478a340`.
- Merged `redesign/agent-3-details` as `4cb3f8c`.
- Mapped map and details greens, creams, ink, and borders onto Agent 1's tokens.
- Kept verified, unverified, expired, and unknown visually distinct.
- Grouped primary and secondary restaurant names so a Hebrew secondary name stays with the title.
- Ran lint, typecheck, tests, and build.
- Inspected the rendered app at 375, 768, and 1280 in English, and the result list in Hebrew.

## 5. Files changed

Merges brought in Agent 2's map files and Agent 3's details files, plus `REDESIGN_AGENT_2.md` and `REDESIGN_AGENT_3.md`. `REDESIGN_SPEC.md` and `REDESIGN_AGENT_1.md` stayed.

Harmonization and the name fix:

- `frontend/src/components/map/map.css`
- `frontend/src/components/map/mapChrome.ts`
- `frontend/src/components/map/MapPopupCard.tsx`
- `frontend/src/components/RestaurantMap.tsx`
- `frontend/src/components/details/details.css`
- `frontend/src/components/details/DetailsIdentity.tsx`
- `frontend/src/components/RestaurantCard.tsx`
- `REDESIGN_INTEGRATION_PROGRESS.md`

## 6. Conflicts encountered and resolutions

None. The three diffs against the baseline do not share a path. Both merges used the `ort` strategy.

## 7. Visual consistency changes

`REDESIGN_SPEC.md` is the visual reference.

- Map and details colors now use `--color-forest`, `--color-forest-deep`, `--color-ink`, `--color-muted`, `--color-soft`, `--color-mist`, `--color-canvas`, `--color-grove-soft`, and `--color-amber-ink`.
- The details hero uses `forest-deep`, the same deep green as the header.
- Map and details primary buttons are forest, with forest-deep on hover. Secondary actions use the soft border and ink text from the shared buttons.
- Map frame, dock, and popup radii follow the shared rounded surfaces.
- Verified evidence stays green. Unverified claims stay dashed amber on a warm sheet. Expired evidence stays red. Unknown stays neutral.
- The search-radius circle uses grove `#2a7a5a` and forest `#1a5c43`.

## 8. Known issues fixed

On English cards, the Hebrew secondary name was a full-width `dir="auto"` block, so it aligned toward the kashrut badge. The title and secondary names are now one group. Each name is isolated with `bdi`, and the group aligns to the start of the page. The same grouping is used on the map card and the details hero.

Measured after the fix, with no horizontal overflow:

- English, 1280: title and secondary both start at x=409. The secondary name does not overlap the badge.
- English, 375: both start at x=32. No overlap.
- Hebrew, 1280: both start at the right edge, x=857. No overlap.
- Hebrew, 375: both start at x=343. No overlap.

## 9. Actual test results

From `C:\FS\projects\KosherRadar-redesign-integration\frontend` on 13 October 2026:

| Command | Result |
| --- | --- |
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0, 26 files, 150 tests passed |
| `npm run build` | exit 0. JS about 759 kB (existing warning above 500 kB). CSS about 65 kB |

Two tests failed once because they expect `dir="auto"` on the details title and the map title. That attribute was restored on those title elements. The secondary-name block does not use it. The two files then passed, and the full suite passed.

## 10. Screenshot paths

Captured from `http://127.0.0.1:5195/` with a browser-only response. These restaurants are not production records and are not in the shipping UI.

- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-home-desktop.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-home-mobile.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-home-768.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-results-desktop.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-results-mobile.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-results-he-desktop.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-results-he-mobile.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-filters-mobile.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-map-markers-desktop.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-map-card-desktop.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-map-card-mobile.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-details-desktop.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-details-mobile.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-details-unverified.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-details-expired.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-kashrut-states.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-state-empty.png`
- `C:\Users\elime\AppData\Local\Temp\cursor\screenshots\integration-state-error.png`

`integration-kashrut-states.png` is the desktop result list with verified, unverified, expired, and unknown cards.

## 11. Remaining tasks

None for Wave 1 integration. Do not start Wave 2. Do not merge into `main`. Do not push.

## 12. Blockers and limitations

- The local API was not used. Restaurant rows, map markers, and details pages were simulated in the browser only. OpenStreetMap tiles did load for the map screenshots.
- The Hebrew verified badge wraps inside its column. The words stay inside the badge and do not cover the name.
- The production JavaScript bundle is still above 500 kB. That warning existed before this integration.

## 13. Uncommitted changes

None after the harmonization commit on this branch. The merge commits are already recorded.

## V2 integration and release review — 13 October 2026

Starting branch `redesign/wave-1-integration`, HEAD `0140d195474c44011dbfd285b4b47338dab73451`, clean worktree. Local source tips: discovery `baff0d684a351ede628e05609290eff97a5a534b` (implementation `a75b82b9de770169320d129efdaa2dbd96b1ed65` plus a documentation-only commit); map `17b4a6275324a9d79411469a4a9a810c9a5c3789`; details `d45317b4dfb162df6910f96f1b2e7a4ceea13d1f`. All expected commits are reachable from their respective source branches; none of the three branches is an ancestor of integration HEAD. All use `0140d19` as baseline; implementation paths do not overlap. Semantic review must cover shared tokens, KashrutBadge, map container widths, search return state, and RTL. Source worktrees are read-only: discovery/map clean; details retains an untracked `frontend/vite.details-preview.config.ts` that must remain untouched. No fetch, push, main merge, credentials, or real services authorized for this review.

The previous Wave 1 visual target and completion notes above are historical. V2 requires a light header and identity sections, compact directory results, scoped map/details styling, and the preserved business rules. Existing installed Chrome and native DevTools automation can support actual combined-app browser verification without installing dependencies. Backend dependencies are absent here; investigate an existing local test runner before marking backend verification unavailable.

## NEXT AGENT ONBOARDING

- Current milestone: V2 integration and release review, explicitly requested by user.
- Current issue: preflight complete; merge discovery, map, details sequentially with preserved histories.
- Starting HEAD: `0140d19`; source tips and preserved untracked source file listed above.
- Completed: read standing instructions/tracking/source handoffs; audited clean integration, local ancestry, separate paths, and installed browser.
- Tests: none yet for V2 combined tree. Prior source/browser claims are historical evidence only.
- Next: merge the three local branches, inspect combined implementation, run frontend scripts and available isolated backend tests, browser-check actual app using fixtures at 375/768/1280 plus another width in both languages, document screenshots and limitations, commit locally. Do not modify source worktrees or main; do not push.
