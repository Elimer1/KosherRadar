const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const israelDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: ISRAEL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// The calendar date in Israel right now, as "YYYY-MM-DD". Never use the UTC date for expiry checks,
// because between midnight and 2-3am in Israel the UTC date is still "yesterday".
export const todayInIsrael = (now = new Date()) => {
  return israelDateFormatter.format(now);
};

export const isValidDateOnly = (value) => {
  if (typeof value !== 'string' || !DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

// Teuda expiration dates are stored at UTC midnight so the calendar date never shifts.
export const dateOnlyToDate = (value) => {
  return new Date(`${value}T00:00:00.000Z`);
};

export const dateToDateOnly = (date) => {
  return new Date(date).toISOString().slice(0, 10);
};

// NEW (Milestone 3): moves a "YYYY-MM-DD" date by whole days (used for "expiring in 30 days").
// חדש (אבן דרך 3): מזיז תאריך "YYYY-MM-DD" במספר ימים שלם (לרשימת "פגות בקרוב").
export const addDaysToDateOnly = (value, days) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

// Moves a "YYYY-MM-DD" date by whole calendar months. Jan 31 + 1 month becomes Feb 28/29, not March 3.
export const addMonthsToDateOnly = (value, months) => {
  const [year, month, day] = value.split('-').map(Number);
  const targetMonthIndex = month - 1 + months;
  const lastDayOfTargetMonth = new Date(Date.UTC(year, targetMonthIndex + 1, 0)).getUTCDate();
  const result = new Date(Date.UTC(year, targetMonthIndex, Math.min(day, lastDayOfTargetMonth)));
  return result.toISOString().slice(0, 10);
};
