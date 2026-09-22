const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  SITE_URL: (process.env.SITE_URL || "http://localhost:5000").replace(/\/$/, ""),
  CORS_EXTRA_ORIGINS: (process.env.CORS_EXTRA_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/orinnovative",

  JWT_SECRET: process.env.JWT_SECRET || "insecure_dev_secret_change_me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "2h",
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || "orinnovative_token",

  ADMIN_NAME: process.env.ADMIN_NAME || "Site Administrator",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@orinnovative.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "ChangeMe@12345",

  MAX_UPLOAD_MB: parseInt(process.env.MAX_UPLOAD_MB, 10) || 5,

  RATE_LIMIT_WINDOW_MIN: parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  LOGIN_RATE_LIMIT_MAX: parseInt(process.env.LOGIN_RATE_LIMIT_MAX, 10) || 8,

  // Cloudinary (optional). If all three are present, media storage automatically
  // switches from local disk to Cloudinary — no code changes required.
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || "orinnovative",

  IS_PROD: process.env.NODE_ENV === "production",
};

env.USE_CLOUDINARY = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

module.exports = env;
