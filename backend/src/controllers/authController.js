const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
  if (!admin || !admin.isActive) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }

  admin.lastLoginAt = new Date();
  admin.lastLoginIp = req.ip;
  await admin.save();

  const token = generateToken(admin);

  res.cookie(env.JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.IS_PROD,
    sameSite: "lax",
    maxAge: 2 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    token,
    admin: admin.toSafeObject(),
  });
});

// @desc    Get currently logged in admin
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  return res.json({ success: true, admin: req.admin.toSafeObject() });
});

// @desc    Logout (clears cookie; client should also drop stored token)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.JWT_COOKIE_NAME);
  return res.json({ success: true, message: "Logged out." });
});

// @desc    Change own password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select("+password");
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Current password is incorrect." });
  }

  admin.password = newPassword;
  await admin.save();

  return res.json({ success: true, message: "Password updated successfully." });
});

module.exports = { login, getMe, logout, changePassword };
