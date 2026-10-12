export const ROLES = ['USER', 'ADMIN'];

export const FOOD_TYPES = ['MEAT', 'DAIRY', 'PAREVE'];

export const CATEGORIES = [
  'RESTAURANT',
  'CAFE',
  'BAKERY',
  'HOTEL',
  'CATERING',
  'FAST_FOOD',
  'FOOD_TRUCK',
  'ICE_CREAM',
  'GROCERY',
];

export const KASHRUT_LEVELS = ['RABBANUT', 'MEHADRIN'];

export const SUBMISSION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export const REPORT_STATUSES = ['PENDING', 'RESOLVED', 'REJECTED'];

export const REPORT_TYPES = ['GENERAL', 'KASHRUT_UPDATE'];

// NEW (Milestone 3): how an admin handled a report. Only the first two count as an applied correction (+1 point).
// חדש (אבן דרך 3): איך מנהל טיפל בדיווח. רק שתי הראשונות נחשבות תיקון שהוחל (+1 נקודה).
//   APPLY_PROPOSED            the server copies the user's proposed hechsher/level onto the record
//   CORRECTION_ALREADY_MADE   the admin already edited the record by hand
//   NO_CORRECTION             informational only: resolved without changing anything
export const REPORT_RESOLUTIONS = ['APPLY_PROPOSED', 'CORRECTION_ALREADY_MADE', 'NO_CORRECTION'];

export const EXPIRING_SOON_DAYS = 30;

export const HECHSHER_OTHER = 'OTHER';

// Maintained list of common hechsher options. Anything else is entered as free text with OTHER.
export const HECHSHER_OPTIONS = [
  { value: 'LOCAL_RABBANUT', labelEn: 'Local Rabbinate', labelHe: 'הרבנות המקומית' },
  { value: 'BADATZ_EDAH_HACHAREDIS', labelEn: 'Badatz Eda HaChareidis', labelHe: 'בד"ץ העדה החרדית' },
  { value: 'BADATZ_BEIT_YOSEF', labelEn: 'Badatz Beit Yosef', labelHe: 'בד"ץ בית יוסף' },
  { value: 'BADATZ_MACHPUD', labelEn: 'Badatz Machpud', labelHe: 'בד"ץ מחפוד' },
  { value: 'RABBI_LANDAU', labelEn: 'Rabbi Landau (Bnei Brak)', labelHe: 'הרב לנדא (בני ברק)' },
  { value: 'RABBI_RUBIN', labelEn: 'Rabbi Rubin', labelHe: 'הרב רובין' },
  { value: 'CHUG_CHATAM_SOFER', labelEn: 'Chug Chatam Sofer', labelHe: 'חוג חתם סופר' },
];

export const HECHSHER_VALUES = [...HECHSHER_OPTIONS.map((option) => option.value), HECHSHER_OTHER];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Rough box around Israel. Used to reject obviously wrong manually typed coordinates.
export const ISRAEL_BOUNDS = { minLat: 29, maxLat: 34, minLng: 34, maxLng: 36.5 };

export const PUBLIC_EXPIRED_MONTHS = 6;

// NEW (Milestone 4): public search settings (spec section 8)
// חדש (אבן דרך 4): הגדרות החיפוש הציבורי (סעיף 8)
export const SEARCH_PAGE_SIZE = 20;
export const SUGGESTION_LIMIT = 8;
export const SEARCH_RADIUS_OPTIONS_KM = [1, 5, 10, 25, 50];
// At most this many restaurants are examined per search. The answer says when the limit was reached.
// עד כמות זו של מסעדות נבדקות בכל חיפוש. התשובה מציינת כשהגענו למגבלה.
export const MAX_SEARCH_CANDIDATES = 2000;
export const ATLAS_SEARCH_HIT_LIMIT = 100;

// NEW (Milestone 5): how many restaurants one map view may return. More than this is reported as capped
// so a zoomed-out map is never presented as a complete list.
// חדש (אבן דרך 5): כמה מסעדות תצוגת מפה אחת רשאית להחזיר. מעבר לזה מדווחים שהרשימה נחתכה.
export const MAP_MARKER_LIMIT = 500;

export const MAX_FUTURE_EXPIRATION_YEARS = 5;
