import { Router } from 'express';
import { getMyProfileController, getMySubmissionsController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/me', authMiddleware, getMyProfileController);
router.get('/me/submissions', authMiddleware, getMySubmissionsController);

export default router;
