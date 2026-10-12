import { z } from 'zod';
import {
  CATEGORIES,
  FOOD_TYPES,
  HECHSHER_VALUES,
  ISRAEL_BOUNDS,
  KASHRUT_LEVELS,
} from '../config/constants.js';
import {
  dropOtherTextUnlessOther,
  httpUrlField,
  phoneField,
  requireOtherTextWhenOther,
} from './commonSchemas.js';
import { teudaFieldsSchema } from './teudaSchemas.js';

// Forms send "" for an untouched optional input. Treat that the same as "not provided".
const emptyToUndefined = (value) => (value === '' || value === null ? undefined : value);

const optionalText = (maxLength) =>
  z.preprocess(emptyToUndefined, z.string().trim().min(1).max(maxLength).optional());

// NEW (Milestone 3): exported so the admin create/edit forms use exactly the same field rules.
// חדש (אבן דרך 3): מיוצא כדי שטפסי יצירה/עריכה של מנהל ישתמשו באותם כללי שדות בדיוק.
export const restaurantFieldsSchema = z
  .object({
    name: z.string().trim().min(1, 'Restaurant name is required').max(150),
    address: z.string().trim().min(1, 'Address is required').max(250),
    city: optionalText(100),

    latitude: z.preprocess(
      emptyToUndefined,
      z
        .number('Latitude must be a number')
        .min(ISRAEL_BOUNDS.minLat, 'Latitude is outside Israel')
        .max(ISRAEL_BOUNDS.maxLat, 'Latitude is outside Israel')
        .optional()
    ),
    longitude: z.preprocess(
      emptyToUndefined,
      z
        .number('Longitude must be a number')
        .min(ISRAEL_BOUNDS.minLng, 'Longitude is outside Israel')
        .max(ISRAEL_BOUNDS.maxLng, 'Longitude is outside Israel')
        .optional()
    ),

    geoapifyPlaceId: optionalText(200),
    phone: z.preprocess(emptyToUndefined, phoneField.optional()),
    website: z.preprocess(emptyToUndefined, httpUrlField.optional()),

    // NEW (update): a person adding a restaurant may leave food type and categories blank.
    // חדש (עדכון): מי שמוסיף מסעדה יכול להשאיר סוג אוכל וקטגוריות ריקים.
    foodType: z.preprocess(emptyToUndefined, z.enum(FOOD_TYPES, 'Choose meat, dairy or pareve').optional()),
    categories: z
      .array(z.enum(CATEGORIES))
      .max(5)
      .default([])
      .transform((values) => [...new Set(values)]),
    foodKeywords: z
      .array(z.string().trim().min(1).max(30))
      .max(10, 'Use at most 10 food keywords')
      .default([]),

    claimedHechsher: z.preprocess(emptyToUndefined, z.enum(HECHSHER_VALUES).optional()),
    claimedHechsherOther: optionalText(100),
    claimedKashrutLevel: z.preprocess(emptyToUndefined, z.enum(KASHRUT_LEVELS).optional()),
  })
  .superRefine((data, context) => {
    const hasLatitude = data.latitude !== undefined;
    const hasLongitude = data.longitude !== undefined;

    if (hasLatitude !== hasLongitude) {
      context.addIssue({
        code: 'custom',
        path: [hasLatitude ? 'longitude' : 'latitude'],
        message: 'Enter both latitude and longitude, or leave both empty',
      });
    }
  })
  .superRefine(requireOtherTextWhenOther('claimedHechsher', 'claimedHechsherOther'))
  .transform(dropOtherTextUnlessOther('claimedHechsher', 'claimedHechsherOther'));

// NEW (update): a user submission needs a name, an address and a hechsher. City is optional.
// חדש (עדכון): הגשת משתמש דורשת שם, כתובת והכשר. עיר אינה חובה.
export const submitRestaurantSchema = z
  .object({
    restaurant: restaurantFieldsSchema,
    teuda: teudaFieldsSchema.optional(),
  })
  .superRefine((data, context) => {
    if (!data.restaurant.claimedHechsher) {
      context.addIssue({
        code: 'custom',
        path: ['restaurant', 'claimedHechsher'],
        message: 'Choose a hechsher',
      });
    }
  });
