import { Router } from 'express';
import { autocompleteAddressesController } from '../controllers/placesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { searchRateLimiter } from '../middleware/rateLimiters.js';
import { validateQuery } from '../middleware/validateQuery.js';
import { addressQuerySchema } from '../schemas/placesSchemas.js';

const router = Router();

// Logged-in users search addresses while filling the restaurant form. The Geoapify key stays here.
router.get(
  '/autocomplete',
  authMiddleware,
  searchRateLimiter,
  validateQuery(addressQuerySchema),
  autocompleteAddressesController
);

export default router;
