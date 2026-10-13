import { autocompleteAddressesService, geocodePlaceService, suggestPlacesService } from '../services/placesService.js';

export const autocompleteAddressesController = async (req, res) => {
  const { text, lang } = req.validatedQuery;
  const result = await autocompleteAddressesService(text, lang);
  res.status(200).json(result);
};

// NEW (Milestone 5): public place suggestions and a single geocode, for the search location field.
// No login: anyone can browse. The Geoapify key stays on the server.
// חדש (אבן דרך 5): הצעות מקום וגיאוקודינג בודד לשדה המיקום בחיפוש. בלי התחברות. המפתח נשאר בשרת.
export const suggestPlacesController = async (req, res) => {
  const { text, lang } = req.validatedQuery;
  res.status(200).json(await suggestPlacesService(text, lang));
};

export const geocodePlaceController = async (req, res) => {
  const { text, lang } = req.validatedQuery;
  res.status(200).json(await geocodePlaceService(text, lang));
};
