import { appError } from '../utils/appError.js';

// Multipart forms can only carry text and files, so nested objects arrive as JSON strings.
// This turns the named fields back into objects before Zod validates them.
export const parseJsonFields = (fieldNames) => (req, res, next) => {
  const body = req.body || {};

  for (const fieldName of fieldNames) {
    if (body[fieldName] === undefined) {
      continue;
    }

    try {
      body[fieldName] = JSON.parse(body[fieldName]);
    } catch (error) {
      throw appError(`The "${fieldName}" field is not valid JSON`, 400);
    }
  }

  req.body = body;
  next();
};
