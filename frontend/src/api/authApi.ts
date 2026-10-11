import { api } from './axiosInstance';
import type { AuthResponse, Credentials, User, UserProfile } from '../types/auth';

export const registerUser = async (credentials: Credentials) => {
  const response = await api.post<AuthResponse>('/auth/register', credentials);
  return response.data;
};

export const loginUser = async (credentials: Credentials) => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.data.user;
};

export const getMyProfile = async () => {
  const response = await api.get<{ user: UserProfile }>('/users/me');
  return response.data.user;
};

// NEW (Milestone 3): password reset. The server answers the same way for every email address.
// חדש (אבן דרך 3): איפוס סיסמה. השרת עונה אותו דבר לכל כתובת מייל.
export const requestPasswordReset = async (email: string) => {
  const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return response.data.message;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await api.post<{ message: string }>('/auth/reset-password', { token, password });
  return response.data.message;
};
