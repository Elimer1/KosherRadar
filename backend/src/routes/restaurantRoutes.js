import { Router } from 'express';
import {
  getSubmissionContextController,
  submitRestaurantController,
  submitTeudaController,
} from '../controllers/restaurantController.js';
import {
  getSuggestionsController,
  searchRestaurantsController,
} from '../controllers/publicRestaurantController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { parseJsonFields } from '../middleware/parseJsonFields.js';
import {
  submissionRateLimiter,
  uploadRateLimiter,
  optionalUploadRateLimiter,
  searchRateLimiter,
} from '../middleware/rateLimiters.js';
import { uploadPhotoMiddleware } from '../middleware/uploadMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { validateObjectIdParam } from '../middleware/validateObjectId.js';
import { validateQuery } from '../middleware/validateQuery.js';
import { submitRestaurantSchema } from '../schemas/restaurantSchemas.js';
import { searchQuerySchema, suggestionsQuerySchema } from '../schemas/searchSchemas.js';
import { submitTeudaSchema } from '../schemas/teudaSchemas.js';

const router = Router();

// NEW (Milestone 4): public search and autocomplete. No login needed (spec section 4: anyone can browse).
// These routes must stay above the routes with `/:restaurantId`, so the word "suggestions" is never read as an id.
// חדש (אבן דרך 4): חיפוש והשלמה אוטומטית ציבוריים. בלי התחברות. חייבים להישאר מעל נתיבי `/:restaurantId`.
router.get('/', searchRateLimiter, validateQuery(searchQuerySchema), searchRestaurantsController);
router.get('/suggestions', searchRateLimiter, validateQuery(suggestionsQuerySchema), getSuggestionsController);

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
