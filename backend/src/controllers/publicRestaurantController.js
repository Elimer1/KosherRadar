// NEW (Milestone 4): HTTP handlers for the public (no login) restaurant endpoints. They read the validated
// query, call a service and answer.
// חדש (אבן דרך 4): מטפלי HTTP לנקודות הקצה הציבוריות של מסעדות (בלי התחברות).
import { getPublicRestaurantDetailsService } from '../services/restaurantDetailsService.js';
import {
  findMapRestaurantsService,
  getRestaurantSuggestionsService,
  searchRestaurantsService,
} from '../services/restaurantSearchService.js';

export const searchRestaurantsController = async (req, res) => {
  res.status(200).json(await searchRestaurantsService(req.validatedQuery));
};

export const getSuggestionsController = async (req, res) => {
  res.status(200).json(await getRestaurantSuggestionsService(req.validatedQuery));
};

// NEW (Milestone 5): markers for the visible map. Same filters as the list; the rectangle is separate
// from the chosen search location, which is not changed when the map moves.
// חדש (אבן דרך 5): סמנים למפה הנראית. אותם מסננים כמו הרשימה; הזזת המפה לא משנה את מיקום החיפוש.
export const getMapRestaurantsController = async (req, res) => {
  res.status(200).json(await findMapRestaurantsService(req.validatedQuery));
};

export const getRestaurantDetailsController = async (req, res) => {
  res.status(200).json(await getPublicRestaurantDetailsService(req.params.restaurantId));
};
