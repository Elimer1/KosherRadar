// NEW (Milestone 4): tests the database queries built by the search repository (Mongoose is mocked, so no
// database is used). They check WHAT is asked, not what MongoDB answers.
// חדש (אבן דרך 4): בדיקות לשאילתות שהמאגר בונה (Mongoose מדומה). בודקות מה נשאל, לא מה MongoDB עונה.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const queryChain = { select: vi.fn(), sort: vi.fn(), limit: vi.fn(), lean: vi.fn() };

vi.mock('../src/models/Restaurant.js', () => ({
  Restaurant: { find: vi.fn(), aggregate: vi.fn() },
}));

vi.mock('../src/models/Teuda.js', () => ({
  Teuda: { find: vi.fn() },
}));

import { Restaurant } from '../src/models/Restaurant.js';
import { Teuda } from '../src/models/Teuda.js';
import {
  findAtlasNameHitsRepo,
  findPublicTeudotForRestaurantsRepo,
  findSearchCandidatesRepo,
} from '../src/repositories/restaurantSearchRepository.js';

const NO_FILTERS = {
  words: [],
  groupsByWord: [],
  extraIds: [],
  foodTypes: [],
  categories: [],
  center: null,
  radiusKm: undefined,
  limit: 2001,
};

const filterSentToDatabase = () => Restaurant.find.mock.calls[0][0];

beforeEach(() => {
  vi.clearAllMocks();
  queryChain.select.mockReturnValue(queryChain);
  queryChain.sort.mockReturnValue(queryChain);
  queryChain.limit.mockReturnValue(queryChain);
  queryChain.lean.mockResolvedValue([]);
  Restaurant.find.mockReturnValue(queryChain);
});

describe('findSearchCandidatesRepo', () => {
  it('always asks only for APPROVED restaurants', async () => {
    await findSearchCandidatesRepo(NO_FILTERS);

    expect(filterSentToDatabase()).toEqual({ status: 'APPROVED' });
  });

  it('never selects admin-only or internal fields', async () => {
    await findSearchCandidatesRepo(NO_FILTERS);

    const selected = queryChain.select.mock.calls[0][0];

    for (const secret of ['adminNote', 'submittedBy', 'rejectionReason', 'possibleDuplicates', 'kosharotUrl']) {
      expect(selected).not.toContain(secret);
    }
  });

  it('sorts by name and id with the limit it was given, and uses plain objects', async () => {
    await findSearchCandidatesRepo(NO_FILTERS);

    expect(queryChain.sort).toHaveBeenCalledWith({ name: 1, _id: 1 });
    expect(queryChain.limit).toHaveBeenCalledWith(2001);
    expect(queryChain.lean).toHaveBeenCalled();
  });

  it('matches names with an anchored "starts with" pattern for every word', async () => {
    await findSearchCandidatesRepo({ ...NO_FILTERS, words: ['pizza', 'hut'], groupsByWord: [['pizza'], []] });

    const [nameCondition, foodCondition] = filterSentToDatabase().$or;

    expect(nameCondition.$and).toHaveLength(2);
    expect(nameCondition.$and[0].nameTokens.source).toBe('^pizza');
    expect(nameCondition.$and[1].nameTokens.source).toBe('^hut');
    // The food condition: a word with a group may match the group; a word without one needs a keyword.
    expect(foodCondition.$and[0].$or).toEqual([
      { foodTokens: expect.any(RegExp) },
      { foodGroups: { $in: ['pizza'] } },
    ]);
    expect(foodCondition.$and[1]).toEqual({ foodTokens: expect.any(RegExp) });
  });

  it('escapes regex characters, so text can never change the pattern', async () => {
    await findSearchCandidatesRepo({ ...NO_FILTERS, words: ['a.*b'], groupsByWord: [[]] });

    const pattern = filterSentToDatabase().$or[0].$and[0].nameTokens;

    expect(pattern.test('a.*b')).toBe(true);
    expect(pattern.test('axxb')).toBe(false);
  });

  it('adds the Atlas hit ids as one more way to match', async () => {
    await findSearchCandidatesRepo({ ...NO_FILTERS, words: ['pizza'], groupsByWord: [[]], extraIds: ['id-1', 'id-2'] });

    expect(filterSentToDatabase().$or).toContainEqual({ _id: { $in: ['id-1', 'id-2'] } });
  });

  it('does not use the Atlas ids when there is no text', async () => {
    await findSearchCandidatesRepo({ ...NO_FILTERS, extraIds: ['id-1'] });

    expect(filterSentToDatabase().$or).toBeUndefined();
  });

  it('filters by food type and category only when chosen', async () => {
    await findSearchCandidatesRepo({ ...NO_FILTERS, foodTypes: ['MEAT'], categories: ['CAFE', 'BAKERY'] });

    expect(filterSentToDatabase()).toEqual({
      status: 'APPROVED',
      foodType: { $in: ['MEAT'] },
      categories: { $in: ['CAFE', 'BAKERY'] },
    });
  });

  it('limits to the radius with GeoJSON order [longitude, latitude]', async () => {
    await findSearchCandidatesRepo({ ...NO_FILTERS, center: { lat: 31.78, lng: 35.21 }, radiusKm: 10 });

    const { $centerSphere } = filterSentToDatabase().location.$geoWithin;

    expect($centerSphere[0]).toEqual([35.21, 31.78]);
    expect($centerSphere[1]).toBeCloseTo(10 / 6371, 10);
  });

  it('does not limit by distance when there is a location but no radius', async () => {
    await findSearchCandidatesRepo({ ...NO_FILTERS, center: { lat: 31.78, lng: 35.21 } });

    expect(filterSentToDatabase().location).toBeUndefined();
  });

  // NEW (Milestone 5): the map rectangle, and the rectangle together with a radius.
  // חדש (אבן דרך 5): מלבן המפה, והמלבן יחד עם רדיוס.
  it('limits the map to the visible box, with longitude first', async () => {
    await findSearchCandidatesRepo({
      ...NO_FILTERS,
      bounds: { west: 34.7, south: 31.7, east: 35.3, north: 32.1 },
    });

    expect(filterSentToDatabase().location).toEqual({
      $geoWithin: { $box: [[34.7, 31.7], [35.3, 32.1]] },
    });
  });

  it('keeps both the visible box and the radius when a radius is set', async () => {
    await findSearchCandidatesRepo({
      ...NO_FILTERS,
      bounds: { west: 34.7, south: 31.7, east: 35.3, north: 32.1 },
      center: { lat: 31.78, lng: 35.21 },
      radiusKm: 5,
    });

    const clauses = filterSentToDatabase().$and;

    expect(clauses[0]).toEqual({ location: { $geoWithin: { $box: [[34.7, 31.7], [35.3, 32.1]] } } });
    expect(clauses[1].location.$geoWithin.$centerSphere[0]).toEqual([35.21, 31.78]);
    expect(filterSentToDatabase().location).toBeUndefined();
  });
});

describe('findAtlasNameHitsRepo', () => {
  it('searches the three name fields in the named index, approved only, with a hit limit', async () => {
    Restaurant.aggregate.mockResolvedValue([{ _id: 'id-1', score: 3.5 }]);

    const hits = await findAtlasNameHitsRepo({ text: 'pizza', indexName: 'restaurant_search' });

    const pipeline = Restaurant.aggregate.mock.calls[0][0];
    const search = pipeline[0].$search;

    expect(search.index).toBe('restaurant_search');
    expect(search.compound.filter).toEqual([{ equals: { path: 'status', value: 'APPROVED' } }]);
    expect(JSON.stringify(search)).toContain('"fuzzy"');
    expect(JSON.stringify(search)).toContain('"autocomplete"');
    expect(search.compound.must[0].compound.should[0].text.path).toEqual(['name', 'nameHe', 'nameEn']);
    expect(pipeline[1]).toEqual({ $limit: 100 });
    expect(hits).toEqual([{ id: 'id-1', score: 3.5 }]);
  });

  it('lets the error go up so the service can fall back', async () => {
    Restaurant.aggregate.mockRejectedValue(new Error('not on Atlas'));

    await expect(findAtlasNameHitsRepo({ text: 'pizza', indexName: 'x' })).rejects.toThrow('not on Atlas');
  });
});

describe('findPublicTeudotForRestaurantsRepo', () => {
  it('does not query at all for an empty list', async () => {
    expect(await findPublicTeudotForRestaurantsRepo([], new Date())).toEqual([]);
    expect(Teuda.find).not.toHaveBeenCalled();
  });

  it('asks only for APPROVED certificates that are not older than the given date', async () => {
    const lean = vi.fn().mockResolvedValue([]);
    Teuda.find.mockReturnValue({ select: vi.fn().mockReturnValue({ lean }) });
    const oldest = new Date('2026-04-11T00:00:00.000Z');

    await findPublicTeudotForRestaurantsRepo(['r1', 'r2'], oldest);

    expect(Teuda.find).toHaveBeenCalledWith({
      restaurant: { $in: ['r1', 'r2'] },
      status: 'APPROVED',
      expirationDate: { $gte: oldest },
    });
  });
});
