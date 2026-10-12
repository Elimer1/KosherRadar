import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/repositories/restaurantRepository.js', () => ({
  findRestaurantByIdRepo: vi.fn(),
}));

vi.mock('../src/repositories/reportRepository.js', () => ({
  createReportRepo: vi.fn(),
  findSimilarPendingReportRepo: vi.fn(),
}));

vi.mock('../src/repositories/teudaRepository.js', () => ({
  findTeudaByIdRepo: vi.fn(),
}));

import { findRestaurantByIdRepo } from '../src/repositories/restaurantRepository.js';
import { createReportRepo, findSimilarPendingReportRepo } from '../src/repositories/reportRepository.js';
import { findTeudaByIdRepo } from '../src/repositories/teudaRepository.js';
import { submitReportService } from '../src/services/reportSubmissionService.js';
import { submitReportSchema } from '../src/schemas/reportSchemas.js';
import { dateOnlyToDate } from '../src/utils/israelDate.js';

const RESTAURANT_ID = '64b7f0f2a1b2c3d4e5f60718';
const TEUDA_ID = '64b7f0f2a1b2c3d4e5f60719';
const user = { _id: 'user-1', role: 'USER' };

const reportData = (overrides = {}) => ({
  restaurantId: RESTAURANT_ID,
  type: 'GENERAL',
  description: 'The phone number changed',
  ...overrides,
});

const teudaExpiring = (dateOnly, overrides = {}) => ({
  _id: TEUDA_ID,
  restaurant: RESTAURANT_ID,
  status: 'APPROVED',
  kashrutLevel: 'MEHADRIN',
  expirationDate: dateOnlyToDate(dateOnly),
  ...overrides,
});

describe('submitReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T09:00:00.000Z'));
    findRestaurantByIdRepo.mockResolvedValue({ _id: RESTAURANT_ID, status: 'APPROVED' });
    findSimilarPendingReportRepo.mockResolvedValue(null);
    createReportRepo.mockImplementation(async (data) => ({ ...data, _id: 'report-1' }));
  });

  afterEach(() => vi.useRealTimers());

  it('saves a PENDING report with no correction applied, owned by the user', async () => {
    const result = await submitReportService({ reportData: reportData(), user });

    expect(result).toEqual({ id: 'report-1', status: 'PENDING' });
    expect(createReportRepo.mock.calls[0][0]).toMatchObject({
      restaurant: RESTAURANT_ID,
      submittedBy: 'user-1',
      status: 'PENDING',
      correctionApplied: false,
    });
  });

  it('returns 404 for a restaurant that is missing, pending or rejected', async () => {
    findRestaurantByIdRepo.mockResolvedValue(null);
    await expect(submitReportService({ reportData: reportData(), user })).rejects.toMatchObject({
      statusCode: 404,
    });

    findRestaurantByIdRepo.mockResolvedValue({ _id: RESTAURANT_ID, status: 'PENDING' });
    await expect(submitReportService({ reportData: reportData(), user })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(createReportRepo).not.toHaveBeenCalled();
  });

  it('allows a report about a valid certificate and about a recently expired one', async () => {
    findTeudaByIdRepo.mockResolvedValue(teudaExpiring('2027-01-01'));
    await expect(
      submitReportService({ reportData: reportData({ teudaId: TEUDA_ID }), user })
    ).resolves.toMatchObject({ status: 'PENDING' });

    findTeudaByIdRepo.mockResolvedValue(teudaExpiring('2026-08-01'));
    await expect(
      submitReportService({ reportData: reportData({ teudaId: TEUDA_ID }), user })
    ).resolves.toMatchObject({ status: 'PENDING' });
  });

  it('blocks a report against an admin-only teuda (expired more than six months ago)', async () => {
    findTeudaByIdRepo.mockResolvedValue(teudaExpiring('2026-01-01'));

    await expect(
      submitReportService({ reportData: reportData({ teudaId: TEUDA_ID }), user })
    ).rejects.toMatchObject({ statusCode: 404, message: 'Certificate not found' });
    expect(createReportRepo).not.toHaveBeenCalled();
  });

  it('blocks a report against a certificate that is not approved or belongs to another restaurant', async () => {
    findTeudaByIdRepo.mockResolvedValue(teudaExpiring('2027-01-01', { status: 'PENDING' }));
    await expect(
      submitReportService({ reportData: reportData({ teudaId: TEUDA_ID }), user })
    ).rejects.toMatchObject({ statusCode: 404 });

    findTeudaByIdRepo.mockResolvedValue(teudaExpiring('2027-01-01', { restaurant: 'another-restaurant' }));
    await expect(
      submitReportService({ reportData: reportData({ teudaId: TEUDA_ID }), user })
    ).rejects.toMatchObject({ statusCode: 404 });

    findTeudaByIdRepo.mockResolvedValue(null);
    await expect(
      submitReportService({ reportData: reportData({ teudaId: TEUDA_ID }), user })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('answers 409 when a concurrent insert loses the pending report index', async () => {
    createReportRepo.mockRejectedValue(
      Object.assign(new Error('E11000 duplicate key'), {
        code: 11000,
        keyPattern: { submittedBy: 1, restaurant: 1, pendingReportFingerprint: 1 },
      })
    );

    await expect(submitReportService({ reportData: reportData(), user })).rejects.toMatchObject({
      statusCode: 409,
      message: 'You already sent this report and it is waiting for review',
    });
  });

  it('does not treat a different duplicate key as a pending report conflict', async () => {
    const duplicate = Object.assign(new Error('E11000 other'), {
      code: 11000,
      keyPattern: { email: 1 },
    });
    createReportRepo.mockRejectedValue(duplicate);

    await expect(submitReportService({ reportData: reportData(), user })).rejects.toBe(duplicate);
  });

  it('answers 409 for the same report sent twice', async () => {
    findSimilarPendingReportRepo.mockResolvedValue({ _id: 'earlier' });

    await expect(submitReportService({ reportData: reportData(), user })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(createReportRepo).not.toHaveBeenCalled();
  });

  it('does not change the restaurant or certificate (it only creates a report)', async () => {
    findTeudaByIdRepo.mockResolvedValue(teudaExpiring('2027-01-01'));

    await submitReportService({
      reportData: reportData({ type: 'KASHRUT_UPDATE', proposedKashrutLevel: 'MEHADRIN', teudaId: TEUDA_ID }),
      user,
    });

    expect(createReportRepo).toHaveBeenCalledTimes(1);
    expect(createReportRepo.mock.calls[0][0].proposedKashrutLevel).toBe('MEHADRIN');
  });
});

describe('submitReportSchema', () => {
  const input = (overrides = {}) => ({
    restaurantId: RESTAURANT_ID,
    type: 'GENERAL',
    description: 'Something is wrong',
    ...overrides,
  });

  it('accepts a general report and treats empty optional inputs as missing', () => {
    const result = submitReportSchema.parse(input({ teudaId: '', proposedHechsher: '' }));
    expect(result.teudaId).toBeUndefined();
    expect(result.proposedHechsher).toBeUndefined();
  });

  it('requires a description and a valid restaurant id', () => {
    expect(() => submitReportSchema.parse(input({ description: '   ' }))).toThrow();
    expect(() => submitReportSchema.parse(input({ restaurantId: '123' }))).toThrow();
    expect(() => submitReportSchema.parse(input({ restaurantId: { $ne: null } }))).toThrow();
  });

  it('requires a proposed hechsher or level for a kashrut update', () => {
    expect(() => submitReportSchema.parse(input({ type: 'KASHRUT_UPDATE' }))).toThrow(
      /Choose the hechsher or the kashrut level/
    );

    const result = submitReportSchema.parse(input({ type: 'KASHRUT_UPDATE', proposedKashrutLevel: 'RABBANUT' }));
    expect(result.proposedKashrutLevel).toBe('RABBANUT');
  });

  it('requires the custom text when the proposed hechsher is OTHER', () => {
    expect(() =>
      submitReportSchema.parse(input({ type: 'KASHRUT_UPDATE', proposedHechsher: 'OTHER' }))
    ).toThrow(/Enter the name of the hechsher/);
  });

  it('drops proposed values from a general report', () => {
    const result = submitReportSchema.parse(input({ proposedKashrutLevel: 'MEHADRIN' }));
    expect(result.proposedKashrutLevel).toBeUndefined();
  });

  it('ignores fields the client must not control', () => {
    const result = submitReportSchema.parse(
      input({ status: 'RESOLVED', correctionApplied: true, submittedBy: 'someone-else', adminNote: 'x' })
    );

    expect(result.status).toBeUndefined();
    expect(result.correctionApplied).toBeUndefined();
    expect(result.submittedBy).toBeUndefined();
    expect(result.adminNote).toBeUndefined();
  });
});
