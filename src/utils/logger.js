const winston = require("winston");
require("dotenv").config(); // Load environment variables

// Define a custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Ensure timestamp is always present
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    // Stringify metadata if it exists
    const metaString = Object.keys(metadata).length
      ? ` ${JSON.stringify(metadata)}`
      : "";
    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Default log level
  format: logFormat,
  transports: [
    // Console transport with colorized output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorize logs in console
        logFormat
      ),
    }),
    // Optional file transport for errors
    ...(process.env.LOG_TO_FILE === "true"
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          new winston.transports.File({
            filename: "logs/combined.log",
          }),
        ]
      : []),
  ],
});

// Middleware to log requests
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
};

// Function to log errors with request context
const logError = (err, req) => {
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
};

module.exports = {
  logger,
  logRequest,
  logError,
};
