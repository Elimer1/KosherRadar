import { Router } from 'express';
import {
  getSubmissionContextController,
  submitRestaurantController,
  submitTeudaController,
} from '../controllers/restaurantController.js';
import {
  getMapRestaurantsController,
  getRestaurantDetailsController,
  getSuggestionsController,
  searchRestaurantsController,
} from '../controllers/publicRestaurantController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { userSubmissionMiddleware } from '../middleware/userSubmissionMiddleware.js';
import { parseJsonFields } from '../middleware/parseJsonFields.js';
import {
  submissionRateLimiter,
  optionalUploadRateLimiter,
  searchRateLimiter,
} from '../middleware/rateLimiters.js';
import { uploadPhotoMiddleware } from '../middleware/uploadMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { validateObjectIdParam } from '../middleware/validateObjectId.js';
import { validateQuery } from '../middleware/validateQuery.js';
import { submitRestaurantSchema } from '../schemas/restaurantSchemas.js';
import { mapQuerySchema, searchQuerySchema, suggestionsQuerySchema } from '../schemas/searchSchemas.js';
import { submitTeudaSchema } from '../schemas/teudaSchemas.js';

const router = Router();

// NEW (Milestone 4): public search and autocomplete. No login needed (spec section 4: anyone can browse).
// These routes must stay above the routes with `/:restaurantId`, so the word "suggestions" is never read as an id.
// חדש (אבן דרך 4): חיפוש והשלמה אוטומטית ציבוריים. בלי התחברות. חייבים להישאר מעל נתיבי `/:restaurantId`.
router.get('/', searchRateLimiter, validateQuery(searchQuerySchema), searchRestaurantsController);
router.get('/suggestions', searchRateLimiter, validateQuery(suggestionsQuerySchema), getSuggestionsController);

// NEW (Milestone 5): restaurants inside the visible map. Must stay above `/:restaurantId`.
// חדש (אבן דרך 5): מסעדות בתוך המפה הנראית. חייב להישאר מעל `/:restaurantId`.
router.get('/map', searchRateLimiter, validateQuery(mapQuerySchema), getMapRestaurantsController);

// NEW (Milestone 4): the public page of one APPROVED restaurant. Any other status answers 404.
// חדש (אבן דרך 4): הדף הציבורי של מסעדה מאושרת אחת. כל סטטוס אחר עונה 404.
router.get(
  '/:restaurantId',
  searchRateLimiter,
  validateObjectIdParam('restaurantId'),
  getRestaurantDetailsController
);

// The photo is optional here: it is only sent when the user also adds a certificate.
router.post(
  '/',
  authMiddleware,
  userSubmissionMiddleware,
  submissionRateLimiter,
  uploadPhotoMiddleware,
  optionalUploadRateLimiter,
  parseJsonFields(['restaurant', 'teuda']),
  validateBody(submitRestaurantSchema),
  submitRestaurantController
);

// NEW (Milestone 6): this public read hits the database, so it uses the same limit as search and details.
// חדש (אבן דרך 6): קריאה ציבורית שפונה למסד, ולכן אותה מגבלה כמו לחיפוש ולדף המסעדה.
router.get(
  '/:restaurantId/submission-context',
  searchRateLimiter,
  validateObjectIdParam('restaurantId'),
  getSubmissionContextController
);

router.post(
  '/:restaurantId/teudot',
  authMiddleware,
  userSubmissionMiddleware,
  validateObjectIdParam('restaurantId'),
  submissionRateLimiter,
  uploadPhotoMiddleware,
  optionalUploadRateLimiter,
  parseJsonFields(['teuda']),
  validateBody(submitTeudaSchema),
  submitTeudaController
);

export default router;
