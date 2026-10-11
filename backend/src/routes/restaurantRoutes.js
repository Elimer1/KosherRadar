import { Router } from 'express';
import {
  getSubmissionContextController,
  submitRestaurantController,
  submitTeudaController,
} from '../controllers/restaurantController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { parseJsonFields } from '../middleware/parseJsonFields.js';
import {
  submissionRateLimiter,
  uploadRateLimiter,
  optionalUploadRateLimiter,
} from '../middleware/rateLimiters.js';
import { uploadPhotoMiddleware } from '../middleware/uploadMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { validateObjectIdParam } from '../middleware/validateObjectId.js';
import { submitRestaurantSchema } from '../schemas/restaurantSchemas.js';
import { submitTeudaSchema } from '../schemas/teudaSchemas.js';

const router = Router();

// The photo is optional here: it is only sent when the user also adds a certificate.
router.post(
  '/',
  authMiddleware,
  submissionRateLimiter,
  uploadPhotoMiddleware,
  optionalUploadRateLimiter,
  parseJsonFields(['restaurant', 'teuda']),
  validateBody(submitRestaurantSchema),
  submitRestaurantController
);

router.get(
  '/:restaurantId/submission-context',
  validateObjectIdParam('restaurantId'),
  getSubmissionContextController
);

router.post(
  '/:restaurantId/teudot',
  authMiddleware,
  validateObjectIdParam('restaurantId'),
  submissionRateLimiter,
  uploadRateLimiter,
  uploadPhotoMiddleware,
  parseJsonFields(['teuda']),
  validateBody(submitTeudaSchema),
  submitTeudaController
);

export default router;
