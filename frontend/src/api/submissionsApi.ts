import { api } from './axiosInstance';
import type { MySubmissions } from '../types/mySubmissions';

export const getMySubmissions = async () => {
  const response = await api.get<MySubmissions>('/users/me/submissions');
  return response.data;
};
