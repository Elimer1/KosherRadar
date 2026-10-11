import { api } from './axiosInstance';
import type { FormOptions } from '../types/submissions';

export const getFormOptions = async () => {
  const response = await api.get<FormOptions>('/options');
  return response.data;
};
