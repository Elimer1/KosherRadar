import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
// NEW (Milestone 3): imports for the moderation endpoints below
// חדש (אבן דרך 3): ייבואים עבור נקודות הקצה של הניהול שמתחת
import {
  approveRestaurantController,
  createRestaurantController,
  deleteRestaurantController,
  getRestaurantController,
  listPendingRestaurantsController,
  rejectRestaurantController,
  searchRestaurantsController,
  updateRestaurantController,
} from '../controllers/adminRestaurantController.js';
import {
  approveTeudaController,
  createTeudaController,
  deleteTeudaController,
  listExpiringSoonController,
  listPendingTeudotController,
  rejectTeudaController,
  updateTeudaController,
} from '../controllers/adminTeudaController.js';
import {
  listPendingReportsController,
  rejectReportController,
  resolveReportController,
} from '../controllers/adminReportController.js';
import { parseJsonFields } from '../middleware/parseJsonFields.js';
import { optionalUploadRateLimiter, uploadRateLimiter } from '../middleware/rateLimiters.js';
import { uploadPhotoMiddleware } from '../middleware/uploadMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { validateObjectIdParam } from '../middleware/validateObjectId.js';
import { validateQuery } from '../middleware/validateQuery.js';
import {
  adminCreateRestaurantSchema,
  adminCreateTeudaSchema,
  adminEditRestaurantSchema,
  adminEditTeudaSchema,
  manageRestaurantsQuerySchema,
  pageQuerySchema,
  rejectBodySchema,
  resolveReportSchema,
} from '../schemas/adminSchemas.js';

const router = Router();

// Every route below needs a valid token AND the ADMIN role. This is checked on the server for each request;
// hiding buttons in the frontend is never the protection.
// כל נתיב כאן דורש טוקן תקף וגם תפקיד ADMIN. הבדיקה נעשית בשרת בכל בקשה, והסתרת כפתורים בפרונט אינה ההגנה.
router.use(authMiddleware, adminMiddleware);

router.get('/check', (req, res) => {
  res.status(200).json({ message: 'Admin access confirmed' });
});

// NEW (Milestone 3): restaurants
// חדש (אבן דרך 3): מסעדות
router.get('/restaurants/pending', validateQuery(pageQuerySchema), listPendingRestaurantsController);
router.get('/restaurants', validateQuery(manageRestaurantsQuerySchema), searchRestaurantsController);
router.post(
  '/restaurants',
  uploadPhotoMiddleware,
  optionalUploadRateLimiter,
  parseJsonFields(['restaurant', 'extras', 'teuda']),
  validateBody(adminCreateRestaurantSchema),
  createRestaurantController
);
router.get('/restaurants/:restaurantId', validateObjectIdParam('restaurantId'), getRestaurantController);
router.put(
  '/restaurants/:restaurantId',
  validateObjectIdParam('restaurantId'),
  validateBody(adminEditRestaurantSchema),
  updateRestaurantController
);
router.post('/restaurants/:restaurantId/approve', validateObjectIdParam('restaurantId'), approveRestaurantController);
router.post(
  '/restaurants/:restaurantId/reject',
  validateObjectIdParam('restaurantId'),
  validateBody(rejectBodySchema),
  rejectRestaurantController
);
router.delete('/restaurants/:restaurantId', validateObjectIdParam('restaurantId'), deleteRestaurantController);

// NEW (Milestone 3): certificates (teudot)
// חדש (אבן דרך 3): תעודות (teudot)
router.get('/teudot/pending', validateQuery(pageQuerySchema), listPendingTeudotController);
router.get('/teudot/expiring-soon', listExpiringSoonController);
router.post(
  '/restaurants/:restaurantId/teudot',
  validateObjectIdParam('restaurantId'),
  uploadRateLimiter,
  uploadPhotoMiddleware,
  parseJsonFields(['teuda']),
  validateBody(adminCreateTeudaSchema),
  createTeudaController
);
router.put(
  '/teudot/:teudaId',
  validateObjectIdParam('teudaId'),
  validateBody(adminEditTeudaSchema),
  updateTeudaController
);
router.post('/teudot/:teudaId/approve', validateObjectIdParam('teudaId'), approveTeudaController);
router.post(
  '/teudot/:teudaId/reject',
  validateObjectIdParam('teudaId'),
  validateBody(rejectBodySchema),
  rejectTeudaController
);
router.delete('/teudot/:teudaId', validateObjectIdParam('teudaId'), deleteTeudaController);

// NEW (Milestone 3): reports
// חדש (אבן דרך 3): דיווחים
router.get('/reports/pending', validateQuery(pageQuerySchema), listPendingReportsController);
router.post(
  '/reports/:reportId/resolve',
  validateObjectIdParam('reportId'),
  validateBody(resolveReportSchema),
  resolveReportController
);
router.post(
  '/reports/:reportId/reject',
  validateObjectIdParam('reportId'),
  validateBody(rejectBodySchema),
  rejectReportController
);

export default router;
