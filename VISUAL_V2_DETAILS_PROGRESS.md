# Visual v2 — restaurant details

## Audit of historical visual instructions

Read before any code change, from worktree `C:\FS\projects\KosherRadar-visual-v2-details` at baseline `0140d195474c44011dbfd285b4b47338dab73451`.

Historical documents that still describe the rejected restaurant-page look:

- `REDESIGN_AGENT_3.md` — dark green identity band (`#174b3a`), white 59px title, four white action pills, two-column evidence plus a contact card, dashed cream claim sheet, full-width status banners on certificates.
- `REDESIGN_SPEC.md` — forest-green brand, rounded white surfaces, pale-green verified cards, and an instruction that `pageTitleClassName` stay unchanged so the details title does not jump.
- `DESIGN_PROGRESS.md` — restaurant details as section cards; verified forest-on-mist; unverified dashed amber; the older `#174B3A` palette.
- `REDESIGN_INTEGRATION_PROGRESS.md` — details hero mapped onto `forest-deep`, shared rounded surfaces, and the same status fills.
- `UI_PROGRESS.md` and `UX_FUNCTIONALITY_PROGRESS.md` — earlier polish and behavior notes that assume the established card layout.

Those visual instructions are superseded by the Wave 1 details assignment. They were not deleted.

Still in force from those documents and from `PROJECT_SPEC.md` / `AGENTS.md`:

- Kashrut status values, evidence precedence, and the details API contract.
- English and Hebrew, including `dir="auto"` names and RTL layout.
- Safe `http`/`https` links only. Phone numbers stay `bdi dir="ltr"`.
- Call, Google Maps, Waze, share, Kosharot, add certificate, and report a problem.
- Authentication stays on the existing add-certificate and report routes. No new approval step and no points for administrators.
- Loading, not-found, error-and-retry, and a back link that restores the originating search.
- KosherRadar does not certify restaurants. Administrator records stay authoritative through the existing rules, with no gold treatment.
- No invented restaurant photo.

Shared tokens are used with the assignment fallbacks. `frontend/src/index.css` is not edited.

## Worktree

- Path: `C:\FS\projects\KosherRadar-visual-v2-details`
- Branch: `redesign/v2-details`
- Baseline HEAD: `0140d195474c44011dbfd285b4b47338dab73451`
- `main` and other worktrees were not modified.

## NEXT AGENT ONBOARDING

### Recovery completed — 13 October 2026

- Current milestone: Visual v2 restaurant details. Fix `V2-D001` is VERIFIED in `FIX_TRACKER.md`.
- Recovered the uncommitted light identity, editorial evidence layout, scoped CSS, icons, labels, and tests on `redesign/v2-details` at `0140d19`. The older onboarding below was stale: implementation already existed. No replacement worktree or branch was created.
- Completed the directions disclosure: collapsed by default, anchored destination chooser, visible chevron, keyboard Enter opens it, Escape closes it and restores focus. Google Maps and Waze destinations remain available.
- Replaced direct DOM removal of failed certificate thumbnails with React state. The safe photo link remains available after a preview failure and language changes.
- Fixed Hebrew title alignment found in screenshot review: the nested `bdi` prevented `dir="auto"` on the heading from detecting its strong text. The heading now contains the name directly, retaining automatic direction.
- Preserved the existing public status terminology, evidence rules, safe links, search return state, metadata, account routes, backend contracts, and authentication. No backend or shared shell/map/discovery files were changed.
- Modified files: `frontend/src/pages/RestaurantDetailsPage.tsx`, its test, and `frontend/src/components/details/{CertificateList,DetailsIdentity,DetailsStates,KashrutOverview,RestaurantActions,UnverifiedClaims,StatusIcon,labels}.tsx` (`labels.ts`), plus `details.css`; tracking notes in this file, `PROGRESS.md`, and `FIX_TRACKER.md`.
- Verification: `cd frontend; npm test` exit 0, 26 files / 154 tests; `npm run lint`, `npm run typecheck`, and `npm run build` each exit 0. Production JS approximately 762.44 kB; existing >500 kB bundle warning remains. Backend tests/build were not run because backend code was untouched.
- Browser verification: installed headless Chrome with a dedicated disposable profile, production frontend and local synthetic API fixtures only. 80 completed renders: 10 states × English/Hebrew × 390/700/900/1280 widths; no horizontal overflow. States: current, current plus expired/claim, expired, unverified, unknown, multiple certificates, long names/URLs, missing contact, not found, loading. Desktop evidence/contact columns mirror in RTL; mobile stacks.
- Screenshots inspected for desktop and mobile, Hebrew long names, expired evidence, and mixed evidence. Evidence is local and ignored in `design-screenshots/details-v2/` (32 matrix screenshots, error and open-directions screenshots, `results.json`). Initial incomplete Vite captures were replaced by completed production renders; they are not verification evidence.
- Browser interactions passed: server error and retry; Enter/Escape on directions; actual clipboard fallback with native sharing marked unavailable; both logged-out contribution links redirect to `/login`. Phone/external destination correctness, safe URLs, search restoration, and stale-response handling are covered by component/helper tests. No external navigation, real calling, native share sheet, or live integration was exercised.
- Hebrew additions in `components/details/labels.ts` (`ניווט`, `תעודות וראיות`) still need native-speaker review under M8-004. This does not change verification terminology.
- The existing untracked `frontend/vite.details-preview.config.ts` was preserved and excluded from the commit, as its header requests. Browser scripts and profiles are local ignored evidence, not application dependencies.
- Exact next step: stop after the local checkpoint. Do not merge, push, start a LATER issue, or change other worktrees. The existing untracked preview config is expected in Git status.

### Historical onboarding at interruption (superseded)

**Current position**

- Branch `redesign/v2-details`, worktree `C:\FS\projects\KosherRadar-visual-v2-details`.
- HEAD is still the baseline. Implementation has not been committed yet.
- Next: replace the details page composition, then verify in the browser and with the frontend scripts.

**Completed work**

- Worktree created from the required baseline.
- Historical visual audit recorded above.

**Incomplete work**

- Page composition, CSS, tests, browser screenshots, and the verification commands are not done.

**Instructions for the next agent**

- Own only `frontend/src/pages/RestaurantDetailsPage.tsx`, `frontend/src/components/details/*`, details tests, and this file.
- Do not edit the shell, discovery, map, shared CSS, locales, or other progress files.
- Do not push or merge.
