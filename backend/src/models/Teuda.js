import mongoose from 'mongoose';
import { KASHRUT_LEVELS, SUBMISSION_STATUSES } from '../config/constants.js';

const teudaSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },

    hechsher: { type: String, required: true, trim: true, maxlength: 100 },
    hechsherOther: { type: String, trim: true, maxlength: 100 },
    // NEW (Audit M1): optional on pending evidence. Existing certificates already have a level, so no backfill.
    // A missing level must never be treated as verified. An admin sets it before approval.
    // חדש (ביקורת M1): אופציונלי בראיה ממתינה. תעודות קיימות כבר כוללות רמה, בלי מילוי לאחור.
    kashrutLevel: { type: String, enum: KASHRUT_LEVELS },

    expirationDate: { type: Date },

    photoUrl: { type: String, trim: true },
    cloudinaryPublicId: { type: String, trim: true },
    mashgiachName: { type: String, trim: true, maxlength: 100 },
    mashgiachPhone: { type: String, trim: true, maxlength: 30 },

    status: { type: String, enum: SUBMISSION_STATUSES, default: 'PENDING' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // True when the teuda was sent together with a brand-new restaurant. Milestone 3 uses this to
    // tell the +3 point case (new restaurant with teuda) from the +2 case (teuda for an existing restaurant).
    submittedWithNewRestaurant: { type: Boolean, default: false },

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
