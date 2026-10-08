import { z } from 'zod';

// bcrypt only uses the first 72 bytes of a password, so longer passwords are rejected.
const emailField = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);

const newPasswordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

// z.object() drops unknown keys, so a client sending "role" or "points" is ignored.
export const registerSchema = z.object({
  email: emailField,
  password: newPasswordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required').max(72),
});
