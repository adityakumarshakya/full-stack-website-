const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimiters");
const { login, getMe, logout, changePassword } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password").isLength({ min: 1 }).withMessage("Password is required."),
  ],
  validate,
  login
);

router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

router.put(
  "/change-password",
  protect,
  [
    body("currentPassword").isLength({ min: 1 }).withMessage("Current password is required."),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters."),
  ],
  validate,
  changePassword
);

module.exports = router;
