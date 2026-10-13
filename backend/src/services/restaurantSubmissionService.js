import { withTransaction } from '../repositories/transaction.js';
import { cleanupFailedUploadService } from './imageCleanupService.js';
import { appError } from '../utils/appError.js';
import { assertUserSubmission } from '../middleware/userSubmissionMiddleware.js';
import { normalizeText } from '../utils/normalizeText.js';
import {
  createRestaurantRepo,
  findPendingRestaurantBySubmitterRepo,
} from '../repositories/restaurantRepository.js';
import { createTeudaRepo } from '../repositories/teudaRepository.js';
import { findPossibleDuplicatesService } from './duplicateService.js';
import { uploadTeudaImageService } from './imageUploadService.js';
import {
  buildTeudaRecord,
  hasCertificateEvidence,
  photoFingerprint,
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

// NEW (Backend QA): the pending-identity unique index reports a lost race as a duplicate key.
// חדש (בדיקת שרת): אינדקס הזהות של הגשה ממתינה מדווח על מרוץ שהפסיד כמפתח כפול.
const isPendingRestaurantDuplicate = (error) => {
  const duplicate = error?.code === 11000 ? error : error?.cause;
  const pattern = duplicate?.keyPattern;

  return (
    duplicate?.code === 11000 &&
    pattern?.submittedBy != null &&
    pattern?.nameNormalized != null &&
    pattern?.addressNormalized != null
  );
};

const pendingRestaurantConflict = () =>
  appError('You already submitted this restaurant and it is waiting for review', 409);

// A signed-in user proposes a new restaurant, optionally with its first certificate.
// Everything starts as PENDING: only an admin can approve, and the user never chooses status or points.
export const submitRestaurantService = async ({ restaurantData, teudaData, file, user, lang }) => {
  assertUserSubmission(user);
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
    cityNormalized: normalizeText(restaurantData.city),
  });

  if (alreadySent) {
    throw pendingRestaurantConflict();
  }

  // Duplicates are only recorded for the admin. They never stop the submission.
  const possibleDuplicates = await findPossibleDuplicatesService(locatedRestaurant);

  const image = evidence && file ? await uploadTeudaImageService(file) : null;

  try {
    return await withTransaction(async () => {
      const restaurant = await createRestaurantRepo({
        ...locatedRestaurant, status: 'PENDING', submittedBy: user._id, possibleDuplicates,
      });
      const teuda = evidence ? await createTeudaRepo(buildTeudaRecord({
        teudaData: evidence, image, photoFingerprint: photoFingerprint(file),
        restaurantId: restaurant._id, userId: user._id, withNewRestaurant: true,
      })) : null;
      return {
        restaurant: { id: String(restaurant._id), status: restaurant.status },
        teuda: teuda ? { id: String(teuda._id), status: teuda.status } : null,
        possibleDuplicateCount: possibleDuplicates.length, locationStatus,
      };
    });
  } catch (error) {
    await cleanupFailedUploadService(image?.cloudinaryPublicId, error);
    if (isPendingRestaurantDuplicate(error)) throw pendingRestaurantConflict();
    throw error;
  }
};
