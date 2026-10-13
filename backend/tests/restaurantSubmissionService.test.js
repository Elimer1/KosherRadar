import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/repositories/restaurantRepository.js', () => ({
  createRestaurantRepo: vi.fn(),
  deleteRestaurantByIdRepo: vi.fn(),
  findPendingRestaurantBySubmitterRepo: vi.fn(),
  findRestaurantByIdRepo: vi.fn(),
  findDuplicateCandidatesRepo: vi.fn(),
  findNearbyRestaurantsRepo: vi.fn(),
}));

vi.mock('../src/repositories/teudaRepository.js', () => ({
  createTeudaRepo: vi.fn(),
  findApprovedTeudotByRestaurantRepo: vi.fn(),
  findSimilarPendingTeudaRepo: vi.fn(),
}));

vi.mock('../src/services/duplicateService.js', () => ({
  findPossibleDuplicatesService: vi.fn(),
}));

vi.mock('../src/services/imageUploadService.js', () => ({
  checkImageFile: vi.fn(),
  uploadTeudaImageService: vi.fn(),
  deleteImageService: vi.fn(),
}));

vi.mock('../src/services/placesService.js', () => ({
  geocodeAddressService: vi.fn(async () => ({ status: 'unavailable' })),
}));

import {
  createRestaurantRepo,
  deleteRestaurantByIdRepo,
  findPendingRestaurantBySubmitterRepo,
} from '../src/repositories/restaurantRepository.js';
import { createTeudaRepo } from '../src/repositories/teudaRepository.js';
import { findPossibleDuplicatesService } from '../src/services/duplicateService.js';
import { deleteImageService, uploadTeudaImageService } from '../src/services/imageUploadService.js';
import { geocodeAddressService } from '../src/services/placesService.js';
import { submitRestaurantService } from '../src/services/restaurantSubmissionService.js';

const user = { _id: 'user-1', role: 'USER' };
const file = { buffer: Buffer.alloc(20), size: 20 };

const restaurantData = () => ({
  name: 'Pizza Hut',
  address: '1 Main St, Jerusalem',
  foodType: 'DAIRY',
  categories: ['RESTAURANT'],
  foodKeywords: [],
});

const teudaData = () => ({
  hechsher: 'BADATZ_BEIT_YOSEF',
  kashrutLevel: 'MEHADRIN',
  expirationDate: '2026-12-31',
  mashgiachName: 'Moshe Cohen',
  mashgiachPhone: '050-1234567',
});

describe('submitRestaurantService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T09:00:00.000Z'));
    findPendingRestaurantBySubmitterRepo.mockResolvedValue(null);
    findPossibleDuplicatesService.mockResolvedValue([]);
    uploadTeudaImageService.mockResolvedValue({
      photoUrl: 'https://res.cloudinary.com/photo.jpg',
      cloudinaryPublicId: 'kosherradar/teudot/photo',
    });
    createRestaurantRepo.mockImplementation(async (data) => ({ ...data, _id: 'rest-1' }));
    createTeudaRepo.mockImplementation(async (data) => ({ ...data, _id: 'teuda-1' }));
  });

  afterEach(() => vi.useRealTimers());

  it('saves a restaurant as PENDING owned by the user, without creating a teuda', async () => {
    const result = await submitRestaurantService({ restaurantData: restaurantData(), user });

    expect(result).toEqual({
      restaurant: { id: 'rest-1', status: 'PENDING' },
      teuda: null,
      possibleDuplicateCount: 0,
      locationStatus: 'unavailable',
    });
    expect(createRestaurantRepo.mock.calls[0][0]).toMatchObject({
      name: 'Pizza Hut',
      status: 'PENDING',
      submittedBy: 'user-1',
    });
    expect(createTeudaRepo).not.toHaveBeenCalled();
    expect(uploadTeudaImageService).not.toHaveBeenCalled();
  });

  it('passes normalized locality to pending duplicate detection', async () => {
    await submitRestaurantService({ restaurantData: { ...restaurantData(), city: '  TEL AVIV! ' }, user });
    expect(findPendingRestaurantBySubmitterRepo).toHaveBeenCalledWith(expect.objectContaining({ cityNormalized: 'tel aviv' }));
  });

  it('forces PENDING even for an admin user (approval belongs to the moderation workflow)', async () => {
    await submitRestaurantService({
      restaurantData: { ...restaurantData(), status: 'APPROVED' },
      user: { _id: 'admin-1', role: 'ADMIN' },
    });

    expect(createRestaurantRepo.mock.calls[0][0].status).toBe('PENDING');
  });

  it('saves a pending teuda marked as sent with a new restaurant', async () => {
    const result = await submitRestaurantService({
      restaurantData: restaurantData(),
      teudaData: teudaData(),
      file,
      user,
    });

    expect(result.teuda).toEqual({ id: 'teuda-1', status: 'PENDING' });
    expect(createTeudaRepo.mock.calls[0][0]).toMatchObject({
      restaurant: 'rest-1',
      status: 'PENDING',
      submittedBy: 'user-1',
      submittedWithNewRestaurant: true,
      photoUrl: 'https://res.cloudinary.com/photo.jpg',
    });
    expect(createTeudaRepo.mock.calls[0][0].kashrutLevel).toBeUndefined();
    expect(createTeudaRepo.mock.calls[0][0].photoFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it('stores a photo without a kashrut level as pending evidence', async () => {
    const result = await submitRestaurantService({
      restaurantData: restaurantData(),
      teudaData: { hechsher: 'BADATZ_BEIT_YOSEF', kashrutLevel: 'MEHADRIN' },
      file,
      user,
    });

    expect(result.teuda.status).toBe('PENDING');
    expect(createTeudaRepo.mock.calls[0][0]).toMatchObject({
      hechsher: 'BADATZ_BEIT_YOSEF',
      status: 'PENDING',
      photoUrl: 'https://res.cloudinary.com/photo.jpg',
    });
    expect(createTeudaRepo.mock.calls[0][0].kashrutLevel).toBeUndefined();
    expect(createTeudaRepo.mock.calls[0][0].expirationDate).toBeUndefined();
  });

  it('keeps coordinates the user already chose and does not geocode them again', async () => {
    const result = await submitRestaurantService({
      restaurantData: { ...restaurantData(), latitude: 31.78, longitude: 35.22 },
      user,
    });

    expect(geocodeAddressService).not.toHaveBeenCalled();
    expect(result.locationStatus).toBe('selected');
    expect(createRestaurantRepo.mock.calls[0][0]).toMatchObject({ latitude: 31.78, longitude: 35.22 });
  });

  it('saves a typed address without coordinates when the geocode is ambiguous', async () => {
    geocodeAddressService.mockResolvedValueOnce({ status: 'ambiguous' });

    const result = await submitRestaurantService({ restaurantData: restaurantData(), user });

    expect(result.locationStatus).toBe('ambiguous');
    expect(createRestaurantRepo.mock.calls[0][0].latitude).toBeUndefined();
  });

  it('saves the restaurant and reports possible duplicates without blocking it', async () => {
    findPossibleDuplicatesService.mockResolvedValue([
      { restaurant: 'older', reasons: ['SAME_PHONE'] },
      { restaurant: 'oldest', reasons: ['SAME_ADDRESS'] },
    ]);

    const result = await submitRestaurantService({ restaurantData: restaurantData(), user });

    expect(result.restaurant.status).toBe('PENDING');
    expect(result.possibleDuplicateCount).toBe(2);
    expect(createRestaurantRepo.mock.calls[0][0].possibleDuplicates).toEqual([
      { restaurant: 'older', reasons: ['SAME_PHONE'] },
      { restaurant: 'oldest', reasons: ['SAME_ADDRESS'] },
    ]);
  });

  it('answers 409 when a concurrent insert loses the pending identity index', async () => {
    createRestaurantRepo.mockRejectedValue(
      Object.assign(new Error('E11000 duplicate key'), {
        code: 11000,
        keyPattern: { submittedBy: 1, nameNormalized: 1, addressNormalized: 1 },
      })
    );

    await expect(
      submitRestaurantService({ restaurantData: restaurantData(), teudaData: teudaData(), file, user })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'You already submitted this restaurant and it is waiting for review',
    });
    expect(deleteImageService).toHaveBeenCalledWith('kosherradar/teudot/photo');
    expect(createTeudaRepo).not.toHaveBeenCalled();
  });

  it('does not treat a different duplicate key as a pending restaurant conflict', async () => {
    const duplicate = Object.assign(new Error('E11000 other'), {
      code: 11000,
      keyPattern: { geoapifyPlaceId: 1 },
    });
    createRestaurantRepo.mockRejectedValue(duplicate);

    await expect(submitRestaurantService({ restaurantData: restaurantData(), user })).rejects.toBe(duplicate);
    expect(createTeudaRepo).not.toHaveBeenCalled();
  });

  it('answers 409 when the same user already has this restaurant waiting for review', async () => {
    findPendingRestaurantBySubmitterRepo.mockResolvedValue({ _id: 'earlier' });

    await expect(
      submitRestaurantService({ restaurantData: restaurantData(), user })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(createRestaurantRepo).not.toHaveBeenCalled();
  });

  it('rejects a photo that arrives without certificate details', async () => {
    await expect(
      submitRestaurantService({ restaurantData: restaurantData(), file, user })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(createRestaurantRepo).not.toHaveBeenCalled();
  });

  it('rejects an expired certificate before anything is uploaded or saved', async () => {
    const expired = { ...teudaData(), expirationDate: '2026-10-10' };

    await expect(
      submitRestaurantService({ restaurantData: restaurantData(), teudaData: expired, file, user })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(uploadTeudaImageService).not.toHaveBeenCalled();
    expect(createRestaurantRepo).not.toHaveBeenCalled();
  });

  it('saves nothing when the photo upload fails', async () => {
    uploadTeudaImageService.mockRejectedValue(Object.assign(new Error('failed'), { statusCode: 502 }));

    await expect(
      submitRestaurantService({ restaurantData: restaurantData(), teudaData: teudaData(), file, user })
    ).rejects.toMatchObject({ statusCode: 502 });
    expect(createRestaurantRepo).not.toHaveBeenCalled();
  });

  it('deletes the uploaded photo when saving the restaurant fails', async () => {
    createRestaurantRepo.mockRejectedValue(new Error('database down'));

    await expect(
      submitRestaurantService({ restaurantData: restaurantData(), teudaData: teudaData(), file, user })
    ).rejects.toThrow('database down');
    expect(deleteImageService).toHaveBeenCalledWith('kosherradar/teudot/photo');
  });

  it('removes the new restaurant and the photo when the teuda cannot be saved', async () => {
    createTeudaRepo.mockRejectedValue(new Error('database down'));

    await expect(
      submitRestaurantService({ restaurantData: restaurantData(), teudaData: teudaData(), file, user })
    ).rejects.toThrow('database down');
    expect(deleteRestaurantByIdRepo).toHaveBeenCalledWith('rest-1');
    expect(deleteImageService).toHaveBeenCalledWith('kosherradar/teudot/photo');
  });

  it('keeps the original error when the restaurant cleanup also fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalError = new Error('teuda database down');
    createTeudaRepo.mockRejectedValue(originalError);
    deleteRestaurantByIdRepo.mockRejectedValue(new Error('cleanup failed'));

    await expect(
      submitRestaurantService({ restaurantData: restaurantData(), teudaData: teudaData(), file, user })
    ).rejects.toBe(originalError);

    expect(deleteImageService).toHaveBeenCalledWith('kosherradar/teudot/photo');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
