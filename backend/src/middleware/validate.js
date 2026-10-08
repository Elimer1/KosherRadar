import { AppError } from '../utils/AppError.js';

// Validates req.body with a Zod schema and replaces it with the cleaned result.
// Unknown fields are removed, so controllers only ever see fields we expect.
export const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      error.errors = errors;
      return next(error);
    }

    req.body = result.data;
    next();
  };
};
