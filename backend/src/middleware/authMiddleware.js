const jwt = require("jsonwebtoken");
const env = require("../config/env");
const Admin = require("../models/Admin");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Protects a route: requires a valid JWT, either in the
 * `Authorization: Bearer <token>` header or in the auth cookie.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies[env.JWT_COOKIE_NAME]) {
    token = req.cookies[env.JWT_COOKIE_NAME];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: "Not authorized. Account not found or disabled." });
    }
    req.admin = admin;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized. Invalid or expired token." });
  }
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, message: "Forbidden. Insufficient permissions." });
    }
    return next();
  };
}

module.exports = { protect, requireRole };
