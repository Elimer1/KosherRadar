// NEW (Milestone 3): admin handling of user reports and corrections: list, resolve (apply or not), reject.
// חדש (אבן דרך 3): טיפול מנהל בדיווחים ותיקונים של משתמשים: רשימה, סגירה (עם תיקון או בלי), דחייה.
import { HECHSHER_OTHER } from '../config/constants.js';
import { appError } from '../utils/appError.js';
import { buildPage } from '../utils/pagination.js';
import { findRestaurantByIdRepo } from '../repositories/restaurantRepository.js';
import { findTeudaByIdRepo } from '../repositories/teudaRepository.js';
import { saveRestaurantChangesRepo } from '../repositories/adminRestaurantRepository.js';
import { saveTeudaChangesRepo } from '../repositories/adminTeudaRepository.js';
import {
  findReportByIdRepo,
  listPendingReportsRepo,
  rejectPendingReportRepo,
  resolvePendingReportRepo,
} from '../repositories/adminReportRepository.js';
import { toAdminReport } from './adminSerializerService.js';
import { notifyRejectionService } from './moderationNotificationService.js';
import { awardPointsForAppliedCorrectionService } from './pointsService.js';

const loadReportOr404 = async (reportId) => {
  const report = await findReportByIdRepo(reportId);

  if (!report) {
    throw appError('Report not found', 404);
  }

  return report;
};

export const listPendingReportsService = async ({ page, limit }) => {
  const { items, total } = await listPendingReportsRepo({ page, limit });
  return buildPage({ items: items.map(toAdminReport), total, page, limit });
};

// Copies the hechsher / level a user proposed into the field names of the record being corrected.
// A certificate stores "hechsher", a restaurant stores its unverified claim as "claimedHechsher".
// מעתיק את ההשגחה/רמה שהמשתמש הציע לשמות השדות של הרשומה שמתקנים. תעודה: hechsher, מסעדה: claimedHechsher.
export const buildCorrectionChanges = (report, target) => {
  const prefix = target === 'TEUDA' ? '' : 'claimed';
  const field = (name) => (prefix ? `${prefix}${name[0].toUpperCase()}${name.slice(1)}` : name);
  const changes = {};

  if (report.proposedHechsher) {
    changes[field('hechsher')] = report.proposedHechsher;
    changes[field('hechsherOther')] =
      report.proposedHechsher === HECHSHER_OTHER ? report.proposedHechsherOther : undefined;
  }

  if (report.proposedKashrutLevel) {
    changes[field('kashrutLevel')] = report.proposedKashrutLevel;
  }

  return changes;
};

// Applies the user's proposal to the certificate the report names, or to the restaurant's own claim when
// the report names no certificate. Applying the same proposal twice gives the same result, so a retry
// after a failure is safe.
// מחיל את ההצעה של המשתמש על התעודה שהדיווח מציין, או על הטענה של המסעדה כשאין תעודה. הפעלה כפולה בטוחה.
const applyProposedCorrection = async (report) => {
  const proposesSomething = report.proposedHechsher || report.proposedKashrutLevel;

  if (report.type !== 'KASHRUT_UPDATE' || !proposesSomething) {
    throw appError('This report has no proposed hechsher or level to apply.', 400);
  }

  if (report.teuda) {
    const teuda = await findTeudaByIdRepo(report.teuda);

    if (!teuda) {
      throw appError('The certificate in this report no longer exists. Resolve it without applying a correction.', 409);
    }

    await saveTeudaChangesRepo(teuda, buildCorrectionChanges(report, 'TEUDA'));
    return;
  }

  const restaurant = await findRestaurantByIdRepo(report.restaurant);

  if (!restaurant) {
    throw appError('The restaurant in this report no longer exists.', 409);
  }

  await saveRestaurantChangesRepo(restaurant, buildCorrectionChanges(report, 'RESTAURANT'));
};

// Resolve a report in one of three ways (spec 6 and 7):
//   APPLY_PROPOSED           the server applies the proposal  -> correctionApplied, +1 point
//   CORRECTION_ALREADY_MADE  the admin edited the record by hand -> correctionApplied, +1 point
//   NO_CORRECTION            informational only                -> no change, 0 points
// Only a real applied correction earns the point, and never twice for the same report.
// סגירת דיווח באחת משלוש דרכים. רק תיקון שהוחל בפועל מזכה בנקודה, ולעולם לא פעמיים על אותו דיווח.
export const resolveReportService = async ({ reportId, resolution, adminNote }) => {
  const report = await loadReportOr404(reportId);

  if (report.status === 'REJECTED') {
    throw appError('A rejected report cannot be resolved.', 409);
  }

  let resolved = report;
  let alreadyResolved = report.status === 'RESOLVED';

  if (!alreadyResolved) {
    const correctionApplied = resolution !== 'NO_CORRECTION';

    if (resolution === 'APPLY_PROPOSED') {
      await applyProposedCorrection(report);
    }

    resolved = await resolvePendingReportRepo(report._id, { correctionApplied, adminNote });

    if (!resolved) {
      throw appError('This report was just handled by another admin. Please refresh.', 409);
    }
  }

  // A repeated call keeps the original outcome and only retries the guarded award.
  // קריאה חוזרת שומרת את התוצאה המקורית ורק מנסה שוב את הענקת הנקודה המוגנת.
  const points = await awardPointsForAppliedCorrectionService({ report: resolved });

  return { report: toAdminReport(resolved), alreadyResolved, points };
};

export const rejectReportService = async ({ reportId, reason }) => {
  const report = await loadReportOr404(reportId);

  if (report.status !== 'PENDING') {
    throw appError('Only a report that is waiting for review can be rejected.', 409);
  }

  const rejected = await rejectPendingReportRepo(report._id, reason);

  if (!rejected) {
    throw appError('This report was just handled by another admin. Please refresh.', 409);
  }

  let restaurantName = 'a restaurant';

  try {
    const restaurant = await findRestaurantByIdRepo(rejected.restaurant);
    restaurantName = restaurant ? restaurant.name : restaurantName;
  } catch (error) {
    // Only used for the email wording.
  }

  const emailStatus = await notifyRejectionService({
    submitterId: rejected.submittedBy,
    kind: 'report',
    subjectName: restaurantName,
    reason,
  });

  return { report: toAdminReport(rejected), emailStatus };
};
