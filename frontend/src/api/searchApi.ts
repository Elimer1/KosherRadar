// NEW (Milestone 4): API functions for the public restaurant search and autocomplete.
// חדש (אבן דרך 4): פונקציות API לחיפוש מסעדות ציבורי ולהשלמה אוטומטית.
import { api } from './axiosInstance';
import type { RestaurantSuggestion, SearchFilters, SearchResult } from '../types/search';

// Turns the filters into the query string the server validates. Empty or default choices are left out,
// and a radius is only sent together with a location.
// הופך את המסננים למחרוזת השאילתה. בחירות ריקות או ברירת מחדל מושמטות, ורדיוס נשלח רק עם מיקום.
export const buildSearchParams = (filters: SearchFilters, page?: number) => {
  const params: Record<string, string> = {};
  const text = filters.q.trim();

  if (text !== '') {
    params.q = text;
  }

  if (filters.level !== '') {
    params.level = filters.level;
  }

  if (filters.hechsher.length > 0) {
    params.hechsher = filters.hechsher.join(',');
  }

  if (filters.foodType.length > 0) {
    params.foodType = filters.foodType.join(',');
  }

  if (filters.category.length > 0) {
    params.category = filters.category.join(',');
  }

  if (filters.hideExpired) {
    params.hideExpired = 'true';
  }

  if (filters.includeUnknown) {
    params.includeUnknown = 'true';
  }

  if (filters.location) {
    params.lat = String(filters.location.lat);
    params.lng = String(filters.location.lng);

    if (filters.radiusKm !== null) {
      params.radiusKm = String(filters.radiusKm);
    }
  }

  if (page !== undefined && page > 1) {
    params.page = String(page);
  }

  return params;
};

export const searchRestaurants = async (filters: SearchFilters, page: number) => {
  const response = await api.get<SearchResult>('/restaurants', { params: buildSearchParams(filters, page) });
  return response.data;
};

// `signal` lets the caller cancel a request that is no longer needed (the visitor kept typing).
export const getRestaurantSuggestions = async (filters: SearchFilters, signal: AbortSignal) => {
  const response = await api.get<{ suggestions: RestaurantSuggestion[] }>('/restaurants/suggestions', {
    params: buildSearchParams(filters),
    signal,
  });
  return response.data.suggestions;
};
