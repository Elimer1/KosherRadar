import type { HechsherOption } from '../types/submissions';

// Readable labels so raw values like "MEHADRIN" or "FAST_FOOD" never reach the screen.
const KASHRUT_LEVEL_LABELS: Record<string, string> = {
  RABBANUT: 'Rabbanut',
  MEHADRIN: 'Mehadrin',
};

const FOOD_TYPE_LABELS: Record<string, string> = {
  MEAT: 'Meat',
  DAIRY: 'Dairy',
  PAREVE: 'Pareve',
};

const CATEGORY_LABELS: Record<string, string> = {
  RESTAURANT: 'Restaurant',
  CAFE: 'Cafe',
  BAKERY: 'Bakery',
  HOTEL: 'Hotel',
  CATERING: 'Catering',
  FAST_FOOD: 'Fast food',
  FOOD_TRUCK: 'Food truck',
  ICE_CREAM: 'Ice cream',
  GROCERY: 'Grocery',
};

export const getKashrutLevelLabel = (value: string) => KASHRUT_LEVEL_LABELS[value] || value;

export const getFoodTypeLabel = (value: string) => FOOD_TYPE_LABELS[value] || value;

export const getCategoryLabel = (value: string) => CATEGORY_LABELS[value] || value;

export const getHechsherLabel = (
  value: string,
  otherText: string | null,
  options: HechsherOption[]
) => {
  if (otherText) {
    return otherText;
  }

  const match = options.find((option) => option.value === value);
  return match ? match.labelEn : value;
};
