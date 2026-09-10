import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;
let listenersRegistered = false;

/**
 * Masks user credentials from MongoDB URI for safe logging.
 */
function maskMongoUri(uri) {
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, '$1$2:****@');
  } catch {
    return 'mongodb://[masked]';
  }
}

/**
 * Sets up persistent Mongoose connection event listeners.
 */
function registerConnectionListeners() {
  if (listenersRegistered) return;

  mongoose.connection.on('connected', () => {
    isConnected = true;
    const host = mongoose.connection.host || 'unknown-host';
    const dbName = mongoose.connection.name || 'default';
    logger.info(`MongoDB Connected successfully: [${host}/${dbName}]`);
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB Connection Error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB connection lost. Driver will automatically attempt to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    logger.info('MongoDB reconnected successfully.');
  });

  listenersRegistered = true;
}

/**
 * Connects to MongoDB (Local or MongoDB Atlas) with retry and exponential backoff.
 *
 * @param {number} maxRetries - Maximum number of connection attempts
 * @param {number} baseDelayMs - Base delay in milliseconds for exponential backoff
 */
export async function connectDB(maxRetries = 5, baseDelayMs = 1000) {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  registerConnectionListeners();

  const isAtlas = env.MONGO_URI.startsWith('mongodb+srv://');
  const targetType = isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB';
  const safeUri = maskMongoUri(env.MONGO_URI);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Attempting connection to ${targetType} (${safeUri}) [Attempt ${attempt}/${maxRetries}]...`);

      const conn = await mongoose.connect(env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        autoIndex: env.NODE_ENV !== 'production', // Build indexes in dev/test, manage in prod
      });

      isConnected = true;
      return conn;
    } catch (error) {
      logger.error(`Failed to connect to ${targetType} on attempt ${attempt}: ${error.message}`);

      if (attempt === maxRetries) {
        logger.error(`Exhausted all ${maxRetries} connection attempts to MongoDB. Halting.`);
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.info(`Retrying connection in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Gracefully disconnects from MongoDB.
 */
export async function disconnectDB() {
  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected cleanly.');
  } catch (error) {
    logger.error(`Error during MongoDB disconnection: ${error.message}`);
    throw error;
  }
}
