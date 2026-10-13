// NEW (Map tiles fix): render real Leaflet with synthetic restaurant data and no live tiles.
// חדש (תיקון אריחי מפה): בדיקת Leaflet עם נתוני מסעדה מלאכותיים וללא אריחים חיים.
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import { emptySearchFilters } from '../types/search';
import { searchRestaurantsInBounds } from '../api/searchApi';
import RestaurantMap from './RestaurantMap';

vi.mock('../api/searchApi', () => ({ searchRestaurantsInBounds: vi.fn() }));
// Clustering algorithms are unchanged; keep this DOM test focused on tiles and selection.
vi.mock('react-leaflet-cluster', () => ({ default: ({ children }: { children: ReactNode }) => children }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

async function renderMap(key: string, language = 'en') {
  vi.stubEnv('VITE_GEOAPIFY_MAPS_API_KEY', key);
  vi.useFakeTimers();
  // jsdom has no layout; provide a viewport so Leaflet can report nonempty bounds.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(500);
  vi.mocked(searchRestaurantsInBounds).mockResolvedValue({
    items: [{
      id: 'test-restaurant', name: 'Test restaurant', address: 'Test address', city: 'Jerusalem',
      nameHe: null, nameEn: null, addressHe: null, addressEn: null,
      latitude: 31.77, longitude: 35.21, phone: null, foodType: 'MEAT', categories: [],
      kashrut: { status: 'UNKNOWN', primary: null, moreCount: 0, hasRecentExpired: false },
      distanceKm: null,
    }],
    capped: false,
    total: 1,
    search: { mode: 'BASIC', atlasUnavailable: false },
  });
  await i18n.changeLanguage(language);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(<MemoryRouter><RestaurantMap filters={emptySearchFilters} hechsherOptions={[]} /></MemoryRouter>);
  });
  await act(async () => { await vi.advanceTimersByTimeAsync(450); });
  return container;
}

describe('RestaurantMap tile integration', () => {
  it('renders Geoapify tiles and attribution while retaining marker selection', async () => {
    const node = await renderMap('test-browser-key');
    const tile = node.querySelector<HTMLImageElement>('.leaflet-tile');
    expect(tile?.src).toContain('https://maps.geoapify.com/v1/tile/osm-carto/');
    expect(tile?.src).toContain('apiKey=test-browser-key');
    expect(node.querySelector('.leaflet-control-attribution')?.textContent).toContain('Geoapify');
    expect(node.querySelector('.leaflet-control-attribution')?.textContent).toContain('OpenStreetMap contributors');
    const marker = node.querySelector<HTMLElement>('.leaflet-marker-icon');
    expect(marker).not.toBeNull();
    await act(async () => { marker!.click(); });
    expect(node.querySelector('[role="dialog"]')?.textContent).toContain('Test restaurant');
  });

  it.each(['en', 'he'])('keeps markers and controls with a missing-key notice in %s', async (language) => {
    const node = await renderMap('', language);
    expect(node.querySelector('.leaflet-tile')).toBeNull();
    expect(node.querySelector('[role="alert"]')?.textContent).toBe(i18n.t('map.tilesUnavailable'));
    expect(node.querySelector('.leaflet-marker-icon')).not.toBeNull();
    expect(node.querySelector('.leaflet-control-zoom')).not.toBeNull();
  });
});
