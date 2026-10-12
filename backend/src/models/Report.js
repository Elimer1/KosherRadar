import mongoose from 'mongoose';
import {
  HECHSHER_VALUES,
  KASHRUT_LEVELS,
  REPORT_STATUSES,
  REPORT_TYPES,
} from '../config/constants.js';
import { pendingReportFingerprint } from '../utils/reportIdentity.js';

const reportSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    teuda: { type: mongoose.Schema.Types.ObjectId, ref: 'Teuda' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    type: { type: String, enum: REPORT_TYPES, default: 'GENERAL' },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    // NEW (update): an optional certificate photo sent with the report. The note can stand alone.
    // חדש (עדכון): תמונת תעודה אופציונלית שנשלחת עם הדיווח. ההערה יכולה לעמוד לבדה.
    photoUrl: { type: String, trim: true },
    cloudinaryPublicId: { type: String, trim: true },
    proposedHechsher: { type: String, enum: HECHSHER_VALUES },
    proposedHechsherOther: { type: String, trim: true, maxlength: 100 },
    proposedKashrutLevel: { type: String, enum: KASHRUT_LEVELS },

    status: { type: String, enum: REPORT_STATUSES, default: 'PENDING' },

    adminNote: { type: String, trim: true, maxlength: 1000 },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      required: function requiredWhenRejected() {
        return this.status === 'REJECTED';
      },
    },

    // Stays false when an admin only marks the report RESOLVED. Only an applied correction earns points.
    correctionApplied: { type: Boolean, default: false },

    // NEW (Backend QA): sha256 of the trimmed description and certificate id. Old reports have no value.
    // חדש (בדיקת שרת): sha256 של התיאור החתוך ומזהה התעודה. לדיווחים ישנים אין ערך.
    pendingReportFingerprint: { type: String, maxlength: 64, select: false },
  },
  { timestamps: true }
);

// NEW (Backend QA): keep the fingerprint aligned with the stored description and certificate.
// חדש (בדיקת שרת): ה-hash נשאר תואם לתיאור ולתעודה שנשמרים.
reportSchema.pre('validate', function setPendingReportFingerprint() {
  this.pendingReportFingerprint = pendingReportFingerprint({
    description: this.description,
    teuda: this.teuda,
  });
});

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ restaurant: 1 });
reportSchema.index({ submittedBy: 1 });
// NEW (Backend QA): one pending report per user, restaurant, and identity fingerprint.
// Resolved and rejected rows leave the index, and reports saved before this field existed are not included.
// חדש (בדיקת שרת): דיווח ממתין אחד לכל משתמש, מסעדה וטביעת זהות.
// דיווח שנסגר יוצא מהאינדקס, ודיווחים ישנים בלי השדה לא נכללים.
reportSchema.index(
  { submittedBy: 1, restaurant: 1, pendingReportFingerprint: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'PENDING', pendingReportFingerprint: { $type: 'string' } },
    name: 'pending_report_identity',
  }
);

export const Report = mongoose.model('Report', reportSchema);
