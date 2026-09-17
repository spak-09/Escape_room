import { env } from './env.js';
import { AppError } from '../utils/AppError.js';

/**
 * Loopback origins used by local tooling. Vite prints both `localhost` and
 * `127.0.0.1` URLs, so either host must be able to talk to a development API
 * (otherwise every authentication request fails with an opaque CORS error).
 */
const LOOPBACK_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function isAllowedOrigin(origin) {
  // No Origin header: curl, server-to-server calls, native clients
  if (!origin) return true;
  if (env.NODE_ENV === 'test') return true;
  if (origin === env.CLIENT_ORIGIN) return true;
  // Non-production only: accept any loopback host/port. Production stays on the
  // strict single-origin allowlist (never a wildcard).
  if (env.NODE_ENV !== 'production' && LOOPBACK_ORIGIN.test(origin)) return true;
  return false;
}

export const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    // Reject with an operational error so the client receives a clear
    // CORS_ORIGIN_DENIED payload (403) instead of an opaque 500 crash.
    return callback(
      new AppError(
        `CORS blocked: origin ${origin} is not permitted. Set CLIENT_ORIGIN to this frontend origin.`,
        403,
        'CORS_ORIGIN_DENIED'
      )
    );
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};

export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", env.CLIENT_ORIGIN],
    },
  },
  crossOriginEmbedderPolicy: false,
};
