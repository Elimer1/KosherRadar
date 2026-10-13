import { withTransaction } from '../repositories/transaction.js';
import { lockRestaurantForWriteRepo } from '../repositories/restaurantIntegrityRepository.js';
import { enqueueImageCleanupRepo } from '../repositories/imageCleanupRepository.js';
import { cleanupFailedUploadService, retryImageCleanupService } from './imageCleanupService.js';
// NEW (Milestone 3): admin moderation of restaurants: lists, create, edit, approve, reject, delete.
// חדש (אבן דרך 3): ניהול מסעדות על ידי מנהל: רשימות, יצירה, עריכה, אישור, דחייה, מחיקה.
import { appError } from '../utils/appError.js';
import { buildPage } from '../utils/pagination.js';
import { normalizeText } from '../utils/normalizeText.js';
import {
  createRestaurantRepo,
  deleteRestaurantByIdRepo,
  findRestaurantByIdRepo,
} from '../repositories/restaurantRepository.js';
import { createTeudaRepo } from '../repositories/teudaRepository.js';
import {
  approvePendingRestaurantRepo,
  findRestaurantWithDetailsRepo,
  listPendingRestaurantsRepo,
  rejectPendingRestaurantRepo,
  saveRestaurantChangesRepo,
  searchRestaurantsRepo,
} from '../repositories/adminRestaurantRepository.js';
import {
  deleteTeudotOfRestaurantRepo,
  findTeudotOfRestaurantForDeleteRepo,
  listAllTeudotOfRestaurantRepo,
  rejectPendingTeudotOfRestaurantRepo,
} from '../repositories/adminTeudaRepository.js';
import {
  deleteReportsOfRestaurantRepo,
  findReportsOfRestaurantRepo,
} from '../repositories/adminReportRepository.js';
import { toAdminRestaurant, toAdminTeuda } from './adminSerializerService.js';
import { findPossibleDuplicatesService } from './duplicateService.js';
import { checkImageFile, uploadTeudaImageService } from './imageUploadService.js';
import { buildKashrutSummary, findConflictingTeudot } from './kashrutStatusService.js';
import { notifyRejectionService } from './moderationNotificationService.js';
import { checkExpirationForAdmin } from './teudaRulesService.js';
import { buildTeudaRecord } from './teudaSubmissionService.js';

const AUTO_REJECT_REASON = 'The restaurant was not approved.';

const loadRestaurantOr404 = async (restaurantId) => {
  const restaurant = await findRestaurantByIdRepo(restaurantId);

  if (!restaurant) {
    throw appError('Restaurant not found', 404);
  }

  return restaurant;
};

export const listPendingRestaurantsService = async ({ page, limit }) => {
  const { items, total } = await listPendingRestaurantsRepo({ page, limit });
  return buildPage({ items: items.map(toAdminRestaurant), total, page, limit });
};

// "Manage restaurants": find any restaurant (any status) by name or address text.
// "ניהול מסעדות": מציאת כל מסעדה (בכל סטטוס) לפי טקסט בשם או בכתובת.
export const searchRestaurantsForAdminService = async ({ search, status, page, limit }) => {
  const normalizedSearch = normalizeText(search || '');
  const { items, total } = await searchRestaurantsRepo({ normalizedSearch, status, page, limit });
  return buildPage({ items: items.map(toAdminRestaurant), total, page, limit });
};

// Everything an admin may see about one restaurant: all certificates in every status and of any age
// (including the ones the public can no longer see), conflict warnings for pending ones, and a preview of
// what the public currently sees.
// כל מה שמנהל רשאי לראות על מסעדה: כל התעודות בכל סטטוס וגיל (גם אלה שהציבור לא רואה), אזהרות קונפליקט, ותצוגה של מה שהציבור רואה.
export const getRestaurantForAdminService = async (restaurantId) => {
  const restaurant = await findRestaurantWithDetailsRepo(restaurantId);

  if (!restaurant) {
    throw appError('Restaurant not found', 404);
  }

  const teudot = await listAllTeudotOfRestaurantRepo(restaurant._id);
  const approvedTeudot = teudot.filter((teuda) => teuda.status === 'APPROVED');

  return {
    restaurant: toAdminRestaurant(restaurant),
    teudot: teudot.map((teuda) => ({
      ...toAdminTeuda(teuda),
      conflicts: teuda.status === 'PENDING' ? findConflictingTeudot(teuda, approvedTeudot) : [],
    })),
    publicKashrutPreview: restaurant.status === 'APPROVED' ? buildKashrutSummary(restaurant, teudot) : null,
  };
};

const toRestaurantChanges = (restaurantData, extras) => {
  // Full replace of the admin-editable fields. A field left empty in the form is cleared.
  // geoapifyPlaceId is not editable here, so it is never touched.
  // החלפה מלאה של השדות הניתנים לעריכה. שדה ריק בטופס מתנקה. geoapifyPlaceId אינו נערך כאן ולכן לא נוגעים בו.
  return {
    name: restaurantData.name,
    address: restaurantData.address,
    city: restaurantData.city,
    latitude: restaurantData.latitude,
    longitude: restaurantData.longitude,
    phone: restaurantData.phone,
    website: restaurantData.website,
    foodType: restaurantData.foodType,
    categories: restaurantData.categories,
    foodKeywords: restaurantData.foodKeywords,
    claimedHechsher: restaurantData.claimedHechsher,
    claimedHechsherOther: restaurantData.claimedHechsherOther,
    claimedKashrutLevel: restaurantData.claimedKashrutLevel,
    nameHe: extras.nameHe,
    nameEn: extras.nameEn,
    addressHe: extras.addressHe,
    addressEn: extras.addressEn,
    adminNote: extras.adminNote,
    kosharotUrl: extras.kosharotUrl,
  };
};

// An admin creates a restaurant that is approved at once, optionally with an approved certificate.
// Possible duplicates are still looked up and saved as a warning; they never block the admin.
// מנהל יוצר מסעדה שמאושרת מיד, אפשר גם עם תעודה מאושרת. כפילויות אפשריות נשמרות כאזהרה ולא חוסמות.
export const createRestaurantByAdminService = async ({ restaurantData, extras, teudaData, file, admin }) => {
  if (teudaData) {
    checkExpirationForAdmin(teudaData.expirationDate);
    checkImageFile(file);
  } else if (file) {
    throw appError('A photo can only be sent together with certificate details', 400);
  }

  const possibleDuplicates = await findPossibleDuplicatesService(restaurantData);

  const image = teudaData ? await uploadTeudaImageService(file) : null;

  try {
    return await withTransaction(async () => {
      const restaurant = await createRestaurantRepo({
        ...restaurantData, ...extras, status: 'APPROVED', submittedBy: admin._id, possibleDuplicates,
      });
      const teuda = teudaData ? await createTeudaRepo({
        ...buildTeudaRecord({ teudaData, image, restaurantId: restaurant._id, userId: admin._id, withNewRestaurant: false }),
        status: 'APPROVED', adminNote: teudaData.adminNote,
      }) : null;
      return { restaurant: toAdminRestaurant(restaurant), teuda: teuda ? toAdminTeuda(teuda) : null,
        possibleDuplicateCount: possibleDuplicates.length };
    });
  } catch (error) {
    await cleanupFailedUploadService(image?.cloudinaryPublicId, error);
    throw error;
  }
};

// Edit a pending, approved or rejected restaurant. The status never changes through an edit.
// עריכת מסעדה. הסטטוס לא משתנה דרך עריכה.
export const updateRestaurantByAdminService = async ({ restaurantId, restaurantData, extras }) => {
  const restaurant = await loadRestaurantOr404(restaurantId);
  const saved = await saveRestaurantChangesRepo(restaurant, toRestaurantChanges(restaurantData, extras));
  return toAdminRestaurant(saved);
};

// Approving only changes the restaurant. Contribution points are decided when its certificate is
// approved, so approving a restaurant on its own never gives points.
// אישור משנה רק את המסעדה. נקודות נקבעות באישור התעודה, ולכן אישור מסעדה לבדו לא נותן נקודות.
export const approveRestaurantService = async ({ restaurantId }) => {
  const restaurant = await loadRestaurantOr404(restaurantId);

  if (restaurant.status === 'APPROVED') {
    return { restaurant: toAdminRestaurant(restaurant), alreadyApproved: true };
  }

  if (restaurant.status === 'REJECTED') {
    throw appError('A rejected restaurant cannot be approved. Ask the user to submit it again.', 409);
  }

  const approved = await approvePendingRestaurantRepo(restaurant._id);

  if (!approved) {
    const current = await findRestaurantByIdRepo(restaurant._id);

    if (current && current.status === 'APPROVED') {
      return { restaurant: toAdminRestaurant(current), alreadyApproved: true };
    }

    throw appError('This restaurant was just handled by another admin. Please refresh.', 409);
  }

  return { restaurant: toAdminRestaurant(approved), alreadyApproved: false };
};

export const rejectRestaurantService = async ({ restaurantId, reason }) => {
  const rejected = await withTransaction(async () => {
    const restaurant = await loadRestaurantOr404(restaurantId);
    if (restaurant.status !== 'PENDING') {
      throw appError('Only a restaurant that is waiting for review can be rejected. Delete it instead.', 409);
    }
    const rejected = await rejectPendingRestaurantRepo(restaurant._id, reason);
    if (!rejected) {
      throw appError('This restaurant was just handled by another admin. Please refresh.', 409);
    }
    await rejectPendingTeudotOfRestaurantRepo(restaurant._id, AUTO_REJECT_REASON);
    return rejected;
  });
  // Notify only after both database decisions commit; a mail failure cannot undo moderation.
  const emailStatus = await notifyRejectionService({
    submitterId: rejected.submittedBy,
    kind: 'restaurant',
    subjectName: rejected.name,
    reason,
  });

  return { restaurant: toAdminRestaurant(rejected), emailStatus };
};

// Deletion policy (spec 6): the restaurant, all its certificates (any status or age) and its reports are
// removed; the certificate photos are deleted from Cloudinary afterwards. Contribution points already
// given stay with the users, and their award keys stay too, so nothing can be awarded again.
// מדיניות מחיקה: המסעדה, כל התעודות והדיווחים שלה נמחקים; התמונות נמחקות מ-Cloudinary. נקודות שניתנו נשארות.
export const deleteRestaurantService = async ({ restaurantId }) => {
  const { ids, deletedCertificates } = await withTransaction(async () => {
    const restaurant = await loadRestaurantOr404(restaurantId);
    await lockRestaurantForWriteRepo(restaurant._id);
    const teudot = await findTeudotOfRestaurantForDeleteRepo(restaurant._id);
    const reports = await findReportsOfRestaurantRepo(restaurant._id);
    const ids = [...teudot, ...reports].map((row) => row.cloudinaryPublicId).filter(Boolean);
    await enqueueImageCleanupRepo(ids);
    await deleteTeudotOfRestaurantRepo(restaurant._id);
    await deleteReportsOfRestaurantRepo(restaurant._id);
    await deleteRestaurantByIdRepo(restaurant._id);
    return { ids, deletedCertificates: teudot.length };
  });
  const imageCleanup = await retryImageCleanupService(ids);
  return { deleted: true, deletedCertificates, imageCleanup };
};
