import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';

import { corsOptions, helmetOptions } from './config/security.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';
import { apiRouter } from './routes/index.js';
import { env } from './config/env.js';

export const app = express();

// Trust proxy if in production / behind reverse proxy
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 1. Security HTTP Headers
app.use(helmet(helmetOptions));

// 2. Cross-Origin Resource Sharing
app.use(cors(corsOptions));

// 3. Global Rate Limiter
app.use(apiLimiter);

// 4. Request Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 5. Data Sanitization against NoSQL Query Injection & Parameter Pollution
app.use(mongoSanitize());
app.use(hpp());

// 6. HTTP Request Logger (skip during testing)
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 7. Mount API Router at /api/v1
app.use('/api/v1', apiRouter);

// 8. Handle Unmatched Routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404, 'ROUTE_NOT_FOUND'));
});

// 9. Centralized Error Handling Middleware
app.use(errorHandler);
