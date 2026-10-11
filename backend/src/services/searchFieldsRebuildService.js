// NEW (Milestone 4): rebuilds the search fields of every restaurant. Needed once for restaurants saved before
// Milestone 4, and again after the food synonym list (config/foodSynonyms.js) changes.
// חדש (אבן דרך 4): בונה מחדש את שדות החיפוש של כל המסעדות. נדרש פעם אחת למסעדות שנשמרו לפני אבן דרך 4,
// ושוב אחרי שרשימת המילים הנרדפות משתנה.
import { rebuildAllSearchFieldsRepo } from '../repositories/restaurantSearchRepository.js';

export const rebuildSearchFieldsService = async () => {
  const restaurantCount = await rebuildAllSearchFieldsRepo();

  return { restaurantCount };
};
