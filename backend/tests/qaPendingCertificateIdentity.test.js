vi.mock('../src/repositories/transaction.js', () => ({ withTransaction: vi.fn(async (work) => work()) }));
vi.mock('../src/repositories/restaurantIntegrityRepository.js', () => ({ lockRestaurantForWriteRepo: vi.fn() }));
vi.mock('../src/repositories/imageCleanupRepository.js', () => ({
  enqueueImageCleanupRepo: vi.fn(),
  findImageCleanupRepo: vi.fn(async (ids) => (ids || []).map((publicId) => ({ publicId }))),
  completeImageCleanupRepo: vi.fn(), failImageCleanupRepo: vi.fn(),
}));
// NEW (QA): what the add-certificate flow uses as a "same certificate" lookup. No database or upload.
// חדש (בדיקות): לפי מה זרימת הוספת התעודה מחליטה שזו אותה תעודה. בלי מסד נתונים ובלי העלאה.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/restaurantRepository.js', () => ({
  findRestaurantByIdRepo: vi.fn(),
}));

vi.mock('../src/repositories/teudaRepository.js', () => ({
  createTeudaRepo: vi.fn(),
  findApprovedTeudotByRestaurantRepo: vi.fn(),
  findSimilarPendingTeudaRepo: vi.fn(),
  findTeudaByIdRepo: vi.fn(),
}));

vi.mock('../src/services/imageUploadService.js', () => ({
  checkImageFile: vi.fn(),
  uploadTeudaImageService: vi.fn(),
  deleteImageService: vi.fn(),
}));

import { findRestaurantByIdRepo } from '../src/repositories/restaurantRepository.js';
import { createTeudaRepo, findSimilarPendingTeudaRepo } from '../src/repositories/teudaRepository.js';
import { uploadTeudaImageService } from '../src/services/imageUploadService.js';
import { submitTeudaService } from '../src/services/teudaSubmissionService.js';
import { dateOnlyToDate } from '../src/utils/israelDate.js';

const user = { _id: 'user-1' };

const submit = (teudaData, file) =>
  submitTeudaService({
    restaurantId: 'rest-1',
    teudaData,
    file,
    user,
  });

describe('pending certificate duplicate lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findRestaurantByIdRepo.mockResolvedValue({ _id: 'rest-1', status: 'APPROVED', name: 'Cafe' });
    findSimilarPendingTeudaRepo.mockResolvedValue(null);
    createTeudaRepo.mockImplementation(async (data) => ({ ...data, _id: 'teuda-new' }));
    uploadTeudaImageService.mockResolvedValue({
      photoUrl: 'https://example.com/photo.jpg',
      cloudinaryPublicId: 'kosherradar/teudot/photo',
    });
  });

  it('drops a client kashrut level and looks up the pending duplicate by the expiration date', async () => {
    await submit({
      hechsher: 'BADATZ_BEIT_YOSEF',
      kashrutLevel: 'MEHADRIN',
      expirationDate: '2027-01-15',
      mashgiachName: 'Avi Cohen',
    });

    expect(findSimilarPendingTeudaRepo).toHaveBeenCalledWith({
      restaurant: 'rest-1',
      submittedBy: 'user-1',
      hechsher: 'BADATZ_BEIT_YOSEF',
      hechsherOther: undefined,
      kashrutLevel: null,
      expirationDate: dateOnlyToDate('2027-01-15'),
    });
    expect(createTeudaRepo.mock.calls[0][0].kashrutLevel).toBeUndefined();
    expect(uploadTeudaImageService).not.toHaveBeenCalled();
  });

  // QA-001: two undated certificates of the same hechsher are not the same certificate when the
  // mashgiach differs. The lookup must differ, so the second submission is not rejected as a duplicate.
  // QA-001: שתי תעודות בלי תאריך מאותה השגחה אינן אותה תעודה כשהמשגיח שונה. החיפוש חייב להיות שונה.
  it('treats undated certificates with different mashgichim as different pending submissions', async () => {
    await submit({ hechsher: 'BADATZ_BEIT_YOSEF', mashgiachName: 'Avi Cohen' });
    await submit({ hechsher: 'BADATZ_BEIT_YOSEF', mashgiachName: 'Dana Levi' });

    const [first] = findSimilarPendingTeudaRepo.mock.calls[0];
    const [second] = findSimilarPendingTeudaRepo.mock.calls[1];

    expect(first).not.toEqual(second);
  });
});
