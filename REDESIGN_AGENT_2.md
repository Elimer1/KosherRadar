# Agent 2 — map experience

## Current position

- Branch: `redesign/agent-2-map`
- Worktree: `C:\FS\projects\KosherRadar-redesign-agent-2`
- Baseline: `539303733b887f499dbbeaf49db3e3dff55b2eeb` (`chore(frontend): remove unused restaurant display helper`)
- Status: map discovery redesign is implemented and verified in this worktree. Not merged. Not pushed.
- Next task: none. Wait for integration. Do not start another screen.

## What changed

The public map still searches the visible bounds with the same filters, debounce, cancellation, clustering, and navigation. The presentation is no longer a small Leaflet bubble on the default pin.

A visitor who taps a marker gets a card docked on the map: large name, place, food type when it exists, the existing kashrut summary, then View details, Call, Waze, and Share. The card does not move the map, so the pin is not pushed out of the search and removed. Zoom controls are separate 48px buttons. Pins are tall teardrops. Clusters are rounded squares with the count. Loading is a bar across the top of the map.

## VISUAL CHANGES

What an ordinary visitor sees that they did not see before:

- Pins are tall forest teardrops with a cream center, about 36×48px. The old pin was an 18px rotated square.
- The open pin has an extra cream ring. That ring means "selected", not a kashrut status.
- A cluster is a rounded square with a pale halo and a large count, not a small circle.
- Zoom in and zoom out are separate rounded buttons, 48px tall, instead of one joined Leaflet bar.
- Choosing a restaurant opens a warm card on the map with a large name, the address, and a full-width details button. Call and Waze sit side by side. Share is its own row. This replaces the small speech bubble.
- On a narrow screen the card fills the map below the zoom buttons and scrolls if the map is short. From 768px up it is a 22rem card aligned to the end of the map.
- While results load, a bar across the top of the map says the existing "Loading map..." line.
- Warnings and errors sit on a warm panel with a colored leading edge. The server message stays visible, with Try again on errors.
- In Hebrew the card is right to left. The map tiles stay left to right. OpenStreetMap attribution stays visible.

## Files

- `frontend/src/components/RestaurantMap.tsx`
- `frontend/src/components/map/map.css`
- `frontend/src/components/map/mapChrome.ts`
- `frontend/src/components/map/mapIcons.ts`
- `frontend/src/components/map/MapPopupCard.tsx`
- `frontend/src/components/map/MapNotices.tsx`
- `frontend/src/components/map/mapChrome.test.ts`
- `frontend/src/components/map/MapPopupCard.test.tsx`
- `REDESIGN_AGENT_2.md`

No shared files were edited. No new translation keys.

## Verification

From `frontend/` in this worktree, 13 October 2026:

- `npm run lint` — exit 0
- `npm run typecheck` — exit 0
- `npm test` — exit 0, 24 files, 137 tests passed
- `npm run build` — exit 0

Browser, `http://localhost:5193`, against the local API through a temporary CORS proxy (the running API only allows `http://localhost:5173`):

- Mobile-width map: cluster "2", then separate pins named Claimed Grill and Pizza Place.
- English card: name, "4 Agrippas St, Jerusalem", Meat, "Unverified claim (no certificate)", Local Rabbinate, Rabbanut, View details, Call, Waze, Share. The card stayed open. Zoom controls did not cover it. Attribution did not cover it.
- Hebrew: page and card `rtl`, map container `ltr`. Card showed `טענה לא מאומתת (אין תעודה)`, `לפרטים`, `התקשרות`, `שיתוף`. Close control did not cover the name.
- At a 1100px viewport the card width was 352px (22rem). The home column is still narrow; that layout belongs to HomePage.
- OpenStreetMap tiles and attribution rendered. A blocked origin showed "Cannot reach the server..." and Try again, not an empty-state disguise.
- Dragging the map still does not change the selected search location. That logic was not edited.

A before screenshot of the baseline map was not captured. The after screenshots are the docked card in English and Hebrew.

## Known limitations

- On a short map the card scrolls to reach Call, Waze, and Share. A typical phone map is taller than the preview panel used here.
- The card can cover the pin. It does not pan the map to reveal the pin, because that pan was dropping the restaurant from the search.
- Close uses the existing `layout.dismiss` string ("Dismiss" / "סגירה"). No new copy was added.
- Live Geoapify, Cloudinary, Resend, and Atlas were not called.

## INTEGRATION NOTES

- Colors in `frontend/src/components/map/map.css` are written out (`#174b3a`, `#103528`, `#fffdf8`, `#24342f`, `#4e5e58`, `#6b4a1f`). They should later use Agent 1's tokens. Do not copy Agent 1's stylesheet into this file.
- New selectors use the `kr-map-` prefix. They do not define `.kr-marker` or `.kr-cluster`. Global rules for those classes in `index.css` no longer paint these pins, because the markers no longer use those class names.
- Leaflet rules are overridden only under `.kr-map-shell` (zoom control, attribution, map direction). `.kr-map-shell .leaflet-container` stays `direction: ltr`. Hebrew card text is outside that container, so it follows the page direction.
- No HomePage change is required for the map to work. A wider map, or moving the search header, would be a HomePage change and was not made.
- No translation additions. `REDESIGN_AGENT_2_LOCALE_PATCH.md` was not created.

## Uncommitted work

None after the verification commit on this branch.
