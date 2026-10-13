import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveAdminRestaurantLocation } from '../src/services/adminRestaurantLocationService.js';
import { geocodeAddressService } from '../src/services/placesService.js';
vi.mock('../src/services/placesService.js', () => ({ geocodeAddressService: vi.fn() }));
const existing = { address: 'Old street 1', city: 'Jerusalem', latitude: 31.7, longitude: 35.2, geoapifyPlaceId: 'old-id' };
beforeEach(() => vi.resetAllMocks());
describe('admin location consistency', () => {
  it('replaces coordinates and provider identity after typing an address', async () => {
    geocodeAddressService.mockResolvedValue({ status: 'matched', latitude: 32.1, longitude: 34.8, geoapifyPlaceId: 'new-id' });
    const result = await resolveAdminRestaurantLocation({ address: 'New street 2', city: 'Tel Aviv' }, existing);
    expect(result.data).toMatchObject({ latitude: 32.1, longitude: 34.8, geoapifyPlaceId: 'new-id' });
    expect(result.locationStatus).toBe('matched');
  });
  it.each(['ambiguous', 'not_found', 'unavailable'])('clears a carried-over pin and stale identity on %s', async (status) => {
    geocodeAddressService.mockResolvedValue({ status });
    const result = await resolveAdminRestaurantLocation({ ...existing, city: 'Haifa' }, existing);
    expect(result.data).toMatchObject({ latitude: undefined, longitude: undefined, geoapifyPlaceId: undefined });
    expect(result.locationStatus).toBe(status);
  });
  it('replaces the provider ID when a new suggestion is selected', async () => {
    const result = await resolveAdminRestaurantLocation({ ...existing, address: 'New street', latitude: 32, geoapifyPlaceId: 'new-id' }, existing);
    expect(result.data.geoapifyPlaceId).toBe('new-id');
    expect(geocodeAddressService).not.toHaveBeenCalled();
  });
  it('honors manually supplied coordinates while clearing carried-over provider identity', async () => {
    const result = await resolveAdminRestaurantLocation({ ...existing, latitude: 32 }, existing);
    expect(result.data).toMatchObject({ latitude: 32, longitude: 35.2, geoapifyPlaceId: undefined });
    expect(geocodeAddressService).not.toHaveBeenCalled();
  });
});
