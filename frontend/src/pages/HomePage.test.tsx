import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';
import { geocodePlace } from '../api/placesApi';
import { useRestaurantSearch } from '../hooks/useRestaurantSearch';

vi.mock('../api/placesApi', () => ({ geocodePlace: vi.fn() }));
vi.mock('../hooks/useRestaurantSearch', () => ({ useRestaurantSearch: vi.fn() }));
vi.mock('../hooks/useFormOptions', () => ({ useFormOptions: () => ({ options: null }) }));
vi.mock('../components/RestaurantMap', () => ({ default: () => <div data-testid="map">Map</div> }));
vi.mock('../components/LocationField', () => ({ default: () => <div /> }));
vi.mock('../components/SearchBar', () => ({ default: () => <div /> }));
vi.mock('../components/discovery/DiscoveryPreview', () => ({ default: () => <div /> }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let container: HTMLDivElement;
const retry = vi.fn();
const mount = async (entry = '/?near=Jerusalem&radius=5', capped = false) => {
  vi.mocked(useRestaurantSearch).mockReturnValue({ items: [], page: 1, total: 0, hasMore: false, capped, atlasUnavailable: false, loading: false, loadingMore: false, error: '', retry, loadMore: vi.fn() });
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  await act(async () => root.render(<MemoryRouter initialEntries={[entry]}><HomePage /></MemoryRouter>));
};
afterEach(() => { act(() => root?.unmount()); container?.remove(); localStorage.clear(); sessionStorage.clear(); vi.clearAllMocks(); });

describe('unresolved geographic searches', () => {
  it.each(['/', '/?q=pizza'])('shows incomplete-result feedback for zero matches at %s', async (entry) => {
    await mount(entry, true);
    const warnings = [...container.querySelectorAll('[role="status"]')].filter(node => node.textContent?.includes('may be incomplete'));
    expect(warnings).toHaveLength(1);
  });
  it.each(['list', 'map'])('blocks the %s and offers retry/clear when URL restoration fails', async (view) => {
    localStorage.setItem('kosherradar-view', view);
    vi.mocked(geocodePlace).mockResolvedValue({ available: true, place: null, reason: 'ambiguous' });
    await mount();
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.textContent).toContain('Clear location');
    expect(container.querySelector('[data-testid="map"]')).toBeNull();
    expect(vi.mocked(useRestaurantSearch).mock.calls.at(-1)?.[1]).toBe(false);
    expect(container.textContent).not.toContain('No restaurants match');
    vi.mocked(geocodePlace).mockResolvedValue({ available: true, place: { label: 'Jerusalem', address: '', city: 'Jerusalem', latitude: 31.7, longitude: 35.2, placeId: 'city' } });
    await act(async () => [...container.querySelectorAll('button')].find(button => button.textContent === 'Try again')!.click());
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(vi.mocked(useRestaurantSearch).mock.calls.at(-1)?.[0].location).toEqual({ lat: 31.7, lng: 35.2 });
  });
});
