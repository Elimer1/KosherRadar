import { autocompleteAddressesService } from '../services/placesService.js';

export const autocompleteAddressesController = async (req, res) => {
  const result = await autocompleteAddressesService(req.query.text);
  res.status(200).json(result);
};
