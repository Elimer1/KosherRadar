import { AppError } from '../utils/AppError.js';

// Must run after authMiddleware. Wrong role is 403 (not 401) so the client keeps its session.
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new AppError('Admin access required', 403));
  }

  next();
};
