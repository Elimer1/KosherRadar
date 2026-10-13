import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LocationField from './LocationField';
import { geocodePlace } from '../api/placesApi';

vi.mock('../api/placesApi', () => ({ geocodePlace: vi.fn(), suggestPlaces: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../i18n', () => ({ activeLanguage: () => 'en' }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let container: HTMLDivElement;
const pick = vi.fn();
const clear = vi.fn();
const place = { label: 'New city', address: '', city: '', latitude: 32, longitude: 35, placeId: 'new' };
const deferred = () => {
  let resolve!: (value: Awaited<ReturnType<typeof geocodePlace>>) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Awaited<ReturnType<typeof geocodePlace>>>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const mount = () => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<LocationField filters={{ q: '', level: '', hechsher: [], foodType: [], category: [], hideExpired: false, includeUnknown: false, location: { lat: 32, lng: 35 }, radiusKm: null }} appliedLabel="Old city" onPickLocation={pick} onClearLocation={clear} />));
};
const enter = () => act(() => { container.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
afterEach(() => { act(() => root?.unmount()); container?.remove(); vi.clearAllMocks(); });

describe('location lookup ordering', () => {
  it.each(['success', 'failure'] as const)('ignores an obsolete %s after a newer lookup succeeds', async (outcome) => {
    const first = deferred(); const second = deferred();
    vi.mocked(geocodePlace).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    mount(); enter(); enter();
    await act(async () => second.resolve({ available: true, place }));
    await act(async () => outcome === 'success' ? first.resolve({ available: true, place: { ...place, label: 'Stale city' } }) : first.reject(new Error('offline')));
    expect(pick).toHaveBeenCalledTimes(1);
    expect(container.querySelector('input')!.value).toBe('New city');
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
  it('reports a current rejected request', async () => {
    vi.mocked(geocodePlace).mockRejectedValueOnce(new Error('offline'));
    mount(); await act(async () => enter());
    expect(container.querySelector('[role="status"]')?.textContent).toBe('location.unavailable');
    expect(pick).not.toHaveBeenCalled();
  });
  it('invalidates a lookup when the applied location is cleared', async () => {
    const request = deferred(); vi.mocked(geocodePlace).mockReturnValueOnce(request.promise);
    mount(); enter();
    act(() => [...container.querySelectorAll('button')].find(button => button.textContent === 'location.clear')!.click());
    await act(async () => request.resolve({ available: true, place }));
    expect(clear).toHaveBeenCalledOnce(); expect(pick).not.toHaveBeenCalled();
    expect(container.querySelector('input')!.value).toBe('');
  });
});
