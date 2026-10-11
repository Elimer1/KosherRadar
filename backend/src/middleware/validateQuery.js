// NEW (Milestone 3): validates the query string (?page=2&search=...) with a Zod schema.
// חדש (אבן דרך 3): בדיקת מחרוזת השאילתה (?page=2&search=...) באמצעות סכמת Zod.
//
// In Express 5 `req.query` cannot be replaced, so the cleaned values are stored in `req.validatedQuery`.
// Handlers must read `req.validatedQuery`, never the raw `req.query`, so an object such as
// ?search[$ne]=x can never reach a database query.
// ב-Express 5 אי אפשר להחליף את req.query, לכן הערכים הנקיים נשמרים ב-req.validatedQuery.
export const validateQuery = (schema) => (req, res, next) => {
  req.validatedQuery = schema.parse(req.query);
  next();
};
