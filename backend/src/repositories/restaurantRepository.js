import { Restaurant } from '../models/Restaurant.js';

export const findRestaurantByIdRepo = async (restaurantId) => {
  return Restaurant.findById(restaurantId);
};
