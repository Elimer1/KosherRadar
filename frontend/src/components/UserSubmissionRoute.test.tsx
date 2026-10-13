import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import UserSubmissionRoute from './UserSubmissionRoute';
const auth = vi.hoisted(() => ({ role: 'USER' }));
vi.mock('../stores/authStore', () => ({ useAuthStore: (select: (state: unknown) => unknown) => select({ user: auth }) }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
describe('bookmarked contribution forms', () => {
  it.each([
    ['ADMIN', '/submit-restaurant', '/admin/restaurants/new'],
    ['ADMIN', '/restaurants/place/add-teuda', '/admin/restaurants/place/add-teuda'],
    ['USER', '/submit-restaurant', '/submit-restaurant'],
    ['USER', '/restaurants/place/add-teuda', '/restaurants/place/add-teuda'],
  ])('routes %s at %s to %s', async (role, initial, expected) => {
    auth.role = role;
    const router = createMemoryRouter([
      { element: <UserSubmissionRoute />, children: [
        { path: '/submit-restaurant', element: <p>User restaurant</p> },
        { path: '/restaurants/:restaurantId/add-teuda', element: <p>User certificate</p> },
      ] },
      { path: '/admin/restaurants/new', element: <p>Admin restaurant</p> },
      { path: '/admin/restaurants/:restaurantId/add-teuda', element: <p>Admin certificate</p> },
    ], { initialEntries: [initial] });
    const node = document.createElement('div'); document.body.append(node); const root = createRoot(node);
    try {
      await act(async () => { root.render(<RouterProvider router={router} />); });
      expect(router.state.location.pathname).toBe(expected);
      expect(node.textContent).toContain(role === 'ADMIN' ? 'Admin' : 'User');
    } finally { await act(async () => root.unmount()); node.remove(); router.dispose(); }
  });
});
