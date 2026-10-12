// NEW (Milestone 3): Zod schemas for the admin API (moderation, editing, creating, report resolution).
// חדש (אבן דרך 3): סכמות Zod לממשק המנהל (אישור/דחייה, עריכה, יצירה, טיפול בדיווחים).
import { z } from 'zod';
import {
  HECHSHER_VALUES,
  KASHRUT_LEVELS,
  REPORT_RESOLUTIONS,
  SUBMISSION_STATUSES,
} from '../config/constants.js';
import {
  dateOnlyField,
  dropOtherTextUnlessOther,
  httpUrlField,
  phoneField,
  requireOtherTextWhenOther,
} from './commonSchemas.js';
import { restaurantFieldsSchema } from './restaurantSchemas.js';

const emptyToUndefined = (value) => (value === '' || value === null ? undefined : value);

const optionalText = (maxLength) =>
  z.preprocess(emptyToUndefined, z.string().trim().min(1).max(maxLength).optional());

// A rejection always needs a reason: it is saved and emailed to the contributor.
// דחייה תמיד דורשת סיבה: היא נשמרת ונשלחת במייל למשתמש.
export const rejectBodySchema = z.object({
  reason: z.string().trim().min(3, 'Please write the reason for the rejection').max(1000),
});

export const approveBodySchema = z.object({
  adminNote: optionalText(1000),
});

// Fields only an admin can set on a restaurant. Empty text clears the value.
// שדות שרק מנהל יכול לקבוע. טקסט ריק מנקה את הערך.
export const restaurantExtrasSchema = z
  .object({
    nameHe: optionalText(150),
    nameEn: optionalText(150),
    addressHe: optionalText(250),
    addressEn: optionalText(250),
    adminNote: optionalText(1000),
    kosharotUrl: z.preprocess(emptyToUndefined, httpUrlField.optional()),
  })
  .default({});

// NEW (Audit M1): creating an approved certificate still needs a full record. Editing pending evidence
// can leave the mashgiach blank, because the user may not have known it. The level and the date stay required.
// חדש (ביקורת M1): יצירת תעודה מאושרת עדיין דורשת רשומה מלאה. בעריכת ראיה ממתינה המשגיח יכול להישאר ריק.
const adminTeudaShape = (mashgiachRequired) =>
  z
    .object({
      hechsher: z.enum(HECHSHER_VALUES, 'Choose a hechsher'),
      hechsherOther: z.string().trim().min(1).max(100).optional(),
      kashrutLevel: z.enum(KASHRUT_LEVELS, 'Choose a kashrut level'),
      expirationDate: dateOnlyField,
      mashgiachName: mashgiachRequired
        ? z.string().trim().min(1, 'Mashgiach name is required').max(100)
        : optionalText(100),
      mashgiachPhone: mashgiachRequired ? phoneField : z.preprocess(emptyToUndefined, phoneField.optional()),
      adminNote: optionalText(1000),
    })
    .superRefine(requireOtherTextWhenOther('hechsher', 'hechsherOther'))
    .transform(dropOtherTextUnlessOther('hechsher', 'hechsherOther'));

export const adminTeudaFieldsSchema = adminTeudaShape(true);

export const adminEditTeudaFieldsSchema = adminTeudaShape(false);

// NEW (update): the admin form still requires food type and a category. The public submit form does not.
// חדש (עדכון): טופס המנהל עדיין דורש סוג אוכל וקטגוריה. טופס ההגשה הציבורי לא.
const requireAdminRestaurantBasics = (data, context) => {
  if (!data.restaurant.foodType) {
    context.addIssue({
      code: 'custom',
      path: ['restaurant', 'foodType'],
      message: 'Choose meat, dairy or pareve',
    });
  }

  if (!data.restaurant.categories || data.restaurant.categories.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['restaurant', 'categories'],
      message: 'Choose at least one category',
    });
  }
};

// Admin creates a restaurant (approved at once), optionally with an approved certificate and its photo.
export const adminCreateRestaurantSchema = z
  .object({
    restaurant: restaurantFieldsSchema,
    extras: restaurantExtrasSchema,
    teuda: adminTeudaFieldsSchema.optional(),
  })
  .superRefine(requireAdminRestaurantBasics);

// Editing replaces the whole set of admin-editable fields, so the form sends every field.
export const adminEditRestaurantSchema = z
  .object({
    restaurant: restaurantFieldsSchema,
    extras: restaurantExtrasSchema,
  })
  .superRefine(requireAdminRestaurantBasics);

export const adminCreateTeudaSchema = z.object({
  teuda: adminTeudaFieldsSchema,
});

export const adminEditTeudaSchema = z.object({
  teuda: adminEditTeudaFieldsSchema,
});

export const resolveReportSchema = z.object({
  resolution: z.enum(REPORT_RESOLUTIONS, 'Choose how the report was handled'),
  adminNote: optionalText(1000),
});

const pageField = z.coerce.number().int().min(1).max(10000).default(1);
const limitField = z.coerce.number().int().min(1).max(50).default(20);

// Query strings are always text, so numbers are converted and everything else must be a plain string.
// מחרוזות שאילתה הן תמיד טקסט, לכן ממירים מספרים וכל השאר חייב להיות מחרוזת רגילה (נגד הזרקת NoSQL).
export const pageQuerySchema = z.object({
  page: pageField,
  limit: limitField,
});

export const manageRestaurantsQuerySchema = z.object({
  page: pageField,
  limit: limitField,
  search: z.string().trim().max(100).optional(),
  status: z.enum(SUBMISSION_STATUSES).optional(),
});
