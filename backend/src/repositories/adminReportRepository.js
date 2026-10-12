// NEW (Milestone 3): database operations used only by the admin handling of reports.
// חדש (אבן דרך 3): פעולות מסד נתונים שמשמשות רק את הטיפול בדיווחים על ידי מנהל.
import { Report } from '../models/Report.js';

export const listPendingReportsRepo = async ({ page, limit }) => {
  const filter = { status: 'PENDING' };

  const [items, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('restaurant', 'name address city')
      .populate('teuda', 'hechsher hechsherOther kashrutLevel expirationDate')
      .populate('submittedBy', 'email')
      .lean(),
    Report.countDocuments(filter),
  ]);

  return { items, total };
};

export const findReportByIdRepo = async (reportId) => {
  return Report.findById(reportId);
};

// Atomic like the other moderation changes: only a PENDING report can be resolved or rejected.
// אטומי כמו שאר פעולות הטיפול: רק דיווח ממתין ניתן לסגירה או לדחייה.
export const resolvePendingReportRepo = async (reportId, { correctionApplied, adminNote }) => {
  const changes = { status: 'RESOLVED', correctionApplied };

  if (adminNote) {
    changes.adminNote = adminNote;
  }

  return Report.findOneAndUpdate({ _id: reportId, status: 'PENDING' }, { $set: changes }, { new: true });
};

// NEW (Audit M2): put a claimed report back to PENDING when the correction write fails.
// חדש (ביקורת M2): מחזיר דיווח שכבר נתפס למצב ממתין כשכתיבת התיקון נכשלת.
export const reopenResolvedReportRepo = async (reportId) => {
  return Report.findOneAndUpdate(
    { _id: reportId, status: 'RESOLVED' },
    { $set: { status: 'PENDING', correctionApplied: false }, $unset: { adminNote: '' } },
    { new: true }
  );
};

export const rejectPendingReportRepo = async (reportId, reason) => {
  return Report.findOneAndUpdate(
    { _id: reportId, status: 'PENDING' },
    { $set: { status: 'REJECTED', rejectionReason: reason, correctionApplied: false } },
    { new: true }
  );
};

// A deleted restaurant takes its reports with it: they describe a record that no longer exists.
// מסעדה שנמחקה לוקחת איתה את הדיווחים שלה: הם מתארים רשומה שכבר לא קיימת.
// NEW (update): needed so a deleted restaurant can also drop the report photos from Cloudinary.
// חדש (עדכון): נדרש כדי שמחיקת מסעדה תמחק גם את תמונות הדיווחים מ-Cloudinary.
export const findReportsOfRestaurantRepo = async (restaurantId) => {
  return Report.find({ restaurant: restaurantId }).select('cloudinaryPublicId');
};

export const deleteReportsOfRestaurantRepo = async (restaurantId) => {
  return Report.deleteMany({ restaurant: restaurantId });
};

// A deleted certificate keeps the report (an admin can still read and close it) but loses the link.
// תעודה שנמחקה משאירה את הדיווח, אבל הקישור אליה מוסר.
export const removeTeudaFromReportsRepo = async (teudaId) => {
  return Report.updateMany({ teuda: teudaId }, { $unset: { teuda: 1 } });
};
