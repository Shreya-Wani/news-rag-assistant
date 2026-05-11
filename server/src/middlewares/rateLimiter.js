import rateLimit from "express-rate-limit";
import { CONSTANTS } from "../config/constants.js";

/**
 * API Rate Limiter
 */
export const rateLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
