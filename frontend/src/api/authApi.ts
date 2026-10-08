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
