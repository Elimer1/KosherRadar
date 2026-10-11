import {
  MAX_FUTURE_EXPIRATION_YEARS,
  PUBLIC_EXPIRED_MONTHS,
} from '../config/constants.js';
import { appError } from '../utils/appError.js';
import { addMonthsToDateOnly, dateToDateOnly, todayInIsrael } from '../utils/israelDate.js';

// How a teuda may be shown, based only on its expiration date:
//   VALID           expires today or later
//   RECENT_EXPIRED  expired, but within the last six calendar months (still public, labeled EXPIRED)
//   ADMIN_ONLY      expired more than six calendar months ago (never public)
// Expired status is derived here and never stored. A teuda that expired exactly six months ago
// today is still RECENT_EXPIRED; the day before that it becomes ADMIN_ONLY.
export const getTeudaVisibility = (expirationDate, today = todayInIsrael()) => {
  const expiration = dateToDateOnly(expirationDate);

  if (expiration >= today) {
    return 'VALID';
  }

  const oldestPublicExpiration = addMonthsToDateOnly(today, -PUBLIC_EXPIRED_MONTHS);

  if (expiration >= oldestPublicExpiration) {
    return 'RECENT_EXPIRED';
  }

  return 'ADMIN_ONLY';
};

export const isTeudaPublic = (teuda, today = todayInIsrael()) => {
  return teuda.status === 'APPROVED' && getTeudaVisibility(teuda.expirationDate, today) !== 'ADMIN_ONLY';
};

// NEW (Milestone 3): admins may enter certificates that already expired (old or recently expired),
// because they record evidence they hold. Only typing mistakes are rejected: before the year 2000
// or more than five years ahead.
// חדש (אבן דרך 3): מנהל רשאי להזין תעודה שכבר פגה. נדחות רק טעויות הקלדה (לפני שנת 2000 או יותר מ-5 שנים קדימה).
const EARLIEST_ADMIN_EXPIRATION = '2000-01-01';

export const checkExpirationForAdmin = (expirationDateOnly, today = todayInIsrael()) => {
  if (expirationDateOnly < EARLIEST_ADMIN_EXPIRATION) {
    throw appError('The expiration date is too old. Please check it.', 400);
  }

  const latestAllowed = addMonthsToDateOnly(today, MAX_FUTURE_EXPIRATION_YEARS * 12);

  if (expirationDateOnly > latestAllowed) {
    throw appError(
      `The expiration date is more than ${MAX_FUTURE_EXPIRATION_YEARS} years away. Please check it.`,
      400
    );
  }
};

// A new submission must be for a certificate that is still valid. Expired paperwork would be
// useless to visitors, and very old dates are almost always typing mistakes.
export const checkExpirationForSubmission = (expirationDateOnly, today = todayInIsrael()) => {
  if (expirationDateOnly < today) {
    throw appError('This certificate has already expired. Please submit a valid certificate.', 400);
  }

  const latestAllowed = addMonthsToDateOnly(today, MAX_FUTURE_EXPIRATION_YEARS * 12);

  if (expirationDateOnly > latestAllowed) {
    throw appError(
      `The expiration date is more than ${MAX_FUTURE_EXPIRATION_YEARS} years away. Please check it.`,
      400
    );
  }
};
