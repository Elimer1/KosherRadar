import mongoose from 'mongoose';

// Schema only for now; the password-reset flow itself is built in a later milestone.
// Only a hash of the emailed token is stored, never the token itself.
const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

// MongoDB deletes the document automatically once expiresAt has passed.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ user: 1 });

export const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
