// NEW (Milestone 4): the public page of one restaurant (spec section 10). Only APPROVED restaurants are public.
// The status and the list of certificates come from kashrutStatusService, the same code the search uses.
// חדש (אבן דרך 4): הדף הציבורי של מסעדה אחת. רק מסעדות מאושרות ציבוריות. הסטטוס ורשימת התעודות מגיעים
// מ-kashrutStatusService, אותו קוד שהחיפוש משתמש בו.
import { appError } from '../utils/appError.js';
import { todayInIsrael } from '../utils/israelDate.js';
import { findRestaurantByIdRepo } from '../repositories/restaurantRepository.js';
import { findApprovedTeudotByRestaurantRepo } from '../repositories/teudaRepository.js';
import { buildKashrutSummary, getPublicTeudot } from './kashrutStatusService.js';
import { toPublicRestaurantDetails } from './publicRestaurantSerializer.js';

export const getPublicRestaurantDetailsService = async (restaurantId) => {
  const restaurant = await findRestaurantByIdRepo(restaurantId);

  // The same 404 for a missing, pending and rejected restaurant, so nothing reveals that one exists.
  // אותה 404 למסעדה שלא קיימת, ממתינה או נדחתה, כך שדבר לא חושף שהיא קיימת.
  if (!restaurant || restaurant.status !== 'APPROVED') {
    throw appError('Restaurant not found', 404);
  }

  const today = todayInIsrael();
  const teudot = await findApprovedTeudotByRestaurantRepo(restaurant._id);

  // Both functions remove certificates that are not public (older than six months after expiration).
  return toPublicRestaurantDetails(
    restaurant,
    buildKashrutSummary(restaurant, teudot, today),
    getPublicTeudot(teudot, today)
  );
};
