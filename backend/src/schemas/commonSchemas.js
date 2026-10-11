import { z } from 'zod';
import { HECHSHER_OTHER } from '../config/constants.js';
import { isValidDateOnly } from '../utils/israelDate.js';

export const phoneField = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{7,30}$/, 'Enter a valid phone number (digits, spaces, + - and brackets only)');

export const dateOnlyField = z
  .string()
  .trim()
  .refine(isValidDateOnly, 'Enter a valid date in the format YYYY-MM-DD');

// Only http and https links are allowed, so values like "javascript:..." can never be saved.
export const httpUrlField = z
  .string()
  .trim()
  .max(300)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }, 'Enter a valid link starting with http:// or https://');

// "OTHER" means the user typed their own hechsher name, so that text becomes required.
export const requireOtherTextWhenOther = (hechsherKey, otherKey) => (data, context) => {
  if (data[hechsherKey] === HECHSHER_OTHER && !data[otherKey]) {
    context.addIssue({
      code: 'custom',
      path: [otherKey],
      message: 'Enter the name of the hechsher',
    });
  }
};

// Throws away leftover "other" text when a standard option was chosen.
export const dropOtherTextUnlessOther = (hechsherKey, otherKey) => (data) => {
  if (data[hechsherKey] === HECHSHER_OTHER) {
    return data;
  }

  return { ...data, [otherKey]: undefined };
};
