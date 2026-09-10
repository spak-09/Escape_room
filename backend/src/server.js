import { app } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: Uncaught Exception! Shutting down server...', { stack: err.stack });
  process.exit(1);
});

export async function startServer() {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(`Digital Safety Escape Room API Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`REST API Root: http://localhost:${env.PORT}/api/v1`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Initiating graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      logger.error('CRITICAL: Unhandled Promise Rejection! Shutting down...', { stack: err.stack });
      server.close(async () => {
        await disconnectDB();
        process.exit(1);
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
