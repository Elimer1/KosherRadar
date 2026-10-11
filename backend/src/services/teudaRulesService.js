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
