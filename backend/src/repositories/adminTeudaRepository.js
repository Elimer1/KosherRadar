// NEW (Milestone 3): database operations used only by the admin moderation of certificates (teudot).
// חדש (אבן דרך 3): פעולות מסד נתונים שמשמשות רק את ניהול התעודות (teudot) על ידי מנהל.
import { Teuda } from '../models/Teuda.js';

const RESTAURANT_FIELDS = 'name address city status submittedBy';

export const listPendingTeudotRepo = async ({ page, limit }) => {
  const filter = { status: 'PENDING' };

  const [items, total] = await Promise.all([
    Teuda.find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('restaurant', RESTAURANT_FIELDS)
      .populate('submittedBy', 'email')
      .lean(),
    Teuda.countDocuments(filter),
  ]);

  return { items, total };
};

// Approved certificates whose expiration date is between the two dates (both included), soonest first.
// The list is capped so one very large day cannot return thousands of rows.
// תעודות מאושרות שתוקפן בין שני התאריכים (כולל), הקרובה ביותר קודם. הרשימה מוגבלת.
export const listApprovedTeudotExpiringBetweenRepo = async ({ fromDate, toDate, limit }) => {
  return Teuda.find({ status: 'APPROVED', expirationDate: { $gte: fromDate, $lte: toDate } })
    .sort({ expirationDate: 1, _id: 1 })
    .limit(limit)
    .populate('restaurant', RESTAURANT_FIELDS)
    .lean();
};

// Every certificate of a restaurant in every status and of any age. Admin only.
// כל התעודות של מסעדה בכל סטטוס ובכל גיל. למנהלים בלבד.
export const listAllTeudotOfRestaurantRepo = async (restaurantId) => {
  return Teuda.find({ restaurant: restaurantId }).sort({ expirationDate: -1, _id: 1 }).populate('submittedBy', 'email').lean();
};

// One query for the approved certificates of several restaurants (used for the conflict warning).
export const listApprovedTeudotOfRestaurantsRepo = async (restaurantIds) => {
  return Teuda.find({ restaurant: { $in: restaurantIds }, status: 'APPROVED' }).lean();
};

export const approvePendingTeudaRepo = async (teudaId) => {
  return Teuda.findOneAndUpdate(
    { _id: teudaId, status: 'PENDING' },
    { $set: { status: 'APPROVED' }, $unset: { rejectionReason: 1 } },
    { new: true }
  );
};

export const rejectPendingTeudaRepo = async (teudaId, reason) => {
  return Teuda.findOneAndUpdate(
    { _id: teudaId, status: 'PENDING' },
    { $set: { status: 'REJECTED', rejectionReason: reason } },
    { new: true }
  );
};

// When a restaurant is rejected its waiting certificates can never be approved, so they are closed too.
// כשמסעדה נדחית, התעודות הממתינות שלה לא יאושרו לעולם, ולכן גם הן נסגרות.
export const rejectPendingTeudotOfRestaurantRepo = async (restaurantId, reason) => {
  return Teuda.updateMany(
    { restaurant: restaurantId, status: 'PENDING' },
    { $set: { status: 'REJECTED', rejectionReason: reason } }
  );
};

export const saveTeudaChangesRepo = async (teuda, changes) => {
  const next = { ...changes };

  for (const key of Object.keys(next)) {
    if (next[key] === null) {
      teuda.set(key, undefined);
      delete next[key];
    }
  }

  teuda.set(next);
  return teuda.save();
};

export const deleteTeudaByIdRepo = async (teudaId) => {
  return Teuda.findByIdAndDelete(teudaId);
};

export const findTeudotOfRestaurantForDeleteRepo = async (restaurantId) => {
  return Teuda.find({ restaurant: restaurantId }).select('cloudinaryPublicId').lean();
};

export const deleteTeudotOfRestaurantRepo = async (restaurantId) => {
  return Teuda.deleteMany({ restaurant: restaurantId });
};
