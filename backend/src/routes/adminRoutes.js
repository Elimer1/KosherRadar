import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/check', (req, res) => {
  res.status(200).json({ message: 'Admin access confirmed' });
});

export default router;
