import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import express from 'express';
vi.mock('../src/config/env.js', () => ({ env: { nodeEnv: 'test' } }));
vi.mock('../src/middleware/authMiddleware.js', () => ({
  authMiddleware: (req, res, next) => { req.user = { _id: 'test', role: req.headers['x-test-role'] }; next(); },
}));
vi.mock('../src/services/restaurantSubmissionService.js', () => ({ submitRestaurantService: vi.fn() }));
vi.mock('../src/services/teudaSubmissionService.js', () => ({ submitTeudaService: vi.fn(), getSubmissionContextService: vi.fn() }));
import routes from '../src/routes/restaurantRoutes.js';
import { errorMiddleware } from '../src/middleware/errorMiddleware.js';
import { submitRestaurantService } from '../src/services/restaurantSubmissionService.js';
import { submitTeudaService } from '../src/services/teudaSubmissionService.js';
let server, url;
beforeAll(async () => {
  const app = express(); app.use(express.json()); app.use(routes); app.use(errorMiddleware);
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  url = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => new Promise((resolve) => server.close(resolve)));
beforeEach(() => vi.clearAllMocks());
it.each(['/', '/507f1f77bcf86cd799439011/teudot'])('rejects ADMIN on %s before parsing uploads or validating incomplete claims', async (path) => {
  const response = await fetch(url + path, { method: 'POST', headers: { 'x-test-role': 'ADMIN', 'Content-Type': 'application/json' }, body: '{}' });
  expect(response.status).toBe(403);
  expect(submitRestaurantService).not.toHaveBeenCalled();
  expect(submitTeudaService).not.toHaveBeenCalled();
});
