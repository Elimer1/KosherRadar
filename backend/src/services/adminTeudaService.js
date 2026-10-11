// NEW (Milestone 3): admin moderation of kashrut certificates (teudot): list, create, edit, approve, reject, delete.
// חדש (אבן דרך 3): ניהול תעודות כשרות (teudot) על ידי מנהל: רשימות, יצירה, עריכה, אישור, דחייה, מחיקה.
import { EXPIRING_SOON_DAYS } from '../config/constants.js';
import { appError } from '../utils/appError.js';
import { buildPage } from '../utils/pagination.js';
import { addDaysToDateOnly, dateOnlyToDate, dateToDateOnly, todayInIsrael } from '../utils/israelDate.js';
import { findRestaurantByIdRepo } from '../repositories/restaurantRepository.js';
import {
  createTeudaRepo,
  findApprovedTeudotByRestaurantRepo,
  findTeudaByIdRepo,
} from '../repositories/teudaRepository.js';
import {
  approvePendingTeudaRepo,
  deleteTeudaByIdRepo,
  listApprovedTeudotExpiringBetweenRepo,
  listApprovedTeudotOfRestaurantsRepo,
  listPendingTeudotRepo,
  rejectPendingTeudaRepo,
  saveTeudaChangesRepo,
} from '../repositories/adminTeudaRepository.js';
import { removeTeudaFromReportsRepo } from '../repositories/adminReportRepository.js';
import { toAdminTeuda } from './adminSerializerService.js';
import { checkImageFile, deleteImageService, uploadTeudaImageService } from './imageUploadService.js';
import { findConflictingTeudot } from './kashrutStatusService.js';
import { notifyRejectionService } from './moderationNotificationService.js';
import { awardPointsForApprovedTeudaService } from './pointsService.js';
import { checkExpirationForAdmin } from './teudaRulesService.js';
import { buildTeudaRecord } from './teudaSubmissionService.js';

const EXPIRING_LIST_LIMIT = 200;

const idOf = (value) => (value && value._id ? String(value._id) : String(value));

const loadTeudaOr404 = async (teudaId) => {
  const teuda = await findTeudaByIdRepo(teudaId);

  if (!teuda) {
    throw appError('Certificate not found', 404);
  }

  return teuda;
};

// Only used for the wording of an email, so a lookup problem must never fail the moderation call.
const getRestaurantNameForEmail = async (restaurantId) => {
  try {
    const restaurant = await findRestaurantByIdRepo(restaurantId);
    return restaurant ? restaurant.name : 'a restaurant';
  } catch (error) {
    return 'a restaurant';
  }
};

// Pending certificates with the facts the admin needs before deciding: is the restaurant approved yet,
// and does an already valid approved certificate cover the same kashrut level (advisory warning only).
// תעודות ממתינות עם מה שהמנהל צריך לפני החלטה: האם המסעדה כבר מאושרת, והאם יש תעודה תקפה באותה רמה (אזהרה בלבד).
export const listPendingTeudotService = async ({ page, limit }) => {
  const { items, total } = await listPendingTeudotRepo({ page, limit });

  const restaurantIds = [...new Set(items.filter((teuda) => teuda.restaurant).map((teuda) => idOf(teuda.restaurant)))];
  const approved = restaurantIds.length > 0 ? await listApprovedTeudotOfRestaurantsRepo(restaurantIds) : [];

  const approvedByRestaurant = new Map();
  for (const teuda of approved) {
    const key = idOf(teuda.restaurant);
    approvedByRestaurant.set(key, [...(approvedByRestaurant.get(key) || []), teuda]);
  }

  const mapped = items.map((teuda) => {
    const restaurantKey = teuda.restaurant ? idOf(teuda.restaurant) : null;

    return {
      ...toAdminTeuda(teuda),
      restaurantApproved: Boolean(teuda.restaurant && teuda.restaurant.status === 'APPROVED'),
      conflicts: findConflictingTeudot(teuda, approvedByRestaurant.get(restaurantKey) || []),
    };
  });

  return buildPage({ items: mapped, total, page, limit });
};

// "Expiring soon": approved certificates that expire from today up to 30 days ahead (Israel dates).
// "פגות בקרוב": תעודות מאושרות שפגות מהיום ועד 30 יום קדימה (לפי תאריך בישראל).
export const listExpiringSoonService = async () => {
  const today = todayInIsrael();
  const lastDay = addDaysToDateOnly(today, EXPIRING_SOON_DAYS);

  const teudot = await listApprovedTeudotExpiringBetweenRepo({
    fromDate: dateOnlyToDate(today),
    toDate: dateOnlyToDate(lastDay),
    limit: EXPIRING_LIST_LIMIT,
  });

  const msPerDay = 24 * 60 * 60 * 1000;

  return teudot.map((teuda) => {
    const daysLeft = Math.round(
      (dateOnlyToDate(dateToDateOnly(teuda.expirationDate)) - dateOnlyToDate(today)) / msPerDay
    );
    return { ...toAdminTeuda(teuda, today), daysLeft };
  });
};

// An admin adds a certificate that is approved at once (spec 6). Expired dates are allowed because the
// admin may be recording old evidence. The restaurant must already be approved (spec 6 and 18).
// מנהל מוסיף תעודה שמאושרת מיד. תאריכים שכבר עברו מותרים. המסעדה חייבת להיות מאושרת כבר.
export const createTeudaByAdminService = async ({ restaurantId, teudaData, file, admin }) => {
  const restaurant = await findRestaurantByIdRepo(restaurantId);

  if (!restaurant) {
    throw appError('Restaurant not found', 404);
  }

  if (restaurant.status !== 'APPROVED') {
    throw appError('Approve the restaurant first. A certificate cannot be approved before its restaurant.', 409, 'RESTAURANT_NOT_APPROVED');
  }

  checkExpirationForAdmin(teudaData.expirationDate);
  checkImageFile(file);

  const image = await uploadTeudaImageService(file);

  try {
    const teuda = await createTeudaRepo({
      ...buildTeudaRecord({
        teudaData,
        image,
        restaurantId: restaurant._id,
        userId: admin._id,
        withNewRestaurant: false,
      }),
      status: 'APPROVED',
      adminNote: teudaData.adminNote,
    });

    return toAdminTeuda(teuda);
  } catch (error) {
    await deleteImageService(image.cloudinaryPublicId);
    throw error;
  }
};

// Admin edits a pending or approved certificate. The status does not change: editing an approved
// certificate keeps it approved. The photo cannot be replaced here (delete and add a new certificate).
// עריכת תעודה ממתינה או מאושרת. הסטטוס לא משתנה: עריכה של תעודה מאושרת משאירה אותה מאושרת.
export const updateTeudaByAdminService = async ({ teudaId, teudaData }) => {
  const teuda = await loadTeudaOr404(teudaId);

  checkExpirationForAdmin(teudaData.expirationDate);

  const saved = await saveTeudaChangesRepo(teuda, {
    hechsher: teudaData.hechsher,
    hechsherOther: teudaData.hechsherOther,
    kashrutLevel: teudaData.kashrutLevel,
    expirationDate: dateOnlyToDate(teudaData.expirationDate),
    mashgiachName: teudaData.mashgiachName,
    mashgiachPhone: teudaData.mashgiachPhone,
    adminNote: teudaData.adminNote,
  });

  return toAdminTeuda(saved);
};

// Approve a pending certificate. Rules:
//  - Its restaurant must be APPROVED already (the one hard rule, spec 18).
//  - A conflict (same level as another valid certificate) is only returned as a warning; it never blocks.
//  - Repeating the call changes nothing and cannot award points twice.
// אישור תעודה ממתינה. המסעדה חייבת להיות מאושרת. קונפליקט רמה הוא אזהרה בלבד ולא חוסם. קריאה חוזרת לא משנה דבר.
export const approveTeudaService = async ({ teudaId }) => {
  const teuda = await loadTeudaOr404(teudaId);

  if (teuda.status === 'REJECTED') {
    throw appError('A rejected certificate cannot be approved. Ask the user to submit it again.', 409);
  }

  const restaurant = await findRestaurantByIdRepo(teuda.restaurant);

  if (!restaurant || restaurant.status !== 'APPROVED') {
    throw appError('Approve the restaurant first. A certificate cannot be approved before its restaurant.', 409, 'RESTAURANT_NOT_APPROVED');
  }

  const approvedTeudot = await findApprovedTeudotByRestaurantRepo(restaurant._id);
  const conflictWarning = findConflictingTeudot(teuda, approvedTeudot);

  let approved = teuda;
  let alreadyApproved = teuda.status === 'APPROVED';

  if (!alreadyApproved) {
    approved = await approvePendingTeudaRepo(teuda._id);

    if (!approved) {
      // Another admin handled it between our read and our update.
      const current = await findTeudaByIdRepo(teuda._id);

      if (!current || current.status !== 'APPROVED') {
        throw appError('This certificate was just handled by another admin. Please refresh.', 409);
      }

      approved = current;
      alreadyApproved = true;
    }
  }

  // Runs on repeated approvals too: the award is guarded, so this also repairs a failed first attempt.
  // רץ גם באישור חוזר: הניקוד מוגן מכפילות, ולכן זה גם מתקן ניסיון ראשון שנכשל.
  const points = await awardPointsForApprovedTeudaService({ teuda: approved, restaurant });

  return { teuda: toAdminTeuda(approved), alreadyApproved, conflictWarning, points };
};

export const rejectTeudaService = async ({ teudaId, reason }) => {
  const teuda = await loadTeudaOr404(teudaId);

  if (teuda.status !== 'PENDING') {
    throw appError('Only a certificate that is waiting for review can be rejected. Delete it instead.', 409);
  }

  const rejected = await rejectPendingTeudaRepo(teuda._id, reason);

  if (!rejected) {
    throw appError('This certificate was just handled by another admin. Please refresh.', 409);
  }

  // The decision is saved. From here on, nothing may undo it, even if the email cannot be sent.
  // ההחלטה נשמרה. מכאן שום דבר לא מבטל אותה, גם אם המייל לא נשלח.
  const emailStatus = await notifyRejectionService({
    submitterId: rejected.submittedBy,
    kind: 'certificate',
    subjectName: await getRestaurantNameForEmail(rejected.restaurant),
    reason,
  });

  return { teuda: toAdminTeuda(rejected), emailStatus };
};

// Deleting keeps points as they are (the contribution was real when it was approved). Reports about the
// certificate stay, without the link, so an admin can still close them. The photo is removed from
// Cloudinary afterwards; if that fails it is only logged.
// מחיקה משאירה את הנקודות כמות שהן. דיווחים על התעודה נשארים בלי הקישור. התמונה נמחקת מ-Cloudinary בסוף.
export const deleteTeudaService = async ({ teudaId }) => {
  const teuda = await loadTeudaOr404(teudaId);

  await deleteTeudaByIdRepo(teuda._id);
  await removeTeudaFromReportsRepo(teuda._id);
  await deleteImageService(teuda.cloudinaryPublicId);

  return { deleted: true };
};
