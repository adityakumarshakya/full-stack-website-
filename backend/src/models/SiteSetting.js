const mongoose = require("mongoose");

const SiteSettingSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, unique: true, default: "site-settings" },

    siteName: { type: String, trim: true, default: "Orinnovative" },
    logoUrl: { type: String, trim: true, default: "" },
    faviconUrl: { type: String, trim: true, default: "" },

    contactEmail: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    footerText: { type: String, trim: true, default: "" },
    businessHours: { type: String, trim: true, default: "" }, // free text, e.g. "Mon-Fri 9am-6pm IST"

    socialLinks: {
      facebook: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      youtube: { type: String, trim: true, default: "" },
      whatsapp: { type: String, trim: true, default: "" },
    },

    robotsTxt: {
      type: String,
      default:
        "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n",
    },
    sitemapEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSetting", SiteSettingSchema);
