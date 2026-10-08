import { appError } from '../utils/appError.js';

export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw appError('Admin access required', 403);
  }

  next();
};
