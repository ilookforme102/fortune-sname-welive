// src/utils/logger.js
import { createLogger, format, transports } from "winston";

// Create logger instance
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
    new transports.Console(),
  ],
});

// Export individual log functions
export const info = (...args) => logger.info(...args);
export const error = (...args) => logger.error(...args);
export const warn = (...args) => logger.warn(...args);
export const debug = (...args) => logger.debug(...args);

// Default export full logger if you ever want full control
export default logger;
