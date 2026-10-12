// NEW (Milestone 5): English and Hebrew for the whole interface. The choice is remembered in this browser.
// חדש (אבן דרך 5): אנגלית ועברית לכל הממשק. הבחירה נשמרת בדפדפן הזה.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { he } from './locales/he';
import { applyDocumentLanguage, readSavedLanguage } from './utils/language';
import type { AppLanguage } from './utils/language';

const initial = readSavedLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (language) => {
  applyDocumentLanguage(language.startsWith('he') ? 'he' : 'en');
});

applyDocumentLanguage(initial);

export const activeLanguage = (): AppLanguage => (i18n.language.startsWith('he') ? 'he' : 'en');

export default i18n;
