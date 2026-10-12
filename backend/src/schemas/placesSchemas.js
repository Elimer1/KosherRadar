import { z } from 'zod';

export const addressQuerySchema = z.object({
  text: z.string().trim().min(2, 'Type at least 2 characters').max(200),
});

// NEW (Milestone 5): public place search for the home page. `lang` only changes the place name Geoapify returns.
// חדש (אבן דרך 5): חיפוש מקום ציבורי לדף הבית. lang משנה רק את שם המקום ש-Geoapify מחזיר.
export const publicPlaceQuerySchema = z.object({
  text: z.string().trim().min(2, 'Type at least 2 characters').max(200),
  lang: z.enum(['en', 'he']).default('en'),
});
