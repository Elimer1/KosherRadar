import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// The one Axios instance used by every API function.
export const api = axios.create({ baseURL });

// Login/register 401s mean "wrong password", not "expired token", so they never log the user out.
const AUTH_FORM_URLS = ['/auth/login', '/auth/register'];

// Adds "Authorization: Bearer <token>" when the user is logged in.
export const attachToken = (config: InternalAxiosRequestConfig, token: string | null) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// True only for: a 401 response, to a request that carried a token, that was not a login/register form.
// 403 (not allowed), 500, and network errors keep the user logged in.
export const isExpiredSessionError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;
  const hadToken = Boolean(axiosError.config?.headers?.Authorization);
  const url = axiosError.config?.url || '';

  return status === 401 && hadToken && !AUTH_FORM_URLS.includes(url);
};

api.interceptors.request.use((config) => {
  return attachToken(config, useAuthStore.getState().token);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isExpiredSessionError(error)) {
      // Clears the saved login. The user stays on the current page; protected pages redirect to login.
      useAuthStore.getState().expireSession();
    }
    return Promise.reject(error);
  }
);
