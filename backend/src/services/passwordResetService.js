// NEW (SEC-006): account-authorized password recovery, random hashed links and neutral request responses.
// חדש (SEC-006): איפוס בסמכות החשבון, קישורים אקראיים מגובבים ותשובות בקשה ניטרליות.
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { appError } from '../utils/appError.js';
import { authorizeResetTokenRepo, resetAuthorizedPasswordRepo } from '../repositories/passwordResetRepository.js';
import { findUserByEmailRepo } from '../repositories/userRepository.js';
import { sendPasswordChangedEmailService, sendPasswordResetEmailService } from './emailService.js';

const SALT_ROUNDS = 10;
export const RESET_TOKEN_VALID_MINUTES = 60;
export const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
export const buildResetLink = (token) => {
  const baseUrl = env.clientUrl.replace(/\/+$/, '');
  // Fragments never reach frontend hosting access logs.
  return `${baseUrl}/reset-password#token=${token}`;
};

// NEW (SEC-006): atomically replace current authority only within the captured credential epoch.
// חדש (SEC-006): החלפת סמכות אטומית רק בתוך גרסת האישורים שנקראה.
export const requestPasswordResetService = async ({ email, language }) => {
  const user = await findUserByEmailRepo(email);
  if (!user) return;
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_VALID_MINUTES * 60 * 1000);
  const authorized = await authorizeResetTokenRepo({
    userId: user._id, tokenVersion: user.tokenVersion ?? 0, tokenHash: hashResetToken(token), expiresAt,
  });
  if (!authorized) return;

  // Send only after acknowledged authority; delayed delivery cannot grant obsolete authority.
  void sendPasswordResetEmailService({
    to: user.email, resetLink: buildResetLink(token), validMinutes: RESET_TOKEN_VALID_MINUTES,
    language: user.preferredLanguage || language,
  }).then((status) => {
    if (status !== 'SENT') {
      console.error(`Password reset email for user ${user._id} was not sent (${status})`);
    }
  }).catch(() => console.error('Password reset email failed'));
};

// NEW (SEC-006): no consume/save gap and no compensating release, including ambiguous write outcomes.
// חדש (SEC-006): אין פער בין ניצול לשמירה ואין שחזור טוקן גם כשהתוצאה אינה ודאית.
export const resetPasswordService = async ({ token, password, language }) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await resetAuthorizedPasswordRepo(hashResetToken(token), passwordHash);
  if (!user) {
    throw appError('This reset link is invalid or has expired. Please request a new one.', 400, 'INVALID_RESET_TOKEN');
  }
  void sendPasswordChangedEmailService({ to: user.email, language: user.preferredLanguage || language })
    .catch(() => console.error('Password-change notification failed'));
};
