import * as authService from '../services/authService.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

/**
 * Register a new player account.
 */
export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser({ username, email, password });

    res.cookie('refreshToken', result.refreshToken, getCookieOptions());

    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Authenticate player credentials.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.cookie('refreshToken', result.refreshToken, getCookieOptions());

    return res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Refresh access token using HttpOnly cookie.
 */
export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    const result = await authService.refreshAccessToken(token);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Clear refresh cookie and invalidate session.
 */
export async function logout(req, res, next) {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Security session ended. Logged out successfully.',
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get authenticated player profile.
 */
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('Player profile not found', 404, 'USER_NOT_FOUND');
    }

    return res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    return next(error);
  }
}
