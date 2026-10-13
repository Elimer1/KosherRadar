import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import '../i18n';
import AddressSearch from './AddressSearch';
import { searchAddresses } from '../api/placesApi';
vi.mock('../api/placesApi', () => ({ searchAddresses: vi.fn() }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root; let container: HTMLDivElement;
const onLocation = vi.fn();
function Probe() {
  const [address, setAddress] = useState('Old street'); const [city, setCity] = useState('Old city');
  return <AddressSearch address={address} city={city} latitude="31.7" disabled={false} cityRequired={false} onAddressChange={setAddress} onCityChange={setCity} onLocationChange={onLocation} />;
}
const mount = () => { vi.useFakeTimers(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); act(() => root.render(<Probe />)); };
const type = (id: string, value: string) => act(() => {
  const input = container.querySelector<HTMLInputElement>(id)!;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
afterEach(() => { act(() => root?.unmount()); container?.remove(); vi.useRealTimers(); vi.clearAllMocks(); });
it('clears old locality when a selected provider suggestion has no city', async () => {
  vi.mocked(searchAddresses).mockResolvedValue({ available: true, suggestions: [{ label: 'New street', address: 'New street', city: '', latitude: 32, longitude: 35, placeId: 'new' }] });
  mount(); type('#restaurant-address', 'New street');
  await act(async () => vi.advanceTimersByTimeAsync(300));
  act(() => [...container.querySelectorAll('button')].find(button => button.textContent === 'New street')!.click());
  expect(container.querySelector<HTMLInputElement>('#restaurant-city')!.value).toBe('');
  expect(onLocation).toHaveBeenLastCalledWith({ latitude: '32', longitude: '35', placeId: 'new' });
});
it('invalidates address suggestions and coordinates when city is edited during a lookup', async () => {
  let resolve!: (value: Awaited<ReturnType<typeof searchAddresses>>) => void;
  vi.mocked(searchAddresses).mockReturnValue(new Promise(yes => { resolve = yes; }));
  mount(); type('#restaurant-address', 'New street');
  await act(async () => vi.advanceTimersByTimeAsync(300));
  type('#restaurant-city', 'New city');
  await act(async () => resolve({ available: true, suggestions: [{ label: 'Stale city', address: 'Old street', city: 'Old city', latitude: 32, longitude: 35, placeId: 'stale' }] }));
  expect(container.textContent).not.toContain('Stale city');
  expect(onLocation).toHaveBeenLastCalledWith({ latitude: '', longitude: '', placeId: '' });
});
