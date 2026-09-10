import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    error = new AppError(`Invalid resource identifier: ${err.value}`, 400, 'INVALID_IDENTIFIER');
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`Duplicate value entered for ${field}. Please use another value.`, 409, 'DUPLICATE_KEY');
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new AppError(`Validation error: ${messages.join('. ')}`, 400, 'VALIDATION_ERROR', err.errors);
  }

  // Handle body-parser JSON syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new AppError('Malformed JSON payload received', 400, 'INVALID_JSON');
  }

  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.isOperational ? error.message : (env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : error.message);
  const details = error.details || null;

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details,
    },
  });
}
