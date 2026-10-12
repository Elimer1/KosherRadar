import { autocompleteAddressesService, geocodePlaceService } from '../services/placesService.js';

export const autocompleteAddressesController = async (req, res) => {
  const result = await autocompleteAddressesService(req.validatedQuery.text);
  res.status(200).json(result);
};

// NEW (Milestone 5): public place suggestions and a single geocode, for the search location field.
// No login: anyone can browse. The Geoapify key stays on the server.
// חדש (אבן דרך 5): הצעות מקום וגיאוקודינג בודד לשדה המיקום בחיפוש. בלי התחברות. המפתח נשאר בשרת.
export const suggestPlacesController = async (req, res) => {
  const { text, lang } = req.validatedQuery;
  res.status(200).json(await autocompleteAddressesService(text, lang));
};

export const geocodePlaceController = async (req, res) => {
  const { text, lang } = req.validatedQuery;
  res.status(200).json(await geocodePlaceService(text, lang));
};
