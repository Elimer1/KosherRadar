import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env } from '../src/config/env.js';
import { autocompleteAddressesService, geocodeAddressService, geocodePlaceService } from '../src/services/placesService.js';
import { publicPlaceQuerySchema } from '../src/schemas/placesSchemas.js';

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

  // NEW (Milestone 5): the public search asks Geoapify for a language and never invents a miss.
  // חדש (אבן דרך 5): החיפוש הציבורי מבקש שפה מ-Geoapify, ולא ממציא תוצאה כשאין התאמה.
  it('asks Geoapify for Hebrew names and returns one place or null', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [jerusalem] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    const found = await geocodePlaceService('ירושלים', 'he');
    const missed = await geocodePlaceService('nowhere', 'he');

    expect(String(fetchMock.mock.calls[0][0])).toContain('lang=he');
    expect(String(fetchMock.mock.calls[0][0])).toContain('/geocode/search');
    expect(found).toEqual({
      available: true,
      place: {
        label: 'King George 1, Jerusalem, Israel',
        address: 'King George 1',
        city: 'Jerusalem',
        latitude: 31.78,
        longitude: 35.22,
        placeId: 'place-1',
      },
    });
    expect(missed).toEqual({ available: true, place: null });
  });

  it('does not geocode a search place when the key is missing', async () => {
    env.geoapifyApiKey = '';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await geocodePlaceService('Jerusalem', 'en')).toEqual({ available: false, place: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('publicPlaceQuerySchema', () => {
  it('defaults the language to English and rejects a short query', () => {
    expect(publicPlaceQuerySchema.parse({ text: '  Tel Aviv  ' })).toEqual({ text: 'Tel Aviv', lang: 'en' });
    expect(publicPlaceQuerySchema.parse({ text: 'חיפה', lang: 'he' }).lang).toBe('he');
    expect(() => publicPlaceQuerySchema.parse({ text: 'a' })).toThrow();
    expect(() => publicPlaceQuerySchema.parse({ text: 'Haifa', lang: 'fr' })).toThrow();
  });
});
