// Shared enum values used by the Mongoose models (and later by validation schemas).

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

// Used by restaurants and teudot.
export const SUBMISSION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export const REPORT_STATUSES = ['PENDING', 'RESOLVED', 'REJECTED'];

export const REPORT_TYPES = ['GENERAL', 'KASHRUT_UPDATE'];
