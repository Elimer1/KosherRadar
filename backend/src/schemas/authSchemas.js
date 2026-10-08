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
