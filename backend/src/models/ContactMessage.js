const mongoose = require("mongoose");

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    service: { type: String, trim: true, maxlength: 120, default: "" },
    subject: { type: String, trim: true, maxlength: 200, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 5000 },

    isRead: { type: Boolean, default: false },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    sourcePage: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { timestamps: true }
);

ContactMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ContactMessage", ContactMessageSchema);
