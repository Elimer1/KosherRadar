// NEW (ADMINCERT-001): HTTP regressions through real validation and admin services with mocked storage.
// חדש (ADMINCERT-001): בדיקות HTTP עם ולידציה ושירותי מנהל אמיתיים ואחסון מדומה.
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import express from 'express';

// Real routes, validation, controllers, certificate services and image validation.
// Persistence, transactions and external services stay mocked; no database is connected.
vi.mock('../src/config/env.js', () => ({ env: { nodeEnv: 'test' } }));
vi.mock('../src/middleware/authMiddleware.js', () => ({
  authMiddleware: (req, _res, next) => { req.user = { _id: 'admin-1', role: req.headers['x-test-role'] || 'ADMIN' }; next(); },
}));
vi.mock('../src/middleware/rateLimiters.js', () => ({
  uploadRateLimiter: (_req, _res, next) => next(),
  optionalUploadRateLimiter: (_req, _res, next) => next(),
}));
vi.mock('../src/repositories/transaction.js', () => ({ withTransaction: vi.fn(async (work) => work()) }));
vi.mock('../src/repositories/restaurantIntegrityRepository.js');
vi.mock('../src/repositories/restaurantRepository.js');
vi.mock('../src/repositories/teudaRepository.js');
vi.mock('../src/repositories/adminTeudaRepository.js');
vi.mock('../src/repositories/adminRestaurantRepository.js');
vi.mock('../src/repositories/adminReportRepository.js');
vi.mock('../src/repositories/userRepository.js');
vi.mock('../src/repositories/imageCleanupRepository.js');
vi.mock('../src/services/duplicateService.js', () => ({ findPossibleDuplicatesService: vi.fn(async () => []) }));
vi.mock('../src/services/emailService.js');
vi.mock('../src/services/imageUploadService.js', async (importOriginal) => ({
  ...await importOriginal(), uploadTeudaImageService: vi.fn(), deleteImageService: vi.fn(),
}));

import routes from '../src/routes/adminRoutes.js';
import { errorMiddleware } from '../src/middleware/errorMiddleware.js';
import { createTeudaRepo, findTeudaByIdRepo } from '../src/repositories/teudaRepository.js';
import { createRestaurantRepo, findRestaurantByIdRepo } from '../src/repositories/restaurantRepository.js';
import { saveTeudaChangesRepo } from '../src/repositories/adminTeudaRepository.js';
import { awardPointsOnceRepo } from '../src/repositories/userRepository.js';
import { uploadTeudaImageService } from '../src/services/imageUploadService.js';
import { buildKashrutSummary } from '../src/services/kashrutStatusService.js';

const ID = '64b7f0f2a1b2c3d4e5f60718';
const restaurant = { _id: ID, name: 'Cafe', address: '1 Main St', status: 'APPROVED' };
const fields = { hechsher: 'LOCAL_RABBANUT', hechsherOther: '', kashrutLevel: 'RABBANUT',
  expirationDate: '2027-01-01', mashgiachName: 'Dan', mashgiachPhone: '050-1234567' };
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
let server, url;
beforeAll(async () => {
  const app = express();
  app.use(express.json()); app.use(routes); app.use(errorMiddleware);
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  url = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => new Promise((resolve) => server.close(resolve)));
beforeEach(() => {
  vi.clearAllMocks();
  findRestaurantByIdRepo.mockResolvedValue(restaurant);
  createRestaurantRepo.mockImplementation(async (data) => ({ ...data, _id: ID }));
  createTeudaRepo.mockImplementation(async (data) => ({ ...data, _id: ID }));
  findTeudaByIdRepo.mockResolvedValue({ ...fields, _id: ID, restaurant: ID, status: 'APPROVED', hechsher: 'OTHER', hechsherOther: 'Old name' });
  saveTeudaChangesRepo.mockImplementation(async (doc, data) => ({ ...doc, ...data }));
  uploadTeudaImageService.mockResolvedValue({ photoUrl: 'https://example.com/cert.png', cloudinaryPublicId: 'mock-photo' });
});

const add = (overrides = {}, { initial = false, photo = png, role = 'ADMIN' } = {}) => {
  const body = new FormData();
  body.append('teuda', JSON.stringify({ ...fields, ...overrides }));
  if (initial) body.append('restaurant', JSON.stringify({ name: 'Cafe', address: '1 Main St', foodType: 'DAIRY', categories: ['CAFE'] }));
  if (photo) body.append('photo', new Blob([photo], { type: 'image/png' }), 'certificate.png');
  return fetch(url + (initial ? '/restaurants' : `/restaurants/${ID}/teudot`), {
    method: 'POST', headers: { 'x-test-role': role }, body,
  });
};

it.each([false, true])('creates immediately authoritative LOCAL_RABBANUT certificates without points (initial=%s)', async (initial) => {
  const response = await add({}, { initial });
  expect(response.status).toBe(201);
  const result = await response.json();
  expect(result.teuda).toMatchObject({ hechsher: 'LOCAL_RABBANUT', hechsherOther: null, status: 'APPROVED', visibility: 'VALID', submittedBy: { id: 'admin-1' } });
  const saved = createTeudaRepo.mock.calls[0][0];
  expect(saved.hechsherOther).toBeUndefined();
  expect(saved).toMatchObject({ status: 'APPROVED', submittedBy: 'admin-1', submittedWithNewRestaurant: false });
  const summary = buildKashrutSummary(restaurant, [{ ...saved, _id: ID }], '2026-10-13');
  expect(summary).toMatchObject({ status: 'VERIFIED' });
  expect(awardPointsOnceRepo).not.toHaveBeenCalled();
});

it('accepts OTHER with a valid trimmed name through the actual service', async () => {
  const response = await add({ hechsher: 'OTHER', hechsherOther: '  Rabbi Levi  ' });
  expect(response.status).toBe(201);
  expect((await response.json()).teuda.hechsherOther).toBe('Rabbi Levi');
  expect(createTeudaRepo.mock.calls[0][0].hechsherOther).toBe('Rabbi Levi');
  expect(awardPointsOnceRepo).not.toHaveBeenCalled();
});

it.each([undefined, '', '   '])('rejects OTHER without a name (%j) before upload/persistence', async (hechsherOther) => {
  const response = await add({ hechsher: 'OTHER', hechsherOther });
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ code: 'VALIDATION_ERROR', errors: expect.arrayContaining([
    expect.objectContaining({ field: 'teuda.hechsherOther', message: 'Enter the name of the hechsher' }),
  ]) });
  expect(uploadTeudaImageService).not.toHaveBeenCalled();
  expect(createTeudaRepo).not.toHaveBeenCalled();
});

it.each([
  { hechsher: 'MADE_UP' }, { kashrutLevel: '' }, { expirationDate: '' }, { expirationDate: '2027-02-30' },
  { mashgiachName: '' }, { mashgiachPhone: 'invalid' }, { hechsherOther: {} }, { hechsherOther: 'x'.repeat(101) },
])('keeps rejecting invalid certificate data %j', async (invalid) => {
  expect((await add(invalid)).status).toBe(400);
  expect(uploadTeudaImageService).not.toHaveBeenCalled();
  expect(createTeudaRepo).not.toHaveBeenCalled();
});

it.each([null, new Uint8Array([1, 2, 3])])('keeps real required photo validation (%j)', async (photo) => {
  expect((await add({}, { photo })).status).toBe(400);
  expect(uploadTeudaImageService).not.toHaveBeenCalled();
  expect(createTeudaRepo).not.toHaveBeenCalled();
});

it('edits OTHER back to a standard hechsher, clearing the old name and preserving approval', async () => {
  const response = await fetch(`${url}/teudot/${ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teuda: fields }) });
  expect(response.status).toBe(200);
  expect((await response.json()).teuda).toMatchObject({ hechsher: 'LOCAL_RABBANUT', hechsherOther: null, status: 'APPROVED' });
  expect(saveTeudaChangesRepo.mock.calls[0][1].hechsherOther).toBeUndefined();
  expect(awardPointsOnceRepo).not.toHaveBeenCalled();
});

it('preserves administrator authorization on creation', async () => {
  expect((await add({}, { role: 'USER' })).status).toBe(403);
  expect(createTeudaRepo).not.toHaveBeenCalled();
});
