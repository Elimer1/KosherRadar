import { Restaurant } from '../models/Restaurant.js';
import { normalizeText } from '../utils/normalizeText.js';

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
  cityNormalized,
}) => {
  const candidates = await Restaurant.find({
    submittedBy, nameNormalized, addressNormalized, status: 'PENDING',
    $or: [{ cityNormalized }, { cityNormalized: { $exists: false } }],
  }).select('_id city cityNormalized').lean();
  // Old documents need no backfill: normalize their original city at read time.
  return candidates.find(row => (row.cityNormalized ?? normalizeText(row.city)) === cityNormalized) || null;
};

const DUPLICATE_FIELDS =
  'name nameNormalized address addressNormalized phoneNormalized geoapifyPlaceId';

// Each kind of match gets its own query and its own cap. With one combined query, many weak
// address matches (for example a shopping center) could push out an exact place ID match.
// The address cap is the largest because one address can legitimately hold many restaurants
// and the service still needs to find the one whose name also matches.
const PLACE_ID_LIMIT = 5;
const PHONE_LIMIT = 10;
const ADDRESS_LIMIT = 30;
const NEARBY_LIMIT = 25;

const findActive = (condition, limit) =>
  Restaurant.find({ status: { $in: ACTIVE_STATUSES }, ...condition })
    .select(DUPLICATE_FIELDS)
    .limit(limit)
    .lean();

// Exact matches on indexed fields, strongest kind first: place ID, then phone, then address.
// A restaurant found by several kinds is returned once.
export const findDuplicateCandidatesRepo = async ({
  geoapifyPlaceId,
  phoneNormalized,
  addressNormalized,
}) => {
  const [byPlaceId, byPhone, byAddress] = await Promise.all([
    geoapifyPlaceId ? findActive({ geoapifyPlaceId }, PLACE_ID_LIMIT) : [],
    phoneNormalized ? findActive({ phoneNormalized }, PHONE_LIMIT) : [],
    addressNormalized ? findActive({ addressNormalized }, ADDRESS_LIMIT) : [],
  ]);

  const unique = new Map();

  for (const restaurant of [...byPlaceId, ...byPhone, ...byAddress]) {
    unique.set(String(restaurant._id), restaurant);
  }

  return [...unique.values()];
};

// Restaurants within a few hundred meters, closest first (2dsphere index). Capped so a dense
// area cannot return hundreds of rows, and sorting by distance keeps the closest ones.
export const findNearbyRestaurantsRepo = async ({ latitude, longitude, radiusMeters }) => {
  return findActive(
    {
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: radiusMeters,
        },
      },
    },
    NEARBY_LIMIT
  );
};
