// NEW (Milestone 4): tests for the public restaurant page with mocked repositories (no database).
// חדש (אבן דרך 4): בדיקות לדף המסעדה הציבורי עם מאגרים מדומים (בלי מסד נתונים).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/repositories/restaurantRepository.js', () => ({
  findRestaurantByIdRepo: vi.fn(),
}));

vi.mock('../src/repositories/teudaRepository.js', () => ({
  findApprovedTeudotByRestaurantRepo: vi.fn(),
}));

import { findRestaurantByIdRepo } from '../src/repositories/restaurantRepository.js';
import { findApprovedTeudotByRestaurantRepo } from '../src/repositories/teudaRepository.js';
import { getPublicRestaurantDetailsService } from '../src/services/restaurantDetailsService.js';
import { dateOnlyToDate } from '../src/utils/israelDate.js';

const TODAY = '2026-10-11';

const makeRestaurant = (overrides = {}) => ({
  _id: 'rest-1',
  name: 'Pizza Hut',
  nameHe: 'פיצה האט',
  address: '1 Main St, Jerusalem',
  city: 'Jerusalem',
  latitude: 31.78,
  longitude: 35.21,
  phone: '02-5551234',
  website: 'https://pizza.example.com',
  foodType: 'DAIRY',
  categories: ['RESTAURANT'],
  foodKeywords: ['pizza'],
  status: 'APPROVED',
  // Everything below must never reach the public.
  adminNote: 'private admin note',
  submittedBy: 'user-1',
  rejectionReason: 'old reason',
  possibleDuplicates: [{ restaurant: 'other' }],
  nameNormalized: 'pizza hut',
  nameTokens: ['pizza', 'hut'],
  foodGroups: ['pizza'],
  ...overrides,
});

let nextId = 1;

const makeTeuda = (expiration, overrides = {}) => ({
  _id: `teuda-${nextId++}`,
  restaurant: 'rest-1',
  status: 'APPROVED',
  hechsher: 'LOCAL_RABBANUT',
  kashrutLevel: 'RABBANUT',
  expirationDate: dateOnlyToDate(expiration),
  photoUrl: 'https://res.cloudinary.com/demo/photo.jpg',
  cloudinaryPublicId: 'secret-public-id',
  mashgiachName: 'Dan',
  mashgiachPhone: '050-1234567',
  adminNote: 'private teuda note',
  submittedBy: 'user-2',
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T09:00:00.000Z`));
  vi.clearAllMocks();
  findApprovedTeudotByRestaurantRepo.mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getPublicRestaurantDetailsService: who can be seen', () => {
  it('answers 404 for a restaurant that does not exist', async () => {
    findRestaurantByIdRepo.mockResolvedValue(null);

    await expect(getPublicRestaurantDetailsService('rest-1')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('answers the same 404 for a PENDING or REJECTED restaurant, so it is not revealed', async () => {
    for (const status of ['PENDING', 'REJECTED']) {
      findRestaurantByIdRepo.mockResolvedValue(makeRestaurant({ status }));

      await expect(getPublicRestaurantDetailsService('rest-1'), status).rejects.toMatchObject({
        statusCode: 404,
        message: 'Restaurant not found',
      });
    }

    expect(findApprovedTeudotByRestaurantRepo).not.toHaveBeenCalled();
  });

  it('shows an APPROVED restaurant', async () => {
    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant());

    const details = await getPublicRestaurantDetailsService('rest-1');

    expect(details).toMatchObject({
      id: 'rest-1',
      name: 'Pizza Hut',
      nameHe: 'פיצה האט',
      address: '1 Main St, Jerusalem',
      city: 'Jerusalem',
      latitude: 31.78,
      longitude: 35.21,
      phone: '02-5551234',
      website: 'https://pizza.example.com/',
      foodType: 'DAIRY',
      categories: ['RESTAURANT'],
    });
  });
});

describe('getPublicRestaurantDetailsService: public data only', () => {
  it('sends no admin, submitter, search or internal field', async () => {
    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant({ kosharotUrl: 'https://kosharot.example.com/r/1' }));
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([makeTeuda('2027-01-01')]);

    const text = JSON.stringify(await getPublicRestaurantDetailsService('rest-1'));

    for (const secret of [
      'private admin note',
      'private teuda note',
      'adminNote',
      'submittedBy',
      'user-1',
      'user-2',
      'rejectionReason',
      'old reason',
      'possibleDuplicates',
      'nameNormalized',
      'nameTokens',
      'foodGroups',
      'cloudinaryPublicId',
      'secret-public-id',
      '"APPROVED"',
    ]) {
      expect(text, secret).not.toContain(secret);
    }
  });

  it('sends the admin-verified Kosharot link only when it is safe', async () => {
    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant({ kosharotUrl: 'https://kosharot.example.com/r/1' }));
    expect((await getPublicRestaurantDetailsService('rest-1')).kosharotUrl).toBe('https://kosharot.example.com/r/1');

    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant());
    expect((await getPublicRestaurantDetailsService('rest-1')).kosharotUrl).toBeNull();
  });

  it('never sends an unsafe link, even if one was written straight into the database', async () => {
    findRestaurantByIdRepo.mockResolvedValue(
      makeRestaurant({ website: 'javascript:alert(1)', kosharotUrl: 'data:text/html,<script>1</script>' })
    );
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([makeTeuda('2027-01-01', { photoUrl: 'javascript:alert(2)' })]);

    const details = await getPublicRestaurantDetailsService('rest-1');

    expect(details.website).toBeNull();
    expect(details.kosharotUrl).toBeNull();
    expect(details.teudot[0].photoUrl).toBeNull();
  });
});

describe('getPublicRestaurantDetailsService: certificates', () => {
  it('shows a valid and a recently expired certificate, valid first, with mashgiach details and the photo', async () => {
    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant());
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([
      makeTeuda('2026-09-01'),
      makeTeuda('2027-01-01', { kashrutLevel: 'MEHADRIN', mashgiachName: 'Avi' }),
    ]);

    const details = await getPublicRestaurantDetailsService('rest-1');

    expect(details.teudot.map((teuda) => teuda.visibility)).toEqual(['VALID', 'RECENT_EXPIRED']);
    expect(details.teudot[0]).toMatchObject({
      kashrutLevel: 'MEHADRIN',
      expirationDate: '2027-01-01',
      mashgiachName: 'Avi',
      mashgiachPhone: '050-1234567',
      photoUrl: 'https://res.cloudinary.com/demo/photo.jpg',
    });
    expect(details.kashrut.status).toBe('VERIFIED');
    expect(details.kashrut.primary.kashrutLevel).toBe('MEHADRIN');
    expect(details.kashrut.items).toHaveLength(2);
    expect(details.kashrut.moreCount).toBe(1);
    expect(details.kashrut.hasRecentExpired).toBe(true);
  });

  it('hides a certificate that expired more than six months ago, even next to a newer one', async () => {
    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant());
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([
      makeTeuda('2026-04-10', { kashrutLevel: 'MEHADRIN', mashgiachName: 'Old Mashgiach' }),
      makeTeuda('2027-01-01'),
    ]);

    const details = await getPublicRestaurantDetailsService('rest-1');

    expect(details.teudot).toHaveLength(1);
    expect(details.kashrut.items).toHaveLength(1);
    expect(JSON.stringify(details)).not.toContain('Old Mashgiach');
    expect(JSON.stringify(details)).not.toContain('MEHADRIN');
  });

  it('keeps a certificate that expired exactly six months ago', async () => {
    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant());
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([makeTeuda('2026-04-11')]);

    const details = await getPublicRestaurantDetailsService('rest-1');

    expect(details.kashrut.status).toBe('EXPIRED');
    expect(details.teudot[0].visibility).toBe('RECENT_EXPIRED');
  });

  it('never shows a certificate that is not approved', async () => {
    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant());
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([
      makeTeuda('2027-01-01', { status: 'PENDING', mashgiachName: 'Pending Person' }),
      makeTeuda('2027-01-01', { status: 'REJECTED', mashgiachName: 'Rejected Person' }),
    ]);

    const details = await getPublicRestaurantDetailsService('rest-1');

    expect(details.teudot).toEqual([]);
    expect(details.kashrut.status).toBe('UNKNOWN');
  });

  it('is UNKNOWN with no certificate and no claim', async () => {
    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant());

    const details = await getPublicRestaurantDetailsService('rest-1');

    expect(details.kashrut).toMatchObject({ status: 'UNKNOWN', primary: null, moreCount: 0, items: [] });
    expect(details.teudot).toEqual([]);
  });
});

describe('getPublicRestaurantDetailsService: unverified claims', () => {
  it('shows the restaurant claim as UNVERIFIED, without a certificate id', async () => {
    findRestaurantByIdRepo.mockResolvedValue(
      makeRestaurant({ claimedHechsher: 'BADATZ_MACHPUD', claimedKashrutLevel: 'MEHADRIN' })
    );

    const details = await getPublicRestaurantDetailsService('rest-1');

    expect(details.kashrut.status).toBe('UNVERIFIED');
    expect(details.kashrut.items).toEqual([
      expect.objectContaining({ kind: 'UNVERIFIED', teudaId: null, hechsher: 'BADATZ_MACHPUD' }),
    ]);
    expect(details.teudot).toEqual([]);
  });

  it('hides a claim that a valid certificate already says, but keeps a claim about a higher level', async () => {
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([makeTeuda('2027-01-01')]);

    findRestaurantByIdRepo.mockResolvedValue(
      makeRestaurant({ claimedHechsher: 'LOCAL_RABBANUT', claimedKashrutLevel: 'RABBANUT' })
    );
    expect((await getPublicRestaurantDetailsService('rest-1')).kashrut.items).toHaveLength(1);

    findRestaurantByIdRepo.mockResolvedValue(makeRestaurant({ claimedKashrutLevel: 'MEHADRIN' }));
    const withHigherClaim = await getPublicRestaurantDetailsService('rest-1');

    // Spec priority: a verified RABBANUT certificate comes before an unverified MEHADRIN claim.
    expect(withHigherClaim.kashrut.items.map((item) => item.kind)).toEqual(['VERIFIED', 'UNVERIFIED']);
    expect(withHigherClaim.kashrut.status).toBe('VERIFIED');
  });
});
