// NEW (Milestone 3): tests that every admin endpoint is behind login AND the ADMIN role, and which endpoints exist.
// חדש (אבן דרך 3): בדיקות שכל נקודת קצה של מנהל מוגנת בהתחברות וגם בתפקיד ADMIN, ואילו נקודות קצה קיימות.
import { describe, it, expect } from 'vitest';
import adminRoutes from '../src/routes/adminRoutes.js';
import restaurantRoutes from '../src/routes/restaurantRoutes.js';
import reportRoutes from '../src/routes/reportRoutes.js';
import { authMiddleware } from '../src/middleware/authMiddleware.js';
import { adminMiddleware } from '../src/middleware/adminMiddleware.js';
import { validateObjectIdParam } from '../src/middleware/validateObjectId.js';

const describeRoutes = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => `${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`)
    .sort();

describe('admin router protection', () => {
  it('runs the login check and then the admin check before any route', () => {
    const [first, second, third] = adminRoutes.stack;

    expect(first.handle).toBe(authMiddleware);
    expect(second.handle).toBe(adminMiddleware);
    // Every layer that is a real route comes after those two.
    expect(first.route).toBeUndefined();
    expect(second.route).toBeUndefined();
    expect(third.route).toBeDefined();
  });

  it('offers exactly the planned moderation endpoints', () => {
    expect(describeRoutes(adminRoutes)).toEqual(
      [
        'GET /check',
        'GET /restaurants',
        'POST /restaurants',
        'GET /restaurants/pending',
        'GET /restaurants/:restaurantId',
        'PUT /restaurants/:restaurantId',
        'DELETE /restaurants/:restaurantId',
        'POST /restaurants/:restaurantId/approve',
        'POST /restaurants/:restaurantId/reject',
        'POST /restaurants/:restaurantId/teudot',
        'GET /teudot/pending',
        'GET /teudot/expiring-soon',
        'PUT /teudot/:teudaId',
        'DELETE /teudot/:teudaId',
        'POST /teudot/:teudaId/approve',
        'POST /teudot/:teudaId/reject',
        'GET /reports/pending',
        'POST /reports/:reportId/resolve',
        'POST /reports/:reportId/reject',
      ].sort()
    );
  });

  it('checks the id format on every route that has an id in its path', () => {
    const withId = adminRoutes.stack.filter((layer) => layer.route && layer.route.path.includes(':'));

    expect(withId.length).toBeGreaterThan(0);
    for (const layer of withId) {
      const handlers = layer.route.stack.map((item) => item.handle);
      const idChecks = handlers.filter((handler) => handler.toString() === validateObjectIdParam('x').toString());
      expect(idChecks.length).toBeGreaterThan(0);
    }
  });

  it('does not put any admin action on the public restaurant or report routers', () => {
    const publicRoutes = [...describeRoutes(restaurantRoutes), ...describeRoutes(reportRoutes)];

    expect(publicRoutes.some((route) => /approve|reject|resolve|DELETE|PUT|PATCH/.test(route))).toBe(false);
  });
});
