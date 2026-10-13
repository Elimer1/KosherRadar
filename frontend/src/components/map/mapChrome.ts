// Map measurements and place copy that do not need Leaflet.
// Panel placement follows the map container width, not the browser width.
import type { HechsherOption } from '../../types/submissions';
import type { KashrutPreview } from '../../types/search';
import { describeEvidenceName, describeValidity, formatMoreCount } from '../../utils/kashrutText';

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Narrow maps use a bottom sheet. This is the last width that still does. */
export const MAP_SHEET_MAX_PX = 559;
/** Compact bottom dock starts here and runs through 799px. */
export const MAP_DOCK_MIN_PX = 560;
/** Side panel starts at this container width. */
export const MAP_SIDE_MIN_PX = 800;

export type MapPanelMode = 'sheet' | 'dock' | 'side';

// Choosing a restaurant must not pan or zoom. A move can push the pin out of the searched bounds.
export const selectionChangesMapView = false;

export const mapPanelMode = (containerWidth: number): MapPanelMode => {
  if (!Number.isFinite(containerWidth) || containerWidth < MAP_DOCK_MIN_PX) {
    return 'sheet';
  }

  if (containerWidth < MAP_SIDE_MIN_PX) {
    return 'dock';
  }

  return 'side';
};

// Zoom stays off the side panel. Bottom panels leave the top-left corner free.
export const zoomControlCorner = (mode: MapPanelMode, direction: 'ltr' | 'rtl'): 'topleft' | 'topright' => {
  if (mode === 'side' && direction !== 'rtl') {
    return 'topright';
  }

  return 'topleft';
};

export const markerIconMetrics = {
  className: 'kr-v2-map-marker-wrap',
  iconSize: [34, 34] as [number, number],
  iconAnchor: [17, 17] as [number, number],
};

// The saved address already often includes the city. The city is added only when it is missing.
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
  const size = count >= 100 ? 52 : count >= 10 ? 46 : 40;

  return {
    className: 'kr-v2-map-cluster-wrap',
    size,
    anchor: size / 2,
  };
};

const PLACE_ICON =
  '<svg class="kr-v2-map-marker-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.5 10.2 12 4.2l7.5 6V20a1 1 0 0 1-1 1h-4.2v-6.1H9.7V21H5.5a1 1 0 0 1-1-1v-9.8z"/></svg>';

// A circle with a place icon. The selected ring means selected, not a kashrut status.
export const markerGlyphHtml = (selected = false) =>
  `<span class="kr-v2-map-marker${selected ? ' kr-v2-map-marker-selected' : ''}">${PLACE_ICON}</span>`;

// The count is a number from the cluster, never restaurant text.
export const clusterBubbleHtml = (count: number) => {
  const safe = Number.isFinite(count) ? String(Math.max(0, Math.trunc(count))) : '0';
  return `<span class="kr-v2-map-cluster">${safe}</span>`;
};

// One evidence line. The status headline is rendered separately, so it is not repeated here.
export const evidenceSummaryLine = (kashrut: KashrutPreview, hechsherOptions: HechsherOption[]) => {
  if (!kashrut.primary) {
    return '';
  }

  const name = describeEvidenceName(kashrut.primary, hechsherOptions);
  const validity = describeValidity(kashrut.primary);
  const more = formatMoreCount(kashrut.moreCount);
  const parts = [name, validity].filter((part) => part !== '');
  const line = parts.join(' · ');

  return more ? `${line} (${more})` : line;
};
