// NEW (Milestone 3): password reset (spec section 6). A reset token is random, single-use and short-lived, and
// only its SHA-256 hash is stored. The request endpoint answers the same way whether or not the email has an
// account, so it cannot be used to find out who is registered.
// חדש (אבן דרך 3): איפוס סיסמה. הטוקן אקראי, חד-פעמי וקצר-מועד, ורק ה-hash שלו נשמר. נקודת הבקשה עונה אותו דבר
// בין אם יש חשבון ובין אם לא, כדי שאי אפשר יהיה לגלות מי רשום.
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { appError } from '../utils/appError.js';
import {
  consumeResetTokenRepo,
  createResetTokenRepo,
  deleteUnusedResetTokensRepo,
} from '../repositories/passwordResetRepository.js';
import { findUserByEmailRepo, setUserPasswordHashRepo } from '../repositories/userRepository.js';
import { sendPasswordResetEmailService } from './emailService.js';

const SALT_ROUNDS = 10;

export const RESET_TOKEN_VALID_MINUTES = 60;

// The token is random and long, so a fast hash (SHA-256) is enough here. bcrypt is used for the password itself.
export const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const buildResetLink = (token) => {
  const baseUrl = env.clientUrl.replace(/\/+$/, '');
  return `${baseUrl}/reset-password?token=${token}`;
};

// Always resolves with nothing. The caller shows the same message in every case.
// תמיד מסתיים בלי ערך. הקורא מציג אותה הודעה בכל מקרה.
export const requestPasswordResetService = async ({ email }) => {
  const user = await findUserByEmailRepo(email);

  if (!user) {
    return;
  }

  // 32 random bytes = 256 bits, which cannot be guessed.
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_VALID_MINUTES * 60 * 1000);

  // Older unused links stop working: only the newest one is valid.
  await deleteUnusedResetTokensRepo(user._id);
  await createResetTokenRepo({ userId: user._id, tokenHash: hashResetToken(token), expiresAt });

  // The email is not awaited: sending takes time, and waiting would make an existing account slower to answer
  // than an unknown one. sendEmail never throws; a failure is only logged on the server.
  // המייל לא ממתינים לו: אחרת חשבון קיים היה עונה לאט יותר מחשבון לא קיים. כשל נרשם ביומן בשרת בלבד.
  void sendPasswordResetEmailService({
    to: user.email,
    resetLink: buildResetLink(token),
    validMinutes: RESET_TOKEN_VALID_MINUTES,
  }).then((status) => {
    if (status !== 'SENT') {
      console.error(`Password reset email for user ${user._id} was not sent (${status})`);
    }
  });
};

export const resetPasswordService = async ({ token, password }) => {
  // One atomic step both checks the token (known, not used, not expired) and marks it used.
  const consumed = await consumeResetTokenRepo(hashResetToken(token), new Date());

  if (!consumed) {
    throw appError('This reset link is invalid or has expired. Please request a new one.', 400, 'INVALID_RESET_TOKEN');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await setUserPasswordHashRepo(consumed.user, passwordHash);

  if (!user) {
    throw appError('This reset link is invalid or has expired. Please request a new one.', 400, 'INVALID_RESET_TOKEN');
  }

  // Any other link that was still waiting is cancelled too.
  await deleteUnusedResetTokensRepo(user._id);
};
