import { withTransaction } from '../repositories/transaction.js';
import { lockRestaurantForWriteRepo } from '../repositories/restaurantIntegrityRepository.js';
import { cleanupFailedUploadService } from './imageCleanupService.js';
import { createHash } from 'node:crypto';
import { appError } from '../utils/appError.js';
import { assertUserSubmission } from '../middleware/userSubmissionMiddleware.js';
import { dateOnlyToDate, dateToDateOnly } from '../utils/israelDate.js';
import { findRestaurantByIdRepo } from '../repositories/restaurantRepository.js';
import {
  createTeudaRepo,
  findApprovedTeudotByRestaurantRepo,
  findSimilarPendingTeudaRepo,
} from '../repositories/teudaRepository.js';
import { checkImageFile, uploadTeudaImageService } from './imageUploadService.js';
import {
  checkExpirationForSubmission,
  getTeudaVisibility,
  isTeudaPublic,
} from './teudaRulesService.js';

// NEW (Backend QA): either pending-certificate index reports a lost race as a duplicate key.
// חדש (בדיקת שרת): כל אחד מאינדקסי התעודה הממתינה מדווח על מרוץ שהפסיד כמפתח כפול.
const isPendingCertificateDuplicate = (error) => {
  const duplicate = error?.code === 11000 ? error : error?.cause;
  const pattern = duplicate?.keyPattern;
  const pendingIdentity =
    pattern?.restaurant != null && pattern?.submittedBy != null && pattern?.hechsher != null;
  const datedOrUndated =
    pattern?.expirationDate != null || pattern?.mashgiachName != null || pattern?.photoFingerprint != null;

  return duplicate?.code === 11000 && pendingIdentity && datedOrUndated;
};

const pendingCertificateConflict = () =>
  appError('You already submitted this certificate and it is waiting for review', 409);

// A photo, an expiration date, or a mashgiach is certificate evidence. The hechsher alone is the restaurant claim.
export const hasCertificateEvidence = (teudaData, file) =>
  Boolean(file || teudaData?.expirationDate || teudaData?.mashgiachName || teudaData?.mashgiachPhone);

// NEW (Audit M1): users cannot classify a certificate. A level sent by the client is ignored.
// חדש (ביקורת M1): משתמש לא מסווג תעודה. רמה שנשלחה מהדפדפן מתעלמים ממנה.
export const withoutUserKashrutLevel = (teudaData) => {
  if (!teudaData) {
    return teudaData;
  }

  const { kashrutLevel, ...evidence } = teudaData;
  return evidence;
};

const blankToNull = (value) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
};

// NEW (Audit QA-001): identity of the photo bytes, so two different undated photos are not one certificate.
// חדש (ביקורת QA-001): זהות של תוכן התמונה, כדי ששתי תמונות בלי תאריך לא ייחשבו לאותה תעודה.
export const photoFingerprint = (file) => {
  if (!file?.buffer) {
    return null;
  }

  return createHash('sha256').update(file.buffer).digest('hex');
};

// NEW (Audit QA-001): a dated certificate matches on hechsher and date. An undated one also matches
// on mashgiach name, phone, and photo bytes, so those are not collapsed into one pending row.
// חדש (ביקורת QA-001): תעודה עם תאריך מזוהה לפי השגחה ותאריך. תעודה בלי תאריך מזוהה גם לפי המשגיח והתמונה.
export const pendingCertificateLookup = ({ restaurantId, userId, evidence, file }) => {
  const expirationDate = evidence.expirationDate ? dateOnlyToDate(evidence.expirationDate) : null;
  const lookup = {
    restaurant: restaurantId,
    submittedBy: userId,
    hechsher: evidence.hechsher,
    hechsherOther: evidence.hechsherOther,
    kashrutLevel: null,
    expirationDate,
  };

  if (expirationDate) {
    return lookup;
  }

  return {
    ...lookup,
    mashgiachName: blankToNull(evidence.mashgiachName),
    mashgiachPhone: blankToNull(evidence.mashgiachPhone),
    photoFingerprint: photoFingerprint(file),
  };
};

// Checks that do not touch the database or Cloudinary. Run before anything is uploaded or saved.
// A missing date or a missing photo is allowed. A date that is present must still be valid.
export const validateTeudaSubmission = (teudaData, file) => {
  if (teudaData?.expirationDate) {
    checkExpirationForSubmission(teudaData.expirationDate);
  }

  if (file) {
    checkImageFile(file);
  }
};

export const buildTeudaRecord = ({
  teudaData,
  image,
  photoFingerprint: fingerprint,
  restaurantId,
  userId,
  withNewRestaurant,
}) => {
  const record = {
    restaurant: restaurantId,
    hechsher: teudaData.hechsher,
    hechsherOther: teudaData.hechsherOther,
    status: 'PENDING',
    submittedBy: userId,
    submittedWithNewRestaurant: withNewRestaurant,
  };

  if (teudaData.kashrutLevel) {
    record.kashrutLevel = teudaData.kashrutLevel;
  }

  if (teudaData.expirationDate) {
    record.expirationDate = dateOnlyToDate(teudaData.expirationDate);
  }

  if (image) {
    record.photoUrl = image.photoUrl;
    record.cloudinaryPublicId = image.cloudinaryPublicId;
  }

  if (fingerprint) {
    record.photoFingerprint = fingerprint;
  }

  if (teudaData.mashgiachName) {
    record.mashgiachName = teudaData.mashgiachName;
  }

  if (teudaData.mashgiachPhone) {
    record.mashgiachPhone = teudaData.mashgiachPhone;
  }

  return record;
};

// A user can add a teuda only to an approved restaurant. The new teuda is PENDING and does not
// touch any approved teuda until an admin approves it.
export const submitTeudaService = async ({ restaurantId, teudaData, file, user }) => {
  assertUserSubmission(user);
  const restaurant = await findRestaurantByIdRepo(restaurantId);

  if (!restaurant || restaurant.status !== 'APPROVED') {
    throw appError('Restaurant not found', 404);
  }

  if (!hasCertificateEvidence(teudaData, file)) {
    throw appError('Add a photo or at least one certificate detail', 400);
  }

  validateTeudaSubmission(teudaData, file);

  const evidence = withoutUserKashrutLevel(teudaData);
  const fingerprint = photoFingerprint(file);

  const alreadySent = await findSimilarPendingTeudaRepo(
    pendingCertificateLookup({
      restaurantId: restaurant._id,
      userId: user._id,
      evidence,
      file,
    })
  );

  if (alreadySent) {
    throw pendingCertificateConflict();
  }

  const image = file ? await uploadTeudaImageService(file) : null;

  try {
    const teuda = await withTransaction(async () => {
      await lockRestaurantForWriteRepo(restaurant._id, 'APPROVED');
      return createTeudaRepo(
        buildTeudaRecord({
          teudaData: evidence,
          image,
          photoFingerprint: fingerprint,
          restaurantId: restaurant._id,
          userId: user._id,
          withNewRestaurant: false,
        })
      );
    });

    return { id: String(teuda._id), status: teuda.status };
  } catch (error) {
    await cleanupFailedUploadService(image?.cloudinaryPublicId, error);

    if (isPendingCertificateDuplicate(error)) {
      throw pendingCertificateConflict();
    }

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
