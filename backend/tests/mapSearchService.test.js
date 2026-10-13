// NEW (Milestone 5): the map search reuses the list's filters and kashrut rules, and adds the visible box.
// חדש (אבן דרך 5): חיפוש המפה משתמש באותם מסננים וחוקי כשרות כמו הרשימה, ומוסיף את המלבן הנראה.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/config/env.js', () => ({
  env: { atlasSearchEnabled: false, atlasSearchIndex: 'restaurant_search' },
}));

vi.mock('../src/repositories/restaurantSearchRepository.js', () => ({
  findSearchCandidatesRepo: vi.fn(),
  findAtlasNameHitsRepo: vi.fn(),
  findPublicTeudotForRestaurantsRepo: vi.fn(),
}));

import { MAP_MARKER_LIMIT } from '../src/config/constants.js';
import {
  findPublicTeudotForRestaurantsRepo,
  findSearchCandidatesRepo,
} from '../src/repositories/restaurantSearchRepository.js';
import { findMapRestaurantsService } from '../src/services/restaurantSearchService.js';
import { mapQuerySchema } from '../src/schemas/searchSchemas.js';
import { dateOnlyToDate } from '../src/utils/israelDate.js';
import { buildRestaurantSearchFields } from '../src/utils/searchFields.js';
import { normalizeText } from '../src/utils/normalizeText.js';

const TODAY = '2026-10-11';

let nextId = 1;

const makeRestaurant = (overrides = {}) => {
  const base = {
    _id: `rest-${String(nextId++).padStart(3, '0')}`,
    name: 'Place',
    address: '1 Main St',
    city: 'Jerusalem',
    foodType: 'DAIRY',
    categories: ['RESTAURANT'],
    foodKeywords: [],
    latitude: 31.78,
    longitude: 35.21,
    ...overrides,
  };

  return {
    ...base,
    nameNormalized: normalizeText(base.name),
    ...buildRestaurantSearchFields(base),
  };
};

const makeTeuda = (restaurant, expiration) => ({
  _id: `teuda-${nextId++}`,
  restaurant: restaurant._id,
  status: 'APPROVED',
  hechsher: 'LOCAL_RABBANUT',
  kashrutLevel: 'RABBANUT',
  expirationDate: dateOnlyToDate(expiration),
});

const box = {
  north: '32.2',
  south: '31.5',
  east: '35.5',
  west: '34.7',
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T09:00:00.000Z`));
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('mapQuerySchema', () => {
  it('requires a real rectangle and converts the numbers', () => {
    const parsed = mapQuerySchema.parse(box);

    expect(parsed.north).toBe(32.2);
    expect(parsed.south).toBe(31.5);
    expect(parsed.east).toBe(35.5);
    expect(parsed.west).toBe(34.7);
  });

  it('rejects an upside-down box, a date-line box, and a radius without a location', () => {
    expect(() => mapQuerySchema.parse({ ...box, north: '31', south: '32' })).toThrow();
    expect(() => mapQuerySchema.parse({ ...box, east: '34', west: '35' })).toThrow();
    expect(() => mapQuerySchema.parse({ ...box, radiusKm: '5' })).toThrow();
  });
});

describe('findMapRestaurantsService', () => {
  it('asks for the visible box and hides restaurants with unknown kashrut', async () => {
    const known = makeRestaurant({ name: 'Known Place' });
    const unknown = makeRestaurant({ name: 'No Evidence' });

    findSearchCandidatesRepo.mockResolvedValue([unknown, known]);
    findPublicTeudotForRestaurantsRepo.mockResolvedValue([makeTeuda(known, '2027-01-01')]);

    const result = await findMapRestaurantsService(mapQuerySchema.parse(box));

    expect(findSearchCandidatesRepo.mock.calls[0][0].bounds).toEqual({
      north: 32.2,
      south: 31.5,
      east: 35.5,
      west: 34.7,
    });
    expect(findSearchCandidatesRepo.mock.calls[0][0].limit).toBe(2001);
    expect(result.items.map((item) => item.name)).toEqual(['Known Place']);
    expect(result.capped).toBe(false);
    expect(result.items[0].latitude).toBe(31.78);
    expect(result.items[0].longitude).toBe(35.21);
  });

  it('reports capped when the box holds more restaurants than the map will draw', async () => {
    const restaurants = Array.from({ length: MAP_MARKER_LIMIT + 1 }, (_, index) =>
      makeRestaurant({ name: `Place ${index}` })
    );

    findSearchCandidatesRepo.mockResolvedValue(restaurants);
    findPublicTeudotForRestaurantsRepo.mockResolvedValue([]);

    const result = await findMapRestaurantsService(mapQuerySchema.parse({ ...box, includeUnknown: 'true' }));

    expect(result.capped).toBe(true);
    expect(result.items).toHaveLength(MAP_MARKER_LIMIT);
  });

  it('filters before applying the marker limit and includes a late eligible restaurant', async () => {
    const restaurants = Array.from({ length: MAP_MARKER_LIMIT + 1 }, (_, i) => makeRestaurant({ name: `Place ${i}` }));
    const eligible = restaurants.at(-1);
    findSearchCandidatesRepo.mockResolvedValue(restaurants);
    findPublicTeudotForRestaurantsRepo.mockResolvedValue([makeTeuda(eligible, '2027-01-01')]);
    const result = await findMapRestaurantsService(mapQuerySchema.parse(box));
    expect(result.items.map(row => row.id)).toEqual([eligible._id]);
    expect(result.capped).toBe(false);
    expect(result.total).toBe(1);
  });

  it('still applies the chosen radius together with the box', async () => {
    findSearchCandidatesRepo.mockResolvedValue([]);
    findPublicTeudotForRestaurantsRepo.mockResolvedValue([]);

    await findMapRestaurantsService(
      mapQuerySchema.parse({ ...box, lat: '31.78', lng: '35.21', radiusKm: '10' })
    );

    const request = findSearchCandidatesRepo.mock.calls[0][0];

    expect(request.bounds.north).toBe(32.2);
    expect(request.center).toEqual({ lat: 31.78, lng: 35.21 });
    expect(request.radiusKm).toBe(10);
  });
});
