// NEW (SEC-006): recovery authority lives beside the password, independent of token cleanup.
// חדש (SEC-006): סמכות האיפוס נשמרת לצד הסיסמה ואינה תלויה בניקוי טוקנים.
import { User } from '../models/User.js';

// NEW (SEC-006): a credential epoch guard prevents issuance delayed across a password change.
// חדש (SEC-006): בדיקת גרסת האישורים מונעת הנפקה מאוחרת לאחר שינוי סיסמה.
export const authorizeResetTokenRepo = async ({ userId, tokenVersion, tokenHash, expiresAt }) => {
  const epoch = tokenVersion === 0
    ? { $or: [{ tokenVersion: 0 }, { tokenVersion: { $exists: false } }] }
    : { tokenVersion };
  return User.findOneAndUpdate(
    { _id: userId, ...epoch },
    { $set: { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt } },
    { new: true, writeConcern: { w: 'majority' } },
  );
};

// NEW (SEC-006): authority, server-time expiry, password and session invalidation are ONE write.
// חדש (SEC-006): סמכות, תוקף לפי זמן השרת, סיסמה וביטול סשנים מתבצעים בכתיבה אחת.
export const resetAuthorizedPasswordRepo = async (tokenHash, passwordHash) => {
  return User.findOneAndUpdate(
    { resetTokenHash: tokenHash, $expr: { $gt: ['$resetTokenExpiresAt', '$$NOW'] } },
    {
      $set: { passwordHash },
      $unset: { resetTokenHash: 1, resetTokenExpiresAt: 1 },
      $inc: { tokenVersion: 1 },
    },
    { new: true, writeConcern: { w: 'majority' } },
  );
};
