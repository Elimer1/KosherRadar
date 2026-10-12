// NEW (Milestone 6): where to go after login. Only a path on this site is accepted.
// A value such as "//other.example" or "https://other.example" would leave the site, so it becomes the home page.
// חדש (אבן דרך 6): לאן חוזרים אחרי התחברות. מתקבל רק נתיב בתוך האתר.
// ערך כמו "//other.example" או כתובת מלאה היה מוציא מהאתר, ולכן הוא הופך לדף הבית.
export const safeReturnPath = (value: unknown): string => {
  if (typeof value !== 'string' || value.length === 0 || value.length > 300) {
    return '/';
  }

  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.includes('://')) {
    return '/';
  }

  return value;
};
