const ContactMessage = require("../models/ContactMessage");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Submit the public contact form
// @route   POST /api/contact
// @access  Public
const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, service, subject, message, sourcePage } = req.body;

  // Prefer the page the form told us about; fall back to the HTTP Referer
  // header so the field is still populated if the frontend doesn't send it.
  const referer = req.get("Referer") || req.get("Referrer") || "";
  const resolvedSourcePage = (sourcePage && String(sourcePage).slice(0, 300)) || referer.slice(0, 300);

  const doc = await ContactMessage.create({
    name,
    email,
    phone,
    service,
    subject,
    message,
    sourcePage: resolvedSourcePage,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent") || "",
  });

  return res.status(201).json({
    success: true,
    message: "Thank you — your message has been received. We'll get back to you within one business day.",
    id: doc._id,
  });
});

// @desc    List all contact messages (paginated)
// @route   GET /api/contact
// @access  Private
const listContactMessages = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const unreadOnly = req.query.unread === "true";

  const filter = unreadOnly ? { isRead: false } : {};

  const [messages, total, unreadCount] = await Promise.all([
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ContactMessage.countDocuments(filter),
    ContactMessage.countDocuments({ isRead: false }),
  ]);

  return res.json({
    success: true,
    messages,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get a single message and mark it read
// @route   GET /api/contact/:id
// @access  Private
const getContactMessage = asyncHandler(async (req, res) => {
  const doc = await ContactMessage.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Message not found." });

  if (!doc.isRead) {
    doc.isRead = true;
    await doc.save();
  }

  return res.json({ success: true, message: doc });
});

// @desc    Toggle read/unread state
// @route   PATCH /api/contact/:id/read
// @access  Private
const markContactMessage = asyncHandler(async (req, res) => {
  const doc = await ContactMessage.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Message not found." });

  doc.isRead = req.body.isRead !== undefined ? !!req.body.isRead : !doc.isRead;
  await doc.save();

  return res.json({ success: true, message: doc });
});

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private
const deleteContactMessage = asyncHandler(async (req, res) => {
  const doc = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Message not found." });

  return res.json({ success: true, message: "Message deleted." });
});

module.exports = {
  submitContactMessage,
  listContactMessages,
  getContactMessage,
  markContactMessage,
  deleteContactMessage,
};
