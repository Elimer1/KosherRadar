import { Router } from 'express';
import {
  registerController,
  loginController,
  getCurrentUserController,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rateLimiters.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), registerController);
router.post('/login', authRateLimiter, validateBody(loginSchema), loginController);
router.get('/me', authMiddleware, getCurrentUserController);

export default router;
