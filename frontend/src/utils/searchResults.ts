// NEW (Milestone 4): small helpers for the search screen: multi-select toggling and joining a new page of results.
// חדש (אבן דרך 4): פונקציות קטנות למסך החיפוש: בחירה מרובה וצירוף עמוד תוצאות חדש.
import type { RestaurantCardData } from '../types/search';

// Adds the value to a multi-select list, or removes it when it is already there.
// מוסיף ערך לרשימת בחירה מרובה, או מסיר אותו אם כבר קיים.
export const toggleValue = (list: string[], value: string) => {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
};

// Joins a newly loaded page ("Load More") to the results already on screen. The server keeps a stable
// order, but if something changed between two requests a restaurant could come twice, so a restaurant
// already on screen is never added again.
// מצרף עמוד שנטען ("טען עוד") לתוצאות שכבר על המסך. מסעדה שכבר מוצגת לא מתווספת שוב.
export const appendNewRestaurants = (current: RestaurantCardData[], incoming: RestaurantCardData[]) => {
  const shownIds = new Set(current.map((restaurant) => restaurant.id));
  return [...current, ...incoming.filter((restaurant) => !shownIds.has(restaurant.id))];
};
