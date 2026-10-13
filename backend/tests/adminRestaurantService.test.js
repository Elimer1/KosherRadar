vi.mock('../src/repositories/transaction.js', () => ({ withTransaction: vi.fn(async (work) => work()) }));
vi.mock('../src/repositories/restaurantIntegrityRepository.js', () => ({ lockRestaurantForWriteRepo: vi.fn() }));
vi.mock('../src/repositories/imageCleanupRepository.js', () => ({
  enqueueImageCleanupRepo: vi.fn(),
  findImageCleanupRepo: vi.fn(async (ids) => (ids || []).map((publicId) => ({ publicId }))),
  completeImageCleanupRepo: vi.fn(), failImageCleanupRepo: vi.fn(),
}));
// NEW (Milestone 3): tests for admin restaurant moderation (create, edit, approve, reject, delete, lists).
// חדש (אבן דרך 3): בדיקות לניהול מסעדות על ידי מנהל (יצירה, עריכה, אישור, דחייה, מחיקה, רשימות).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/repositories/restaurantRepository.js', () => ({
  createRestaurantRepo: vi.fn(),
  deleteRestaurantByIdRepo: vi.fn(),
  findRestaurantByIdRepo: vi.fn(),
}));

vi.mock('../src/repositories/teudaRepository.js', () => ({
  createTeudaRepo: vi.fn(),
}));

vi.mock('../src/repositories/adminRestaurantRepository.js', () => ({
  approvePendingRestaurantRepo: vi.fn(),
  findRestaurantWithDetailsRepo: vi.fn(),
  listPendingRestaurantsRepo: vi.fn(),
  rejectPendingRestaurantRepo: vi.fn(),
  saveRestaurantChangesRepo: vi.fn(),
  searchRestaurantsRepo: vi.fn(),
}));

vi.mock('../src/repositories/adminTeudaRepository.js', () => ({
  deleteTeudotOfRestaurantRepo: vi.fn(),
  findTeudotOfRestaurantForDeleteRepo: vi.fn(),
  listAllTeudotOfRestaurantRepo: vi.fn(),
  rejectPendingTeudotOfRestaurantRepo: vi.fn(),
}));

vi.mock('../src/repositories/adminReportRepository.js', () => ({
  deleteReportsOfRestaurantRepo: vi.fn(),
  findReportsOfRestaurantRepo: vi.fn().mockResolvedValue([]),
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

vi.mock('../src/services/duplicateService.js', () => ({
  findPossibleDuplicatesService: vi.fn(),
}));

vi.mock('../src/services/imageUploadService.js', () => ({
  checkImageFile: vi.fn(),
  uploadTeudaImageService: vi.fn(),
  deleteImageService: vi.fn(),
}));

import {
  createRestaurantRepo,
  deleteRestaurantByIdRepo,
  findRestaurantByIdRepo,
} from '../src/repositories/restaurantRepository.js';
import { createTeudaRepo } from '../src/repositories/teudaRepository.js';
import {
  approvePendingRestaurantRepo,
  findRestaurantWithDetailsRepo,
  listPendingRestaurantsRepo,
  rejectPendingRestaurantRepo,
  saveRestaurantChangesRepo,
  searchRestaurantsRepo,
} from '../src/repositories/adminRestaurantRepository.js';
import {
  deleteTeudotOfRestaurantRepo,
  findTeudotOfRestaurantForDeleteRepo,
  listAllTeudotOfRestaurantRepo,
  rejectPendingTeudotOfRestaurantRepo,
} from '../src/repositories/adminTeudaRepository.js';
import {
  deleteReportsOfRestaurantRepo,
  findReportsOfRestaurantRepo,
} from '../src/repositories/adminReportRepository.js';
import { awardPointsOnceRepo, findUserByIdRepo } from '../src/repositories/userRepository.js';
import { sendApprovalEmailService, sendRejectionEmailService } from '../src/services/emailService.js';
import { findPossibleDuplicatesService } from '../src/services/duplicateService.js';
import { deleteImageService, uploadTeudaImageService } from '../src/services/imageUploadService.js';
import {
  approveRestaurantService,
  createRestaurantByAdminService,
  deleteRestaurantService,
  getRestaurantForAdminService,
  listPendingRestaurantsService,
  rejectRestaurantService,
  searchRestaurantsForAdminService,
  updateRestaurantByAdminService,
} from '../src/services/adminRestaurantService.js';
import { dateOnlyToDate } from '../src/utils/israelDate.js';

const admin = { _id: 'admin-1', role: 'ADMIN' };

const restaurant = (overrides = {}) => ({
  _id: 'rest-1',
  name: 'Pizza Hut',
  address: '1 Main St',
  foodType: 'DAIRY',
  categories: ['RESTAURANT'],
  status: 'PENDING',
  submittedBy: 'user-1',
  adminNote: 'private admin note',
  ...overrides,
});

const restaurantFields = (overrides = {}) => ({
  name: 'Pizza Hut',
  address: '1 Main St',
  foodType: 'DAIRY',
  categories: ['RESTAURANT'],
  foodKeywords: [],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-11T09:00:00.000Z'));
  vi.spyOn(console, 'error').mockImplementation(() => {});

  findPossibleDuplicatesService.mockResolvedValue([]);
  findReportsOfRestaurantRepo.mockResolvedValue([]);
  findUserByIdRepo.mockResolvedValue({ _id: 'user-1', role: 'USER', email: 'user@example.com' });
  sendRejectionEmailService.mockResolvedValue('SENT');
  createRestaurantRepo.mockImplementation(async (data) => ({ ...data, _id: 'rest-new' }));
  createTeudaRepo.mockImplementation(async (data) => ({ ...data, _id: 'teuda-new' }));
  uploadTeudaImageService.mockResolvedValue({ photoUrl: 'https://example.com/n.jpg', cloudinaryPublicId: 'new-id' });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('createRestaurantByAdminService', () => {
  const file = { buffer: Buffer.alloc(20), size: 20 };
  const teudaData = {
    hechsher: 'BADATZ_MACHPUD',
    kashrutLevel: 'MEHADRIN',
    expirationDate: '2026-08-01',
    mashgiachName: 'Dan',
    mashgiachPhone: '050-1234567',
  };

  it('creates an APPROVED restaurant at once, owned by the admin, with the admin-only fields', async () => {
    const result = await createRestaurantByAdminService({
      restaurantData: restaurantFields(),
      extras: { kosharotUrl: 'https://example.com/kosharot/1', adminNote: 'Visited' },
      file: undefined,
      admin,
    });

    expect(createRestaurantRepo.mock.calls[0][0]).toMatchObject({
      status: 'APPROVED',
      submittedBy: 'admin-1',
      kosharotUrl: 'https://example.com/kosharot/1',
      adminNote: 'Visited',
    });
    expect(result.restaurant.status).toBe('APPROVED');
    expect(result.teuda).toBeNull();
    expect(createTeudaRepo).not.toHaveBeenCalled();
  });

  it('creates an approved certificate with it, even a recently expired one', async () => {
    const result = await createRestaurantByAdminService({
      restaurantData: restaurantFields(),
      extras: {},
      teudaData,
      file,
      admin,
    });

    expect(createTeudaRepo.mock.calls[0][0]).toMatchObject({ status: 'APPROVED', restaurant: 'rest-new' });
    expect(result.teuda).toMatchObject({ status: 'APPROVED', visibility: 'RECENT_EXPIRED' });
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('records possible duplicates as a warning and still creates the restaurant', async () => {
    findPossibleDuplicatesService.mockResolvedValue([{ restaurant: 'rest-9', reasons: ['SAME_PHONE'] }]);

    const result = await createRestaurantByAdminService({
      restaurantData: restaurantFields(),
      extras: {},
      admin,
    });

    expect(createRestaurantRepo.mock.calls[0][0].possibleDuplicates).toHaveLength(1);
    expect(result.possibleDuplicateCount).toBe(1);
    expect(result.restaurant.status).toBe('APPROVED');
  });

  it('aborts creation and cleans the photo when the certificate cannot be saved', async () => {
    createTeudaRepo.mockRejectedValue(new Error('database down'));

    await expect(
      createRestaurantByAdminService({ restaurantData: restaurantFields(), extras: {}, teudaData, file, admin })
    ).rejects.toThrow('database down');

    expect(deleteRestaurantByIdRepo).not.toHaveBeenCalled();
    expect(deleteImageService).toHaveBeenCalledWith('new-id');
  });

  it('refuses a photo without certificate details', async () => {
    await expect(
      createRestaurantByAdminService({ restaurantData: restaurantFields(), extras: {}, file, admin })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(createRestaurantRepo).not.toHaveBeenCalled();
  });
});

describe('updateRestaurantByAdminService', () => {
  it('replaces the editable fields, keeps the status and never touches the Geoapify place id', async () => {
    const existing = restaurant({ status: 'APPROVED', geoapifyPlaceId: 'place-1' });
    findRestaurantByIdRepo.mockResolvedValue(existing);
    saveRestaurantChangesRepo.mockImplementation(async (doc, changes) => ({ ...doc, ...changes }));

    const result = await updateRestaurantByAdminService({
      restaurantId: 'rest-1',
      restaurantData: restaurantFields({ name: 'Pizza Hut Jerusalem' }),
      extras: { adminNote: 'Name fixed' },
    });

    const changes = saveRestaurantChangesRepo.mock.calls[0][1];
    expect(changes).not.toHaveProperty('status');
    expect(changes).not.toHaveProperty('geoapifyPlaceId');
    expect(changes).not.toHaveProperty('submittedBy');
    expect(result.name).toBe('Pizza Hut Jerusalem');
    expect(result.status).toBe('APPROVED');
    expect(result.adminNote).toBe('Name fixed');
  });

  it('clears an optional field that was left empty', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant({ phone: '02-1234567' }));
    saveRestaurantChangesRepo.mockImplementation(async (doc, changes) => ({ ...doc, ...changes }));

    await updateRestaurantByAdminService({ restaurantId: 'rest-1', restaurantData: restaurantFields(), extras: {} });

    expect(saveRestaurantChangesRepo.mock.calls[0][1]).toHaveProperty('phone', undefined);
  });

  it('answers 404 for an unknown restaurant', async () => {
    findRestaurantByIdRepo.mockResolvedValue(null);

    await expect(
      updateRestaurantByAdminService({ restaurantId: 'x', restaurantData: restaurantFields(), extras: {} })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('approveRestaurantService', () => {
  it('approves a pending restaurant and gives no points (points come with the certificate)', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant());
    approvePendingRestaurantRepo.mockResolvedValue(restaurant({ status: 'APPROVED' }));

    const result = await approveRestaurantService({ restaurantId: 'rest-1' });

    expect(result.restaurant.status).toBe('APPROVED');
    expect(result.alreadyApproved).toBe(false);
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
    expect(sendApprovalEmailService).toHaveBeenCalledTimes(1);
  });

  it('changes nothing when the restaurant is already approved', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant({ status: 'APPROVED' }));

    const result = await approveRestaurantService({ restaurantId: 'rest-1' });

    expect(result.alreadyApproved).toBe(true);
    expect(approvePendingRestaurantRepo).not.toHaveBeenCalled();
    expect(sendApprovalEmailService).not.toHaveBeenCalled();
  });

  it('refuses to approve a rejected restaurant', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant({ status: 'REJECTED' }));

    await expect(approveRestaurantService({ restaurantId: 'rest-1' })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('treats a lost race with another admin as already approved', async () => {
    findRestaurantByIdRepo
      .mockResolvedValueOnce(restaurant())
      .mockResolvedValueOnce(restaurant({ status: 'APPROVED' }));
    approvePendingRestaurantRepo.mockResolvedValue(null);

    const result = await approveRestaurantService({ restaurantId: 'rest-1' });

    expect(result.alreadyApproved).toBe(true);
    expect(sendApprovalEmailService).not.toHaveBeenCalled();
  });

  it('keeps the saved approval when notification throws and sends nothing on retry', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant());
    approvePendingRestaurantRepo.mockResolvedValue(restaurant({ status: 'APPROVED' }));
    sendApprovalEmailService.mockRejectedValueOnce(new Error('SMTP down'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await approveRestaurantService({ restaurantId: 'rest-1' })).restaurant.status).toBe('APPROVED');
    findRestaurantByIdRepo.mockResolvedValue(restaurant({ status: 'APPROVED' }));
    await approveRestaurantService({ restaurantId: 'rest-1' });
    expect(sendApprovalEmailService).toHaveBeenCalledTimes(1);
    log.mockRestore();
  });
});

describe('rejectRestaurantService', () => {
  it('saves the reason, closes its pending certificates and emails the submitter', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant());
    rejectPendingRestaurantRepo.mockResolvedValue(restaurant({ status: 'REJECTED', rejectionReason: 'Not a real place' }));

    const result = await rejectRestaurantService({ restaurantId: 'rest-1', reason: 'Not a real place' });

    expect(rejectPendingRestaurantRepo).toHaveBeenCalledWith('rest-1', 'Not a real place');
    expect(rejectPendingTeudotOfRestaurantRepo).toHaveBeenCalledWith('rest-1', expect.any(String));
    expect(result.restaurant.rejectionReason).toBe('Not a real place');
    expect(result.emailStatus).toBe('SENT');
    expect(sendRejectionEmailService).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com', kind: 'restaurant', subjectName: 'Pizza Hut' })
    );
  });

  it('keeps the rejection saved when the email fails, and tells the admin', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant());
    rejectPendingRestaurantRepo.mockResolvedValue(restaurant({ status: 'REJECTED', rejectionReason: 'Duplicate' }));
    sendRejectionEmailService.mockResolvedValue('NOT_CONFIGURED');

    const result = await rejectRestaurantService({ restaurantId: 'rest-1', reason: 'Duplicate' });

    expect(result.restaurant.status).toBe('REJECTED');
    expect(result.emailStatus).toBe('NOT_CONFIGURED');
  });

  it('fails the transaction and sends no notification when certificate rejection fails', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant());
    rejectPendingRestaurantRepo.mockResolvedValue(restaurant({ status: 'REJECTED', rejectionReason: 'Duplicate' }));
    rejectPendingTeudotOfRestaurantRepo.mockRejectedValue(new Error('database hiccup'));

    await expect(rejectRestaurantService({ restaurantId: 'rest-1', reason: 'Duplicate' })).rejects.toThrow('database hiccup');
    expect(sendRejectionEmailService).not.toHaveBeenCalled();
  });

  it('only rejects a restaurant that is waiting for review', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant({ status: 'APPROVED' }));

    await expect(rejectRestaurantService({ restaurantId: 'rest-1', reason: 'Closed' })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(rejectPendingRestaurantRepo).not.toHaveBeenCalled();
  });
});

describe('deleteRestaurantService', () => {
  it('deletes the certificates, reports and restaurant, then removes every photo', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant({ status: 'APPROVED' }));
    findTeudotOfRestaurantForDeleteRepo.mockResolvedValue([
      { cloudinaryPublicId: 'photo-1' },
      { cloudinaryPublicId: 'photo-2' },
    ]);
    findReportsOfRestaurantRepo.mockResolvedValue([{ cloudinaryPublicId: 'report-photo' }]);

    const result = await deleteRestaurantService({ restaurantId: 'rest-1' });

    expect(result).toMatchObject({ deleted: true, deletedCertificates: 2, imageCleanup: expect.any(Object) });
    expect(deleteTeudotOfRestaurantRepo).toHaveBeenCalledWith('rest-1');
    expect(deleteReportsOfRestaurantRepo).toHaveBeenCalledWith('rest-1');
    expect(deleteRestaurantByIdRepo).toHaveBeenCalledWith('rest-1');
    expect(deleteImageService).toHaveBeenCalledTimes(3);
    expect(deleteImageService).toHaveBeenCalledWith('photo-1');
    expect(deleteImageService).toHaveBeenCalledWith('report-photo');
  });

  it('never touches points (given points stay with the users)', async () => {
    findRestaurantByIdRepo.mockResolvedValue(restaurant({ status: 'APPROVED' }));
    findTeudotOfRestaurantForDeleteRepo.mockResolvedValue([]);

    await deleteRestaurantService({ restaurantId: 'rest-1' });

    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('answers 404 and deletes nothing for an unknown restaurant', async () => {
    findRestaurantByIdRepo.mockResolvedValue(null);

    await expect(deleteRestaurantService({ restaurantId: 'x' })).rejects.toMatchObject({ statusCode: 404 });
    expect(deleteRestaurantByIdRepo).not.toHaveBeenCalled();
  });
});

describe('lists and details', () => {
  it('pending list includes the private fields an admin needs and the page numbers', async () => {
    listPendingRestaurantsRepo.mockResolvedValue({
      total: 45,
      items: [
        restaurant({
          submittedBy: { _id: 'user-1', email: 'user@example.com' },
          possibleDuplicates: [
            { restaurant: { _id: 'rest-9', name: 'Pizza Hut Old', address: '1 Main St', status: 'APPROVED' }, reasons: ['SAME_PHONE'] },
          ],
        }),
      ],
    });

    const result = await listPendingRestaurantsService({ page: 2, limit: 20 });

    expect(result).toMatchObject({ page: 2, limit: 20, total: 45, totalPages: 3 });
    expect(result.items[0].submittedBy).toEqual({ id: 'user-1', email: 'user@example.com' });
    expect(result.items[0].adminNote).toBe('private admin note');
    expect(result.items[0].possibleDuplicates[0]).toMatchObject({
      reasons: ['SAME_PHONE'],
      restaurant: { id: 'rest-9', name: 'Pizza Hut Old' },
    });
  });

  it('searches with normalized text and passes the status filter', async () => {
    searchRestaurantsRepo.mockResolvedValue({ total: 0, items: [] });

    await searchRestaurantsForAdminService({ search: '  PIZZA  Hut ', status: 'APPROVED', page: 1, limit: 20 });

    const query = searchRestaurantsRepo.mock.calls[0][0];
    expect(query.normalizedSearch).toBe('pizza hut');
    expect(query.status).toBe('APPROVED');
  });

  it('detail shows old certificates to the admin but not in the public preview', async () => {
    findRestaurantWithDetailsRepo.mockResolvedValue(
      restaurant({ status: 'APPROVED', claimedKashrutLevel: undefined })
    );
    listAllTeudotOfRestaurantRepo.mockResolvedValue([
      {
        _id: 'valid',
        restaurant: 'rest-1',
        status: 'APPROVED',
        hechsher: 'LOCAL_RABBANUT',
        kashrutLevel: 'RABBANUT',
        expirationDate: dateOnlyToDate('2027-01-01'),
      },
      {
        _id: 'old',
        restaurant: 'rest-1',
        status: 'APPROVED',
        hechsher: 'LOCAL_RABBANUT',
        kashrutLevel: 'MEHADRIN',
        expirationDate: dateOnlyToDate('2025-01-01'),
      },
      {
        _id: 'pending',
        restaurant: 'rest-1',
        status: 'PENDING',
        hechsher: 'LOCAL_RABBANUT',
        kashrutLevel: 'RABBANUT',
        expirationDate: dateOnlyToDate('2027-06-01'),
      },
    ]);

    const result = await getRestaurantForAdminService('rest-1');

    expect(result.teudot.map((teuda) => [teuda.id, teuda.visibility])).toEqual([
      ['valid', 'VALID'],
      ['old', 'ADMIN_ONLY'],
      ['pending', 'VALID'],
    ]);
    expect(result.teudot[2].conflicts).toHaveLength(1);
    expect(result.publicKashrutPreview.items).toHaveLength(1);
    expect(result.publicKashrutPreview.primary.teudaId).toBe('valid');
  });

  it('detail has no public preview for a restaurant that is not approved', async () => {
    findRestaurantWithDetailsRepo.mockResolvedValue(restaurant());
    listAllTeudotOfRestaurantRepo.mockResolvedValue([]);

    const result = await getRestaurantForAdminService('rest-1');

    expect(result.publicKashrutPreview).toBeNull();
  });
});
