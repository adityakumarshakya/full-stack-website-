const ContactMessage = require("../models/ContactMessage");
const Media = require("../models/Media");
const SeoSetting = require("../models/SeoSetting");
const { PAGES } = require("../utils/pageMap");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");

// @desc    Website overview for the admin dashboard
// @route   GET /api/dashboard/overview
// @access  Private
const getOverview = asyncHandler(async (req, res) => {
  const [totalMessages, unreadMessages, totalMedia, seoConfigured] = await Promise.all([
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ isRead: false }),
    Media.countDocuments(),
    SeoSetting.countDocuments({ metaTitle: { $ne: "" } }),
  ]);

  const recentMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(5);

  return res.json({
    success: true,
    overview: {
      siteUrl: env.SITE_URL,
      totalPages: PAGES.length,
      seoConfiguredPages: seoConfigured,
      totalMessages,
      unreadMessages,
      totalMedia,
    },
    recentMessages,
  });
});

module.exports = { getOverview };
