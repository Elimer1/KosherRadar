// NEW (UX WP3): the heading follows the interface language only when that name was stored.
// A missing Hebrew or English name stays the submitted name. Nothing here is translated.
// חדש (חבילת UX 3): הכותרת עוקבת אחרי שפת הממשק רק כשהשם הזה נשמר. שם חסר נשאר השם שנשלח.
import { activeLanguage } from '../i18n';

export interface StoredRestaurantNames {
  name: string;
  nameHe: string | null;
  nameEn: string | null;
}

export const restaurantDisplayNames = (restaurant: StoredRestaurantNames) => {
  const primary =
    activeLanguage() === 'he' ? restaurant.nameHe || restaurant.name : restaurant.nameEn || restaurant.name;
  const seen = new Set<string>([primary]);
  const secondary: string[] = [];

  for (const candidate of [restaurant.name, restaurant.nameHe, restaurant.nameEn]) {
    if (candidate && !seen.has(candidate)) {
      seen.add(candidate);
      secondary.push(candidate);
    }
  }

  return { primary, secondary };
};
