import { Router } from 'express';
import {
  CATEGORIES,
  FOOD_TYPES,
  HECHSHER_OPTIONS,
  HECHSHER_OTHER,
  KASHRUT_LEVELS,
  MAX_IMAGE_BYTES,
} from '../config/constants.js';

const router = Router();

// The form choices come from the server so the frontend and the validation always use the same lists.
router.get('/', (req, res) => {
  res.status(200).json({
    hechsherOptions: HECHSHER_OPTIONS,
    hechsherOtherValue: HECHSHER_OTHER,
    kashrutLevels: KASHRUT_LEVELS,
    foodTypes: FOOD_TYPES,
    categories: CATEGORIES,
    maxImageBytes: MAX_IMAGE_BYTES,
  });
});

export default router;
