import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

// Pre-computed dummy hash to mitigate timing-based account enumeration attacks
const DUMMY_HASH = '$2a$12$e8Y6/x3hK/eL4l89Z.fakehashlongerthan60charactersfortestvalidation';

/**
 * Generates short-lived access token and long-lived refresh token.
 */
export function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    {
      userId: user._id.toString(),
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Registers a new player with hashed credentials.
 */
export async function registerUser({ username, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedUsername = username.trim();

  // Check for existing email
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw new AppError('Email address is already registered', 409, 'DUPLICATE_EMAIL');
  }

  // Check for existing username
  const existingUsername = await User.findOne({ username: trimmedUsername });
  if (existingUsername) {
    throw new AppError('Username is already taken', 409, 'DUPLICATE_USERNAME');
  }

  // Hash password with bcrypt cost factor 12
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    username: trimmedUsername,
    email: normalizedEmail,
    passwordHash,
  });

  const { accessToken, refreshToken } = generateTokens(user);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticates user credentials with timing-attack mitigation.
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  // Execute password comparison even if user does not exist to prevent timing attacks
  const isMatch = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !isMatch) {
    throw new AppError('Invalid email or password credentials', 401, 'INVALID_CREDENTIALS');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
}

/**
 * Exchanges a valid refresh token for a fresh 15-minute access token.
 */
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401, 'TOKEN_MISSING');
  }

  // Only signature/expiry verification failures map to token errors. Wrapping
  // the whole flow would mask intentional errors (e.g. USER_NOT_FOUND) as a
  // misleading "invalid signature", making session problems impossible to
  // diagnose from the client.
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid refresh token signature or payload', 401, 'TOKEN_INVALID');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError('Account associated with this token no longer exists', 401, 'USER_NOT_FOUND');
  }

  const accessToken = jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return { accessToken };
}
