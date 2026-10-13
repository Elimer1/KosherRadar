// Checks panel breakpoints, circular marker markup, and the OpenStreetMap tile contract.
import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import type { KashrutPreview } from '../../types/search';
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  clusterBubbleHtml,
  clusterMetrics,
  evidenceSummaryLine,
  mapPanelMode,
  markerGlyphHtml,
  markerIconMetrics,
  popupPlaceLine,
  selectionChangesMapView,
  zoomControlCorner,
} from './mapChrome';

const verified: KashrutPreview = {
  status: 'VERIFIED',
  primary: {
    kind: 'VERIFIED',
    hechsher: 'LOCAL',
    hechsherOther: null,
    kashrutLevel: 'MEHADRIN',
    expirationDate: '2026-12-01',
  },
  moreCount: 1,
  hasRecentExpired: false,
};

describe('panel layout', () => {
  it('picks a sheet, dock, or side panel from the map container width', () => {
    expect(mapPanelMode(375)).toBe('sheet');
    expect(mapPanelMode(559)).toBe('sheet');
    expect(mapPanelMode(560)).toBe('dock');
    expect(mapPanelMode(600)).toBe('dock');
    expect(mapPanelMode(799)).toBe('dock');
    expect(mapPanelMode(800)).toBe('side');
    expect(mapPanelMode(900)).toBe('side');
    expect(mapPanelMode(1280)).toBe('side');
    expect(mapPanelMode(Number.NaN)).toBe('sheet');
  });

  it('keeps zoom off the side panel and does not move the map when a place is selected', () => {
    expect(selectionChangesMapView).toBe(false);
    expect(zoomControlCorner('sheet', 'ltr')).toBe('topleft');
    expect(zoomControlCorner('dock', 'rtl')).toBe('topleft');
    expect(zoomControlCorner('side', 'ltr')).toBe('topright');
    expect(zoomControlCorner('side', 'rtl')).toBe('topleft');
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
  it('uses a circular place marker anchored on its center', () => {
    expect(markerIconMetrics.className).toBe('kr-v2-map-marker-wrap');
    expect(markerIconMetrics.iconSize).toEqual([34, 34]);
    expect(markerIconMetrics.iconAnchor).toEqual([17, 17]);

    const idle = markerGlyphHtml();
    const selected = markerGlyphHtml(true);

    expect(idle).toContain('kr-v2-map-marker');
    expect(idle).not.toContain('kr-v2-map-marker-selected');
    expect(selected).toContain('kr-v2-map-marker-selected');
    expect(idle).not.toContain('kr-marker');
    expect(idle).not.toContain('M18 3.2');
    expect(selected).not.toContain('verified');
  });

  it('shows a circular cluster count and grows only the bubble', () => {
    expect(clusterBubbleHtml(7)).toBe('<span class="kr-v2-map-cluster">7</span>');
    expect(clusterBubbleHtml(120)).toContain('120');
    expect(clusterBubbleHtml(-4)).toContain('>0<');
    expect(clusterMetrics(7).size).toBe(40);
    expect(clusterMetrics(12).size).toBe(46);
    expect(clusterMetrics(120).size).toBe(52);
    expect(clusterMetrics(7).anchor).toBe(clusterMetrics(7).size / 2);
    expect(clusterMetrics(120).size).toBeGreaterThan(clusterMetrics(7).size);
    expect(clusterMetrics(7).className).toBe('kr-v2-map-cluster-wrap');
    expect(clusterMetrics(7).className).not.toBe('kr-cluster-wrap');
  });
});

describe('evidence summary', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('puts hechsher, level, and validity on one line and leaves the status headline out', () => {
    const line = evidenceSummaryLine(verified, [{ value: 'LOCAL', labelEn: 'Local Rabbinate', labelHe: 'רבנות מקומית' }]);

    expect(line).toContain('Local Rabbinate');
    expect(line).toContain('Mehadrin');
    expect(line).toContain('(+1 more)');
    expect(line).not.toContain('Verified certificate');
    expect(line.indexOf('Local Rabbinate')).toBe(line.lastIndexOf('Local Rabbinate'));
    expect(line.indexOf('Mehadrin')).toBe(line.lastIndexOf('Mehadrin'));
  });
});

describe('map tiles', () => {
  it('keeps the OpenStreetMap tile layer and its copyright link', () => {
    expect(OSM_ATTRIBUTION).toContain('https://www.openstreetmap.org/copyright');
    expect(OSM_TILE_URL).toBe('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });
});
