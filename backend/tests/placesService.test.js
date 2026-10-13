import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env } from '../src/config/env.js';
import {
  autocompleteAddressesService,
  geocodeAddressService,
  geocodePlaceService,
  selectUnambiguousPlace,
  suggestPlacesService,
  GEOAPIFY_TIMEOUT_MS,
} from '../src/services/placesService.js';
import { addressQuerySchema, publicPlaceQuerySchema } from '../src/schemas/placesSchemas.js';

const jerusalem = {
  formatted: 'King George 1, Jerusalem, Israel',
  address_line1: 'King George 1',
  city: 'Jerusalem',
  lat: 31.78,
  lon: 35.22,
  place_id: 'place-1',
  rank: { confidence: 1, match_type: 'full_match' },
};

describe('placesService', () => {
  it.each(['match_by_city', 'full_match'])('accepts a reliable city %s for public search but never as a restaurant pin', async (match_type) => {
    const city = { ...jerusalem, address_line1: 'Jerusalem', result_type: 'city', rank: { confidence: 1, match_type } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [city] }) }));
    expect((await geocodePlaceService('Jerusalem')).place?.city).toBe('Jerusalem');
    expect(await geocodeAddressService({ address: 'Jerusalem', city: 'Jerusalem' })).toEqual({ status: 'ambiguous' });
    expect((await autocompleteAddressesService('Jerusalem')).suggestions).toEqual([]);
    expect((await suggestPlacesService('Jerusalem')).suggestions).toHaveLength(1);
  });

  it('rejects near-tied competing public city matches', async () => {
    const city = { ...jerusalem, result_type: 'city', rank: { confidence: 1, match_type: 'match_by_city' } };
    const other = { ...city, place_id: 'city-2', city: 'Other city', rank: { confidence: 0.95, match_type: 'match_by_city' } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [city, other] }) }));
    expect(await geocodePlaceService('city')).toEqual({ available: true, place: null, reason: 'ambiguous' });
  });
  beforeEach(() => {
    env.geoapifyApiKey = 'test-key';
  });

  afterEach(() => {
    env.geoapifyApiKey = '';
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each(['headers', 'body'])('bounds stalled provider %s and aborts the request', async (stage) => {
    vi.useFakeTimers();
    const stalled = new Promise(() => {});
    const fetchMock = vi.fn().mockReturnValue(stage === 'headers' ? stalled : Promise.resolve({ ok: true, json: () => stalled }));
    vi.stubGlobal('fetch', fetchMock);
    const lookup = geocodePlaceService('Jerusalem');
    await vi.advanceTimersByTimeAsync(GEOAPIFY_TIMEOUT_MS);
    expect(await lookup).toEqual({ available: false, place: null, reason: 'unavailable' });
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears the provider deadline after a successful request', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [jerusalem] }) }));
    expect((await geocodePlaceService('Jerusalem')).available).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
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

    expect(located).toEqual({
      status: 'matched',
      latitude: 31.78,
      longitude: 35.22,
      geoapifyPlaceId: 'place-1',
    });
    expect(missed).toEqual({ status: 'not_found' });
  });

  it('does not pin the first result when the match is weak or tied', async () => {
    const weak = { ...jerusalem, rank: { confidence: 0.4, match_type: 'full_match' } };
    const street = { ...jerusalem, rank: { confidence: 1, match_type: 'match_by_street' } };
    const other = { ...jerusalem, place_id: 'place-2', lat: 31.79, rank: { confidence: 0.9, match_type: 'full_match' } };

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [weak] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [street] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [jerusalem, other] }) })
    );

    expect(await geocodeAddressService({ address: 'weak', city: 'Jerusalem' })).toEqual({ status: 'ambiguous' });
    expect(await geocodeAddressService({ address: 'street', city: 'Jerusalem' })).toEqual({ status: 'ambiguous' });
    expect(await geocodeAddressService({ address: 'tied', city: 'Jerusalem' })).toEqual({ status: 'ambiguous' });
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
      reason: 'matched',
      place: {
        label: 'King George 1, Jerusalem, Israel',
        address: 'King George 1',
        city: 'Jerusalem',
        latitude: 31.78,
        longitude: 35.22,
        placeId: 'place-1',
      },
    });
    expect(missed).toEqual({ available: true, place: null, reason: 'not_found' });
  });

  it('does not geocode a search place when the key is missing', async () => {
    env.geoapifyApiKey = '';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await geocodePlaceService('Jerusalem', 'en')).toEqual({
      available: false,
      place: null,
      reason: 'unavailable',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('selectUnambiguousPlace', () => {
  const place = (confidence, matchType, placeId = 'a') => ({
    confidence,
    matchType,
    placeId,
    label: placeId,
    address: placeId,
    city: 'Jerusalem',
    latitude: 31.7,
    longitude: 35.2,
  });

  it('accepts one precise hit and rejects a tie', () => {
    expect(selectUnambiguousPlace([place(1, 'full_match')])?.placeId).toBe('a');
    expect(selectUnambiguousPlace([place(1, 'full_match', 'a'), place(0.95, 'full_match', 'b')])).toBeNull();
    expect(selectUnambiguousPlace([place(1, 'match_by_city')])).toBeNull();
    expect(selectUnambiguousPlace([place(null, 'full_match')])).toBeNull();
  });

  it('accepts the exact confidence-gap boundary despite floating-point subtraction', () => {
    expect(selectUnambiguousPlace([place(1, 'full_match'), place(0.8, 'full_match', 'b')])?.placeId).toBe('a');
    expect(selectUnambiguousPlace([place(1, 'full_match'), place(0.8000000001, 'full_match', 'b')])).toBeNull();
  });
  it('compares lower-confidence and imprecise competitors before accepting a building', () => {
    expect(selectUnambiguousPlace([place(0.8, 'full_match'), place(0.79, 'full_match', 'b')])).toBeNull();
    expect(selectUnambiguousPlace([place(1, 'full_match'), place(0.99, 'match_by_city', 'b')])).toBeNull();
    expect(selectUnambiguousPlace([place(1, 'full_match'), place(0.7, 'match_by_city', 'b')])?.placeId).toBe('a');
    expect(selectUnambiguousPlace([place(0.9, 'full_match'), place(1, 'match_by_city', 'b')])).toBeNull();
  });
  it.each([NaN, Infinity, -0.1, 1.1, null])('refuses an invalid or unknown competing confidence %s', (confidence) => {
    expect(selectUnambiguousPlace([place(1, 'full_match'), place(confidence, 'full_match', 'b')])).toBeNull();
  });
});

describe('addressQuerySchema', () => {
  it('defaults the form autocomplete language to English', () => {
    expect(addressQuerySchema.parse({ text: 'Jerusalem' })).toEqual({ text: 'Jerusalem', lang: 'en' });
    expect(addressQuerySchema.parse({ text: 'ירושלים', lang: 'he' }).lang).toBe('he');
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
