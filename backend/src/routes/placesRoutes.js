import { Router } from 'express';
import {
  autocompleteAddressesController,
  geocodePlaceController,
  suggestPlacesController,
} from '../controllers/placesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { searchRateLimiter } from '../middleware/rateLimiters.js';
import { validateQuery } from '../middleware/validateQuery.js';
import { addressQuerySchema, publicPlaceQuerySchema } from '../schemas/placesSchemas.js';

const router = Router();

// NEW (Milestone 5): public location search for the home page. Must stay above any future "/:id" route.
// חדש (אבן דרך 5): חיפוש מיקום ציבורי לדף הבית.
router.get('/suggest', searchRateLimiter, validateQuery(publicPlaceQuerySchema), suggestPlacesController);
router.get('/geocode', searchRateLimiter, validateQuery(publicPlaceQuerySchema), geocodePlaceController);

// Logged-in users search addresses while filling the restaurant form. The Geoapify key stays here.
router.get(
  '/autocomplete',
  authMiddleware,
  searchRateLimiter,
  validateQuery(addressQuerySchema),
  autocompleteAddressesController
);

export default router;
