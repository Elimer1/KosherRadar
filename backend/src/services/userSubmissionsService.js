import {
  POINTS_APPLIED_CORRECTION,
  POINTS_NEW_RESTAURANT_WITH_TEUDA,
  POINTS_TEUDA_FOR_EXISTING_RESTAURANT,
} from './pointsService.js';
import { findUserAwardKeysRepo } from '../repositories/userRepository.js';
import {
  listMyReportsRepo,
  listMyRestaurantsRepo,
  listMyTeudotRepo,
} from '../repositories/userSubmissionsRepository.js';

const restaurantName = (record) => {
  if (record.restaurant && typeof record.restaurant === 'object' && record.restaurant.name) {
    return record.restaurant.name;
  }

  return null;
};

const toWhen = (value) => (value ? new Date(value).toISOString() : null);

// Points already stored on the user. A missing key means this item earned nothing (still pending, rejected, or an admin).
const pointsFor = (keys, key, points) => (keys.has(key) ? points : 0);

export const getMySubmissionsService = async (userId) => {
  const [awardUser, restaurants, teudot, reports] = await Promise.all([
    findUserAwardKeysRepo(userId),
    listMyRestaurantsRepo(userId),
    listMyTeudotRepo(userId),
    listMyReportsRepo(userId),
  ]);

  const keys = new Set(awardUser?.awardedPointKeys || []);

  return {
    restaurants: restaurants.map((restaurant) => ({
      id: String(restaurant._id),
      name: restaurant.name,
      status: restaurant.status,
      rejectionReason: restaurant.rejectionReason || null,
      createdAt: toWhen(restaurant.createdAt),
    })),
    teudot: teudot.map((teuda) => ({
      id: String(teuda._id),
      restaurantName: restaurantName(teuda),
      status: teuda.status,
      rejectionReason: teuda.rejectionReason || null,
      createdAt: toWhen(teuda.createdAt),
      points: pointsFor(
        keys,
        `TEUDA:${teuda._id}`,
        teuda.submittedWithNewRestaurant ? POINTS_NEW_RESTAURANT_WITH_TEUDA : POINTS_TEUDA_FOR_EXISTING_RESTAURANT
      ),
    })),
    reports: reports.map((report) => ({
      id: String(report._id),
      restaurantName: restaurantName(report),
      description: report.description,
      status: report.status,
      rejectionReason: report.rejectionReason || null,
      createdAt: toWhen(report.createdAt),
      points: pointsFor(keys, `REPORT:${report._id}`, POINTS_APPLIED_CORRECTION),
    })),
  };
};
