// NEW (Milestone 3): tests for private contribution points (+3 / +2 / +1, zero cases, no double award).
// חדש (אבן דרך 3): בדיקות לנקודות תרומה פרטיות (+3 / +2 / +1, מקרי אפס, בלי כפל ניקוד).
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/userRepository.js', () => ({
  findUserByIdRepo: vi.fn(),
  awardPointsOnceRepo: vi.fn(),
}));

import { awardPointsOnceRepo, findUserByIdRepo } from '../src/repositories/userRepository.js';
import {
  awardPointsForAppliedCorrectionService,
  awardPointsForApprovedTeudaService,
} from '../src/services/pointsService.js';

const approvedRestaurant = { _id: 'rest-1', status: 'APPROVED', submittedBy: 'user-1' };

const approvedTeuda = (overrides = {}) => ({
  _id: 'teuda-1',
  status: 'APPROVED',
  submittedBy: 'user-1',
  submittedWithNewRestaurant: false,
  ...overrides,
});

// A tiny in-memory stand-in for the atomic "add once per key" update.
const useFakeLedger = () => {
  const usedKeys = new Set();
  awardPointsOnceRepo.mockImplementation(async (userId, key) => {
    if (usedKeys.has(key)) {
      return null;
    }
    usedKeys.add(key);
    return { _id: userId };
  });
};

describe('points for an approved teuda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUserByIdRepo.mockResolvedValue({ _id: 'user-1', role: 'USER' });
    awardPointsOnceRepo.mockResolvedValue({ _id: 'user-1' });
  });

  it('gives +3 for a new restaurant sent together with a certificate, once both are approved', async () => {
    const result = await awardPointsForApprovedTeudaService({
      teuda: approvedTeuda({ submittedWithNewRestaurant: true }),
      restaurant: approvedRestaurant,
    });

    expect(result).toMatchObject({ awarded: true, points: 3 });
    expect(awardPointsOnceRepo).toHaveBeenCalledWith('user-1', 'TEUDA:teuda-1', 3);
  });

  it('gives +2 for a certificate added to an already existing restaurant', async () => {
    const result = await awardPointsForApprovedTeudaService({
      teuda: approvedTeuda(),
      restaurant: approvedRestaurant,
    });

    expect(result).toMatchObject({ awarded: true, points: 2 });
  });

  it('gives +2, not +3, when the restaurant was submitted by somebody else', async () => {
    const result = await awardPointsForApprovedTeudaService({
      teuda: approvedTeuda({ submittedWithNewRestaurant: true }),
      restaurant: { ...approvedRestaurant, submittedBy: 'user-2' },
    });

    expect(result.points).toBe(2);
  });

  it('gives nothing while the certificate is pending or rejected', async () => {
    for (const status of ['PENDING', 'REJECTED']) {
      const result = await awardPointsForApprovedTeudaService({
        teuda: approvedTeuda({ status }),
        restaurant: approvedRestaurant,
      });
      expect(result).toMatchObject({ awarded: false, points: 0, reason: 'NOT_APPROVED' });
    }

    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('gives nothing when the restaurant is not approved', async () => {
    const result = await awardPointsForApprovedTeudaService({
      teuda: approvedTeuda(),
      restaurant: { ...approvedRestaurant, status: 'PENDING' },
    });

    expect(result).toMatchObject({ awarded: false, reason: 'NOT_APPROVED' });
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('gives nothing to an admin submitter', async () => {
    findUserByIdRepo.mockResolvedValue({ _id: 'admin-1', role: 'ADMIN' });

    const result = await awardPointsForApprovedTeudaService({
      teuda: approvedTeuda({ submittedBy: 'admin-1' }),
      restaurant: approvedRestaurant,
    });

    expect(result).toMatchObject({ awarded: false, reason: 'SUBMITTER_IS_NOT_A_USER' });
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('gives nothing when the submitter account no longer exists', async () => {
    findUserByIdRepo.mockResolvedValue(null);

    const result = await awardPointsForApprovedTeudaService({
      teuda: approvedTeuda(),
      restaurant: approvedRestaurant,
    });

    expect(result.reason).toBe('SUBMITTER_NOT_FOUND');
  });

  it('does not award twice when the same approval is repeated', async () => {
    useFakeLedger();
    const input = { teuda: approvedTeuda({ submittedWithNewRestaurant: true }), restaurant: approvedRestaurant };

    const first = await awardPointsForApprovedTeudaService(input);
    const second = await awardPointsForApprovedTeudaService(input);
    const third = await awardPointsForApprovedTeudaService(input);

    expect(first).toMatchObject({ awarded: true, points: 3 });
    expect(second).toMatchObject({ awarded: false, reason: 'ALREADY_AWARDED' });
    expect(third).toMatchObject({ awarded: false, reason: 'ALREADY_AWARDED' });
  });

  it('awards two different certificates of the same user separately', async () => {
    useFakeLedger();

    const first = await awardPointsForApprovedTeudaService({
      teuda: approvedTeuda({ _id: 'teuda-1' }),
      restaurant: approvedRestaurant,
    });
    const second = await awardPointsForApprovedTeudaService({
      teuda: approvedTeuda({ _id: 'teuda-2' }),
      restaurant: approvedRestaurant,
    });

    expect(first.awarded).toBe(true);
    expect(second.awarded).toBe(true);
  });
});

describe('points for an applied correction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUserByIdRepo.mockResolvedValue({ _id: 'user-1', role: 'USER' });
    awardPointsOnceRepo.mockResolvedValue({ _id: 'user-1' });
  });

  const resolvedReport = (overrides = {}) => ({
    _id: 'report-1',
    status: 'RESOLVED',
    correctionApplied: true,
    submittedBy: 'user-1',
    ...overrides,
  });

  it('gives +1 when the correction was really applied', async () => {
    const result = await awardPointsForAppliedCorrectionService({ report: resolvedReport() });

    expect(result).toMatchObject({ awarded: true, points: 1 });
    expect(awardPointsOnceRepo).toHaveBeenCalledWith('user-1', 'REPORT:report-1', 1);
  });

  it('gives 0 when the report was only marked RESOLVED without a correction', async () => {
    const result = await awardPointsForAppliedCorrectionService({
      report: resolvedReport({ correctionApplied: false }),
    });

    expect(result).toMatchObject({ awarded: false, points: 0, reason: 'NO_CORRECTION_APPLIED' });
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('gives 0 for a rejected report', async () => {
    const result = await awardPointsForAppliedCorrectionService({
      report: resolvedReport({ status: 'REJECTED', correctionApplied: false }),
    });

    expect(result.awarded).toBe(false);
  });

  it('does not award twice for the same report', async () => {
    useFakeLedger();

    const first = await awardPointsForAppliedCorrectionService({ report: resolvedReport() });
    const second = await awardPointsForAppliedCorrectionService({ report: resolvedReport() });

    expect(first.awarded).toBe(true);
    expect(second).toMatchObject({ awarded: false, reason: 'ALREADY_AWARDED' });
  });

  it('gives nothing to an admin submitter', async () => {
    findUserByIdRepo.mockResolvedValue({ _id: 'admin-1', role: 'ADMIN' });

    const result = await awardPointsForAppliedCorrectionService({ report: resolvedReport({ submittedBy: 'admin-1' }) });

    expect(result.awarded).toBe(false);
  });
});
