import { z } from 'zod';
import { HECHSHER_VALUES, KASHRUT_LEVELS, REPORT_TYPES } from '../config/constants.js';
import { isObjectIdString } from '../middleware/validateObjectId.js';
import { dropOtherTextUnlessOther, requireOtherTextWhenOther } from './commonSchemas.js';

const emptyToUndefined = (value) => (value === '' || value === null ? undefined : value);

const objectIdField = z.string().refine(isObjectIdString, 'Invalid id');

export const submitReportSchema = z
  .object({
    restaurantId: objectIdField,
    teudaId: z.preprocess(emptyToUndefined, objectIdField.optional()),
    // NEW (update): the report form no longer asks for a type. A missing type is a general note.
    // חדש (עדכון): טופס הדיווח כבר לא שואל סוג. בלי סוג זו הערה כללית.
    type: z.preprocess(
      (value) => (value === '' || value === undefined || value === null ? 'GENERAL' : value),
      z.enum(REPORT_TYPES, 'Choose the type of report')
    ),
    description: z.string().trim().min(1, 'Please describe the problem').max(2000),
    proposedHechsher: z.preprocess(emptyToUndefined, z.enum(HECHSHER_VALUES).optional()),
    proposedHechsherOther: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(100).optional()),
    proposedKashrutLevel: z.preprocess(emptyToUndefined, z.enum(KASHRUT_LEVELS).optional()),
  })
  .superRefine((data, context) => {
    const proposesSomething = data.proposedHechsher || data.proposedKashrutLevel;

    if (data.type === 'KASHRUT_UPDATE' && !proposesSomething) {
      context.addIssue({
        code: 'custom',
        path: ['proposedHechsher'],
        message: 'Choose the hechsher or the kashrut level you think is correct',
      });
    }
  })
  .superRefine(requireOtherTextWhenOther('proposedHechsher', 'proposedHechsherOther'))
  .transform(dropOtherTextUnlessOther('proposedHechsher', 'proposedHechsherOther'))
  .transform((data) => {
    // A general report carries no proposed values, so nothing unused is saved for an admin to misread.
    if (data.type === 'GENERAL') {
      return {
        ...data,
        proposedHechsher: undefined,
        proposedHechsherOther: undefined,
        proposedKashrutLevel: undefined,
      };
    }
    return data;
  });
