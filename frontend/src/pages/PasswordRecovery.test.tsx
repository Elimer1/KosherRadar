import { AxiosError, type AxiosResponse } from 'axios';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import { useAuthStore } from '../stores/authStore';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
vi.mock('../api/authApi', () => ({ requestPasswordReset: vi.fn(), resetPassword: vi.fn() }));
import { requestPasswordReset, resetPassword } from '../api/authApi';

const TOKEN = 'a'.repeat(64);
const mounted: { root: Root; container: HTMLDivElement }[] = [];
const responseError = (status: number, code?: string) => new AxiosError('failure', String(status), undefined,
  undefined, { status, data: { code, message: 'English server message' } } as AxiosResponse);

async function show(path: string) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  const router = createMemoryRouter([
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
    { path: '/login', element: <p>Login destination</p> },
  ], { initialEntries: [path] });
  await act(async () => root.render(<RouterProvider router={router} />));
  return { container, router };
}

async function input(container: HTMLElement, selector: string, value: string) {
  const element = container.querySelector<HTMLInputElement>(selector)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function submit(container: HTMLElement) {
  await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}
async function fillPassword(container: HTMLElement, password = 'new-password-123', confirm = password) {
  await input(container, '#reset-password', password);
  await input(container, '#reset-confirm-password', confirm);
}

beforeEach(async () => {
  vi.clearAllMocks();
  localStorage.clear(); sessionStorage.clear();
  useAuthStore.getState().logout();
  await i18n.changeLanguage('en');
  vi.mocked(requestPasswordReset).mockResolvedValue('English API message');
  vi.mocked(resetPassword).mockResolvedValue('Password changed');
});
afterEach(async () => {
  for (const { root, container } of mounted) {
    await act(async () => root.unmount());
    container.remove();
  }
  mounted.length = 0;
  await i18n.changeLanguage('en');
});

describe('localized recovery forms', () => {
  it.each(['en', 'he'] as const)('shows neutral localized confirmation and allows another request (%s)', async (language) => {
    await i18n.changeLanguage(language);
    const { container } = await show('/forgot-password');
    await input(container, '#forgot-email', 'user@example.com');
    await submit(container);
    expect(requestPasswordReset).toHaveBeenCalledExactlyOnceWith('user@example.com', language);
    expect(container.querySelector('[role="status"]')?.textContent).toBe(i18n.t('auth.forgotConfirmation'));
    expect(container.textContent).not.toContain('English API message');
    expect(document.documentElement.dir).toBe(language === 'he' ? 'rtl' : 'ltr');
    await act(async () => container.querySelector('button')!.click());
    expect(container.querySelector('#forgot-email')).not.toBeNull();
  });

  it('updates success copy when language changes', async () => {
    const { container } = await show('/forgot-password');
    await input(container, '#forgot-email', 'user@example.com');
    await submit(container);
    await act(async () => { await i18n.changeLanguage('he'); });
    expect(container.querySelector('[role="status"]')?.textContent).toBe(i18n.t('auth.forgotConfirmation'));
  });

  it('shows loading state then localized rate-limit/offline failures', async () => {
    let reject: (error: unknown) => void = () => {};
    vi.mocked(requestPasswordReset).mockReturnValueOnce(new Promise((_, fail) => { reject = fail; }));
    const { container } = await show('/forgot-password');
    await input(container, '#forgot-email', 'user@example.com');
    await submit(container);
    expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    expect(container.querySelector('form')?.getAttribute('aria-busy')).toBe('true');
    await act(async () => reject(responseError(429)));
    expect(container.textContent).toContain(i18n.t('auth.rateLimited'));
    vi.mocked(requestPasswordReset).mockRejectedValueOnce(new AxiosError('offline'));
    await submit(container);
    expect(container.textContent).toContain(i18n.t('common.offline'));
  });

  it.each(['?token=', '#token='])('cleans the address, keeps token in memory, clears login after reset (%s)', async (prefix) => {
    useAuthStore.getState().setAuth('old-jwt', { id: 'user-1', email: 'user@example.com', role: 'USER' });
    const { container, router } = await show(`/reset-password${prefix}${TOKEN}`);
    expect(router.state.location.search).toBe('');
    expect(router.state.location.hash).toBe('');
    expect(JSON.stringify(router.state.location.state)).not.toContain(TOKEN);
    await fillPassword(container);
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Show password"]')!.click());
    expect(container.querySelector<HTMLInputElement>('#reset-password')?.type).toBe('text');
    await submit(container);
    expect(resetPassword).toHaveBeenCalledExactlyOnceWith(TOKEN, 'new-password-123', 'en');
    expect(container.textContent).toContain(i18n.t('auth.passwordChanged'));
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('kosherradar-auth')).not.toContain(TOKEN);
    expect(sessionStorage.length).toBe(0);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/login');
  });

  it('blocks password mismatch and multibyte overflow without calling the API', async () => {
    const { container } = await show(`/reset-password#token=${TOKEN}`);
    await fillPassword(container, 'new-password-123', 'different-password');
    await submit(container);
    expect(container.textContent).toContain(i18n.t('auth.mismatch'));
    await fillPassword(container, 'א'.repeat(40));
    await submit(container);
    expect(container.textContent).toContain(i18n.t('auth.passwordLimits'));
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it.each(['en', 'he'] as const)('shows localized expired-link recovery (%s)', async (language) => {
    await i18n.changeLanguage(language);
    vi.mocked(resetPassword).mockRejectedValueOnce(responseError(400, 'INVALID_RESET_TOKEN'));
    const { container } = await show(`/reset-password#token=${TOKEN}`);
    await fillPassword(container);
    await submit(container);
    expect(container.textContent).toContain(i18n.t('auth.resetExpiredBody'));
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/forgot-password');
    expect(container.textContent).not.toContain('English server message');
  });

  it('offers another link for malformed token without making a request', async () => {
    const { container, router } = await show('/reset-password?token=short');
    expect(container.textContent).toContain(i18n.t('auth.resetInvalidTitle'));
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/forgot-password');
    expect(router.state.location.search).toBe('');
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('retains form and current login after a failed password write', async () => {
    useAuthStore.getState().setAuth('old-jwt', { id: 'u', email: 'u@example.com', role: 'USER' });
    vi.mocked(resetPassword).mockRejectedValueOnce(responseError(503));
    const { container } = await show(`/reset-password#token=${TOKEN}`);
    await fillPassword(container);
    await submit(container);
    expect(container.textContent).toContain(i18n.t('auth.resetFailed'));
    expect(container.querySelector('form')).not.toBeNull();
    expect(useAuthStore.getState().token).toBe('old-jwt');
    expect(container.textContent).not.toContain(i18n.t('auth.passwordChangedBody'));
  });
});
