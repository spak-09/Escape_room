import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Normalizes the HTTP port.
 * An ambient shell variable (or a blank line in .env) must never silently bind
 * the API to a random OS-assigned port: `dotenv` does not override variables
 * that already exist in the process environment, and `PORT=0` / `PORT=` would
 * otherwise be coerced to 0. The Vite dev client always targets :5000, so both
 * cases fall back to the documented default instead of breaking authentication
 * with connection-refused errors.
 */
const normalizePort = (value) => {
  if (value === undefined || value === null) return undefined;
  const raw = String(value).trim();
  if (raw === '' || Number(raw) === 0) return undefined;
  return raw;
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess(normalizePort, z.coerce.number().int().positive().max(65535).default(5000)),
  MONGO_URI: z
    .string()
    .refine(
      (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
      'MONGO_URI must begin with "mongodb://" (local instance) or "mongodb+srv://" (MongoDB Atlas)'
    )
    .default('mongodb://localhost:27017/escape_room'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('CRITICAL: Environment configuration validation failed:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
