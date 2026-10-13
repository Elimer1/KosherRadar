// Map chrome measurements and popup copy that do not need Leaflet.
// מידות וטקסט לחלון המפה, בלי Leaflet, כדי שאפשר לבדוק אותם לבד.

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const MAP_POPUP_PREFERRED_WIDTH = 300;
export const MAP_POPUP_MIN_WIDTH = 200;
export const MAP_POPUP_VIEWPORT_GUTTER = 48;

// Leaves room for the zoom control and the OpenStreetMap attribution.
// משאיר מקום לכפתורי ההתקרבות ולקרדיט של OpenStreetMap.
export const MAP_CONTROL_RESERVE_PX = 56;

export const markerIconMetrics = {
  className: 'kr-map-pin-wrap',
  iconSize: [36, 48] as [number, number],
  iconAnchor: [18, 46] as [number, number],
  popupAnchor: [0, -40] as [number, number],
};

export const popupMaxWidth = (viewportWidth: number) => {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return MAP_POPUP_PREFERRED_WIDTH;
  }

  const available = viewportWidth - MAP_POPUP_VIEWPORT_GUTTER;
  return Math.max(MAP_POPUP_MIN_WIDTH, Math.min(MAP_POPUP_PREFERRED_WIDTH, available));
};

// The popup does not pan the map. A pan that pushes the pin outside the searched area
// would drop the pin and close the popup. The popup scrolls instead of growing past the screen.
// החלון לא מזיז את המפה. הזזה שמוציאה את הסיכה מהאזור הנסרק מסירה אותה וסוגרת את החלון. החלון נגלל במקום לגדול מעבר למסך.
export const popupMaxHeight = (viewportHeight: number) => {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return 320;
  }

  return Math.max(220, Math.min(360, Math.round(viewportHeight * 0.5)));
};

export const popupLayout = (viewportWidth: number, viewportHeight = 800) => ({
  maxWidth: popupMaxWidth(viewportWidth),
  minWidth: 180,
  maxHeight: popupMaxHeight(viewportHeight),
  autoPan: false,
  keepInView: false,
  autoPanPaddingTopLeft: [MAP_CONTROL_RESERVE_PX, 56] as [number, number],
  autoPanPaddingBottomRight: [12, 40] as [number, number],
});

// The saved address already often includes the city. The city is added only when it is missing.
// הכתובת השמורה כבר כוללת לעיתים את העיר. העיר מתווספת רק כשהיא חסרה.
export const popupPlaceLine = (address: string, city: string | null | undefined) => {
  const place = address.trim();
  const locality = (city ?? '').trim();

  if (locality === '') {
    return place;
  }

  if (place === '') {
    return locality;
  }

  if (place.toLocaleLowerCase().includes(locality.toLocaleLowerCase())) {
    return place;
  }

  return `${place}, ${locality}`;
};

export const clusterMetrics = (count: number) => {
  const size = count >= 100 ? 60 : 52;

  return {
    className: 'kr-map-cluster-wrap',
    size,
    anchor: size / 2,
  };
};

const PIN_BODY =
  '<path fill="var(--color-forest)" stroke="#fff" stroke-width="2" d="M18 3.2C10.4 3.2 4.6 9 4.6 16.6 4.6 26.4 18 45 18 45s13.4-18.6 13.4-28.4C31.4 9 25.6 3.2 18 3.2z"/><circle cx="18" cy="16.2" r="5.2" fill="var(--color-canvas)"/><circle cx="18" cy="16.2" r="2.1" fill="var(--color-forest)"/>';

export const markerPinHtml = (selected = false) =>
  `<svg class="kr-map-pin" viewBox="0 0 36 48" width="36" height="48" aria-hidden="true" focusable="false">${
    selected ? '<circle cx="18" cy="16.2" r="11" fill="none" stroke="var(--color-canvas)" stroke-width="3"/>' : ''
  }${PIN_BODY}</svg>`;

// The count is a number from the cluster, never restaurant text.
// המספר מגיע מהמקבץ, לא מטקסט של מסעדה.
export const clusterBubbleHtml = (count: number) => {
  const safe = Number.isFinite(count) ? String(Math.max(0, Math.trunc(count))) : '0';
  return `<span class="kr-map-cluster">${safe}</span>`;
};
