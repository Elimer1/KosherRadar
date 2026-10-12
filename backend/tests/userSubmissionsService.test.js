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

describe('getMySubmissionsService', () => {
  beforeEach(() => {
    findUserAwardKeysRepo.mockResolvedValue({ awardedPointKeys: ['TEUDA:teuda-1', 'REPORT:report-1'] });
    listMyRestaurantsRepo.mockResolvedValue([
      {
        _id: 'rest-1',
        name: 'Pizza Hut',
        status: 'PENDING',
        createdAt: new Date('2026-10-01T00:00:00.000Z'),
      },
    ]);
    listMyTeudotRepo.mockResolvedValue([
      {
        _id: 'teuda-1',
        status: 'APPROVED',
        submittedWithNewRestaurant: true,
        restaurant: { name: 'Pizza Hut' },
        createdAt: new Date('2026-10-02T00:00:00.000Z'),
      },
      {
        _id: 'teuda-2',
        status: 'REJECTED',
        rejectionReason: 'Photo is unreadable',
        submittedWithNewRestaurant: false,
        restaurant: { name: 'Cafe' },
        createdAt: new Date('2026-10-03T00:00:00.000Z'),
      },
    ]);
    listMyReportsRepo.mockResolvedValue([
      {
        _id: 'report-1',
        description: 'The phone number changed',
        status: 'RESOLVED',
        restaurant: { name: 'Pizza Hut' },
        createdAt: new Date('2026-10-04T00:00:00.000Z'),
      },
    ]);
  });

  it('returns only this user\'s rows, with points taken from award keys', async () => {
    const result = await getMySubmissionsService('user-1');

    expect(listMyRestaurantsRepo).toHaveBeenCalledWith('user-1');
    expect(result.restaurants[0]).toMatchObject({ id: 'rest-1', name: 'Pizza Hut', status: 'PENDING' });
    expect(result.teudot[0].points).toBe(3);
    expect(result.teudot[1]).toMatchObject({ points: 0, rejectionReason: 'Photo is unreadable' });
    expect(result.reports[0]).toMatchObject({ status: 'RESOLVED', points: 1, description: 'The phone number changed' });
    expect(result.restaurants[0].adminNote).toBeUndefined();
  });
});
