// NEW (QA): extra checks for the account submission history. Repositories stay mocked.
// חדש (בדיקות): בדיקות נוספות להיסטוריית ההגשות בחשבון. המאגרים נשארים מדומים.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/userRepository.js', () => ({
  findUserAwardKeysRepo: vi.fn(),
}));

vi.mock('../src/repositories/userSubmissionsRepository.js', () => ({
  listMyRestaurantsRepo: vi.fn(),
  listMyTeudotRepo: vi.fn(),
  listMyReportsRepo: vi.fn(),
}));

import { findUserAwardKeysRepo } from '../src/repositories/userRepository.js';
import {
  listMyReportsRepo,
  listMyRestaurantsRepo,
  listMyTeudotRepo,
} from '../src/repositories/userSubmissionsRepository.js';
import { getMySubmissionsService } from '../src/services/userSubmissionsService.js';

const createdAt = new Date('2026-10-05T12:00:00.000Z');

describe('getMySubmissionsService history rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUserAwardKeysRepo.mockResolvedValue({ awardedPointKeys: [] });
    listMyRestaurantsRepo.mockResolvedValue([]);
    listMyTeudotRepo.mockResolvedValue([]);
    listMyReportsRepo.mockResolvedValue([]);
  });

  // NEW (Agent 3): correction outcome is independent of a stored award key.
  // חדש (סוכן 3): תוצאת התיקון אינה תלויה בנקודות.
  it.each(['admin-1', 'user-award-failed'])('returns applied correction with zero points for %s', async (userId) => {
    listMyReportsRepo.mockResolvedValue([{
      _id: 'report-fixed', description: 'Wrong phone', status: 'RESOLVED',
      correctionApplied: true, restaurant: { name: 'Cafe' }, createdAt,
      adminNote: 'private', submittedBy: userId,
    }]);
    const result = await getMySubmissionsService(userId);
    expect(listMyReportsRepo).toHaveBeenCalledWith(userId);
    expect(result.reports[0]).toMatchObject({ correctionApplied: true, points: 0 });
    expect(result.reports[0].adminNote).toBeUndefined();
    expect(result.reports[0].submittedBy).toBeUndefined();
  });

  it('does not infer an applied correction from an award or a missing legacy field', async () => {
    findUserAwardKeysRepo.mockResolvedValue({ awardedPointKeys: ['REPORT:report-old'] });
    listMyReportsRepo.mockResolvedValue([
      { _id: 'report-old', status: 'RESOLVED', createdAt },
      { _id: 'report-no-change', status: 'RESOLVED', correctionApplied: false, createdAt },
    ]);
    const result = await getMySubmissionsService('user-1');
    expect(result.reports.map((report) => report.correctionApplied)).toEqual([false, false]);
    expect(result.reports[0].points).toBe(1);
  });

  it('asks only for this user and returns empty lists when they have nothing', async () => {
    findUserAwardKeysRepo.mockResolvedValue(null);

    const result = await getMySubmissionsService('user-9');

    expect(listMyRestaurantsRepo).toHaveBeenCalledWith('user-9');
    expect(listMyTeudotRepo).toHaveBeenCalledWith('user-9');
    expect(listMyReportsRepo).toHaveBeenCalledWith('user-9');
    expect(result).toEqual({ restaurants: [], teudot: [], reports: [] });
  });

  it('shows a rejection reason and no points for a restaurant', async () => {
    listMyRestaurantsRepo.mockResolvedValue([
      {
        _id: 'rest-1',
        name: 'Cafe',
        status: 'REJECTED',
        rejectionReason: 'Duplicate of an existing place',
        adminNote: 'call the owner',
        submittedBy: 'user-1',
        createdAt,
      },
    ]);

    const result = await getMySubmissionsService('user-1');

    expect(result.restaurants).toEqual([
      {
        id: 'rest-1',
        name: 'Cafe',
        status: 'REJECTED',
        rejectionReason: 'Duplicate of an existing place',
        createdAt: createdAt.toISOString(),
      },
    ]);
    expect(JSON.stringify(result)).not.toContain('call the owner');
    expect(result.restaurants[0].submittedBy).toBeUndefined();
    expect(result.restaurants[0].points).toBeUndefined();
  });

  it('shows +3 only when the award key exists for a certificate sent with a new restaurant', async () => {
    findUserAwardKeysRepo.mockResolvedValue({ awardedPointKeys: ['TEUDA:teuda-awarded'] });
    listMyTeudotRepo.mockResolvedValue([
      {
        _id: 'teuda-awarded',
        status: 'APPROVED',
        submittedWithNewRestaurant: true,
        restaurant: { name: 'Pizza' },
        createdAt,
      },
      {
        _id: 'teuda-pending',
        status: 'PENDING',
        submittedWithNewRestaurant: true,
        restaurant: { name: 'Pizza' },
        createdAt,
      },
    ]);

    const result = await getMySubmissionsService('user-1');

    expect(result.teudot.map((teuda) => teuda.points)).toEqual([3, 0]);
  });

  it('shows +2 for an approved certificate added to an existing restaurant, and 0 without the key', async () => {
    findUserAwardKeysRepo.mockResolvedValue({ awardedPointKeys: ['TEUDA:teuda-2'] });
    listMyTeudotRepo.mockResolvedValue([
      {
        _id: 'teuda-2',
        status: 'APPROVED',
        submittedWithNewRestaurant: false,
        restaurant: { name: 'Cafe' },
        createdAt,
      },
      {
        _id: 'teuda-admin',
        status: 'APPROVED',
        submittedWithNewRestaurant: false,
        restaurant: { name: 'Cafe' },
        createdAt,
      },
    ]);

    const result = await getMySubmissionsService('user-1');

    expect(result.teudot.map((teuda) => teuda.points)).toEqual([2, 0]);
  });

  it('keeps a certificate whose restaurant record is missing, without inventing a name', async () => {
    listMyTeudotRepo.mockResolvedValue([
      {
        _id: 'teuda-orphan',
        status: 'PENDING',
        submittedWithNewRestaurant: false,
        restaurant: null,
        cloudinaryPublicId: 'secret-photo',
        adminNote: 'private',
        createdAt,
      },
    ]);

    const result = await getMySubmissionsService('user-1');

    expect(result.teudot[0]).toMatchObject({
      id: 'teuda-orphan',
      restaurantName: null,
      status: 'PENDING',
      points: 0,
      rejectionReason: null,
    });
    expect(JSON.stringify(result)).not.toContain('secret-photo');
    expect(JSON.stringify(result)).not.toContain('private');
  });

  it('shows +1 only for a report whose award key was stored', async () => {
    findUserAwardKeysRepo.mockResolvedValue({ awardedPointKeys: ['REPORT:report-applied'] });
    listMyReportsRepo.mockResolvedValue([
      {
        _id: 'report-applied',
        description: 'Wrong phone',
        status: 'RESOLVED',
        restaurant: { name: 'Cafe' },
        createdAt,
      },
      {
        _id: 'report-note',
        description: 'Closed on Shabbat',
        status: 'RESOLVED',
        restaurant: { name: 'Cafe' },
        createdAt,
      },
      {
        _id: 'report-rejected',
        description: 'Not a problem',
        status: 'REJECTED',
        rejectionReason: 'Could not confirm',
        adminNote: 'checked the site',
        restaurant: { name: 'Cafe' },
        createdAt,
      },
    ]);

    const result = await getMySubmissionsService('user-1');

    expect(result.reports.map((report) => report.points)).toEqual([1, 0, 0]);
    expect(result.reports[2].rejectionReason).toBe('Could not confirm');
    expect(JSON.stringify(result)).not.toContain('checked the site');
  });
});
