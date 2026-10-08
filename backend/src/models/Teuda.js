import mongoose from 'mongoose';
import { KASHRUT_LEVELS, SUBMISSION_STATUSES } from '../config/constants.js';

const teudaSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },

    // A standardized hechsher key, or "OTHER" together with hechsherOther.
    hechsher: { type: String, required: true, trim: true, maxlength: 100 },
    hechsherOther: { type: String, trim: true, maxlength: 100 },
    kashrutLevel: { type: String, enum: KASHRUT_LEVELS, required: true },

    // Date-only value: store midnight UTC of the Israeli calendar date (for example
    // 2026-03-15T00:00:00.000Z) so the date never shifts by a day. Later milestones
    // compare it with "today in Israel", never with a raw timestamp.
    expirationDate: { type: Date, required: true },

    photoUrl: { type: String, required: true, trim: true },
    cloudinaryPublicId: { type: String, required: true, trim: true },
    mashgiachName: { type: String, required: true, trim: true, maxlength: 100 },
    mashgiachPhone: { type: String, required: true, trim: true, maxlength: 30 },

    status: { type: String, enum: SUBMISSION_STATUSES, default: 'PENDING' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Private to admins.
    adminNote: { type: String, trim: true, maxlength: 1000 },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      required: function requiredWhenRejected() {
        return this.status === 'REJECTED';
      },
    },
  },
  { timestamps: true }
);

teudaSchema.index({ restaurant: 1, status: 1 });
teudaSchema.index({ status: 1, expirationDate: 1 });
teudaSchema.index({ submittedBy: 1 });

export const Teuda = mongoose.model('Teuda', teudaSchema);
