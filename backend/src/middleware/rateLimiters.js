import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

export const submissionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many submissions. Please try again later.' },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many photo uploads. Please try again later.' },
});

// For routes where the photo is optional. It runs after the file is read and only counts requests that have one.
export const optionalUploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => !req.file,
  message: { message: 'Too many photo uploads. Please try again later.' },
});

// NEW (Milestone 4): generous limit for public search and autocomplete (one request per pause while typing).
// חדש (אבן דרך 4): מגבלה נדיבה לחיפוש והשלמה אוטומטית ציבוריים (בקשה אחת בכל הפסקה בהקלדה).
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many searches. Please wait a moment and try again.' },
});

// NEW (Milestone 3): a stricter limit for "forgot password", so nobody can use it to flood an inbox with emails.
// חדש (אבן דרך 3): מגבלה קשוחה יותר ל"שכחתי סיסמה", כדי שאי אפשר יהיה להציף תיבת מייל.
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Please try again later.' },
});
