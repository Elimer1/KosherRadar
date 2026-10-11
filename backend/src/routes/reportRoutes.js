import { Router } from 'express';
import { submitReportController } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { submissionRateLimiter } from '../middleware/rateLimiters.js';
import { validateBody } from '../middleware/validate.js';
import { submitReportSchema } from '../schemas/reportSchemas.js';

const router = Router();

router.post('/', authMiddleware, submissionRateLimiter, validateBody(submitReportSchema), submitReportController);

export default router;
