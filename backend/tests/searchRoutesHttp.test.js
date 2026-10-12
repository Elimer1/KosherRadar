// NEW (Milestone 4): real HTTP requests to the public search routes (no database, services mocked):
// no login needed, query validation, the service only ever receives validated values.
// חדש (אבן דרך 4): בקשות HTTP אמיתיות לנתיבי החיפוש הציבוריים: בלי התחברות, בדיקת שאילתה, השירות מקבל רק ערכים נבדקים.
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';

vi.mock('../src/config/env.js', () => ({
  env: { jwtSecret: 'test-secret-that-is-long-enough-for-jwt-signing', jwtExpiresIn: '24h', nodeEnv: 'test' },
}));

vi.mock('../src/services/restaurantSearchService.js', () => ({
  searchRestaurantsService: vi.fn(),
  getRestaurantSuggestionsService: vi.fn(),
  findMapRestaurantsService: vi.fn(),
}));

vi.mock('../src/services/restaurantSubmissionService.js', () => ({ submitRestaurantService: vi.fn() }));
vi.mock('../src/services/teudaSubmissionService.js', () => ({
  getSubmissionContextService: vi.fn(),
  submitTeudaService: vi.fn(),
}));

import {
  findMapRestaurantsService,
  getRestaurantSuggestionsService,
  searchRestaurantsService,
} from '../src/services/restaurantSearchService.js';
import restaurantRoutes from '../src/routes/restaurantRoutes.js';
import { errorMiddleware, notFoundMiddleware } from '../src/middleware/errorMiddleware.js';

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

const emptyResult = { items: [], page: 1, pageSize: 20, total: 0, hasMore: false, capped: false };

beforeEach(() => {
  vi.clearAllMocks();
  searchRestaurantsService.mockResolvedValue(emptyResult);
  getRestaurantSuggestionsService.mockResolvedValue({ suggestions: [] });
  findMapRestaurantsService.mockResolvedValue({ items: [], total: 0, capped: false, search: { mode: 'BASIC', atlasUnavailable: false } });
});

describe('GET /api/restaurants (search)', () => {
  it('works without logging in', async () => {
    const response = await fetch(baseUrl);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(emptyResult);
  });

  it('gives the service the validated and converted values', async () => {
    await fetch(`${baseUrl}?q=pizza&level=MEHADRIN&foodType=MEAT,DAIRY&hideExpired=true&lat=31.7&lng=35.2&radiusKm=5&page=2`);

    expect(searchRestaurantsService).toHaveBeenCalledWith({
      q: 'pizza',
      level: 'MEHADRIN',
      hechsher: [],
      foodType: ['MEAT', 'DAIRY'],
      category: [],
      hideExpired: true,
      includeUnknown: false,
      lat: 31.7,
      lng: 35.2,
      radiusKm: 5,
      page: 2,
    });
  });

  it('answers 400 for a bad filter value and never calls the service', async () => {
    for (const badQuery of ['level=SUPER', 'radiusKm=7&lat=31&lng=35', 'page=0', 'radiusKm=5', 'lat=31']) {
      const response = await fetch(`${baseUrl}?${badQuery}`);
      expect(response.status, badQuery).toBe(400);
    }

    expect(searchRestaurantsService).not.toHaveBeenCalled();
  });

  it('answers 400 for repeated keys, which would otherwise become an array', async () => {
    for (const badQuery of ['q=a&q=b', 'level=MEHADRIN&level=RABBANUT', 'page=1&page=2']) {
      const response = await fetch(`${baseUrl}?${badQuery}`);
      expect(response.status, badQuery).toBe(400);
    }

    expect(searchRestaurantsService).not.toHaveBeenCalled();
  });

  it('never lets an injected object like q[$ne]=x reach the service (Express 5 keeps it as a plain, ignored key)', async () => {
    const response = await fetch(`${baseUrl}?q[$ne]=x&level[$gt]=&foodType[]=MEAT`);

    expect(response.status).toBe(200);

    const received = searchRestaurantsService.mock.calls[0][0];
    expect(received.q).toBeUndefined();
    expect(received.level).toBeUndefined();
    expect(received.foodType).toEqual([]);
  });

  it('does not treat the word "suggestions" as a restaurant id', async () => {
    await fetch(`${baseUrl}/suggestions?q=pizza`);

    expect(getRestaurantSuggestionsService).toHaveBeenCalledTimes(1);
    expect(searchRestaurantsService).not.toHaveBeenCalled();
  });
});

describe('GET /api/restaurants/suggestions', () => {
  it('works without logging in and returns the suggestions', async () => {
    getRestaurantSuggestionsService.mockResolvedValue({ suggestions: [{ id: 'r1', name: 'Pizza Hut' }] });

    const response = await fetch(`${baseUrl}/suggestions?q=pi`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ suggestions: [{ id: 'r1', name: 'Pizza Hut' }] });
  });

  it('answers 400 under 2 characters, and for a missing or injected q', async () => {
    for (const badQuery of ['q=a', 'q=', '', 'q[$ne]=x', 'q=ab&q=cd']) {
      const response = await fetch(`${baseUrl}/suggestions?${badQuery}`);
      expect(response.status, badQuery).toBe(400);
    }

    expect(getRestaurantSuggestionsService).not.toHaveBeenCalled();
  });
});

// NEW (Milestone 5): the map route is public and does not accept a box that is upside down.
// חדש (אבן דרך 5): נתיב המפה ציבורי, ולא מקבל תיבה הפוכה.
describe('GET /api/restaurants/map', () => {
  const box = 'north=32.2&south=31.6&east=35.4&west=34.6';

  it('works without logging in and passes the box plus the filters', async () => {
    const response = await fetch(`${baseUrl}/map?${box}&q=pizza&radiusKm=5&lat=31.7&lng=35.2&hideExpired=true`);

    expect(response.status).toBe(200);
    expect(findMapRestaurantsService).toHaveBeenCalledWith({
      q: 'pizza',
      level: undefined,
      hechsher: [],
      foodType: [],
      category: [],
      hideExpired: true,
      includeUnknown: false,
      lat: 31.7,
      lng: 35.2,
      radiusKm: 5,
      north: 32.2,
      south: 31.6,
      east: 35.4,
      west: 34.6,
    });
    expect(searchRestaurantsService).not.toHaveBeenCalled();
  });

  it('answers 400 when the box is invalid or a key is repeated', async () => {
    for (const badQuery of [
      'north=31&south=32&east=35&west=34',
      'north=32&south=31&east=34&west=35',
      `${box}&north=33`,
      'north=32&south=31&east=35',
    ]) {
      const response = await fetch(`${baseUrl}/map?${badQuery}`);
      expect(response.status, badQuery).toBe(400);
    }

    expect(findMapRestaurantsService).not.toHaveBeenCalled();
  });
});
