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

export const MAX_FUTURE_EXPIRATION_YEARS = 5;
