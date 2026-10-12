import type { HechsherOption } from '../types/submissions';
import i18n, { activeLanguage } from '../i18n';

// NEW (Milestone 5): labels follow the chosen language. A value with no translation stays as stored, never a raw guess.
// חדש (אבן דרך 5): התוויות לפי השפה שנבחרה. ערך בלי תרגום נשאר כפי שנשמר.
const translated = (key: string, fallback: string) => {
  const text = i18n.t(key);
  return text === key ? fallback : text;
};

export const getKashrutLevelLabel = (value: string) => translated(`level.${value}`, value);

export const getFoodTypeLabel = (value: string) => translated(`food.${value}`, value);

export const getCategoryLabel = (value: string) => translated(`category.${value}`, value);

export const getHechsherOptionLabel = (option: HechsherOption) =>
  activeLanguage() === 'he' ? option.labelHe : option.labelEn;

export const getHechsherLabel = (
  value: string,
  otherText: string | null,
  options: HechsherOption[]
) => {
  if (otherText) {
    return otherText;
  }

  const match = options.find((option) => option.value === value);
  return match ? getHechsherOptionLabel(match) : value;
};
