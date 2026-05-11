import { logger } from "../utils/logger.js";

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${message}`);

  if (process.env.NODE_ENV === "development") {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
