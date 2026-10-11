// NEW (Milestone 3): private contribution points (spec section 7). Idempotent: one award per source.
// חדש (אבן דרך 3): נקודות תרומה פרטיות (סעיף 7). כל מקור מקבל ניקוד פעם אחת בלבד.
//
//   +3  USER sent a NEW restaurant together with a certificate, and both are now APPROVED
//   +2  USER sent a certificate for an EXISTING restaurant and it is APPROVED
//   +1  USER report that led to a correction an admin actually applied
//   0   everything else (rejected, claim without certificate, informational resolution, admin submitters)
//
// Points are given when the certificate is approved. A certificate can only be approved after its
// restaurant is approved, so for the +3 case that moment is the one where "both are approved" is true,
// whichever order the admin handled them in. A restaurant on its own never earns points.
// הניקוד ניתן ברגע אישור התעודה. אי אפשר לאשר תעודה לפני המסעדה, ולכן ברגע הזה שניהם מאושרים.

import { findUserByIdRepo, awardPointsOnceRepo } from '../repositories/userRepository.js';

export const POINTS_NEW_RESTAURANT_WITH_TEUDA = 3;
export const POINTS_TEUDA_FOR_EXISTING_RESTAURANT = 2;
export const POINTS_APPLIED_CORRECTION = 1;

const notAwarded = (reason) => ({ awarded: false, points: 0, reason });

// Gives `points` once for `key`. Calling it again with the same key changes nothing.
// Only ordinary USER accounts earn points: admins moderate, they do not collect points.
// מוסיף ניקוד פעם אחת לכל מפתח. רק משתמשים רגילים (USER) צוברים ניקוד.
const awardOnce = async ({ userId, key, points }) => {
  const submitter = await findUserByIdRepo(userId);

  if (!submitter) {
    return notAwarded('SUBMITTER_NOT_FOUND');
  }

  if (submitter.role !== 'USER') {
    return notAwarded('SUBMITTER_IS_NOT_A_USER');
  }

  const updatedUser = await awardPointsOnceRepo(userId, key, points);

  if (!updatedUser) {
    return notAwarded('ALREADY_AWARDED');
  }

  return { awarded: true, points, reason: 'AWARDED' };
};

// NEW (Milestone 3): points for an approved certificate (+3 or +2). Safe to call again after a retry.
// חדש (אבן דרך 3): ניקוד על תעודה מאושרת (+3 או +2). בטוח לקריאה חוזרת.
export const awardPointsForApprovedTeudaService = async ({ teuda, restaurant }) => {
  if (teuda.status !== 'APPROVED' || restaurant.status !== 'APPROVED') {
    return notAwarded('NOT_APPROVED');
  }

  // "New restaurant with certificate" only counts when the same person sent both.
  const withNewRestaurant =
    teuda.submittedWithNewRestaurant && String(restaurant.submittedBy) === String(teuda.submittedBy);

  return awardOnce({
    userId: teuda.submittedBy,
    key: `TEUDA:${teuda._id}`,
    points: withNewRestaurant ? POINTS_NEW_RESTAURANT_WITH_TEUDA : POINTS_TEUDA_FOR_EXISTING_RESTAURANT,
  });
};

// NEW (Milestone 3): +1 for a report whose correction was really applied (not just marked RESOLVED).
// חדש (אבן דרך 3): +1 על דיווח שהתיקון שלו הוחל בפועל (לא רק סומן כטופל).
export const awardPointsForAppliedCorrectionService = async ({ report }) => {
  if (report.status !== 'RESOLVED' || !report.correctionApplied) {
    return notAwarded('NO_CORRECTION_APPLIED');
  }

  return awardOnce({
    userId: report.submittedBy,
    key: `REPORT:${report._id}`,
    points: POINTS_APPLIED_CORRECTION,
  });
};
