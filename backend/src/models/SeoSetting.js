const mongoose = require("mongoose");

/**
 * One document per website page (see src/utils/pageMap.js for the canonical
 * list of page slugs). Any field left blank falls back to the value already
 * hard-coded in the static HTML file, so the site never renders empty tags.
 */
const SeoSettingSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, unique: true, trim: true, lowercase: true },
    metaTitle: { type: String, trim: true, maxlength: 160, default: "" },
    metaDescription: { type: String, trim: true, maxlength: 320, default: "" },
    metaKeywords: { type: String, trim: true, maxlength: 500, default: "" },

    ogTitle: { type: String, trim: true, maxlength: 160, default: "" },
    ogDescription: { type: String, trim: true, maxlength: 320, default: "" },
    ogImage: { type: String, trim: true, default: "" },
    ogType: { type: String, trim: true, default: "website" },
    ogUrl: { type: String, trim: true, default: "" },

    twitterCard: {
      type: String,
      enum: ["summary", "summary_large_image", "app", "player"],
      default: "summary_large_image",
    },
    twitterTitle: { type: String, trim: true, maxlength: 160, default: "" },
    twitterDescription: { type: String, trim: true, maxlength: 320, default: "" },
    twitterImage: { type: String, trim: true, default: "" },

    canonicalUrl: { type: String, trim: true, default: "" },
    robotsMeta: { type: String, trim: true, default: "index, follow" },

    schemaMarkup: { type: String, default: "" }, // raw JSON-LD string, validated on save
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeoSetting", SeoSettingSchema);
