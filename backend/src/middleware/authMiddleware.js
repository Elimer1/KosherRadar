import { appError } from '../utils/appError.js';
import { getUserFromTokenService } from '../services/authService.js';

export const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw appError('Authentication required', 401, 'INVALID_TOKEN');
  }

  req.user = await getUserFromTokenService(token);
  next();
};
