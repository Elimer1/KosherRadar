import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Every admin route is protected here once, in the right order: login first, then role.
router.use(authMiddleware, adminMiddleware);

// Smallest possible admin-only endpoint. Lets us (and the tests) prove that role checks work.
// Real moderation endpoints are added in a later milestone.
router.get('/check', (req, res) => {
  res.status(200).json({ message: 'Admin access confirmed' });
});

export default router;
