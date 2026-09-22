const rateLimit = require("express-rate-limit");
const env = require("../config/env");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MIN * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

// Stricter limiter for the login endpoint to slow down brute force attempts
const loginLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MIN * 60 * 1000,
  max: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

// Limiter for the public contact form to prevent spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages sent. Please try again later." },
});

module.exports = { apiLimiter, loginLimiter, contactLimiter };
