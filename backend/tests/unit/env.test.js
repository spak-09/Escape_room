import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Environment Validation Logic', () => {
  const testEnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    MONGO_URI: z
      .string()
      .refine(
        (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
        'MONGO_URI must begin with mongodb:// or mongodb+srv://'
      )
      .default('mongodb://localhost:27017/escape_room'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  });

  it('should accept valid local MongoDB configuration', () => {
    const valid = {
      NODE_ENV: 'development',
      PORT: '5000',
      MONGO_URI: 'mongodb://localhost:27017/escape_room',
      JWT_SECRET: 'super_secret_jwt_key_at_least_32_characters_long',
      JWT_REFRESH_SECRET: 'super_secret_refresh_jwt_key_at_least_32_characters_long',
      CLIENT_ORIGIN: 'http://localhost:5173',
    };

    const result = testEnvSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(5000);
      expect(result.data.MONGO_URI).toBe('mongodb://localhost:27017/escape_room');
    }
  });

  it('should accept valid MongoDB Atlas SRV URI', () => {
    const atlasConfig = {
      NODE_ENV: 'production',
      PORT: 8080,
      MONGO_URI: 'mongodb+srv://dbUser:securePass123@cluster0.abcde.mongodb.net/escape_room?retryWrites=true&w=majority',
      JWT_SECRET: 'super_secret_jwt_key_at_least_32_characters_long',
      JWT_REFRESH_SECRET: 'super_secret_refresh_jwt_key_at_least_32_characters_long',
      CLIENT_ORIGIN: 'https://escaperoom.example.com',
    };

    const result = testEnvSchema.safeParse(atlasConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.MONGO_URI).toContain('mongodb+srv://');
    }
  });

  it('should reject invalid URI protocol', () => {
    const invalidUri = {
      MONGO_URI: 'http://localhost:27017/db',
      JWT_SECRET: 'super_secret_jwt_key_at_least_32_characters_long',
      JWT_REFRESH_SECRET: 'super_secret_refresh_jwt_key_at_least_32_characters_long',
    };

    const result = testEnvSchema.safeParse(invalidUri);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('mongodb:// or mongodb+srv://');
    }
  });

  it('should reject short JWT secrets', () => {
    const shortSecret = {
      JWT_SECRET: 'short_key',
      JWT_REFRESH_SECRET: 'short_key',
    };

    const result = testEnvSchema.safeParse(shortSecret);
    expect(result.success).toBe(false);
  });
});
