import { appError } from '../utils/appError.js';
import { normalizeText } from '../utils/normalizeText.js';
import {
  createRestaurantRepo,
  deleteRestaurantByIdRepo,
  findPendingRestaurantBySubmitterRepo,
} from '../repositories/restaurantRepository.js';
import { createTeudaRepo } from '../repositories/teudaRepository.js';
import { findPossibleDuplicatesService } from './duplicateService.js';
import { deleteImageService, uploadTeudaImageService } from './imageUploadService.js';
import { buildTeudaRecord, validateTeudaSubmission } from './teudaSubmissionService.js';

// A signed-in user proposes a new restaurant, optionally with its first certificate.
// Everything starts as PENDING: only an admin can approve, and the user never chooses status or points.
export const submitRestaurantService = async ({ restaurantData, teudaData, file, user }) => {
  if (teudaData) {
    validateTeudaSubmission(teudaData, file);
  } else if (file) {
    throw appError('A photo can only be sent together with certificate details', 400);
  }

  const alreadySent = await findPendingRestaurantBySubmitterRepo({
    submittedBy: user._id,
    nameNormalized: normalizeText(restaurantData.name),
    addressNormalized: normalizeText(restaurantData.address),
  });

  if (alreadySent) {
    throw appError('You already submitted this restaurant and it is waiting for review', 409);
  }

  // Duplicates are only recorded for the admin. They never stop the submission.
  const possibleDuplicates = await findPossibleDuplicatesService(restaurantData);

  const image = teudaData ? await uploadTeudaImageService(file) : null;

  let restaurant;

  try {
    restaurant = await createRestaurantRepo({
      ...restaurantData,
      status: 'PENDING',
      submittedBy: user._id,
      possibleDuplicates,
    });
  } catch (error) {
    if (image) {
      await deleteImageService(image.cloudinaryPublicId);
    }
    throw error;
  }

  if (!teudaData) {
    return {
      restaurant: { id: String(restaurant._id), status: restaurant.status },
      teuda: null,
      possibleDuplicateCount: possibleDuplicates.length,
    };
  }

  try {
    const teuda = await createTeudaRepo(
      buildTeudaRecord({
        teudaData,
        image,
        restaurantId: restaurant._id,
        userId: user._id,
        withNewRestaurant: true,
      })
    );

    return {
      restaurant: { id: String(restaurant._id), status: restaurant.status },
      teuda: { id: String(teuda._id), status: teuda.status },
      possibleDuplicateCount: possibleDuplicates.length,
    };
  } catch (error) {
    // Do not leave a restaurant behind that the user believes was sent together with a certificate.
    // A failed cleanup is only logged so the original error is the one the user gets.
    try {
      await deleteRestaurantByIdRepo(restaurant._id);
    } catch (cleanupError) {
      console.error('Could not delete orphaned restaurant:', restaurant._id, cleanupError.message);
    }

    await deleteImageService(image.cloudinaryPublicId);
    throw error;
  }
};
