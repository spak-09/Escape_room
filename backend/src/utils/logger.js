import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const isProd = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    isProd ? json() : combine(colorize(), devFormat)
  ),
  transports: [
    new winston.transports.Console()
  ],
});
