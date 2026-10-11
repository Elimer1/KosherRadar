// NEW (Milestone 3): database operations used only by the admin moderation of restaurants.
// חדש (אבן דרך 3): פעולות מסד נתונים שמשמשות רק את ניהול המסעדות על ידי מנהל.
import { Restaurant } from '../models/Restaurant.js';

const SUBMITTER_FIELDS = 'email';
const DUPLICATE_FIELDS = 'name address city status';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Oldest first, so the review queue is handled in the order it arrived.
// הישן ביותר קודם, כדי שתור הבדיקה יטופל לפי סדר ההגעה.
export const listPendingRestaurantsRepo = async ({ page, limit }) => {
  const filter = { status: 'PENDING' };

  const [items, total] = await Promise.all([
    Restaurant.find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('submittedBy', SUBMITTER_FIELDS)
      .populate('possibleDuplicates.restaurant', DUPLICATE_FIELDS)
      .lean(),
    Restaurant.countDocuments(filter),
  ]);

  return { items, total };
};

// Search by name or address text, normalized the same way as the stored copies. The search text is
// escaped, so characters like "(" or "*" are matched literally and cannot build a harmful pattern.
// חיפוש לפי טקסט בשם או בכתובת. הטקסט עובר escape כך שתווים מיוחדים נבדקים כמות שהם.
export const searchRestaurantsRepo = async ({ normalizedSearch, status, page, limit }) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (normalizedSearch) {
    const pattern = new RegExp(escapeRegex(normalizedSearch));
    filter.$or = [{ nameNormalized: pattern }, { addressNormalized: pattern }];
  }

  const [items, total] = await Promise.all([
    Restaurant.find(filter)
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Restaurant.countDocuments(filter),
  ]);

  return { items, total };
};

export const findRestaurantWithDetailsRepo = async (restaurantId) => {
  return Restaurant.findById(restaurantId)
    .populate('submittedBy', SUBMITTER_FIELDS)
    .populate('possibleDuplicates.restaurant', DUPLICATE_FIELDS)
    .lean();
};

// Only a PENDING restaurant can be approved or rejected here. The filter makes the change atomic:
// if two admins click at the same moment, only the first one changes anything.
// רק מסעדה ממתינה ניתנת לאישור/דחייה. הסינון הופך את השינוי לאטומי: אם שני מנהלים לוחצים יחד, רק הראשון משנה.
export const approvePendingRestaurantRepo = async (restaurantId) => {
  return Restaurant.findOneAndUpdate(
    { _id: restaurantId, status: 'PENDING' },
    { $set: { status: 'APPROVED' }, $unset: { rejectionReason: 1 } },
    { new: true }
  );
};

export const rejectPendingRestaurantRepo = async (restaurantId, reason) => {
  return Restaurant.findOneAndUpdate(
    { _id: restaurantId, status: 'PENDING' },
    { $set: { status: 'REJECTED', rejectionReason: reason } },
    { new: true }
  );
};

// Edits go through save() so the model's checks run and the location / normalized copies are rebuilt.
// עריכות עוברות דרך save() כדי שבדיקות המודל ירוצו והמיקום והעותקים המנורמלים ייבנו מחדש.
export const saveRestaurantChangesRepo = async (restaurant, changes) => {
  restaurant.set(changes);
  return restaurant.save();
};
