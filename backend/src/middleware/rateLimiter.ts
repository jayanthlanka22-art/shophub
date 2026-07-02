import rateLimit from "express-rate-limit";

// Applied only to auth endpoints (login/register/refresh) to slow brute-force attempts.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later.", errors: null },
});
