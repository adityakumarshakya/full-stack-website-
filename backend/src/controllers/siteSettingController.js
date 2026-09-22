const SiteSetting = require("../models/SiteSetting");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get website settings
// @route   GET /api/settings
// @access  Private
const getSiteSettings = asyncHandler(async (req, res) => {
  const doc = await SiteSetting.findOneAndUpdate(
    { singletonKey: "site-settings" },
    { $setOnInsert: { singletonKey: "site-settings" } },
    { new: true, upsert: true }
  );
  return res.json({ success: true, settings: doc });
});

// @desc    Update website settings
// @route   PUT /api/settings
// @access  Private
const updateSiteSettings = asyncHandler(async (req, res) => {
  const allowedFields = [
    "siteName",
    "logoUrl",
    "faviconUrl",
    "contactEmail",
    "contactPhone",
    "address",
    "footerText",
    "businessHours",
  ];
  const update = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      update[field] = req.body[field];
    }
  }
  if (req.body.socialLinks && typeof req.body.socialLinks === "object") {
    const allowedSocial = ["facebook", "twitter", "instagram", "linkedin", "youtube", "whatsapp"];
    update.socialLinks = {};
    for (const key of allowedSocial) {
      if (req.body.socialLinks[key] !== undefined) {
        update.socialLinks[key] = req.body.socialLinks[key];
      }
    }
  }

  const doc = await SiteSetting.findOneAndUpdate(
    { singletonKey: "site-settings" },
    { $set: update, $setOnInsert: { singletonKey: "site-settings" } },
    { new: true, upsert: true, runValidators: true }
  );

  return res.json({ success: true, message: "Website settings updated.", settings: doc });
});

// @desc    Get robots.txt content (raw, for the admin editor)
// @route   GET /api/settings/robots
// @access  Private
const getRobotsTxt = asyncHandler(async (req, res) => {
  const doc = await SiteSetting.findOneAndUpdate(
    { singletonKey: "site-settings" },
    { $setOnInsert: { singletonKey: "site-settings" } },
    { new: true, upsert: true }
  );
  return res.json({ success: true, robotsTxt: doc.robotsTxt, sitemapEnabled: doc.sitemapEnabled });
});

// @desc    Update robots.txt content
// @route   PUT /api/settings/robots
// @access  Private
const updateRobotsTxt = asyncHandler(async (req, res) => {
  const { robotsTxt, sitemapEnabled } = req.body;
  const update = {};
  if (robotsTxt !== undefined) update.robotsTxt = robotsTxt;
  if (sitemapEnabled !== undefined) update.sitemapEnabled = !!sitemapEnabled;

  const doc = await SiteSetting.findOneAndUpdate(
    { singletonKey: "site-settings" },
    { $set: update, $setOnInsert: { singletonKey: "site-settings" } },
    { new: true, upsert: true, runValidators: true }
  );

  return res.json({ success: true, message: "robots.txt updated.", robotsTxt: doc.robotsTxt });
});

// @desc    Public, unauthenticated subset of site settings for the live
//          frontend to render dynamically (logo, contact info, socials...).
//          Never exposes robotsTxt or any admin-only field.
// @route   GET /api/public/site-settings
// @access  Public
const getPublicSiteSettings = asyncHandler(async (req, res) => {
  const doc = await SiteSetting.findOne({ singletonKey: "site-settings" }).lean();

  const safe = doc
    ? {
        siteName: doc.siteName,
        logoUrl: doc.logoUrl,
        faviconUrl: doc.faviconUrl,
        contactEmail: doc.contactEmail,
        contactPhone: doc.contactPhone,
        address: doc.address,
        footerText: doc.footerText,
        businessHours: doc.businessHours,
        socialLinks: doc.socialLinks,
      }
    : null;

  // Cache briefly at the edge/browser — settings change rarely, and this
  // endpoint is fetched by every page load.
  res.set("Cache-Control", "public, max-age=60");
  return res.json({ success: true, settings: safe });
});

module.exports = {
  getSiteSettings,
  updateSiteSettings,
  getRobotsTxt,
  updateRobotsTxt,
  getPublicSiteSettings,
};
