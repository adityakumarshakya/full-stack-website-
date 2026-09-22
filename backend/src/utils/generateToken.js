const jwt = require("jsonwebtoken");
const env = require("../config/env");

function generateToken(admin) {
  return jwt.sign(
    { id: admin._id.toString(), role: admin.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

module.exports = generateToken;
