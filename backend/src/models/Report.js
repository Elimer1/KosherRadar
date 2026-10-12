import mongoose from 'mongoose';
import {
  HECHSHER_VALUES,
  KASHRUT_LEVELS,
  REPORT_STATUSES,
  REPORT_TYPES,
} from '../config/constants.js';

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
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ restaurant: 1 });
reportSchema.index({ submittedBy: 1 });

export const Report = mongoose.model('Report', reportSchema);
