import { Teuda } from '../models/Teuda.js';

export const createTeudaRepo = async (teudaData) => {
  return Teuda.create(teudaData);
};

export const findTeudaByIdRepo = async (teudaId) => {
  return Teuda.findById(teudaId);
};

export const findApprovedTeudotByRestaurantRepo = async (restaurantId) => {
  return Teuda.find({ restaurant: restaurantId, status: 'APPROVED' }).sort({ expirationDate: -1 });
};

// Guards against the same person sending the same certificate twice (double click, retry).
export const findSimilarPendingTeudaRepo = async ({
  restaurant,
  submittedBy,
  hechsher,
  hechsherOther,
  kashrutLevel,
  expirationDate,
}) => {
  const filter = { restaurant, submittedBy, hechsher, kashrutLevel, expirationDate, status: 'PENDING' };

  if (hechsherOther) {
    filter.hechsherOther = hechsherOther;
  }

  return Teuda.findOne(filter);
};
