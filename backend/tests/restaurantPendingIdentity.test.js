import { describe, expect, it, vi, beforeEach } from 'vitest';
import { findPendingRestaurantBySubmitterRepo } from '../src/repositories/restaurantRepository.js';
import { Restaurant } from '../src/models/Restaurant.js';
vi.mock('../src/models/Restaurant.js', () => ({ Restaurant: { find: vi.fn() } }));
const lookup = (cityNormalized) => findPendingRestaurantBySubmitterRepo({ submittedBy: 'user', nameNormalized: 'branch', addressNormalized: 'main 1', cityNormalized });
const rows = (data) => Restaurant.find.mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(data) }) });
beforeEach(() => vi.clearAllMocks());
describe('pending branch locality identity', () => {
  it('queries normalized city alongside the existing identity fields', async () => {
    rows([{ _id: 'same', cityNormalized: 'jerusalem' }]);
    expect(await lookup('jerusalem')).toMatchObject({ _id: 'same' });
    expect(Restaurant.find).toHaveBeenCalledWith(expect.objectContaining({ submittedBy: 'user', nameNormalized: 'branch', addressNormalized: 'main 1', $or: [{ cityNormalized: 'jerusalem' }, { cityNormalized: { $exists: false } }] }));
  });
  it('allows a same-name/street legacy branch in a different city', async () => {
    rows([{ _id: 'other', city: 'Haifa' }]);
    expect(await lookup('jerusalem')).toBeNull();
  });
  it('detects a normalized legacy locality without rewriting records', async () => {
    rows([{ _id: 'legacy', city: '  JERUSALEM!  ' }]);
    expect(await lookup('jerusalem')).toMatchObject({ _id: 'legacy' });
  });
  it('handles a legacy missing city as empty locality', async () => {
    rows([{ _id: 'legacy' }]);
    expect(await lookup('')).toMatchObject({ _id: 'legacy' });
    expect(await lookup('haifa')).toBeNull();
  });
});
