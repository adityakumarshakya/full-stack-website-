const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true }, // local filename OR Cloudinary public_id
    originalName: { type: String, required: true },
    url: { type: String, required: true }, // public path, e.g. /uploads/xxxx.jpg or Cloudinary secure_url
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // bytes
    label: { type: String, trim: true, default: "" }, // optional purpose, e.g. "logo", "favicon"
    folder: { type: String, trim: true, default: "general" }, // simple folder/category organization
    storageProvider: { type: String, enum: ["local", "cloudinary"], default: "local" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

MediaSchema.index({ folder: 1, createdAt: -1 });

module.exports = mongoose.model("Media", MediaSchema);
