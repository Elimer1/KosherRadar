// NEW (Milestone 4): API function for the public restaurant page.
// חדש (אבן דרך 4): פונקציית API לדף המסעדה הציבורי.
import { api } from './axiosInstance';
import type { RestaurantDetails } from '../types/restaurantDetails';

export const getRestaurantDetails = async (restaurantId: string) => {
  const response = await api.get<RestaurantDetails>(`/restaurants/${encodeURIComponent(restaurantId)}`);
  return response.data;
};
