import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
import {
  createTeudaRepo,
  findApprovedTeudotByRestaurantRepo,
  findSimilarPendingTeudaRepo,
} from '../src/repositories/teudaRepository.js';
import {
  deleteImageService,
  uploadTeudaImageService,
} from '../src/services/imageUploadService.js';
import {
  getSubmissionContextService,
  submitTeudaService,
} from '../src/services/teudaSubmissionService.js';
import { dateOnlyToDate } from '../src/utils/israelDate.js';

const user = { _id: 'user-1' };
const file = { buffer: Buffer.alloc(20), size: 20 };

const teudaData = () => ({
  hechsher: 'BADATZ_BEIT_YOSEF',
  kashrutLevel: 'MEHADRIN',
  expirationDate: '2026-12-31',
  mashgiachName: 'Moshe Cohen',
  mashgiachPhone: '050-1234567',
});

describe('submitTeudaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T09:00:00.000Z'));
    findRestaurantByIdRepo.mockResolvedValue({ _id: 'rest-1', status: 'APPROVED' });
    findSimilarPendingTeudaRepo.mockResolvedValue(null);
    uploadTeudaImageService.mockResolvedValue({
      photoUrl: 'https://res.cloudinary.com/photo.jpg',
      cloudinaryPublicId: 'kosherradar/teudot/photo',
    });
    createTeudaRepo.mockImplementation(async (data) => ({ ...data, _id: 'teuda-1' }));
  });

  afterEach(() => vi.useRealTimers());

  it('saves a PENDING teuda owned by the logged-in user', async () => {
    const result = await submitTeudaService({
      restaurantId: 'rest-1',
      teudaData: teudaData(),
      file,
      user,
    });

    expect(result).toEqual({ id: 'teuda-1', status: 'PENDING' });
    const saved = createTeudaRepo.mock.calls[0][0];
    expect(saved).toMatchObject({
      restaurant: 'rest-1',
      status: 'PENDING',
      submittedBy: 'user-1',
      submittedWithNewRestaurant: false,
      photoUrl: 'https://res.cloudinary.com/photo.jpg',
      cloudinaryPublicId: 'kosherradar/teudot/photo',
    });
    expect(saved.expirationDate).toEqual(dateOnlyToDate('2026-12-31'));
  });

  it('does not touch existing approved teudot (only creates a new pending record)', async () => {
    await submitTeudaService({ restaurantId: 'rest-1', teudaData: teudaData(), file, user });

    expect(createTeudaRepo).toHaveBeenCalledTimes(1);
    expect(findApprovedTeudotByRestaurantRepo).not.toHaveBeenCalled();
  });

  it('returns 404 for a restaurant that does not exist', async () => {
    findRestaurantByIdRepo.mockResolvedValue(null);

    await expect(
      submitTeudaService({ restaurantId: 'missing', teudaData: teudaData(), file, user })
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(uploadTeudaImageService).not.toHaveBeenCalled();
  });

  it('returns 404 for a pending or rejected restaurant, so hidden restaurants are not exposed', async () => {
    findRestaurantByIdRepo.mockResolvedValue({ _id: 'rest-1', status: 'PENDING' });

    await expect(
      submitTeudaService({ restaurantId: 'rest-1', teudaData: teudaData(), file, user })
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(createTeudaRepo).not.toHaveBeenCalled();
  });

  it('rejects an expired certificate before uploading anything', async () => {
    const data = { ...teudaData(), expirationDate: '2026-10-10' };

    await expect(
      submitTeudaService({ restaurantId: 'rest-1', teudaData: data, file, user })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(uploadTeudaImageService).not.toHaveBeenCalled();
  });

  it('accepts a certificate that expires today in Israel', async () => {
    const data = { ...teudaData(), expirationDate: '2026-10-11' };

    await expect(
      submitTeudaService({ restaurantId: 'rest-1', teudaData: data, file, user })
    ).resolves.toMatchObject({ status: 'PENDING' });
  });

  it('answers 409 and does not upload when the same certificate is already waiting for review', async () => {
    findSimilarPendingTeudaRepo.mockResolvedValue({ _id: 'earlier' });

    await expect(
      submitTeudaService({ restaurantId: 'rest-1', teudaData: teudaData(), file, user })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(uploadTeudaImageService).not.toHaveBeenCalled();
  });

  it('does not save anything when the upload fails', async () => {
    uploadTeudaImageService.mockRejectedValue(Object.assign(new Error('upload failed'), { statusCode: 502 }));

    await expect(
      submitTeudaService({ restaurantId: 'rest-1', teudaData: teudaData(), file, user })
    ).rejects.toMatchObject({ statusCode: 502 });
    expect(createTeudaRepo).not.toHaveBeenCalled();
  });

  it('deletes the uploaded photo when saving to the database fails', async () => {
    createTeudaRepo.mockRejectedValue(new Error('database down'));

    await expect(
      submitTeudaService({ restaurantId: 'rest-1', teudaData: teudaData(), file, user })
    ).rejects.toThrow('database down');
    expect(deleteImageService).toHaveBeenCalledWith('kosherradar/teudot/photo');
  });
});

describe('getSubmissionContextService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T09:00:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  const approvedTeuda = (id, dateOnly) => ({
    _id: id,
    status: 'APPROVED',
    hechsher: 'BADATZ_MACHPUD',
    kashrutLevel: 'RABBANUT',
    expirationDate: dateOnlyToDate(dateOnly),
    adminNote: 'private',
    mashgiachPhone: '050-0000000',
    photoUrl: 'https://res.cloudinary.com/photo.jpg',
  });

  it('lists valid and recently expired teudot but never the admin-only old ones', async () => {
    findRestaurantByIdRepo.mockResolvedValue({
      _id: 'rest-1',
      name: 'Cafe',
      address: '1 Main St',
      status: 'APPROVED',
    });
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([
      approvedTeuda('valid', '2027-01-01'),
      approvedTeuda('recent', '2026-08-01'),
      approvedTeuda('old', '2025-12-01'),
    ]);

    const context = await getSubmissionContextService('rest-1');

    expect(context.teudot.map((teuda) => teuda.id)).toEqual(['valid', 'recent']);
    expect(context.teudot.map((teuda) => teuda.visibility)).toEqual(['VALID', 'RECENT_EXPIRED']);
  });

  it('exposes only the fields needed to pick a certificate (no notes, photo or phone)', async () => {
    findRestaurantByIdRepo.mockResolvedValue({
      _id: 'rest-1',
      name: 'Cafe',
      address: '1 Main St',
      status: 'APPROVED',
    });
    findApprovedTeudotByRestaurantRepo.mockResolvedValue([approvedTeuda('valid', '2027-01-01')]);

    const context = await getSubmissionContextService('rest-1');

    expect(Object.keys(context.teudot[0]).sort()).toEqual(
      ['expirationDate', 'hechsher', 'hechsherOther', 'id', 'kashrutLevel', 'visibility'].sort()
    );
    expect(context.restaurant).toEqual({ id: 'rest-1', name: 'Cafe', address: '1 Main St', city: null });
  });

  it('returns 404 for a restaurant that is not approved', async () => {
    findRestaurantByIdRepo.mockResolvedValue({ _id: 'rest-1', status: 'PENDING' });

    await expect(getSubmissionContextService('rest-1')).rejects.toMatchObject({ statusCode: 404 });
  });
});
