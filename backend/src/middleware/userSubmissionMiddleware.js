import { appError } from '../utils/appError.js';

// Administrators must use the fully validated authoritative creation endpoints.
export const assertUserSubmission = (user) => {
  if (user?.role === 'ADMIN') {
    throw appError('Use the administrator creation workflow for restaurants and certificates', 403);
  }
};

export const userSubmissionMiddleware = (req, res, next) => {
  assertUserSubmission(req.user);
  next();
};
