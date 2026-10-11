// NEW (Milestone 3): the shapes sent to ADMIN endpoints only (they include private notes, submitter emails
// and certificates that are hidden from the public). Public endpoints must use kashrutStatusService instead.
// חדש (אבן דרך 3): הצורות שנשלחות רק לממשקי מנהל (כוללות הערות פרטיות, מיילים ותעודות ישנות). ממשק ציבורי לא משתמש בהן.
import { dateToDateOnly, todayInIsrael } from '../utils/israelDate.js';
import { getTeudaVisibility } from './teudaRulesService.js';

const idOf = (value) => (value && value._id ? String(value._id) : value ? String(value) : null);

// A populated user has an email; a plain id does not. Never includes the password hash or points.
// משתמש שהוצמד (populate) כולל מייל; מזהה פשוט לא. לעולם לא כולל סיסמה או נקודות.
const toUserBrief = (user) => {
  if (!user) {
    return null;
  }

  return { id: idOf(user), email: user.email || null };
};

const toRestaurantBrief = (restaurant) => {
  if (!restaurant) {
    return null;
  }

  if (!restaurant.name) {
    return { id: idOf(restaurant), name: null, address: null, city: null, status: null };
  }

  return {
    id: idOf(restaurant),
    name: restaurant.name,
    address: restaurant.address,
    city: restaurant.city || null,
    status: restaurant.status || null,
  };
};

export const toAdminRestaurant = (restaurant) => {
  return {
    id: idOf(restaurant),
    name: restaurant.name,
    nameHe: restaurant.nameHe || null,
    nameEn: restaurant.nameEn || null,
    address: restaurant.address,
    addressHe: restaurant.addressHe || null,
    addressEn: restaurant.addressEn || null,
    city: restaurant.city || null,
    latitude: restaurant.latitude ?? null,
    longitude: restaurant.longitude ?? null,
    geoapifyPlaceId: restaurant.geoapifyPlaceId || null,
    phone: restaurant.phone || null,
    website: restaurant.website || null,
    foodType: restaurant.foodType,
    categories: restaurant.categories || [],
    foodKeywords: restaurant.foodKeywords || [],
    claimedHechsher: restaurant.claimedHechsher || null,
    claimedHechsherOther: restaurant.claimedHechsherOther || null,
    claimedKashrutLevel: restaurant.claimedKashrutLevel || null,
    status: restaurant.status,
    submittedBy: toUserBrief(restaurant.submittedBy),
    adminNote: restaurant.adminNote || null,
    rejectionReason: restaurant.rejectionReason || null,
    kosharotUrl: restaurant.kosharotUrl || null,
    possibleDuplicates: (restaurant.possibleDuplicates || []).map((duplicate) => ({
      restaurant: toRestaurantBrief(duplicate.restaurant),
      reasons: duplicate.reasons || [],
    })),
    createdAt: restaurant.createdAt,
  };
};

// `visibility` is VALID, RECENT_EXPIRED or ADMIN_ONLY, so the admin can see which old certificates
// the public cannot see.
// visibility הוא VALID, RECENT_EXPIRED או ADMIN_ONLY, כך שהמנהל רואה אילו תעודות ישנות מוסתרות מהציבור.
export const toAdminTeuda = (teuda, today = todayInIsrael()) => {
  return {
    id: idOf(teuda),
    restaurant: toRestaurantBrief(teuda.restaurant),
    hechsher: teuda.hechsher,
    hechsherOther: teuda.hechsherOther || null,
    kashrutLevel: teuda.kashrutLevel,
    expirationDate: dateToDateOnly(teuda.expirationDate),
    visibility: getTeudaVisibility(teuda.expirationDate, today),
    photoUrl: teuda.photoUrl,
    mashgiachName: teuda.mashgiachName,
    mashgiachPhone: teuda.mashgiachPhone,
    status: teuda.status,
    submittedBy: toUserBrief(teuda.submittedBy),
    submittedWithNewRestaurant: Boolean(teuda.submittedWithNewRestaurant),
    adminNote: teuda.adminNote || null,
    rejectionReason: teuda.rejectionReason || null,
    createdAt: teuda.createdAt,
  };
};

export const toAdminReport = (report) => {
  const teuda = report.teuda && report.teuda.hechsher
    ? {
        id: idOf(report.teuda),
        hechsher: report.teuda.hechsher,
        hechsherOther: report.teuda.hechsherOther || null,
        kashrutLevel: report.teuda.kashrutLevel,
        expirationDate: dateToDateOnly(report.teuda.expirationDate),
      }
    : null;

  return {
    id: idOf(report),
    restaurant: toRestaurantBrief(report.restaurant),
    teuda,
    submittedBy: toUserBrief(report.submittedBy),
    type: report.type,
    description: report.description,
    proposedHechsher: report.proposedHechsher || null,
    proposedHechsherOther: report.proposedHechsherOther || null,
    proposedKashrutLevel: report.proposedKashrutLevel || null,
    status: report.status,
    adminNote: report.adminNote || null,
    rejectionReason: report.rejectionReason || null,
    correctionApplied: Boolean(report.correctionApplied),
    createdAt: report.createdAt,
  };
};
