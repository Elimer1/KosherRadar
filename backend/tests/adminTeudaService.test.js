vi.mock('../src/repositories/transaction.js', () => ({ withTransaction: vi.fn(async (work) => work()) }));
vi.mock('../src/repositories/restaurantIntegrityRepository.js', () => ({ lockRestaurantForWriteRepo: vi.fn() }));
vi.mock('../src/repositories/imageCleanupRepository.js', () => ({
  enqueueImageCleanupRepo: vi.fn(),
  findImageCleanupRepo: vi.fn(async (ids) => (ids || []).map((publicId) => ({ publicId }))),
  completeImageCleanupRepo: vi.fn(), failImageCleanupRepo: vi.fn(),
}));
// NEW (Milestone 3): tests for admin certificate (teuda) moderation.
// חדש (אבן דרך 3): בדיקות לניהול תעודות על ידי מנהל.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/repositories/restaurantRepository.js', () => ({
  findRestaurantByIdRepo: vi.fn(),
}));

vi.mock('../src/repositories/teudaRepository.js', () => ({
  createTeudaRepo: vi.fn(),
  findApprovedTeudotByRestaurantRepo: vi.fn(),
  findTeudaByIdRepo: vi.fn(),
}));

vi.mock('../src/repositories/adminTeudaRepository.js', () => ({
  approvePendingTeudaRepo: vi.fn(),
  deleteTeudaByIdRepo: vi.fn(),
  listApprovedTeudotExpiringBetweenRepo: vi.fn(),
  listApprovedTeudotOfRestaurantsRepo: vi.fn(),
  listPendingTeudotRepo: vi.fn(),
  rejectPendingTeudaRepo: vi.fn(),
  saveTeudaChangesRepo: vi.fn(),
}));

vi.mock('../src/repositories/adminReportRepository.js', () => ({
  removeTeudaFromReportsRepo: vi.fn(),
}));

vi.mock('../src/repositories/userRepository.js', () => ({
  findUserByIdRepo: vi.fn(),
  awardPointsOnceRepo: vi.fn(),
}));

vi.mock('../src/services/emailService.js', () => ({
  EMAIL_FAILED: 'FAILED',
  sendRejectionEmailService: vi.fn(),
  sendApprovalEmailService: vi.fn().mockResolvedValue('SENT'),
}));

vi.mock('../src/services/imageUploadService.js', () => ({
  checkImageFile: vi.fn(),
  uploadTeudaImageService: vi.fn(),
  deleteImageService: vi.fn(),
}));

import { findRestaurantByIdRepo } from '../src/repositories/restaurantRepository.js';
import {
  createTeudaRepo,
  findApprovedTeudotByRestaurantRepo,
  findTeudaByIdRepo,
} from '../src/repositories/teudaRepository.js';
import {
  approvePendingTeudaRepo,
  deleteTeudaByIdRepo,
  listApprovedTeudotExpiringBetweenRepo,
  listApprovedTeudotOfRestaurantsRepo,
  listPendingTeudotRepo,
  rejectPendingTeudaRepo,
  saveTeudaChangesRepo,
} from '../src/repositories/adminTeudaRepository.js';
import { removeTeudaFromReportsRepo } from '../src/repositories/adminReportRepository.js';
import { awardPointsOnceRepo, findUserByIdRepo } from '../src/repositories/userRepository.js';
import { sendApprovalEmailService, sendRejectionEmailService } from '../src/services/emailService.js';
import { checkImageFile, deleteImageService, uploadTeudaImageService } from '../src/services/imageUploadService.js';
import {
  approveTeudaService,
  createTeudaByAdminService,
  deleteTeudaService,
  listExpiringSoonService,
  listPendingTeudotService,
  rejectTeudaService,
  updateTeudaByAdminService,
} from '../src/services/adminTeudaService.js';
import { dateOnlyToDate } from '../src/utils/israelDate.js';

const admin = { _id: 'admin-1', role: 'ADMIN' };

const teuda = (overrides = {}) => ({
  _id: 'teuda-1',
  restaurant: 'rest-1',
  hechsher: 'BADATZ_MACHPUD',
  kashrutLevel: 'MEHADRIN',
  expirationDate: dateOnlyToDate('2027-03-01'),
  photoUrl: 'https://example.com/p.jpg',
  cloudinaryPublicId: 'kosherradar/teudot/p',
  mashgiachName: 'Dan',
  mashgiachPhone: '050-1234567',
  status: 'PENDING',
  submittedBy: 'user-1',
  submittedWithNewRestaurant: false,
  ...overrides,
});

const approvedRestaurant = { _id: 'rest-1', name: 'Pizza Hut', status: 'APPROVED', submittedBy: 'user-1' };

const teudaFields = (overrides = {}) => ({
  hechsher: 'BADATZ_MACHPUD',
  kashrutLevel: 'MEHADRIN',
  expirationDate: '2027-03-01',
  mashgiachName: 'Dan',
  mashgiachPhone: '050-1234567',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-11T09:00:00.000Z'));
  vi.spyOn(console, 'error').mockImplementation(() => {});

  findRestaurantByIdRepo.mockResolvedValue(approvedRestaurant);
  findApprovedTeudotByRestaurantRepo.mockResolvedValue([]);
  findUserByIdRepo.mockResolvedValue({ _id: 'user-1', role: 'USER', email: 'user@example.com' });
  awardPointsOnceRepo.mockResolvedValue({ _id: 'user-1' });
  sendRejectionEmailService.mockResolvedValue('SENT');
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('approveTeudaService', () => {
  it('refuses to approve evidence that still has no kashrut level, and awards no points', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda({ kashrutLevel: undefined, expirationDate: undefined }));

    await expect(approveTeudaService({ teudaId: 'teuda-1' })).rejects.toMatchObject({ statusCode: 400 });
    expect(approvePendingTeudaRepo).not.toHaveBeenCalled();
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('cannot approve a certificate while its restaurant is not approved', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());
    findRestaurantByIdRepo.mockResolvedValue({ ...approvedRestaurant, status: 'PENDING' });

    await expect(approveTeudaService({ teudaId: 'teuda-1' })).rejects.toMatchObject({
      statusCode: 409,
      code: 'RESTAURANT_NOT_APPROVED',
    });
    expect(approvePendingTeudaRepo).not.toHaveBeenCalled();
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('approves, and gives +2 for a certificate of an existing restaurant', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());
    approvePendingTeudaRepo.mockResolvedValue(teuda({ status: 'APPROVED' }));

    const result = await approveTeudaService({ teudaId: 'teuda-1' });

    expect(result.teuda.status).toBe('APPROVED');
    expect(result.alreadyApproved).toBe(false);
    expect(result.points).toMatchObject({ awarded: true, points: 2 });
    expect(awardPointsOnceRepo).toHaveBeenCalledWith('user-1', 'TEUDA:teuda-1', 2);
    expect(sendApprovalEmailService).toHaveBeenCalledTimes(1);
  });

  it('gives +3 when the certificate was sent together with a new restaurant', async () => {
    const pending = teuda({ submittedWithNewRestaurant: true });
    findTeudaByIdRepo.mockResolvedValue(pending);
    approvePendingTeudaRepo.mockResolvedValue({ ...pending, status: 'APPROVED' });

    const result = await approveTeudaService({ teudaId: 'teuda-1' });

    expect(result.points).toMatchObject({ awarded: true, points: 3 });
  });

  it('still approves when a valid certificate of the same level exists, and only warns (override)', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([
      teuda({ _id: 'other', status: 'APPROVED', expirationDate: dateOnlyToDate('2027-01-01') }),
    ]);
    approvePendingTeudaRepo.mockResolvedValue(teuda({ status: 'APPROVED' }));

    const result = await approveTeudaService({ teudaId: 'teuda-1' });

    expect(result.teuda.status).toBe('APPROVED');
    expect(result.conflictWarning).toHaveLength(1);
    expect(result.conflictWarning[0]).toMatchObject({ id: 'other', kashrutLevel: 'MEHADRIN' });
  });

  it('does not change anything or award points a second time when approved again', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda({ status: 'APPROVED' }));
    // The first approval already used the key: the guarded update finds nothing to change.
    awardPointsOnceRepo.mockResolvedValue(null);

    const result = await approveTeudaService({ teudaId: 'teuda-1' });

    expect(result.alreadyApproved).toBe(true);
    expect(approvePendingTeudaRepo).not.toHaveBeenCalled();
    expect(result.points).toMatchObject({ awarded: false, reason: 'ALREADY_AWARDED' });
    expect(sendApprovalEmailService).not.toHaveBeenCalled();
  });

  it('repairs a missing award when an approved certificate is approved again', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda({ status: 'APPROVED' }));

    const result = await approveTeudaService({ teudaId: 'teuda-1' });

    expect(result.points).toMatchObject({ awarded: true, points: 2 });
  });

  it('treats a lost race with another admin as already approved', async () => {
    findTeudaByIdRepo
      .mockResolvedValueOnce(teuda())
      .mockResolvedValueOnce(teuda({ status: 'APPROVED' }));
    approvePendingTeudaRepo.mockResolvedValue(null);
    awardPointsOnceRepo.mockResolvedValue(null);

    const result = await approveTeudaService({ teudaId: 'teuda-1' });

    expect(result.alreadyApproved).toBe(true);
  });

  it('refuses to approve a rejected certificate', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda({ status: 'REJECTED' }));

    await expect(approveTeudaService({ teudaId: 'teuda-1' })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('answers 404 for an unknown certificate', async () => {
    findTeudaByIdRepo.mockResolvedValue(null);

    await expect(approveTeudaService({ teudaId: 'missing' })).rejects.toMatchObject({ statusCode: 404 });
  });

  it('gives no points when an admin-submitted certificate is approved', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda({ submittedBy: 'admin-1' }));
    approvePendingTeudaRepo.mockResolvedValue(teuda({ status: 'APPROVED', submittedBy: 'admin-1' }));
    findUserByIdRepo.mockResolvedValue({ _id: 'admin-1', role: 'ADMIN' });

    const result = await approveTeudaService({ teudaId: 'teuda-1' });

    expect(result.points.awarded).toBe(false);
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });
});

describe('rejectTeudaService', () => {
  it('saves the rejection with the reason and emails the submitter', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());
    rejectPendingTeudaRepo.mockResolvedValue(teuda({ status: 'REJECTED', rejectionReason: 'Photo is unreadable' }));

    const result = await rejectTeudaService({ teudaId: 'teuda-1', reason: 'Photo is unreadable' });

    expect(rejectPendingTeudaRepo).toHaveBeenCalledWith('teuda-1', 'Photo is unreadable');
    expect(result.teuda.status).toBe('REJECTED');
    expect(result.teuda.rejectionReason).toBe('Photo is unreadable');
    expect(result.emailStatus).toBe('SENT');
    expect(sendRejectionEmailService).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com', kind: 'certificate', reason: 'Photo is unreadable' })
    );
  });

  it('keeps the rejection and reports FAILED when the email cannot be sent', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());
    rejectPendingTeudaRepo.mockResolvedValue(teuda({ status: 'REJECTED', rejectionReason: 'Bad photo' }));
    sendRejectionEmailService.mockResolvedValue('FAILED');

    const result = await rejectTeudaService({ teudaId: 'teuda-1', reason: 'Bad photo' });

    expect(result.teuda.status).toBe('REJECTED');
    expect(result.emailStatus).toBe('FAILED');
  });

  it('keeps the rejection even when looking up the submitter throws', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());
    rejectPendingTeudaRepo.mockResolvedValue(teuda({ status: 'REJECTED', rejectionReason: 'Bad photo' }));
    findUserByIdRepo.mockRejectedValue(new Error('database hiccup'));

    const result = await rejectTeudaService({ teudaId: 'teuda-1', reason: 'Bad photo' });

    expect(result.teuda.status).toBe('REJECTED');
    expect(result.emailStatus).toBe('FAILED');
  });

  it('never gives points for a rejected certificate', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());
    rejectPendingTeudaRepo.mockResolvedValue(teuda({ status: 'REJECTED', rejectionReason: 'Bad photo' }));

    await rejectTeudaService({ teudaId: 'teuda-1', reason: 'Bad photo' });

    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('only rejects a certificate that is waiting for review', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda({ status: 'APPROVED' }));

    await expect(rejectTeudaService({ teudaId: 'teuda-1', reason: 'Bad photo' })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(rejectPendingTeudaRepo).not.toHaveBeenCalled();
  });
});

describe('updateTeudaByAdminService', () => {
  it('edits the fields without touching the status, so an approved certificate stays approved', async () => {
    const existing = teuda({ status: 'APPROVED' });
    findTeudaByIdRepo.mockResolvedValue(existing);
    saveTeudaChangesRepo.mockImplementation(async (doc, changes) => ({ ...doc, ...changes }));

    const result = await updateTeudaByAdminService({
      teudaId: 'teuda-1',
      teudaData: teudaFields({ kashrutLevel: 'RABBANUT', adminNote: 'Checked by phone' }),
    });

    const changes = saveTeudaChangesRepo.mock.calls[0][1];
    expect(changes).not.toHaveProperty('status');
    expect(changes.kashrutLevel).toBe('RABBANUT');
    expect(result.status).toBe('APPROVED');
    expect(result.adminNote).toBe('Checked by phone');
  });

  it('accepts an expiration date in the past (an admin may record old evidence)', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());
    saveTeudaChangesRepo.mockImplementation(async (doc, changes) => ({ ...doc, ...changes }));

    const result = await updateTeudaByAdminService({
      teudaId: 'teuda-1',
      teudaData: teudaFields({ expirationDate: '2025-01-01' }),
    });

    expect(result.expirationDate).toBe('2025-01-01');
    expect(result.visibility).toBe('ADMIN_ONLY');
  });

  it('rejects an obviously wrong date', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());

    await expect(
      updateTeudaByAdminService({ teudaId: 'teuda-1', teudaData: teudaFields({ expirationDate: '1990-01-01' }) })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      updateTeudaByAdminService({ teudaId: 'teuda-1', teudaData: teudaFields({ expirationDate: '2040-01-01' }) })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(saveTeudaChangesRepo).not.toHaveBeenCalled();
  });
});

describe('createTeudaByAdminService', () => {
  const file = { buffer: Buffer.alloc(20), size: 20 };

  beforeEach(() => {
    uploadTeudaImageService.mockResolvedValue({ photoUrl: 'https://example.com/n.jpg', cloudinaryPublicId: 'new-id' });
    createTeudaRepo.mockImplementation(async (data) => ({ ...data, _id: 'teuda-new' }));
  });

  it('creates an APPROVED certificate at once, owned by the admin', async () => {
    const result = await createTeudaByAdminService({
      restaurantId: 'rest-1',
      teudaData: teudaFields({ adminNote: 'Seen in person' }),
      file,
      admin,
    });

    expect(createTeudaRepo.mock.calls[0][0]).toMatchObject({
      status: 'APPROVED',
      submittedBy: 'admin-1',
      submittedWithNewRestaurant: false,
      adminNote: 'Seen in person',
    });
    expect(result.status).toBe('APPROVED');
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('allows a recently expired date', async () => {
    const result = await createTeudaByAdminService({
      restaurantId: 'rest-1',
      teudaData: teudaFields({ expirationDate: '2026-08-01' }),
      file,
      admin,
    });

    expect(result.visibility).toBe('RECENT_EXPIRED');
  });

  it('refuses when the restaurant is not approved', async () => {
    findRestaurantByIdRepo.mockResolvedValue({ ...approvedRestaurant, status: 'PENDING' });

    await expect(
      createTeudaByAdminService({ restaurantId: 'rest-1', teudaData: teudaFields(), file, admin })
    ).rejects.toMatchObject({ statusCode: 409, code: 'RESTAURANT_NOT_APPROVED' });
    expect(uploadTeudaImageService).not.toHaveBeenCalled();
  });

  it('checks the photo before uploading anything', async () => {
    checkImageFile.mockImplementation(() => {
      throw Object.assign(new Error('bad photo'), { statusCode: 400 });
    });

    await expect(
      createTeudaByAdminService({ restaurantId: 'rest-1', teudaData: teudaFields(), file, admin })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(uploadTeudaImageService).not.toHaveBeenCalled();
    checkImageFile.mockReset();
  });

  it('removes the uploaded photo when saving fails', async () => {
    createTeudaRepo.mockRejectedValue(new Error('database down'));

    await expect(
      createTeudaByAdminService({ restaurantId: 'rest-1', teudaData: teudaFields(), file, admin })
    ).rejects.toThrow('database down');
    expect(deleteImageService).toHaveBeenCalledWith('new-id');
  });
});

describe('deleteTeudaService', () => {
  it('deletes the certificate, unlinks its reports and removes the photo', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda());

    const result = await deleteTeudaService({ teudaId: 'teuda-1' });

    expect(result).toMatchObject({ deleted: true, imageCleanup: expect.any(Object) });
    expect(deleteTeudaByIdRepo).toHaveBeenCalledWith('teuda-1');
    expect(removeTeudaFromReportsRepo).toHaveBeenCalledWith('teuda-1');
    expect(deleteImageService).toHaveBeenCalledWith('kosherradar/teudot/p');
  });

  it('does not touch points when a certificate is deleted', async () => {
    findTeudaByIdRepo.mockResolvedValue(teuda({ status: 'APPROVED' }));

    await deleteTeudaService({ teudaId: 'teuda-1' });

    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });
});

describe('listPendingTeudotService', () => {
  it('flags a pending certificate whose restaurant is not approved yet and adds conflict warnings', async () => {
    listPendingTeudotRepo.mockResolvedValue({
      total: 2,
      items: [
        teuda({ _id: 'p1', restaurant: { _id: 'rest-1', name: 'A', address: 'x', status: 'APPROVED' } }),
        teuda({ _id: 'p2', restaurant: { _id: 'rest-2', name: 'B', address: 'y', status: 'PENDING' } }),
      ],
    });
    listApprovedTeudotOfRestaurantsRepo.mockResolvedValue([
      teuda({ _id: 'old', restaurant: 'rest-1', status: 'APPROVED', expirationDate: dateOnlyToDate('2027-01-01') }),
    ]);

    const result = await listPendingTeudotService({ page: 1, limit: 20 });

    expect(result.total).toBe(2);
    expect(result.items[0]).toMatchObject({ id: 'p1', restaurantApproved: true });
    expect(result.items[0].conflicts).toHaveLength(1);
    expect(result.items[1]).toMatchObject({ id: 'p2', restaurantApproved: false, conflicts: [] });
  });

  it('does not ask for approved certificates when the page is empty', async () => {
    listPendingTeudotRepo.mockResolvedValue({ total: 0, items: [] });

    const result = await listPendingTeudotService({ page: 1, limit: 20 });

    expect(result.items).toEqual([]);
    expect(listApprovedTeudotOfRestaurantsRepo).not.toHaveBeenCalled();
  });
});

describe('listExpiringSoonService', () => {
  it('asks for approved certificates from today up to 30 days ahead (Israel dates) and adds days left', async () => {
    listApprovedTeudotExpiringBetweenRepo.mockResolvedValue([
      teuda({ status: 'APPROVED', expirationDate: dateOnlyToDate('2026-10-11') }),
      teuda({ _id: 'later', status: 'APPROVED', expirationDate: dateOnlyToDate('2026-11-10') }),
    ]);

    const result = await listExpiringSoonService();

    const query = listApprovedTeudotExpiringBetweenRepo.mock.calls[0][0];
    expect(query.fromDate.toISOString().slice(0, 10)).toBe('2026-10-11');
    expect(query.toDate.toISOString().slice(0, 10)).toBe('2026-11-10');
    expect(result.map((item) => item.daysLeft)).toEqual([0, 30]);
  });
});
