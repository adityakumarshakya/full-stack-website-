const fs = require("fs");
const path = require("path");
const streamifier = require("streamifier");
const Media = require("../models/Media");
const asyncHandler = require("../utils/asyncHandler");
const { UPLOAD_DIR, cloudinary, USE_CLOUDINARY } = require("../middleware/upload");
const env = require("../config/env");

// Streams a memory-buffered file (Cloudinary mode) up to Cloudinary and
// resolves with the upload result.
function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `${env.CLOUDINARY_FOLDER}/${folder || "general"}`, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function persistFile(file, folder) {
  if (USE_CLOUDINARY) {
    const result = await uploadBufferToCloudinary(file.buffer, folder);
    return {
      fileName: result.public_id,
      url: result.secure_url,
      storageProvider: "cloudinary",
    };
  }

  // Local disk: multer already wrote the file to UPLOAD_DIR.
  return {
    fileName: file.filename,
    url: `/uploads/${file.filename}`,
    storageProvider: "local",
  };
}

async function removeStoredFile(doc) {
  if (doc.storageProvider === "cloudinary" && USE_CLOUDINARY) {
    try {
      await cloudinary.uploader.destroy(doc.fileName, { resource_type: "image" });
    } catch (err) {
      console.error("[media] Cloudinary delete failed:", err.message);
    }
    return;
  }
  const filePath = path.join(UPLOAD_DIR, doc.fileName);
  if (fs.existsSync(filePath)) fs.unlink(filePath, () => {});
}

// @desc    Upload one or more images
// @route   POST /api/media/upload
// @access  Private
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  const folder = (req.body.folder || "general").trim() || "general";

  const created = await Promise.all(
    req.files.map(async (file) => {
      const stored = await persistFile(file, folder);
      return Media.create({
        fileName: stored.fileName,
        originalName: file.originalname,
        url: stored.url,
        mimeType: file.mimetype,
        size: file.size,
        label: req.body.label || "",
        folder,
        storageProvider: stored.storageProvider,
        uploadedBy: req.admin._id,
      });
    })
  );

  return res.status(201).json({ success: true, message: "Upload successful.", media: created });
});

// @desc    List uploaded media (paginated, optionally filtered by folder)
// @route   GET /api/media
// @access  Private
const listMedia = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const filter = req.query.folder ? { folder: req.query.folder } : {};

  const [media, total, folders] = await Promise.all([
    Media.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Media.countDocuments(filter),
    Media.distinct("folder"),
  ]);

  return res.json({
    success: true,
    media,
    folders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Replace an existing image's file (keeps same DB record id, new underlying file)
// @route   PUT /api/media/:id/replace
// @access  Private
const replaceMedia = asyncHandler(async (req, res) => {
  const doc = await Media.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Media not found." });
  if (!req.file) return res.status(400).json({ success: false, message: "No replacement file uploaded." });

  await removeStoredFile(doc);

  const stored = await persistFile(req.file, doc.folder);
  doc.fileName = stored.fileName;
  doc.originalName = req.file.originalname;
  doc.url = stored.url;
  doc.mimeType = req.file.mimetype;
  doc.size = req.file.size;
  doc.storageProvider = stored.storageProvider;
  await doc.save();

  return res.json({ success: true, message: "Image replaced.", media: doc });
});

// @desc    Delete an image
// @route   DELETE /api/media/:id
// @access  Private
const deleteMedia = asyncHandler(async (req, res) => {
  const doc = await Media.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Media not found." });

  await removeStoredFile(doc);
  await doc.deleteOne();
  return res.json({ success: true, message: "Media deleted." });
});

module.exports = { uploadMedia, listMedia, replaceMedia, deleteMedia };
