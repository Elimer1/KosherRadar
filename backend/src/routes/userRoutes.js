import { Router } from 'express';
import { getMyProfileController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/me', authMiddleware, getMyProfileController);

export default router;
