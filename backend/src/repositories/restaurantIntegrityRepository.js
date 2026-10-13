import { Restaurant } from '../models/Restaurant.js';
import { appError } from '../utils/appError.js';

// Every new child and every cascade writes the parent in the same transaction.
// MongoDB write conflicts then serialize child insertion against parent deletion/rejection.
export const lockRestaurantForWriteRepo = async (restaurantId, status) => {
  const result = await Restaurant.updateOne(
    { _id: restaurantId, ...(status ? { status } : {}) }, { $inc: { integrityVersion: 1 } }
  );
  if (!result.matchedCount) throw appError('Restaurant not found or no longer available for this operation', 409);
};
