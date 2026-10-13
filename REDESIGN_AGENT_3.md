# REDESIGN AGENT 3 — restaurant details

## Baseline

- Branch: `redesign/agent-3-details`
- Worktree: `C:\FS\projects\KosherRadar-agent-3`
- Baseline commit: `539303733b887f499dbbeaf49db3e3dff55b2eeb`
- Baseline subject: `chore(frontend): remove unused restaurant display helper`
- Started from the same commit as `main` in `C:\FS\projects\KosherRadar`. No other agent branch was merged or cherry-picked.
- `main` had an untracked `PRE_PUSH_REVIEW.md`. It stayed in the main worktree and is not on this branch.

## Current step

The restaurant-details page has a new layout. Stop here. Do not start another milestone.

## Decisions

- Reused existing translation keys only. No locale file was edited, and no new keys are required.
- Did not change `KashrutBadge`, status values, evidence precedence, or which certificates the API already returns. `RECENT_EXPIRED` stays labeled expired. Unverified claims stay out of the certificate list.
- Kept the canonical `address` plus `city` line. `addressHe` and `addressEn` stay on the payload and are not swapped in.
- Try again on a network or server failure repeats the same details request. Routes and authorization are unchanged.
- The back-to-search link is also shown while loading, because the return path is already known from router state.
- No restaurant photo, letter tile, or other invented mark. A missing photo stays missing.
- Supervising authority and level in the overview are the primary certificate's hechsher and kashrut level, labeled with `filters.hechsher` and `filters.level`. Claims do not get those rows.
- Details controls use scoped classes in `details.css`. They no longer reuse the shared form button and chip classes, so this page can look different without editing `formStyles.ts`.

## VISUAL CHANGES

An ordinary visitor on a restaurant page will see a different page, not a recolored version of the old stack of white cards.

- The name, address, food-type chips, and the Call / Google Maps / Waze / Share controls sit in one dark green band (`#174b3a`). The name is white. On a 1280px-wide window it measured 59.2px; on a 390px-wide window it measured 34.4px and stayed on one line for “Claimed Grill”. The previous page used a white card and a 30px dark title (`rgb(36, 52, 47)`).
- Those four actions are white pills on the green band. On a phone they stack and each measured 320×48px. On a wide screen they sit in the band under the name.
- Under the band, a wide screen is two columns: the kashrut evidence on the start side (about 646px) and a contact card on the end side (about 296px). The contact card shows the phone number in large type, a solid green “Add a certificate” button, and an outline “Report a problem” button. On a phone the columns stack and the contact card follows the evidence. In Hebrew (`dir=rtl`) the evidence column moves to the right and the contact card to the left.
- Unverified claims are a cream sheet (`#fff6e8`) with a dashed amber border. The warning sentence leads that sheet. On the previous page the claim note followed a smaller kicker inside the same kind of white card as the rest of the page.
- Current and expired certificates, when the API returns them, use a full-width dark status banner (green for current, dark red for expired) and a colored rail on the start edge, so the rail flips in Hebrew. Those two states were not available in the local database.
- Loading and not-found use the same green band. A network or server error uses a white sheet with a solid “Try again” button.
- There is no decorative initial or placeholder photo.

## Completed changes

- Identity header: back link, primary name, secondary names, address and city, food type, categories, and food keywords.
- Kashrut overview uses the existing badge, then labeled authority and validity when the primary evidence is a current or expired certificate.
- Certificate list keeps hechsher, level, expiration wording, mashgiach name and phone, and a photo link only when `isSafeHttpUrl` accepts it.
- Unverified claims are a separate dashed section with the existing claim wording.
- Actions preserved: call, Google Maps, Waze, share, phone, safe website, Kosharot, add certificate, report a problem.
- States: loading, not found (400 and 404), network/server error with retry, missing optional fields, no evidence, multiple certificates, long authority names, expired evidence, and mixed Hebrew/English text.

## Files modified

- `frontend/src/pages/RestaurantDetailsPage.tsx`
- `frontend/src/pages/RestaurantDetailsPage.test.tsx`
- `frontend/src/components/details/details.css`
- `frontend/src/components/details/DetailsIdentity.tsx`
- `frontend/src/components/details/DetailsStates.tsx`
- `frontend/src/components/details/KashrutOverview.tsx`
- `frontend/src/components/details/CertificateList.tsx`
- `frontend/src/components/details/UnverifiedClaims.tsx`
- `frontend/src/components/details/RestaurantActions.tsx`
- `frontend/src/components/details/placeLine.ts`
- `REDESIGN_AGENT_3.md`

Not modified: `KashrutBadge.tsx`, `Layout.tsx`, `Navbar.tsx`, `formStyles.ts`, `index.css`, `HomePage.tsx`, `RestaurantMap.tsx`, locale files, `PROGRESS.md`, `FIX_TRACKER.md`, backend.

## Verification

Technical checks from `C:\FS\projects\KosherRadar-agent-3\frontend` on 13 October 2026. These check that the page still builds and behaves. They are not the evidence for the visual change.

- `npm run lint` — exit 0.
- `npm test -- src/pages/RestaurantDetailsPage.test.tsx` — exit 0, 10 tests passed (after the layout rewrite).
- `npm run build` (`tsc -b && vite build`) — exit 0. `dist/assets/index-DbaGppeG.js` 752.91 kB (gzip 220.03 kB). CSS `index-DsFtzBRf.css` 54.69 kB (gzip 14.63 kB). Vite still warns that the JS chunk is over 500 kB.
- An earlier full `npm test` on this branch, before the last visual pass, was exit 0: 23 files, 138 tests. It was not repeated after the CSS-only follow-up.

Rendered interface, inspected in the browser on 13 October 2026:

- New page at `http://localhost:5184/restaurants/6acc84e0953576757dad2141` (Claimed Grill), through a temporary same-origin proxy to the local API on port 5000. That proxy config was not committed.
- Desktop emulation 1280×1200: one article, green hero background `rgb(23, 75, 58)`, white title at 59.2px, hero about 275px tall, evidence column about 646px, contact card about 296px, horizontal overflow 0. Claim sheet border style `dashed`, background `rgb(255, 246, 232)`.
- Phone emulation 390×844: title 34.4px white, layout `flex` (stacked), contact card at x=16, horizontal overflow 0, each quick action 320×48px.
- Hebrew: `lang=he`, `dir=rtl`, claim warning in Hebrew leading the claim sheet. At 1280px the contact card was on the left (x=152) and the claim sheet on the right (x=467). English was restored (`lang=en`, `dir=ltr`).
- Earlier in the session, on the same new page: Unknown Kitchen (unknown status), invalid id (not found, back to `/`), and Add a certificate redirecting to `/login`.

Before, for comparison, the baseline page still served at `http://localhost:5173/restaurants/6acc84e0953576757dad2141`: article class `mx-auto max-w-3xl space-y-5`, no `.kr-details-hero`, title 30px and `rgb(36, 52, 47)`, single 768px column. Clipped screenshots of both pages were captured. The screenshot viewer described each capture as repeated side by side; the DOM measurements above are one page of the stated width.

Not seen in the browser: a current certificate, an expired certificate, a certificate photo, or the Try again control. The local database had no approved certificate. Those states are covered by the component tests and by the certificate CSS.

## Remaining work

None for this assignment. Stop and wait.

## INTEGRATION NOTES

Desired shared token mappings, already used and not redefined:

- `--color-ink`, `--color-muted`, `--color-soft`, `--color-mist`, `--color-forest`, `--color-forest-deep`, `--color-amber-ink`
- Body canvas and the global focus ring stay in `index.css`

Shared-component requests, not applied here:

- `KashrutBadge` paragraphs need `overflow-wrap: break-word` so a long hechsher does not overflow. This page wraps the badge from `.kr-details-badge`.
- `ShareButton` renders an inner `span.inline-flex`. The details page passes `className="kr-details-command"` and stretches that control. A root element that accepts width would be sturdier.
- Keep shared buttons at least 44px tall. This page’s own controls are 48px.

Potential style conflicts:

- All new selectors start with `.kr-details`. They do not redefine `@theme` tokens.
- `.kr-details a:focus-visible` repeats the global forest focus ring, with a white outline inside the green band.
- `.kr-back` and `.kr-back-mark` are still used so the global Hebrew mirror of the back mark keeps working.
- Claims use the existing amber ink. Expired evidence uses a dark red banner. Neither is a new status name.

Translation additions:

- None.
- No new Hebrew UI copy was written. Existing Hebrew strings are reused. If those strings change later, they still need native-speaker review.

Review after Agent 1 is integrated:

- Confirm `.kr-details` still does not override Agent 1 tokens.
- This page no longer depends on `formStyles` button or chip classes.

## Known issues

- Local data had no approved or expired certificate, so those two visual states were not opened in the browser.
- The temporary preview config used for the browser was deleted and must not be committed.
- `addressHe` / `addressEn` are still unused on the public page, as before.

## Exact next task

Stop. Wait for the next assignment. Do not merge, push, or start another agent’s files.
