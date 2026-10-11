// NEW (Milestone 4): real HTTP requests to the public restaurant page route (no database, service mocked).
// חדש (אבן דרך 4): בקשות HTTP אמיתיות לנתיב הדף הציבורי של מסעדה (בלי מסד נתונים, השירות מדומה).
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';

vi.mock('../src/config/env.js', () => ({
  env: { jwtSecret: 'test-secret-that-is-long-enough-for-jwt-signing', jwtExpiresIn: '24h', nodeEnv: 'test' },
}));

vi.mock('../src/services/restaurantDetailsService.js', () => ({
  getPublicRestaurantDetailsService: vi.fn(),
}));

vi.mock('../src/services/restaurantSearchService.js', () => ({
  searchRestaurantsService: vi.fn(),
  getRestaurantSuggestionsService: vi.fn(),
}));

vi.mock('../src/services/restaurantSubmissionService.js', () => ({ submitRestaurantService: vi.fn() }));
vi.mock('../src/services/teudaSubmissionService.js', () => ({
  getSubmissionContextService: vi.fn(),
  submitTeudaService: vi.fn(),
}));

import { getPublicRestaurantDetailsService } from '../src/services/restaurantDetailsService.js';
import { getRestaurantSuggestionsService } from '../src/services/restaurantSearchService.js';
import restaurantRoutes from '../src/routes/restaurantRoutes.js';
import { appError } from '../src/utils/appError.js';
import { errorMiddleware, notFoundMiddleware } from '../src/middleware/errorMiddleware.js';

const VALID_ID = '64b7f0f2a1b2c3d4e5f60718';

let server;
let baseUrl;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/restaurants', restaurantRoutes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/restaurants`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

beforeEach(() => {
  vi.clearAllMocks();
  getRestaurantSuggestionsService.mockResolvedValue({ suggestions: [] });
});

describe('GET /api/restaurants/:restaurantId', () => {
  it('works without logging in and returns the public page', async () => {
    getPublicRestaurantDetailsService.mockResolvedValue({ id: VALID_ID, name: 'Pizza Hut' });

    const response = await fetch(`${baseUrl}/${VALID_ID}`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: VALID_ID, name: 'Pizza Hut' });
    expect(getPublicRestaurantDetailsService).toHaveBeenCalledWith(VALID_ID);
  });

  it('answers 404 with the service message for a restaurant that is not public', async () => {
    getPublicRestaurantDetailsService.mockRejectedValue(appError('Restaurant not found', 404));

    const response = await fetch(`${baseUrl}/${VALID_ID}`);

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ message: 'Restaurant not found' });
  });

  it('answers 400 for an id that is not an ObjectId and never calls the service', async () => {
    for (const badId of ['abc', '123', '64b7f0f2a1b2c3d4e5f6071', '%7B%22%24ne%22%3A1%7D']) {
      const response = await fetch(`${baseUrl}/${badId}`);
      expect(response.status, badId).toBe(400);
    }

    expect(getPublicRestaurantDetailsService).not.toHaveBeenCalled();
  });

  it('does not take over the suggestions route', async () => {
    await fetch(`${baseUrl}/suggestions?q=pizza`);

    expect(getRestaurantSuggestionsService).toHaveBeenCalledTimes(1);
    expect(getPublicRestaurantDetailsService).not.toHaveBeenCalled();
  });
});
