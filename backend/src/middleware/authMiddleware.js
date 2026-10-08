import { AppError } from '../utils/AppError.js';
import { getUserFromTokenService } from '../services/authService.js';

// Requires "Authorization: Bearer <token>". On success req.user is the user loaded from the
// database (not data copied from the token), so req.user.role can be trusted.
export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication required', 401, 'INVALID_TOKEN');
    }

    req.user = await getUserFromTokenService(token);
    next();
  } catch (error) {
    next(error);
  }
};
