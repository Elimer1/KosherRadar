import { Restaurant } from '../models/Restaurant.js';

const EARTH_RADIUS_METERS = 6378100;

// Pending and approved restaurants count when looking for duplicates. Rejected ones do not.
const ACTIVE_STATUSES = ['PENDING', 'APPROVED'];

export const findRestaurantByIdRepo = async (restaurantId) => {
  return Restaurant.findById(restaurantId);
};

export const createRestaurantRepo = async (restaurantData) => {
  return Restaurant.create(restaurantData);
};

export const deleteRestaurantByIdRepo = async (restaurantId) => {
  return Restaurant.findByIdAndDelete(restaurantId);
};

// Same person sending the same restaurant twice (double click, retry) while the first is still pending.
export const findPendingRestaurantBySubmitterRepo = async ({
  submittedBy,
  nameNormalized,
  addressNormalized,
}) => {
  return Restaurant.findOne({ submittedBy, nameNormalized, addressNormalized, status: 'PENDING' });
};

// Exact matches on indexed fields. The result is capped so one odd address cannot return hundreds of rows.
export const findDuplicateCandidatesRepo = async ({
  geoapifyPlaceId,
  phoneNormalized,
  addressNormalized,
}) => {
  const conditions = [];

  if (geoapifyPlaceId) {
    conditions.push({ geoapifyPlaceId });
  }

  if (phoneNormalized) {
    conditions.push({ phoneNormalized });
  }

  if (addressNormalized) {
    conditions.push({ addressNormalized });
  }

  if (conditions.length === 0) {
    return [];
  }

  return Restaurant.find({ status: { $in: ACTIVE_STATUSES }, $or: conditions })
    .select('name nameNormalized address addressNormalized phoneNormalized geoapifyPlaceId')
    .limit(10);
};

// Restaurants within a few hundred meters, using the 2dsphere index. Capped for the same reason.
export const findNearbyRestaurantsRepo = async ({ latitude, longitude, radiusMeters }) => {
  return Restaurant.find({
    status: { $in: ACTIVE_STATUSES },
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radiusMeters / EARTH_RADIUS_METERS] },
    },
  })
    .select('name nameNormalized address addressNormalized phoneNormalized geoapifyPlaceId')
    .limit(25);
};
