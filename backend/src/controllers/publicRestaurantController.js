// NEW (Milestone 4): HTTP handlers for the public (no login) restaurant endpoints. They read the validated
// query, call a service and answer.
// חדש (אבן דרך 4): מטפלי HTTP לנקודות הקצה הציבוריות של מסעדות (בלי התחברות).
import { getPublicRestaurantDetailsService } from '../services/restaurantDetailsService.js';
import {
  getRestaurantSuggestionsService,
  searchRestaurantsService,
} from '../services/restaurantSearchService.js';

export const searchRestaurantsController = async (req, res) => {
  res.status(200).json(await searchRestaurantsService(req.validatedQuery));
};

export const getSuggestionsController = async (req, res) => {
  res.status(200).json(await getRestaurantSuggestionsService(req.validatedQuery));
};

export const getRestaurantDetailsController = async (req, res) => {
  res.status(200).json(await getPublicRestaurantDetailsService(req.params.restaurantId));
};
