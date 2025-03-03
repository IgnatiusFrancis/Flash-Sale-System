import rateLimit from "express-rate-limit";

export const purchaseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 purchase requests per minute
  message: {
    error: "Too many purchase attempts, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
