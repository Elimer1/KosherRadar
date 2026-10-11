import { describe, it, expect, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { attachToken, isExpiredSessionError } from './axiosInstance';
import { useAuthStore } from '../stores/authStore';

// Builds the kind of error Axios throws, with a given status and request details.
const makeError = (status: number | null, url: string, withToken: boolean) => {
  const headers = new AxiosHeaders();
  if (withToken) {
    headers.set('Authorization', 'Bearer some-token');
  }
  const config = { url, headers } as InternalAxiosRequestConfig;
  const response =
    status === null
      ? undefined
      : { status, data: {}, statusText: '', headers: {}, config };

  return new AxiosError('request failed', 'ERR_BAD_REQUEST', config, {}, response);
};

describe('isExpiredSessionError', () => {
  it('is true for a 401 on an authenticated protected request', () => {
    expect(isExpiredSessionError(makeError(401, '/users/me', true))).toBe(true);
  });

  it('is false for a wrong-password 401 from login', () => {
    expect(isExpiredSessionError(makeError(401, '/auth/login', true))).toBe(false);
    expect(isExpiredSessionError(makeError(401, '/auth/login', false))).toBe(false);
  });

  it('is false for a 401 on a request that sent no token', () => {
    expect(isExpiredSessionError(makeError(401, '/users/me', false))).toBe(false);
  });

  it('is false for 403, 500 and network failures', () => {
    expect(isExpiredSessionError(makeError(403, '/admin/check', true))).toBe(false);
    expect(isExpiredSessionError(makeError(500, '/users/me', true))).toBe(false);
    expect(isExpiredSessionError(makeError(null, '/users/me', true))).toBe(false);
  });

  it('is false for errors that are not Axios errors', () => {
    expect(isExpiredSessionError(new Error('boom'))).toBe(false);
  });
});

describe('attachToken', () => {
  const makeConfig = () => ({ headers: new AxiosHeaders() }) as InternalAxiosRequestConfig;

  it('adds the Bearer header when a token exists', () => {
    const config = attachToken(makeConfig(), 'abc123');
    expect(config.headers.Authorization).toBe('Bearer abc123');
  });

  it('adds nothing for visitors who are not logged in', () => {
    const config = attachToken(makeConfig(), null);
    expect(config.headers.Authorization).toBeUndefined();
  });
});

describe('auth store', () => {
  const user = { id: 'u1', email: 'a@example.com', role: 'USER' as const };

  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ token: null, user: null, sessionExpired: false });
  });

  it('saves token and user to localStorage on login', () => {
    useAuthStore.getState().setAuth('token-1', user);

    const saved = JSON.parse(localStorage.getItem('kosherradar-auth') || '{}');
    expect(saved.state.token).toBe('token-1');
    expect(saved.state.user.email).toBe('a@example.com');
  });

  it('expireSession clears the login and flags the expiry', () => {
    useAuthStore.getState().setAuth('token-1', user);
    useAuthStore.getState().expireSession();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.sessionExpired).toBe(true);
  });

  it('does not save the sessionExpired flag to localStorage', () => {
    useAuthStore.getState().expireSession();

    const saved = JSON.parse(localStorage.getItem('kosherradar-auth') || '{}');
    expect(saved.state.sessionExpired).toBeUndefined();
  });

  it('logout clears everything', () => {
    useAuthStore.getState().setAuth('token-1', user);
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
