import { appError } from '../utils/appError.js';
import { dateOnlyToDate, dateToDateOnly } from '../utils/israelDate.js';
import { findRestaurantByIdRepo } from '../repositories/restaurantRepository.js';
import {
  createTeudaRepo,
  findApprovedTeudotByRestaurantRepo,
  findSimilarPendingTeudaRepo,
} from '../repositories/teudaRepository.js';
import { checkImageFile, deleteImageService, uploadTeudaImageService } from './imageUploadService.js';
import {
  checkExpirationForSubmission,
  getTeudaVisibility,
  isTeudaPublic,
} from './teudaRulesService.js';

// Checks that do not touch the database or Cloudinary. Run before anything is uploaded or saved.
export const validateTeudaSubmission = (teudaData, file) => {
  checkExpirationForSubmission(teudaData.expirationDate);
  checkImageFile(file);
};

export const buildTeudaRecord = ({ teudaData, image, restaurantId, userId, withNewRestaurant }) => {
  return {
    restaurant: restaurantId,
    hechsher: teudaData.hechsher,
    hechsherOther: teudaData.hechsherOther,
    kashrutLevel: teudaData.kashrutLevel,
    expirationDate: dateOnlyToDate(teudaData.expirationDate),
    photoUrl: image.photoUrl,
    cloudinaryPublicId: image.cloudinaryPublicId,
    mashgiachName: teudaData.mashgiachName,
    mashgiachPhone: teudaData.mashgiachPhone,
    status: 'PENDING',
    submittedBy: userId,
    submittedWithNewRestaurant: withNewRestaurant,
  };
};

// A user can add a teuda only to an approved restaurant. The new teuda is PENDING and does not
// touch any approved teuda until an admin approves it.
export const submitTeudaService = async ({ restaurantId, teudaData, file, user }) => {
  const restaurant = await findRestaurantByIdRepo(restaurantId);

  if (!restaurant || restaurant.status !== 'APPROVED') {
    throw appError('Restaurant not found', 404);
  }

  validateTeudaSubmission(teudaData, file);

  const expirationDate = dateOnlyToDate(teudaData.expirationDate);

  const alreadySent = await findSimilarPendingTeudaRepo({
    restaurant: restaurant._id,
    submittedBy: user._id,
    hechsher: teudaData.hechsher,
    hechsherOther: teudaData.hechsherOther,
    kashrutLevel: teudaData.kashrutLevel,
    expirationDate,
  });

  if (alreadySent) {
    throw appError('You already submitted this certificate and it is waiting for review', 409);
  }

  const image = await uploadTeudaImageService(file);

  try {
    const teuda = await createTeudaRepo(
      buildTeudaRecord({
        teudaData,
        image,
        restaurantId: restaurant._id,
        userId: user._id,
        withNewRestaurant: false,
      })
    );

    return { id: String(teuda._id), status: teuda.status };
  } catch (error) {
    await deleteImageService(image.cloudinaryPublicId);
    throw error;
  }
};

// Small public summary used by the "add a certificate" and "report" pages.
// Teudot that expired more than six months ago are admin-only and are never included.
export const getSubmissionContextService = async (restaurantId) => {
  const restaurant = await findRestaurantByIdRepo(restaurantId);

  if (!restaurant || restaurant.status !== 'APPROVED') {
    throw appError('Restaurant not found', 404);
  }

  const teudot = await findApprovedTeudotByRestaurantRepo(restaurant._id);

  return {
    restaurant: {
      id: String(restaurant._id),
      name: restaurant.name,
      address: restaurant.address,
      city: restaurant.city || null,
    },
    teudot: teudot
      .filter((teuda) => isTeudaPublic(teuda))
      .map((teuda) => ({
        id: String(teuda._id),
        hechsher: teuda.hechsher,
        hechsherOther: teuda.hechsherOther || null,
        kashrutLevel: teuda.kashrutLevel,
        expirationDate: dateToDateOnly(teuda.expirationDate),
        visibility: getTeudaVisibility(teuda.expirationDate),
      })),
  };
};
