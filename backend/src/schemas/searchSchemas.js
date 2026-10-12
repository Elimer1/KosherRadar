// NEW (Milestone 4): Zod schemas for the public search query string (?q=pizza&level=MEHADRIN&page=2 ...).
// חדש (אבן דרך 4): סכמות Zod למחרוזת השאילתה של החיפוש הציבורי.
//
// Query strings are always text. Every value must be a plain string (a repeated key or ?q[$ne]=x is
// an array/object and fails), so nothing but validated values can reach a database query.
// מחרוזות שאילתה הן תמיד טקסט. כל ערך חייב להיות מחרוזת רגילה (מפתח חוזר או ?q[$ne]=x נכשלים).
import { z } from 'zod';
import {
  CATEGORIES,
  FOOD_TYPES,
  HECHSHER_VALUES,
  KASHRUT_LEVELS,
  SEARCH_RADIUS_OPTIONS_KM,
} from '../config/constants.js';

// "a,b,c" -> ['a', 'b', 'c'], each value checked against the allowed list. Missing means "no filter".
// "a,b,c" -> מערך, כל ערך נבדק מול הרשימה המותרת. חסר פירושו "בלי מסנן".
const listOf = (allowedValues) =>
  z
    .string()
    .trim()
    .transform((text) => (text === '' ? [] : text.split(',').map((item) => item.trim())))
    .pipe(z.array(z.enum(allowedValues)).max(allowedValues.length))
    .default([]);

const booleanFlag = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .default(false);

// An empty value (?lat=) must not silently become 0, so the text has to be non-empty before it is converted.
// ערך ריק (?lat=) לא יהפוך בשקט ל-0, לכן הטקסט חייב להיות לא ריק לפני ההמרה.
const numberText = z.string().trim().min(1);

const searchShape = {
  q: z.string().trim().max(100).optional(),
  level: z.enum(KASHRUT_LEVELS).optional(),
  hechsher: listOf(HECHSHER_VALUES),
  foodType: listOf(FOOD_TYPES),
  category: listOf(CATEGORIES),
  hideExpired: booleanFlag,
  includeUnknown: booleanFlag,
  lat: numberText.pipe(z.coerce.number().min(-90).max(90)).optional(),
  lng: numberText.pipe(z.coerce.number().min(-180).max(180)).optional(),
  radiusKm: numberText
    .pipe(
      z.coerce.number().refine((value) => SEARCH_RADIUS_OPTIONS_KM.includes(value), {
        message: `Choose a radius of ${SEARCH_RADIUS_OPTIONS_KM.join(', ')} km`,
      })
    )
    .optional(),
};

// The location is one point: both numbers or neither. A radius only makes sense around a location.
// המיקום הוא נקודה אחת: שני המספרים או אף אחד. רדיוס הגיוני רק סביב מיקום.
const checkLocation = (data, context) => {
  if ((data.lat === undefined) !== (data.lng === undefined)) {
    context.addIssue({ code: 'custom', path: ['lat'], message: 'Send both lat and lng, or neither' });
  }

  if (data.radiusKm !== undefined && data.lat === undefined) {
    context.addIssue({ code: 'custom', path: ['radiusKm'], message: 'A radius needs a search location' });
  }
};

export const searchQuerySchema = z
  .object({
    ...searchShape,
    page: numberText.pipe(z.coerce.number().int().min(1).max(500)).default(1),
  })
  .superRefine(checkLocation);

// Autocomplete starts at 2 characters (spec section 8).
export const suggestionsQuerySchema = z
  .object({
    ...searchShape,
    q: z.string().trim().min(2, 'Type at least 2 characters').max(100),
  })
  .superRefine(checkLocation);

// NEW (Milestone 5): the map asks for the rectangle currently on screen (north/south/east/west).
// The same filters as the list apply, including a radius around the chosen search location.
// חדש (אבן דרך 5): המפה מבקשת את המלבן שעל המסך. אותם מסננים כמו ברשימה, כולל רדיוס סביב מיקום החיפוש.
const latitudeText = numberText.pipe(z.coerce.number().min(-90).max(90));
const longitudeText = numberText.pipe(z.coerce.number().min(-180).max(180));

export const mapQuerySchema = z
  .object({
    ...searchShape,
    north: latitudeText,
    south: latitudeText,
    east: longitudeText,
    west: longitudeText,
  })
  .superRefine((data, context) => {
    checkLocation(data, context);

    if (data.north <= data.south) {
      context.addIssue({ code: 'custom', path: ['north'], message: 'north must be greater than south' });
    }

    // A box that crosses the date line is not used. The map asks the visitor to zoom in instead.
    // תיבה שחוצה את קו התאריך לא בשימוש. המפה מבקשת להתקרב.
    if (data.east <= data.west) {
      context.addIssue({ code: 'custom', path: ['east'], message: 'east must be greater than west' });
    }
  });
