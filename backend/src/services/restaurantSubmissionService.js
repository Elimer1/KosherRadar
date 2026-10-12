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
import {
  buildTeudaRecord,
  hasCertificateEvidence,
  validateTeudaSubmission,
  withoutUserKashrutLevel,
} from './teudaSubmissionService.js';
import { geocodeAddressService } from './placesService.js';

// NEW (Audit M1): coordinates already chosen by the user are kept. A typed address is geocoded only when
// the match is unambiguous. Anything else is saved with no pin and a status the form can explain.
// חדש (ביקורת M1): קואורדינטות שהמשתמש בחר נשמרות. כתובת שהוקלדה ממוקמת רק כשההתאמה חד-משמעית.
const withGeocodedLocation = async (restaurantData, lang) => {
  const hasLatitude = restaurantData.latitude !== undefined;
  const hasLongitude = restaurantData.longitude !== undefined;

  if (hasLatitude && hasLongitude) {
    return { restaurantData, locationStatus: 'selected' };
  }

  const located = await geocodeAddressService({
    address: restaurantData.address,
    city: restaurantData.city,
    lang,
  });

  if (located.status !== 'matched') {
    return { restaurantData, locationStatus: located.status };
  }

  return {
    restaurantData: {
      ...restaurantData,
      latitude: located.latitude,
      longitude: located.longitude,
      geoapifyPlaceId: restaurantData.geoapifyPlaceId || located.geoapifyPlaceId,
    },
    locationStatus: 'matched',
  };
};

// A signed-in user proposes a new restaurant, optionally with its first certificate.
// Everything starts as PENDING: only an admin can approve, and the user never chooses status or points.
export const submitRestaurantService = async ({ restaurantData, teudaData, file, user, lang }) => {
  const evidence = hasCertificateEvidence(teudaData, file) ? withoutUserKashrutLevel(teudaData) : null;

  if (file && !evidence?.hechsher) {
    throw appError('A photo can only be sent together with certificate details', 400);
  }

  if (evidence) {
    validateTeudaSubmission(evidence, file);
  }

  const { restaurantData: locatedRestaurant, locationStatus } = await withGeocodedLocation(restaurantData, lang);

  const alreadySent = await findPendingRestaurantBySubmitterRepo({
    submittedBy: user._id,
    nameNormalized: normalizeText(restaurantData.name),
    addressNormalized: normalizeText(restaurantData.address),
  });

  if (alreadySent) {
    throw appError('You already submitted this restaurant and it is waiting for review', 409);
  }

  // Duplicates are only recorded for the admin. They never stop the submission.
  const possibleDuplicates = await findPossibleDuplicatesService(locatedRestaurant);

  const image = evidence && file ? await uploadTeudaImageService(file) : null;

  let restaurant;

  try {
    restaurant = await createRestaurantRepo({
      ...locatedRestaurant,
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

  if (!evidence) {
    return {
      restaurant: { id: String(restaurant._id), status: restaurant.status },
      teuda: null,
      possibleDuplicateCount: possibleDuplicates.length,
      locationStatus,
    };
  }

  try {
    const teuda = await createTeudaRepo(
      buildTeudaRecord({
        teudaData: evidence,
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
      locationStatus,
    };
  } catch (error) {
    // Do not leave a restaurant behind that the user believes was sent together with a certificate.
    // A failed cleanup is only logged so the original error is the one the user gets.
    try {
      await deleteRestaurantByIdRepo(restaurant._id);
    } catch (cleanupError) {
      console.error('Could not delete orphaned restaurant:', restaurant._id, cleanupError.message);
    }

    if (image) {
      await deleteImageService(image.cloudinaryPublicId);
    }
    throw error;
  }
};
