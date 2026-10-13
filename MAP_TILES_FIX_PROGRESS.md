# Map tiles fix — 13 October 2026

- Branch/worktree: `fix/map-tiles`, `C:\FS\projects\KosherRadar-map-tiles`.
- Baseline: `dc5dc24`, clean working tree; accepted V2 merge is already an ancestor.
- Scope/issue: MAP-001, tile provider only. No other milestone, backend or database changes.

## Evidence and decision

The reported OSM tile image says access is blocked for tile-policy noncompliance. The source confirms `RestaurantMap` used `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` through `mapChrome.ts`. This is a remote basemap access problem, separate from the restaurant bounds API. No captured network headers or failed browser session were supplied; the precise enforcement trigger (Referer, client/network identity, traffic or another restriction) is unknown. No claim is made that changing subdomains or spoofing headers would resolve it. Repository HTML has no restrictive referrer policy; deployed headers and browser/network policy were not observable.

Reviewed the [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/) and [Geoapify raster/Leaflet documentation](https://apidocs.geoapify.com/docs/maps/map-tiles/). OSM documents best-effort availability, a canonical non-subdomain URL and potential access blocks. A compliant OSM setup is possible but cannot guarantee that the reported block will clear. CARTO was considered: its [current terms](https://carto.com/legal/basemap-terms/) also require a key. No alternative was assumed to provide unrestricted keyless hosting.

Geoapify fits the existing provider relationship without adding a dependency or tile proxy. Use its `osm-carto` 256px XYZ style to retain the existing OSM visual appearance and max zoom 18. This style requires Geoapify and OSM attribution, without OpenMapTiles attribution. Browser caching and existing Leaflet loading remain intact. No prefetch, retry storm or automatic fallback to the blocked servers.

Backend `placesService.js` uses private `GEOAPIFY_API_KEY` for geocoding/autocomplete. It remains unchanged. New `VITE_GEOAPIFY_MAPS_API_KEY` is a separate **public browser key**, restricted to permitted origins in the provider dashboard. No real `.env` file was read; key availability is unconfirmed. Neither a key nor real credentials were committed. No tile URL logging added.

## Implementation and verification

Provider options are isolated in `mapTiles.ts`; `RestaurantMap` changes only tile options and a missing-key notice. Existing markers, clustering, selection, bounds debounce, location following, radius, filters, navigation and responsive CSS are preserved. New Hebrew notice requires native-speaker review (M8-004). The old test asserting that the blocked OSM URL must remain is obsolete under this explicit request; replaced by provider contract tests, while marker/panel tests remain.

Verified implementation (MAP-001). `RestaurantMap.test.tsx` renders real Leaflet in jsdom with synthetic restaurant data, a mocked bounds API and clustering wrapper, and explicit simulated viewport dimensions. It checks Geoapify tile image URLs/attribution, marker selection, controls and English/Hebrew missing-key notices. Unit tests cover absent/blank keys, URL encoding, zoom limit and provider attribution. MapContainer explicitly retains max zoom 18 even without a tile layer. Existing map/popup/layout tests pass. No full browser rendering or live tile integration is claimed.

| Command (frontend directory) | Result |
| --- | --- |
| `npm ci --no-audit --no-fund` | Exit 0, 142 existing locked packages installed; manifests/lockfile unchanged |
| `npm test -- src/components/RestaurantMap.test.tsx` | Exit 0, 3 passed |
| `npm test` | Exit 0, 28 files / 166 passed, 0 failed |
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run build` | Exit 0; JS 767.42 kB / 224.56 kB gzip; existing >500 kB bundle warning |

Initial test/lint/typecheck attempts each exited 1 because no dependencies were installed in this fresh worktree. Intermediate added component tests/typecheck failed due to incorrect synthetic fixture fields and missing jsdom layout dimensions; corrected fixtures/dimensions, no weakened assertions or application validation. Full suite emits an existing jsdom navigation-not-implemented message but passes. Backend unchanged; backend checks not run. No application database, production data or live service accessed.

`git -c core.whitespace=cr-at-eol diff --check` and the staged equivalent exited 0. Git staging initially hit the sandbox boundary because this worktree's index lives in shared repository metadata; authorized escalation staged only the 13 fix files. No integration worktree files were modified.

## Handoff

Set `VITE_GEOAPIFY_MAPS_API_KEY` locally with an origin-restricted public Geoapify key, restart/rebuild, then manually check tile responses and the background in English/Hebrew and mobile/desktop. Never expose the private backend geocoding key. Preserve tracking history when incorporating this commit; do not repeat earlier audit fixes. No merge, push, deploy or other worktree changes performed.

To incorporate in the integration branch, the integration owner should cherry-pick the final commit from `fix/map-tiles` (obtain hash with `git rev-parse fix/map-tiles`). Reconcile any documentation conflicts by preserving both agents' records. Run frontend `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` in that checkout. Configure the public map key at build time, then verify live tile rendering and attribution. This fix does not itself authorize a merge, push or deploy.
