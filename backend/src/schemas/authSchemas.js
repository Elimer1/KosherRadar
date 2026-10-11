import { z } from 'zod';

const emailField = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);

const newPasswordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

export const registerSchema = z.object({
  email: emailField,
  password: newPasswordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required').max(72),
});

// NEW (Milestone 3): password reset bodies. The token is the 64-character hex string from the emailed link.
// חדש (אבן דרך 3): גופי הבקשות לאיפוס סיסמה. הטוקן הוא מחרוזת hex של 64 תווים מהקישור שנשלח במייל.
export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().regex(/^[a-f0-9]{64}$/i, 'This reset link is not valid'),
  password: newPasswordField,
});
