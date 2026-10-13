// Checks map chrome measurements, cluster counts, and that new selectors do not reuse the global pin names.
// בודק מידות, מספרי מקבץ, וששמות המחלקות החדשים לא חופפים לסיכות הגלובליות.
import { describe, expect, it } from 'vitest';
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  clusterBubbleHtml,
  clusterMetrics,
  markerIconMetrics,
  markerPinHtml,
  popupLayout,
  popupMaxHeight,
  popupMaxWidth,
  popupPlaceLine,
} from './mapChrome';

describe('popup layout', () => {
  it('keeps a popup inside a phone viewport and caps it on a wide screen', () => {
    expect(popupMaxWidth(320)).toBe(272);
    expect(popupMaxWidth(1440)).toBe(300);
    expect(popupMaxWidth(120)).toBe(200);
    expect(popupMaxWidth(Number.NaN)).toBe(300);
  });

  it('reserves space for the zoom control without following the popup out of view', () => {
    const layout = popupLayout(390, 520);

    expect(layout.autoPan).toBe(false);
    expect(layout.keepInView).toBe(false);
    expect(layout.autoPanPaddingTopLeft[0]).toBeGreaterThanOrEqual(44);
    expect(layout.maxHeight).toBe(popupMaxHeight(520));
    expect(layout.maxHeight).toBeLessThanOrEqual(360);
    expect(layout.maxWidth).toBeLessThanOrEqual(300);
  });
});

describe('popup place line', () => {
  it('adds a city only when the address does not already contain it', () => {
    expect(popupPlaceLine('12 Herzl', 'Tel Aviv')).toBe('12 Herzl, Tel Aviv');
    expect(popupPlaceLine('12 Herzl, Tel Aviv', 'Tel Aviv')).toBe('12 Herzl, Tel Aviv');
    expect(popupPlaceLine('12 Herzl, tel aviv', 'Tel Aviv')).toBe('12 Herzl, tel aviv');
    expect(popupPlaceLine('', 'Haifa')).toBe('Haifa');
    expect(popupPlaceLine('12 Herzl', null)).toBe('12 Herzl');
  });
});

describe('marker and cluster markup', () => {
  it('uses one pin design and keeps the tip on the coordinate', () => {
    expect(markerIconMetrics.className).toBe('kr-map-pin-wrap');
    expect(markerIconMetrics.iconAnchor).toEqual([18, 46]);
    expect(markerPinHtml()).toContain('kr-map-pin');
    expect(markerPinHtml(true)).toContain('kr-map-pin');
    expect(markerPinHtml()).not.toContain('kr-marker');
  });

  it('shows the cluster count and grows only the bubble, not the anchor point', () => {
    expect(clusterBubbleHtml(7)).toBe('<span class="kr-map-cluster">7</span>');
    expect(clusterBubbleHtml(120)).toContain('120');
    expect(clusterBubbleHtml(-4)).toContain('>0<');
    expect(clusterMetrics(7).anchor).toBe(clusterMetrics(7).size / 2);
    expect(clusterMetrics(120).size).toBeGreaterThan(clusterMetrics(7).size);
    expect(clusterMetrics(7).className).not.toBe('kr-cluster-wrap');
  });
});

describe('map tiles', () => {
  it('keeps the OpenStreetMap tile layer and its copyright link', () => {
    expect(OSM_ATTRIBUTION).toContain('https://www.openstreetmap.org/copyright');
    expect(OSM_TILE_URL).toBe('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });
});
