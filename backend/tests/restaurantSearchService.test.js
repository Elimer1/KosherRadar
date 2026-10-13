// NEW (Milestone 4): tests for the public search service with a mocked repository (no database).
// חדש (אבן דרך 4): בדיקות לשירות החיפוש הציבורי עם מאגר מדומה (בלי מסד נתונים).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/config/env.js', () => ({
  env: { atlasSearchEnabled: false, atlasSearchIndex: 'restaurant_search' },
}));

vi.mock('../src/repositories/restaurantSearchRepository.js', () => ({
  findSearchCandidatesRepo: vi.fn(),
  findAtlasNameHitsRepo: vi.fn(),
  findPublicTeudotForRestaurantsRepo: vi.fn(),
}));

import { env } from '../src/config/env.js';
import {
  findAtlasNameHitsRepo,
  findPublicTeudotForRestaurantsRepo,
  findSearchCandidatesRepo,
} from '../src/repositories/restaurantSearchRepository.js';
import {
  calculateRelevance,
  getRestaurantSuggestionsService,
  searchRestaurantsService,
} from '../src/services/restaurantSearchService.js';
import { dateOnlyToDate } from '../src/utils/israelDate.js';
import { buildRestaurantSearchFields, parseSearchText } from '../src/utils/searchFields.js';
import { normalizeText } from '../src/utils/normalizeText.js';
import { searchQuerySchema } from '../src/schemas/searchSchemas.js';

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
    ...overrides,
  };

  return {
    ...base,
    nameNormalized: normalizeText(base.name),
    ...buildRestaurantSearchFields(base),
  };
};

const makeTeuda = (restaurant, expiration, overrides = {}) => ({
  _id: `teuda-${nextId++}`,
  restaurant: restaurant._id,
  status: 'APPROVED',
  hechsher: 'LOCAL_RABBANUT',
  kashrutLevel: 'RABBANUT',
  expirationDate: dateOnlyToDate(expiration),
  ...overrides,
});

const query = (overrides = {}) => searchQuerySchema.parse(overrides);

const setData = (restaurants, teudot = []) => {
  findSearchCandidatesRepo.mockImplementation(async ({ afterId, limit }) =>
    [...restaurants].sort((a, b) => String(a._id).localeCompare(String(b._id)))
      .filter(row => !afterId || String(row._id) > String(afterId)).slice(0, limit));
  findPublicTeudotForRestaurantsRepo.mockResolvedValue(teudot);
};

const idsOf = (result) => result.items.map((item) => item.id);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T09:00:00.000Z`));
  vi.clearAllMocks();
  env.atlasSearchEnabled = false;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('searchRestaurantsService: what is asked from the database', () => {
  it('passes the parsed words, food groups, food types, categories and radius to the repository', async () => {
    setData([]);

    await searchRestaurantsService(
      query({ q: 'Pizza', foodType: 'MEAT,DAIRY', category: 'CAFE', lat: '31.78', lng: '35.21', radiusKm: '5' })
    );

    const request = findSearchCandidatesRepo.mock.calls[0][0];

    expect(request.words).toEqual(['pizza']);
    expect(request.groupsByWord[0]).toContain('pizza');
    expect(request.foodTypes).toEqual(['MEAT', 'DAIRY']);
    expect(request.categories).toEqual(['CAFE']);
    expect(request.center).toEqual({ lat: 31.78, lng: 35.21 });
    expect(request.radiusKm).toBe(5);
  });

  it('asks for one more than the cap so it can tell that the cap was reached', async () => {
    setData([]);

    await searchRestaurantsService(query());

    expect(findSearchCandidatesRepo.mock.calls[0][0].limit).toBe(2001);
  });

  it('loads certificates only for the restaurants it found, in one query, from six months ago', async () => {
    const first = makeRestaurant();
    const second = makeRestaurant();
    setData([first, second]);

    await searchRestaurantsService(query({ includeUnknown: 'true' }));

    expect(findPublicTeudotForRestaurantsRepo).toHaveBeenCalledTimes(1);
    const [ids, oldestDate] = findPublicTeudotForRestaurantsRepo.mock.calls[0];
    expect(ids).toEqual([first._id, second._id]);
    expect(oldestDate.toISOString()).toBe('2026-04-11T00:00:00.000Z');
  });
});

describe('searchRestaurantsService: kashrut rules', () => {
  it('hides UNKNOWN restaurants by default and shows them with Include Unknown', async () => {
    const unknown = makeRestaurant({ name: 'Unknown Cafe' });
    const verified = makeRestaurant({ name: 'Verified Cafe' });
    setData([unknown, verified], [makeTeuda(verified, '2027-01-01')]);

    const byDefault = await searchRestaurantsService(query());
    const withUnknown = await searchRestaurantsService(query({ includeUnknown: 'true' }));

    expect(idsOf(byDefault)).toEqual([verified._id]);
    expect(withUnknown.total).toBe(2);
  });

  it('shows the status derived by the shared rules: verified, expired, unverified', async () => {
    const verified = makeRestaurant({ name: 'A Verified' });
    const expired = makeRestaurant({ name: 'B Expired' });
    const claim = makeRestaurant({ name: 'C Claim', claimedKashrutLevel: 'MEHADRIN' });
    setData([verified, expired, claim], [makeTeuda(verified, '2027-01-01'), makeTeuda(expired, '2026-09-01')]);

    const result = await searchRestaurantsService(query());
    const statusOf = (restaurant) => result.items.find((item) => item.id === restaurant._id).kashrut.status;

    expect(statusOf(verified)).toBe('VERIFIED');
    expect(statusOf(expired)).toBe('EXPIRED');
    expect(statusOf(claim)).toBe('UNVERIFIED');
  });

  it('never uses a certificate that expired more than six months ago', async () => {
    const restaurant = makeRestaurant();
    setData([restaurant], [makeTeuda(restaurant, '2026-04-10', { kashrutLevel: 'MEHADRIN' })]);

    const result = await searchRestaurantsService(query({ level: 'MEHADRIN', includeUnknown: 'true' }));

    expect(result.total).toBe(0);
  });

  it('never uses a certificate that is not approved', async () => {
    const restaurant = makeRestaurant();
    setData([restaurant], [makeTeuda(restaurant, '2027-01-01', { status: 'PENDING' })]);

    const result = await searchRestaurantsService(query({ includeUnknown: 'true' }));

    expect(result.items[0].kashrut.status).toBe('UNKNOWN');
  });

  it('Hide Expired removes a restaurant that has only expired evidence but keeps one that is also valid', async () => {
    const onlyExpired = makeRestaurant({ name: 'Only Expired' });
    const both = makeRestaurant({ name: 'Both' });
    setData(
      [onlyExpired, both],
      [
        makeTeuda(onlyExpired, '2026-09-01'),
        makeTeuda(both, '2026-09-01', { kashrutLevel: 'MEHADRIN' }),
        makeTeuda(both, '2027-01-01'),
      ]
    );

    const result = await searchRestaurantsService(query({ hideExpired: 'true', includeUnknown: 'true' }));

    expect(idsOf(result)).toEqual([both._id]);
    expect(result.items[0].kashrut.hasRecentExpired).toBe(false);
  });

  it('level filter matches verified, recent expired and a labeled claim', async () => {
    const verified = makeRestaurant({ name: 'A' });
    const expired = makeRestaurant({ name: 'B' });
    const claim = makeRestaurant({ name: 'C', claimedKashrutLevel: 'MEHADRIN' });
    const other = makeRestaurant({ name: 'D' });
    setData(
      [verified, expired, claim, other],
      [
        makeTeuda(verified, '2027-01-01', { kashrutLevel: 'MEHADRIN' }),
        makeTeuda(expired, '2026-09-01', { kashrutLevel: 'MEHADRIN' }),
        makeTeuda(other, '2027-01-01', { kashrutLevel: 'RABBANUT' }),
      ]
    );

    const result = await searchRestaurantsService(query({ level: 'MEHADRIN' }));

    expect(idsOf(result)).toEqual([verified._id, expired._id, claim._id]);
  });

  it('shows "+N more" and warns when an expired certificate sits behind a better item', async () => {
    const restaurant = makeRestaurant();
    setData(
      [restaurant],
      [makeTeuda(restaurant, '2027-01-01', { kashrutLevel: 'MEHADRIN' }), makeTeuda(restaurant, '2026-09-01')]
    );

    const [card] = (await searchRestaurantsService(query())).items;

    expect(card.kashrut.primary.kashrutLevel).toBe('MEHADRIN');
    expect(card.kashrut.moreCount).toBe(1);
    expect(card.kashrut.hasRecentExpired).toBe(true);
  });
});

describe('searchRestaurantsService: sorting', () => {
  it('without text and without location, sorts A to Z', async () => {
    const charlie = makeRestaurant({ name: 'Charlie' });
    const alpha = makeRestaurant({ name: 'Alpha' });
    const bravo = makeRestaurant({ name: 'Bravo' });
    setData([charlie, alpha, bravo]);

    const result = await searchRestaurantsService(query({ includeUnknown: 'true' }));

    expect(idsOf(result)).toEqual([alpha._id, bravo._id, charlie._id]);
  });

  it('with text, puts an exact name before a name that starts with the text before a word match', async () => {
    const wordMatch = makeRestaurant({ name: 'The Big Pizza' });
    const startsWith = makeRestaurant({ name: 'Pizza Hut' });
    const exact = makeRestaurant({ name: 'Pizza' });
    setData([wordMatch, startsWith, exact]);

    const result = await searchRestaurantsService(query({ q: 'pizza', includeUnknown: 'true' }));

    expect(idsOf(result)).toEqual([exact._id, startsWith._id, wordMatch._id]);
  });

  it('with text, ranks a name match above a food-only match', async () => {
    const foodOnly = makeRestaurant({ name: 'Danny', foodKeywords: ['pizza'] });
    const nameMatch = makeRestaurant({ name: 'Zed Pizza Bar' });
    setData([foodOnly, nameMatch]);

    const result = await searchRestaurantsService(query({ q: 'pizza', includeUnknown: 'true' }));

    expect(idsOf(result)).toEqual([nameMatch._id, foodOnly._id]);
  });

  it('with a location, sorts nearest first and shows the distance; no coordinates go last', async () => {
    const far = makeRestaurant({ name: 'A Far', latitude: 32.0853, longitude: 34.7818 });
    const near = makeRestaurant({ name: 'B Near', latitude: 31.77, longitude: 35.22 });
    const noCoordinates = makeRestaurant({ name: 'C Nowhere' });
    setData([far, near, noCoordinates]);

    const result = await searchRestaurantsService(
      query({ lat: '31.7683', lng: '35.2137', includeUnknown: 'true' })
    );

    expect(idsOf(result)).toEqual([near._id, far._id, noCoordinates._id]);
    expect(result.items[0].distanceKm).toBeLessThan(2);
    expect(result.items[1].distanceKm).toBeGreaterThan(50);
    expect(result.items[2].distanceKm).toBeNull();
  });

  it('does not show a distance when there is no search location', async () => {
    setData([makeRestaurant({ latitude: 31.77, longitude: 35.22 })]);

    const result = await searchRestaurantsService(query({ includeUnknown: 'true' }));

    expect(result.items[0].distanceKm).toBeNull();
  });

  it('breaks ties by name and then id, so the order never changes between requests', async () => {
    const restaurants = [
      makeRestaurant({ name: 'Same' }),
      makeRestaurant({ name: 'Same' }),
      makeRestaurant({ name: 'Same' }),
    ];
    setData([restaurants[2], restaurants[0], restaurants[1]]);
    const firstOrder = idsOf(await searchRestaurantsService(query({ includeUnknown: 'true' })));

    setData([restaurants[1], restaurants[2], restaurants[0]]);
    const secondOrder = idsOf(await searchRestaurantsService(query({ includeUnknown: 'true' })));

    expect(firstOrder).toEqual(restaurants.map((restaurant) => restaurant._id));
    expect(secondOrder).toEqual(firstOrder);
  });
});

describe('searchRestaurantsService: pagination', () => {
  const fiftyRestaurants = () =>
    Array.from({ length: 50 }, (_, index) => makeRestaurant({ name: `Cafe ${String(index).padStart(2, '0')}` }));

  it('returns 20 per page, with the total and whether there is more', async () => {
    setData(fiftyRestaurants());

    const first = await searchRestaurantsService(query({ includeUnknown: 'true' }));

    expect(first.items).toHaveLength(20);
    expect(first.pageSize).toBe(20);
    expect(first.total).toBe(50);
    expect(first.hasMore).toBe(true);
  });

  it('pages do not repeat or skip any restaurant', async () => {
    setData(fiftyRestaurants());

    const pages = [];

    for (const page of ['1', '2', '3']) {
      pages.push(await searchRestaurantsService(query({ includeUnknown: 'true', page })));
    }

    const allIds = pages.flatMap((result) => idsOf(result));

    expect(pages.map((result) => result.items.length)).toEqual([20, 20, 10]);
    expect(new Set(allIds).size).toBe(50);
    expect(pages[2].hasMore).toBe(false);
  });

  it('an empty page past the end is an empty list, not an error', async () => {
    setData(fiftyRestaurants());

    const result = await searchRestaurantsService(query({ includeUnknown: 'true', page: '9' }));

    expect(result.items).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  it('evaluates all batches rather than truncating before filtering', async () => {
    const many = Array.from({ length: 2001 }, (_, index) =>
      makeRestaurant({ name: `R ${String(index).padStart(4, '0')}` })
    );
    setData(many);

    const result = await searchRestaurantsService(query({ includeUnknown: 'true' }));

    expect(result.capped).toBe(false);
    expect(result.total).toBe(2001);
    expect(findSearchCandidatesRepo).toHaveBeenCalledTimes(2);
    expect(findPublicTeudotForRestaurantsRepo.mock.calls[0][0]).toHaveLength(2000);
    expect(findPublicTeudotForRestaurantsRepo.mock.calls[1][0]).toHaveLength(1);
  });

  it('does not report capped for a normal search', async () => {
    setData([makeRestaurant()]);

    expect((await searchRestaurantsService(query({ includeUnknown: 'true' }))).capped).toBe(false);
  });
});

describe('searchRestaurantsService: no empty-answer surprises', () => {
  it('finds the only eligible restaurant beyond the previous 2000-candidate limit', async () => {
    const many = Array.from({ length: 2001 }, (_, index) => makeRestaurant({ _id: `r${String(index).padStart(5, '0')}`, name: `Place ${index}` }));
    const eligible = many.at(-1);
    setData(many, [makeTeuda(eligible, '2027-01-01')]);
    const result = await searchRestaurantsService(query());
    expect(idsOf(result)).toEqual([eligible._id]);
    expect(result.total).toBe(1);
    expect(result.capped).toBe(false);
  });

  it('ranks the nearest candidate in a later batch first with stable pagination', async () => {
    const many = Array.from({ length: 2001 }, (_, index) => makeRestaurant({ _id: `r${String(index).padStart(5, '0')}`, name: `Place ${index}`, latitude: 32.5, longitude: 35.2 }));
    const nearest = many.at(-1); nearest.latitude = 31.7;
    setData(many);
    const first = await searchRestaurantsService(query({ includeUnknown: 'true', lat: '31.7', lng: '35.2' }));
    const second = await searchRestaurantsService(query({ includeUnknown: 'true', lat: '31.7', lng: '35.2', page: '2' }));
    expect(first.items[0].id).toBe(nearest._id);
    expect(first.total).toBe(2001);
    expect(new Set([...idsOf(first), ...idsOf(second)]).size).toBe(40);
  });

  it('reports Atlas truncation even when no fuzzy candidate passes kashrut filters', async () => {
    env.atlasSearchEnabled = true;
    findAtlasNameHitsRepo.mockResolvedValue(Array.from({ length: 101 }, (_, i) => ({ id: `fuzzy-${i}`, score: 101 - i })));
    setData([]);
    const result = await searchRestaurantsService(query({ q: 'pizza' }));
    expect(result).toMatchObject({ items: [], capped: true, completeness: { complete: false, reasons: ['atlas_candidate_limit'] } });
  });
  it('answers an empty result for no matches', async () => {
    setData([]);

    const result = await searchRestaurantsService(query({ q: 'zzzz' }));

    expect(result).toMatchObject({ items: [], total: 0, hasMore: false, capped: false });
    expect(findPublicTeudotForRestaurantsRepo).toHaveBeenCalled();
  });
});

describe('searchRestaurantsService: public data only', () => {
  it('sends no admin or internal field', async () => {
    const restaurant = makeRestaurant({
      name: 'Secret Cafe',
      phone: '02-5551234',
      adminNote: 'private',
      submittedBy: 'user-1',
      rejectionReason: 'x',
      possibleDuplicates: [{ restaurant: 'other' }],
      cloudinaryPublicId: 'x',
    });
    setData([restaurant], [makeTeuda(restaurant, '2027-01-01', { adminNote: 'private', mashgiachPhone: '050' })]);

    const [card] = (await searchRestaurantsService(query())).items;
    const text = JSON.stringify(card);

    for (const secret of ['private', 'submittedBy', 'user-1', 'rejectionReason', 'possibleDuplicates', 'nameTokens', 'foodGroups', 'nameNormalized', 'mashgiach', 'teudaId']) {
      expect(text).not.toContain(secret);
    }

    expect(card.name).toBe('Secret Cafe');
    expect(card.phone).toBe('02-5551234');
  });
});

describe('Atlas Search and the fallback', () => {
  it('does not call Atlas when it is switched off, and reports the basic mode', async () => {
    setData([]);

    const result = await searchRestaurantsService(query({ q: 'pizza' }));

    expect(findAtlasNameHitsRepo).not.toHaveBeenCalled();
    expect(result.search).toEqual({ mode: 'BASIC', atlasUnavailable: false });
  });

  it('does not call Atlas when there is no text to search', async () => {
    env.atlasSearchEnabled = true;
    setData([]);

    await searchRestaurantsService(query());

    expect(findAtlasNameHitsRepo).not.toHaveBeenCalled();
  });

  it('adds the Atlas hits to the candidates and ranks a fuzzy hit above a food-only match', async () => {
    env.atlasSearchEnabled = true;
    const typoHit = makeRestaurant({ name: 'Pitza Bar' });
    const foodOnly = makeRestaurant({ name: 'Danny', foodKeywords: ['pizza'] });
    findAtlasNameHitsRepo.mockResolvedValue([{ id: typoHit._id, score: 4 }]);
    setData([foodOnly, typoHit]);

    const result = await searchRestaurantsService(query({ q: 'pizza', includeUnknown: 'true' }));

    expect(findAtlasNameHitsRepo).toHaveBeenCalledWith({ text: 'pizza', indexName: 'restaurant_search' });
    expect(findSearchCandidatesRepo.mock.calls[0][0].extraIds).toEqual([typoHit._id]);
    expect(idsOf(result)).toEqual([typoHit._id, foodOnly._id]);
    expect(result.search.mode).toBe('ATLAS');
  });

  it('falls back to the basic search when Atlas fails, and says so', async () => {
    env.atlasSearchEnabled = true;
    findAtlasNameHitsRepo.mockRejectedValue(new Error('Unrecognized pipeline stage name: $search'));
    const match = makeRestaurant({ name: 'Pizza Hut' });
    setData([match]);

    const result = await searchRestaurantsService(query({ q: 'pizza', includeUnknown: 'true' }));

    expect(idsOf(result)).toEqual([match._id]);
    expect(result.search).toEqual({ mode: 'BASIC', atlasUnavailable: true });
    expect(result.completeness).toEqual({ complete: false, reasons: ['atlas_unavailable'] });
    expect(findSearchCandidatesRepo.mock.calls[0][0].extraIds).toEqual([]);
  });
});

describe('getRestaurantSuggestionsService', () => {
  it('returns at most 8 short rows with name, place and the primary kashrut label', async () => {
    const restaurants = Array.from({ length: 12 }, (_, index) =>
      makeRestaurant({ name: `Pizza ${String(index).padStart(2, '0')}` })
    );
    setData(restaurants, restaurants.map((restaurant) => makeTeuda(restaurant, '2027-01-01', { kashrutLevel: 'MEHADRIN' })));

    const { suggestions } = await getRestaurantSuggestionsService(query({ q: 'pizza' }));

    expect(suggestions).toHaveLength(8);
    expect(Object.keys(suggestions[0]).sort()).toEqual(
      ['address', 'city', 'id', 'kashrut', 'name', 'nameEn', 'nameHe'].sort()
    );
    expect(suggestions[0].kashrut.primary.kashrutLevel).toBe('MEHADRIN');
  });

  it('applies the same Include Unknown rule as the search', async () => {
    const unknown = makeRestaurant({ name: 'Pizza Unknown' });
    setData([unknown]);

    const hidden = await getRestaurantSuggestionsService(query({ q: 'pizza' }));
    const shown = await getRestaurantSuggestionsService(query({ q: 'pizza', includeUnknown: 'true' }));

    expect(hidden.suggestions).toEqual([]);
    expect(shown.suggestions).toHaveLength(1);
  });
});

describe('calculateRelevance', () => {
  const restaurant = makeRestaurant({ name: 'Pizza Hut', foodKeywords: ['pasta'] });

  it('is 0 without text', () => {
    expect(calculateRelevance(restaurant, parseSearchText(''))).toBe(0);
  });

  it('gives a food-only match less than any name match', () => {
    const foodOnly = makeRestaurant({ name: 'Danny', foodKeywords: ['pasta'] });

    expect(calculateRelevance(foodOnly, parseSearchText('pasta'))).toBeLessThan(
      calculateRelevance(restaurant, parseSearchText('hut'))
    );
  });
});
