const SeoSetting = require("../models/SeoSetting");
const asyncHandler = require("../utils/asyncHandler");
const { PAGES, findBySlug } = require("../utils/pageMap");

// @desc    List every page with its SEO settings (creates a blank one if missing)
// @route   GET /api/seo
// @access  Private
const listSeo = asyncHandler(async (req, res) => {
  const all = await SeoSetting.find().lean();
  const byPage = new Map(all.map((s) => [s.page, s]));

  const merged = PAGES.map((p) => ({
    ...p,
    seo: byPage.get(p.slug) || null,
  }));

  return res.json({ success: true, pages: merged });
});

// @desc    Get SEO settings for a single page
// @route   GET /api/seo/:page
// @access  Private
const getSeoByPage = asyncHandler(async (req, res) => {
  const page = findBySlug(req.params.page);
  if (!page) {
    return res.status(404).json({ success: false, message: "Unknown page slug." });
  }

  let seo = await SeoSetting.findOne({ page: page.slug });
  if (!seo) {
    seo = await SeoSetting.create({ page: page.slug });
  }

  return res.json({ success: true, page, seo });
});

// @desc    Update SEO settings for a page (upsert)
// @route   PUT /api/seo/:page
// @access  Private
const updateSeoByPage = asyncHandler(async (req, res) => {
  const page = findBySlug(req.params.page);
  if (!page) {
    return res.status(404).json({ success: false, message: "Unknown page slug." });
  }

  // Validate JSON-LD before saving so a typo can't break the live site.
  if (req.body.schemaMarkup) {
    try {
      JSON.parse(req.body.schemaMarkup);
    } catch (e) {
      return res.status(400).json({ success: false, message: "Schema Markup must be valid JSON." });
    }
  }

  const allowedFields = [
    "metaTitle",
    "metaDescription",
    "metaKeywords",
    "ogTitle",
    "ogDescription",
    "ogImage",
    "ogType",
    "ogUrl",
    "twitterCard",
    "twitterTitle",
    "twitterDescription",
    "twitterImage",
    "canonicalUrl",
    "robotsMeta",
    "schemaMarkup",
  ];

  const update = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      update[field] = req.body[field];
    }
  }

  const seo = await SeoSetting.findOneAndUpdate(
    { page: page.slug },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  return res.json({ success: true, message: "SEO settings updated.", seo });
});

module.exports = { listSeo, getSeoByPage, updateSeoByPage };
