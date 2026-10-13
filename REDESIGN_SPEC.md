# KosherRadar visual specification

Active visual reference for the shared design foundation and the public discovery experience. Functional requirements, business rules, security, API contracts, and data integrity stay in `PROJECT_SPEC.md` and the implemented services. Older design notes are historical and are not a brief to reproduce the previous forest-green dashboard.

Agents 2 and 3 do not need this file until integration. It records the tokens and contracts they should adopt then.

## Design principles

- The public product is a warm restaurant directory, not an admin console.
- One refined green does the work of actions and verified status. Neutrals carry structure. Amber is only for unverified claims and cautions. Red is only for expired certificates and errors.
- Space, type, and alignment create hierarchy. Surfaces are few. Controls are not decorated.
- A restaurant can be understood with no photograph. The interface does not invent photos, ratings, reviews, opening hours, prices, or extra trust labels.
- Existing search, location, filter, and navigation behavior stays. Visual changes do not add a second search state or an extra Apply step.
- English and Hebrew are equal. Layout uses the document direction. Restaurant names and addresses keep their own direction.

## Color

Token names are unchanged so existing Tailwind classes (`bg-forest`, `text-ink`, `border-soft`, and the rest) pick up the new palette. Do not reintroduce `#174B3A` as the brand green.

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#1c2420` | Primary text |
| `muted` | `#5c564e` | Secondary text on canvas or white |
| `canvas` | `#f4f0e8` | Page background |
| `soft` | `#e3dbd0` | Hairline borders and dividers |
| `mist` | `#efe8dc` | Quiet fills, hover, selected filter rows |
| `forest` | `#1a5c43` | Primary buttons, links, focus |
| `forest-deep` | `#0f3d2d` | Primary hover, verified text |
| `grove` | `#2a7a5a` | Secondary green text |
| `grove-soft` | `#e6f3ec` | Verified certificate surface |
| `amber-ink` | `#6a4518` | Unverified claims and warning text |

White text on `forest` is about 7.9:1. `muted` on `canvas` is about 6.3:1. `amber-ink` on white is about 8.4:1. Do not lighten `forest` or `muted` without rechecking WCAG 2.2 AA for normal text.

Status color is never the only signal. Every kashrut state also has its translated words and a symbol.

## Typography

System sans, including Hebrew: `system-ui`, Segoe UI, Roboto, Noto Sans Hebrew, Arial Hebrew, Arial.

- Page title: semibold, tight tracking, about 1.65rem, up to 1.875rem from the small breakpoint.
- Section labels: 0.875rem, medium.
- Restaurant names: semibold, 1.125rem, 1.25rem from the small breakpoint.
- Supporting lines: 0.875rem, relaxed leading, `muted`.
- Do not load a web font.

Names, addresses, and place suggestions use `dir="auto"` so a Hebrew name stays readable inside an English page and the reverse.

## Spacing and surfaces

- The page column is `max-w-6xl` with horizontal padding of 1rem, 1.5rem from the small breakpoint, and 2rem from the large breakpoint.
- Cards and the discovery composer use white on the warm canvas, a 1.5rem radius, and a soft ring. One surface per region. Do not nest a bordered box inside another bordered box.
- Touch targets are at least 44px (`min-h-11`), including icon buttons, filter choices, and dialog actions.
- The header sticks to the top. Desktop filters stick under it and scroll inside their own panel when they are taller than the viewport.

## Component treatment

**Header.** A deep-green bar (`forest-deep`) with cream wordmark and links. Brand and language stay visible. Below the medium breakpoint, Add a restaurant, Log in, Sign up, account, Log out, and Admin sit in a disclosure labeled with the existing main-navigation name. Sign up is a cream pill. Admin is still shown only when `user.role === 'ADMIN'`. There is no gold or staff treatment. Focus rings on this bar are cream, because the global forest ring disappears on `forest-deep`.

**Discovery home.** Only the home route is full-bleed. Other pages stay in the `max-w-6xl` column. The home opening is a short deep-green band: a large title and the existing introduction, in cream. A white search sheet overlaps the bottom of that band. Inside the sheet: restaurant/food search, then a named place field, then the current-location action on a pale green button. Those three call the existing criteria helpers. The page does not request geolocation on load.

**Filters.** Every current filter remains, with the same values and the same immediate `onChange` behavior: level, hechsher (including Other), food type, category, hide expired, include unknown, and radius. Radius stays disabled in meaning until a location exists; the existing explanation is shown instead of the select. Below 1024px the panel opens in a modal dialog with a title, Hide filters, Escape, a focus trap, and a dimmed scrim. There is no Apply button. At 1024px and wider the same panel is a sidebar.

**Results toolbar.** List and Map are one segmented control (`aria-pressed`, only one selected). The choice is still saved with `readSavedView` / `saveView`. The map component is unchanged and is mounted only in map view.

**Restaurant cards.** Show the real primary name, secondary names when they exist, address and city when they exist, food type and categories when they exist, distance when `distanceKm` is not null, the kashrut preview, View details, and Call or Waze only when those links can be built. No image slot.

**Kashrut preview.** Same props and the same four statuses.

| Status | Words | Surface |
| --- | --- | --- |
| `VERIFIED` | Verified certificate | Pale green, solid border |
| `UNVERIFIED` | Unverified claim (no certificate) | White, dashed amber border |
| `EXPIRED` | EXPIRED certificate | Red tint, solid border |
| `UNKNOWN` | Kashrut status unknown | Canvas, neutral border |

Evidence name, validity date, `+N more`, and the hidden-expired warning stay. An unverified claim must not use the verified green fill.

**Notices.** Loading uses the spinner and “Searching...”. Empty, no-match, error plus Try again, Atlas fallback, capped results, and the unknown-kashrut note stay, using the existing sentences.

## Responsive behavior

| Width | Header | Filters | Results |
| --- | --- | --- | --- |
| 375px | Brand, language, disclosure | Dialog | Stacked composer, full-width view switch, stacked card actions |
| 768px | Links in the bar | Dialog | Composer and toolbar start to sit on one row where they fit |
| 1280px | Links in the bar | Sticky sidebar | Composer plus a two-column results area |

No horizontal page scroll at these widths. The filter dialog and suggestion lists scroll inside themselves.

## RTL and LTR

- The document `dir` still comes from the saved language.
- New layout uses logical spacing and `text-start`. Flex rows reverse with the document.
- `.kr-back-mark` stays mirrored in Hebrew.
- `.leaflet-container` stays `direction: ltr`. Popup text still follows the page language. Do not remove those rules.

## Motion and accessibility

Target WCAG 2.2 AA.

- Semantic headings: one discovery `h1`, filter title as `h2`, each restaurant name as `h3`.
- Search suggestions stay a combobox with the existing keyboard behavior. Place suggestions use the same pattern: arrows, Enter to pick, Escape to close, and Enter with nothing highlighted still looks up the typed place.
- Visible focus remains a 2px `forest` outline. Inputs use a forest ring.
- The filter dialog is `aria-modal`, labeled, and returns focus to the control that opened it.
- `prefers-reduced-motion: reduce` disables the spinner and transitions on `.kr-card` and `.kr-view-toggle button`.

## Unsupported data

Do not display, illustrate, or reserve space for data the API does not send.

- No restaurant photos unless a real, safe image URL is already part of that screen’s existing data. Discovery cards do not receive one.
- No star ratings, review counts, price level, or opening hours.
- No extra public status such as “staff verified”, “official”, or a gold badge. Administrator-created restaurants and certificates are already authoritative through the existing moderation rules. They look the same as any other public record. Admins still do not earn contribution points. Ordinary submissions still wait for moderation.
- No guessed coordinates. A missed or ambiguous place lookup still leaves the search without a location.
- Device coordinates are not shown. The existing “current location” phrase is the label.

## Shared contracts to keep

These class names and exports are used outside discovery. Integration should keep them even when a screen is restyled.

CSS selectors that must survive: `.kr-spinner`, `.kr-card`, `.kr-view-toggle`, `.kr-marker-wrap`, `.kr-cluster-wrap`, `.kr-marker`, `.kr-cluster`, `.leaflet-container`, `.leaflet-popup-content-wrapper`, `.leaflet-popup-content`, `.leaflet-popup-tip`, `.leaflet-popup-close-button`, `.kr-choice`, `.kr-back-mark`, and `html[dir='rtl'] .leaflet-popup-content` / `.kr-back-mark`.

`formStyles.ts` export names stay: `inputClassName`, `labelClassName`, `primaryButtonClassName`, `primaryButtonCompactClassName`, `secondaryButtonClassName`, `quietActionClassName`, `textLinkClassName`, `panelClassName`, `sectionCardClassName`, `pageTitleClassName`, `dangerButtonClassName`, `filterChipClassName`, `metaChipClassName`, `quietChipClassName`, `choiceClassName`, `noticeClassName`, `warningNoticeClassName`, `errorNoticeClassName`.

`KashrutBadge` props stay `{ kashrut, hechsherOptions }`. `SearchBar`, `LocationField`, `SearchFiltersPanel`, and `RestaurantCard` keep their current required props. `SearchFiltersPanel` accepts an optional `showHeading` (default `true`).

## Intended downstream adaptations

At integration, other screens inherit this without a rewrite:

- Page background, text, borders, and primary buttons shift from the old forest palette to the tokens above.
- Shared inputs, panels, and buttons use a slightly rounder radius, a warmer shadow, and a taller input.
- The shell is wider (`max-w-6xl`) and the footer is a quiet warm band instead of a solid green bar. The footer sentence is unchanged.
- `KashrutBadge` uses the status surfaces above on the restaurant page and in map popups.
- Map pin and cluster colors in `index.css` use `forest` so they match the new green. Geometry, clustering, popup structure, and Leaflet’s left-to-right map are unchanged. Agent 2 can replace the pin drawing. Do not delete the selectors.
- `pageTitleClassName` is intentionally unchanged so the details page title does not jump.

No new translation keys were required. Discovery uses the existing `home`, `search`, `location`, `filters`, `card`, `kashrut`, `nav`, and `common` phrases.
