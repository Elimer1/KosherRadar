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
  mashgiachName,
  mashgiachPhone,
  photoFingerprint,
}) => {
  const filter = { restaurant, submittedBy, hechsher, kashrutLevel, expirationDate, status: 'PENDING' };

  if (hechsherOther) {
    filter.hechsherOther = hechsherOther;
  }

  // NEW (Audit QA-001): set only for an undated certificate. null matches a missing name, phone, or photo.
  // חדש (ביקורת QA-001): נקבע רק לתעודה בלי תאריך. null תופס גם שדה חסר.
  if (mashgiachName !== undefined) {
    filter.mashgiachName = mashgiachName;
  }

  if (mashgiachPhone !== undefined) {
    filter.mashgiachPhone = mashgiachPhone;
  }

  if (photoFingerprint !== undefined) {
    filter.photoFingerprint = photoFingerprint;
  }

  return Teuda.findOne(filter);
};
