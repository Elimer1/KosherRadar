import { describe, it, expect } from 'vitest';
import restaurantRoutes from '../src/routes/restaurantRoutes.js';
import reportRoutes from '../src/routes/reportRoutes.js';
import { authMiddleware } from '../src/middleware/authMiddleware.js';

const listRoutes = (router) => {
  return router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
      handlers: layer.route.stack.map((item) => item.handle),
    }));
};

describe('submission routes', () => {
  const allRoutes = [...listRoutes(restaurantRoutes), ...listRoutes(reportRoutes)];

  it('offers only the expected endpoints, so a USER has no way to edit, delete or approve records', () => {
    const summary = allRoutes.map((route) => `${route.methods.join(',').toUpperCase()} ${route.path}`).sort();

    // Milestone 4 added three public read-only routes: search, suggestions and one restaurant's page.
    expect(summary).toEqual([
      'GET /',
      'GET /:restaurantId',
      'GET /:restaurantId/submission-context',
      'GET /suggestions',
      'POST /',
      'POST /',
      'POST /:restaurantId/teudot',
    ]);
  });

  it('requires a logged-in user for every route that creates something', () => {
    const creating = allRoutes.filter((route) => route.methods.includes('post'));

    expect(creating).toHaveLength(3);
    for (const route of creating) {
      expect(route.handlers).toContain(authMiddleware);
    }
  });

  it('keeps the public submission context readable without logging in', () => {
    const context = allRoutes.find((route) => route.path === '/:restaurantId/submission-context');

    expect(context.handlers).not.toContain(authMiddleware);
  });
});
