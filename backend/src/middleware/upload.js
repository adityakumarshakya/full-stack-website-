const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");
const env = require("../config/env");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error("Unsupported file type. Only image files are allowed."));
  }
  return cb(null, true);
}

let cloudinary = null;
if (env.USE_CLOUDINARY) {
  // eslint-disable-next-line global-require
  cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Local disk storage (default / fallback when no Cloudinary keys are set).
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

// When Cloudinary is configured, buffer the file in memory instead — the
// media controller streams it up to Cloudinary itself (keeps this file free
// of any Cloudinary-specific upload logic beyond storage selection).
const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: env.USE_CLOUDINARY ? memoryStorage : localStorage,
  fileFilter,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
});

module.exports = { upload, UPLOAD_DIR, cloudinary, USE_CLOUDINARY: env.USE_CLOUDINARY };
