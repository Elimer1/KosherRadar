import { Router } from 'express';
import {
  registerController,
  loginController,
  getCurrentUserController,
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimiters.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/authSchemas.js';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), registerController);
router.post('/login', authRateLimiter, validateBody(loginSchema), loginController);
router.get('/me', authMiddleware, getCurrentUserController);

// NEW (Milestone 3): password reset. No login needed (the user forgot the password).
// חדש (אבן דרך 3): איפוס סיסמה. לא נדרשת התחברות (המשתמש שכח את הסיסמה).
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validateBody(forgotPasswordSchema),
  forgotPasswordController
);
router.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), resetPasswordController);

export default router;
