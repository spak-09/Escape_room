import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid Bearer token.', 401, 'TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.trim() === '') {
      throw new AppError('Authentication token cannot be empty', 401, 'TOKEN_MISSING');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);

      // Attach decoded player identity to request
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      };

      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Access token has expired. Please refresh your session.', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid access token signature or payload', 401, 'TOKEN_INVALID');
    }
  } catch (error) {
    return next(error);
  }
}
