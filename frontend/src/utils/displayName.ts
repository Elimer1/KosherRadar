// NEW (Design): choose the stored name and address for the active language. Nothing is translated.
// חדש (עיצוב): בחירת השם והכתובת השמורים לפי השפה הפעילה. אין תרגום.
import { activeLanguage } from '../i18n';
import type { AppLanguage } from './language';

export interface NamedRecord {
  name: string;
  nameHe?: string | null;
  nameEn?: string | null;
  address?: string;
  addressHe?: string | null;
  addressEn?: string | null;
}

const clean = (value: string | null | undefined) => {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? '' : trimmed;
};

export const localizedRestaurantName = (record: NamedRecord, language: AppLanguage = activeLanguage()) => {
  const stored = clean(record.name);
  const hebrew = clean(record.nameHe);
  const english = clean(record.nameEn);
  const unique = [stored, hebrew, english].filter((name, index, all) => name !== '' && all.indexOf(name) === index);

  let primary = stored || hebrew || english;

  if (language === 'he' && hebrew) {
    primary = hebrew;
  } else if (language === 'en' && english) {
    primary = english;
  }

  return {
    primary,
    secondary: unique.filter((name) => name !== primary).join(' · '),
  };
};

export const localizedAddress = (record: NamedRecord, language: AppLanguage = activeLanguage()) => {
  const stored = clean(record.address);
  const hebrew = clean(record.addressHe);
  const english = clean(record.addressEn);

  if (language === 'he' && hebrew) {
    return hebrew;
  }

  if (language === 'en' && english) {
    return english;
  }

  return stored;
};
