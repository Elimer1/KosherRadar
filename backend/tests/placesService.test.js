import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env } from '../src/config/env.js';
import { autocompleteAddressesService, geocodeAddressService } from '../src/services/placesService.js';

const jerusalem = {
  formatted: 'King George 1, Jerusalem, Israel',
  address_line1: 'King George 1',
  city: 'Jerusalem',
  lat: 31.78,
  lon: 35.22,
  place_id: 'place-1',
};

describe('placesService', () => {
  beforeEach(() => {
    env.geoapifyApiKey = 'test-key';
  });

  afterEach(() => {
    env.geoapifyApiKey = '';
    vi.unstubAllGlobals();
  });

  it('does not call Geoapify when the key is missing', async () => {
    env.geoapifyApiKey = '';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await autocompleteAddressesService('Jeru');

    expect(result).toEqual({ available: false, suggestions: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns Israel matches and drops a result outside the country box', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [jerusalem, { ...jerusalem, lat: 48.85, lon: 2.35, address_line1: 'Paris' }],
        }),
      })
    );

    const result = await autocompleteAddressesService('King');

    expect(result.available).toBe(true);
    expect(result.suggestions).toEqual([
      {
        label: 'King George 1, Jerusalem, Israel',
        address: 'King George 1',
        city: 'Jerusalem',
        latitude: 31.78,
        longitude: 35.22,
        placeId: 'place-1',
      },
    ]);
  });

  it('says search is unavailable when Geoapify fails, instead of throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }));

    const result = await autocompleteAddressesService('King');

    expect(result).toEqual({ available: false, suggestions: [] });
  });

  it('geocodes a typed address and returns null when nothing matches', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [jerusalem] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    const located = await geocodeAddressService({ address: 'King George 1', city: 'Jerusalem' });
    const missed = await geocodeAddressService({ address: 'Nowhere', city: 'Jerusalem' });

    expect(located).toEqual({ latitude: 31.78, longitude: 35.22, geoapifyPlaceId: 'place-1' });
    expect(missed).toBeNull();
  });
});
