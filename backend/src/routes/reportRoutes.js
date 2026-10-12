import { Router } from 'express';
import { submitReportController } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { optionalUploadRateLimiter, submissionRateLimiter } from '../middleware/rateLimiters.js';
import { uploadPhotoMiddleware } from '../middleware/uploadMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { submitReportSchema } from '../schemas/reportSchemas.js';

const router = Router();

// NEW (update): the certificate photo is optional, so the upload limit applies only when a file is sent.
// חדש (עדכון): תמונת התעודה אינה חובה, ולכן מגבלת ההעלאה חלה רק כשיש קובץ.
router.post(
  '/',
  authMiddleware,
  submissionRateLimiter,
  uploadPhotoMiddleware,
  optionalUploadRateLimiter,
  validateBody(submitReportSchema),
  submitReportController
);

export default router;
