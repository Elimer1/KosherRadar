// NEW (Milestone 3): sends real HTTP requests to the admin router (no database): login and role checks,
// validation errors, and that valid requests reach the right service. Services and users are mocked.
// חדש (אבן דרך 3): שולח בקשות HTTP אמיתיות לראוטר המנהל (בלי מסד נתונים): בדיקות התחברות ותפקיד, שגיאות ולידציה.
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';

vi.mock('../src/config/env.js', () => ({
  env: {
    jwtSecret: 'test-secret-that-is-long-enough-for-jwt-signing',
    jwtExpiresIn: '24h',
    nodeEnv: 'test',
  },
}));

vi.mock('../src/repositories/userRepository.js', () => ({
  findUserByIdRepo: vi.fn(),
  createUserRepo: vi.fn(),
  findUserByEmailRepo: vi.fn(),
  findUserByEmailWithPasswordRepo: vi.fn(),
  setUserRoleRepo: vi.fn(),
}));

vi.mock('../src/services/adminTeudaService.js', () => ({
  approveTeudaService: vi.fn(),
  createTeudaByAdminService: vi.fn(),
  deleteTeudaService: vi.fn(),
  listExpiringSoonService: vi.fn(),
  listPendingTeudotService: vi.fn(),
  rejectTeudaService: vi.fn(),
  updateTeudaByAdminService: vi.fn(),
}));

vi.mock('../src/services/adminRestaurantService.js', () => ({
  approveRestaurantService: vi.fn(),
  createRestaurantByAdminService: vi.fn(),
  deleteRestaurantService: vi.fn(),
  getRestaurantForAdminService: vi.fn(),
  listPendingRestaurantsService: vi.fn(),
  rejectRestaurantService: vi.fn(),
  searchRestaurantsForAdminService: vi.fn(),
  updateRestaurantByAdminService: vi.fn(),
}));

vi.mock('../src/services/adminReportService.js', () => ({
  listPendingReportsService: vi.fn(),
  rejectReportService: vi.fn(),
  resolveReportService: vi.fn(),
}));

import { findUserByIdRepo } from '../src/repositories/userRepository.js';
import { signTokenService } from '../src/services/authService.js';
import { approveTeudaService, rejectTeudaService } from '../src/services/adminTeudaService.js';
import { rejectRestaurantService, searchRestaurantsForAdminService } from '../src/services/adminRestaurantService.js';
import { resolveReportService } from '../src/services/adminReportService.js';
import adminRoutes from '../src/routes/adminRoutes.js';
import { errorMiddleware, notFoundMiddleware } from '../src/middleware/errorMiddleware.js';

const VALID_ID = '64b7f0f2a1b2c3d4e5f60718';

let server;
let baseUrl;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/admin`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

const tokenFor = (role) => signTokenService({ _id: `${role}-1`, role });

const call = (path, { method = 'GET', role, body } = {}) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(role ? { Authorization: `Bearer ${tokenFor(role)}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

beforeEach(() => {
  vi.clearAllMocks();
  findUserByIdRepo.mockImplementation(async (id) => ({ _id: id, role: String(id).split('-')[0] }));
});

describe('admin endpoints over HTTP', () => {
  it('answers 401 without a token on every kind of admin endpoint', async () => {
    const attempts = [
      ['/restaurants/pending', 'GET'],
      [`/restaurants/${VALID_ID}/approve`, 'POST'],
      [`/teudot/${VALID_ID}/approve`, 'POST'],
      [`/teudot/${VALID_ID}`, 'DELETE'],
      [`/reports/${VALID_ID}/resolve`, 'POST'],
    ];

    for (const [path, method] of attempts) {
      const response = await call(path, { method });
      expect(response.status, `${method} ${path}`).toBe(401);
    }

    expect(approveTeudaService).not.toHaveBeenCalled();
  });

  it('answers 403 for an ordinary USER on every kind of admin endpoint and never reaches a service', async () => {
    const attempts = [
      ['/restaurants/pending', 'GET'],
      [`/restaurants/${VALID_ID}/approve`, 'POST'],
      [`/teudot/${VALID_ID}/approve`, 'POST'],
      [`/teudot/${VALID_ID}`, 'DELETE'],
      [`/reports/${VALID_ID}/resolve`, 'POST', { resolution: 'APPLY_PROPOSED' }],
    ];

    for (const [path, method, body] of attempts) {
      const response = await call(path, { method, role: 'USER', body });
      expect(response.status, `${method} ${path}`).toBe(403);
    }

    expect(approveTeudaService).not.toHaveBeenCalled();
    expect(resolveReportService).not.toHaveBeenCalled();
  });

  it('lets an ADMIN approve a certificate and returns the service result', async () => {
    approveTeudaService.mockResolvedValue({ teuda: { id: VALID_ID, status: 'APPROVED' }, conflictWarning: [] });

    const response = await call(`/teudot/${VALID_ID}/approve`, { method: 'POST', role: 'ADMIN' });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ teuda: { status: 'APPROVED' } });
    expect(approveTeudaService).toHaveBeenCalledWith({ teudaId: VALID_ID });
  });

  it('rejects a malformed id with 400 before any service runs', async () => {
    const response = await call('/teudot/not-an-id/approve', { method: 'POST', role: 'ADMIN' });

    expect(response.status).toBe(400);
    expect(approveTeudaService).not.toHaveBeenCalled();
  });

  it('requires a reason to reject a restaurant, certificate or report (400 without one)', async () => {
    for (const path of [
      `/restaurants/${VALID_ID}/reject`,
      `/teudot/${VALID_ID}/reject`,
      `/reports/${VALID_ID}/reject`,
    ]) {
      const missing = await call(path, { method: 'POST', role: 'ADMIN', body: {} });
      const blank = await call(path, { method: 'POST', role: 'ADMIN', body: { reason: '   ' } });
      expect(missing.status, path).toBe(400);
      expect(blank.status, path).toBe(400);
    }

    expect(rejectRestaurantService).not.toHaveBeenCalled();
    expect(rejectTeudaService).not.toHaveBeenCalled();
  });

  it('passes a valid rejection reason to the service', async () => {
    rejectTeudaService.mockResolvedValue({ teuda: { status: 'REJECTED' }, emailStatus: 'SENT' });

    const response = await call(`/teudot/${VALID_ID}/reject`, {
      method: 'POST',
      role: 'ADMIN',
      body: { reason: 'The photo is unreadable', status: 'APPROVED' },
    });

    expect(response.status).toBe(200);
    expect(rejectTeudaService).toHaveBeenCalledWith({ teudaId: VALID_ID, reason: 'The photo is unreadable' });
  });

  it('never lets a query-string operator object reach the service', async () => {
    searchRestaurantsForAdminService.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 });

    // Express 5 does not build nested objects from "search[$ne]=x", so the filter simply is not applied.
    // Zod is the second safety net: a repeated key becomes an array and is refused below.
    const nested = await call('/restaurants?search[$ne]=x', { role: 'ADMIN' });
    expect(nested.status).toBe(200);
    expect(searchRestaurantsForAdminService.mock.calls[0][0].search).toBeUndefined();

    const repeated = await call('/restaurants?search=a&search=b', { role: 'ADMIN' });
    expect(repeated.status).toBe(400);
    expect(searchRestaurantsForAdminService).toHaveBeenCalledTimes(1);
  });

  it('passes clean paging and search values to the service', async () => {
    searchRestaurantsForAdminService.mockResolvedValue({ items: [], total: 0, page: 2, limit: 10, totalPages: 1 });

    const response = await call('/restaurants?search=pizza&status=APPROVED&page=2&limit=10', { role: 'ADMIN' });

    expect(response.status).toBe(200);
    expect(searchRestaurantsForAdminService).toHaveBeenCalledWith({
      search: 'pizza',
      status: 'APPROVED',
      page: 2,
      limit: 10,
    });
  });

  it('rejects an unknown resolution for a report', async () => {
    const response = await call(`/reports/${VALID_ID}/resolve`, {
      method: 'POST',
      role: 'ADMIN',
      body: { resolution: 'DELETE_EVERYTHING' },
    });

    expect(response.status).toBe(400);
    expect(resolveReportService).not.toHaveBeenCalled();
  });
});
