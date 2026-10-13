// NEW (Agent 3): verify authenticated history scoping through the actual router.
// חדש (סוכן 3): בדיקת הרשאות היסטוריה דרך הנתב האמיתי.
import express from 'express';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
vi.mock('../src/services/authService.js', () => ({ getUserFromTokenService: vi.fn() }));
vi.mock('../src/services/userSubmissionsService.js', () => ({ getMySubmissionsService: vi.fn() }));
import { getUserFromTokenService } from '../src/services/authService.js';
import { getMySubmissionsService } from '../src/services/userSubmissionsService.js';
import userRoutes from '../src/routes/userRoutes.js';
import { errorMiddleware } from '../src/middleware/errorMiddleware.js';
let server; let baseUrl;
beforeAll(async () => {
  const app = express(); app.use('/api/users', userRoutes); app.use(errorMiddleware);
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/users/me/submissions`;
});
afterAll(async () => { await new Promise((resolve) => server.close(resolve)); });
beforeEach(() => { vi.clearAllMocks(); });
it('rejects anonymous history requests without reading submissions', async () => {
  const response = await fetch(baseUrl);
  expect(response.status).toBe(401);
  expect(getMySubmissionsService).not.toHaveBeenCalled();
});
it('uses the authenticated identity rather than client-supplied userId', async () => {
  getUserFromTokenService.mockResolvedValue({ _id: 'authenticated-user', role: 'ADMIN' });
  getMySubmissionsService.mockResolvedValue({ restaurants: [], teudot: [], reports: [{ correctionApplied: true, points: 0 }] });
  const response = await fetch(`${baseUrl}?userId=another-user`, { headers: { authorization: 'Bearer mocked-token' } });
  expect(response.status).toBe(200);
  expect(getMySubmissionsService).toHaveBeenCalledWith('authenticated-user');
  expect((await response.json()).reports[0]).toEqual({ correctionApplied: true, points: 0 });
});
