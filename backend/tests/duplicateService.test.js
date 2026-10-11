import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/restaurantRepository.js', () => ({
  findDuplicateCandidatesRepo: vi.fn(),
  findNearbyRestaurantsRepo: vi.fn(),
}));

import {
  findDuplicateCandidatesRepo,
  findNearbyRestaurantsRepo,
} from '../src/repositories/restaurantRepository.js';
import { findPossibleDuplicatesService, namesAreSimilar } from '../src/services/duplicateService.js';
import { normalizePhone, normalizeText } from '../src/utils/normalizeText.js';

const existing = (id, overrides = {}) => ({
  _id: id,
  name: 'Existing',
  nameNormalized: 'existing',
  addressNormalized: 'other street 1',
  phoneNormalized: '',
  geoapifyPlaceId: undefined,
  ...overrides,
});

describe('normalizeText and normalizePhone', () => {
  it('ignores case, punctuation and extra spaces', () => {
    expect(normalizeText("  Pizza   Hut!! ")).toBe('pizza hut');
    expect(normalizeText("Joe's Cafe, Tel-Aviv")).toBe('joes cafe telaviv');
  });

  it('removes Hebrew vowel marks and quotes', () => {
    expect(normalizeText('פִּיצָה "הַבַּיִת"')).toBe('פיצה הבית');
  });

  it('turns different phone formats into the same digits', () => {
    expect(normalizePhone('+972-50-123-4567')).toBe('0501234567');
    expect(normalizePhone('050 123 4567')).toBe('0501234567');
    expect(normalizePhone('')).toBe('');
    expect(normalizePhone(undefined)).toBe('');
  });
});

describe('namesAreSimilar', () => {
  it('matches equal names and names that contain each other', () => {
    expect(namesAreSimilar('pizza hut', 'pizza hut')).toBe(true);
    expect(namesAreSimilar('pizza', 'pizza hut')).toBe(true);
  });

  it('does not match unrelated names or very short fragments', () => {
    expect(namesAreSimilar('pizza hut', 'sushi bar')).toBe(false);
    expect(namesAreSimilar('ab', 'abc cafe')).toBe(false);
    expect(namesAreSimilar('', 'abc')).toBe(false);
  });
});

describe('findPossibleDuplicatesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findDuplicateCandidatesRepo.mockResolvedValue([]);
    findNearbyRestaurantsRepo.mockResolvedValue([]);
  });

  const candidate = {
    name: 'Pizza Hut',
    address: '1 Main St, Jerusalem',
    phone: '050-123-4567',
    geoapifyPlaceId: 'place-1',
    latitude: 31.78,
    longitude: 35.22,
  };

  it('returns an empty list when nothing matches (a normal new restaurant)', async () => {
    expect(await findPossibleDuplicatesService(candidate)).toEqual([]);
  });

  it('flags the same Geoapify place and the same phone number', async () => {
    findDuplicateCandidatesRepo.mockResolvedValue([
      existing('a', { geoapifyPlaceId: 'place-1' }),
      existing('b', { phoneNormalized: '0501234567' }),
    ]);

    const result = await findPossibleDuplicatesService(candidate);

    expect(result).toEqual([
      { restaurant: 'a', reasons: ['SAME_PLACE_ID'] },
      { restaurant: 'b', reasons: ['SAME_PHONE'] },
    ]);
  });

  it('flags the same address with a similar name more strongly than the same address alone', async () => {
    findDuplicateCandidatesRepo.mockResolvedValue([
      existing('same-name', { nameNormalized: 'pizza hut', addressNormalized: '1 main st jerusalem' }),
      existing('other-name', { nameNormalized: 'sushi bar', addressNormalized: '1 main st jerusalem' }),
    ]);

    const result = await findPossibleDuplicatesService(candidate);

    expect(result).toEqual([
      { restaurant: 'same-name', reasons: ['SAME_NAME_AND_ADDRESS'] },
      { restaurant: 'other-name', reasons: ['SAME_ADDRESS'] },
    ]);
  });

  it('flags a similar name nearby but ignores different restaurants nearby', async () => {
    findNearbyRestaurantsRepo.mockResolvedValue([
      existing('close-same', { nameNormalized: 'pizza hut' }),
      existing('close-other', { nameNormalized: 'falafel king' }),
    ]);

    const result = await findPossibleDuplicatesService(candidate);

    expect(result).toEqual([{ restaurant: 'close-same', reasons: ['SIMILAR_NAME_NEARBY'] }]);
    expect(findNearbyRestaurantsRepo).toHaveBeenCalledWith({
      latitude: 31.78,
      longitude: 35.22,
      radiusMeters: 300,
    });
  });

  it('combines several reasons for the same restaurant into one entry', async () => {
    const match = existing('x', {
      geoapifyPlaceId: 'place-1',
      phoneNormalized: '0501234567',
      nameNormalized: 'pizza hut',
    });
    findDuplicateCandidatesRepo.mockResolvedValue([match]);
    findNearbyRestaurantsRepo.mockResolvedValue([match]);

    const result = await findPossibleDuplicatesService(candidate);

    expect(result).toHaveLength(1);
    expect(result[0].reasons).toEqual(['SAME_PLACE_ID', 'SAME_PHONE', 'SIMILAR_NAME_NEARBY']);
  });

  it('skips the nearby search when the restaurant has no coordinates', async () => {
    await findPossibleDuplicatesService({ name: 'Pizza Hut', address: '1 Main St' });

    expect(findNearbyRestaurantsRepo).not.toHaveBeenCalled();
  });

  it('never returns more than 10 possible duplicates', async () => {
    const many = Array.from({ length: 20 }, (_, index) =>
      existing(`id-${index}`, { phoneNormalized: '0501234567' })
    );
    findDuplicateCandidatesRepo.mockResolvedValue(many);

    expect(await findPossibleDuplicatesService(candidate)).toHaveLength(10);
  });
});
