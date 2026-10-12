// NEW (Milestone 3): database operations for password reset tokens. Only the SHA-256 hash of a token is
// stored, never the token itself, so a leaked database cannot be used to reset anyone's password.
// חדש (אבן דרך 3): פעולות מסד נתונים לטוקני איפוס סיסמה. נשמר רק ה-hash של הטוקן, לעולם לא הטוקן עצמו.
import { PasswordResetToken } from '../models/PasswordResetToken.js';

export const createResetTokenRepo = async ({ userId, tokenHash, expiresAt }) => {
  return PasswordResetToken.create({ user: userId, tokenHash, expiresAt });
};

// Removes every token of the user that was not used yet, so only the newest link works.
// מוחק כל טוקן של המשתמש שלא נוצל, כך שרק הקישור האחרון עובד.
export const deleteUnusedResetTokensRepo = async (userId) => {
  return PasswordResetToken.deleteMany({ user: userId, usedAt: null });
};

// Marks a valid token as used in ONE atomic update. If two requests arrive together with the same token,
// only one of them gets the document back; the other gets null. Returns null for unknown, used or expired tokens.
// מסמן טוקן תקף כמנוצל בעדכון אטומי אחד. אם שתי בקשות מגיעות יחד, רק אחת מקבלת את המסמך. null לטוקן לא תקף.
export const consumeResetTokenRepo = async (tokenHash, now) => {
  return PasswordResetToken.findOneAndUpdate(
    { tokenHash, usedAt: null, expiresAt: { $gt: now } },
    { usedAt: now },
    { new: true }
  );
};

// NEW (Audit M5): make a consumed link usable again when the new password was not saved.
// חדש (ביקורת M5): מחזיר קישור שסומן כמנוצל לשימוש, כשהסיסמה החדשה לא נשמרה.
export const releaseResetTokenRepo = async (tokenId) => {
  return PasswordResetToken.findOneAndUpdate(
    { _id: tokenId, usedAt: { $ne: null } },
    { $set: { usedAt: null } },
    { new: true }
  );
};
