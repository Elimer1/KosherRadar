import { z } from 'zod';
import { HECHSHER_VALUES, KASHRUT_LEVELS } from '../config/constants.js';
import {
  dateOnlyField,
  dropOtherTextUnlessOther,
  phoneField,
  requireOtherTextWhenOther,
} from './commonSchemas.js';

// Used on its own for "add a teuda to an existing restaurant" and nested inside the new-restaurant form.
export const teudaFieldsSchema = z
  .object({
    hechsher: z.enum(HECHSHER_VALUES, 'Choose a hechsher'),
    hechsherOther: z.string().trim().min(1).max(100).optional(),
    kashrutLevel: z.enum(KASHRUT_LEVELS, 'Choose a kashrut level'),
    expirationDate: dateOnlyField,
    mashgiachName: z.string().trim().min(1, 'Mashgiach name is required').max(100),
    mashgiachPhone: phoneField,
  })
  .superRefine(requireOtherTextWhenOther('hechsher', 'hechsherOther'))
  .transform(dropOtherTextUnlessOther('hechsher', 'hechsherOther'));

export const submitTeudaSchema = z.object({
  teuda: teudaFieldsSchema,
});
