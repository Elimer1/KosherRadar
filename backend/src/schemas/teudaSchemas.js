import { z } from 'zod';
import { HECHSHER_VALUES } from '../config/constants.js';
import {
  dateOnlyField,
  dropOtherTextUnlessOther,
  phoneField,
  requireOtherTextWhenOther,
} from './commonSchemas.js';

const emptyToUndefined = (value) => (value === '' || value === null ? undefined : value);

// NEW (Audit M1): a user may send a photo and any certificate details they have. The kashrut level is
// not accepted here; an admin sets it during review. Unknown keys, including kashrutLevel, are dropped.
// חדש (ביקורת M1): משתמש יכול לשלוח תמונה וכל פרט תעודה שיש לו. רמת הכשרות לא מתקבלת כאן; מנהל קובע אותה.
export const pendingEvidenceSchema = z
  .object({
    hechsher: z.enum(HECHSHER_VALUES, 'Choose a hechsher'),
    hechsherOther: z.string().trim().min(1).max(100).optional(),
    expirationDate: z.preprocess(emptyToUndefined, dateOnlyField.optional()),
    mashgiachName: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(100).optional()),
    mashgiachPhone: z.preprocess(emptyToUndefined, phoneField.optional()),
  })
  .superRefine(requireOtherTextWhenOther('hechsher', 'hechsherOther'))
  .transform(dropOtherTextUnlessOther('hechsher', 'hechsherOther'));

export const submitTeudaSchema = z.object({
  teuda: pendingEvidenceSchema,
});
