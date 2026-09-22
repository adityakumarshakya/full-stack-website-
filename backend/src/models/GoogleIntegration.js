const mongoose = require("mongoose");

const GoogleIntegrationSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, unique: true, default: "google-integration" },
    gaMeasurementId: { type: String, trim: true, default: "" }, // GA4, e.g. G-XXXXXXX
    gscVerificationCode: { type: String, trim: true, default: "" }, // google-site-verification content
    gtmContainerId: { type: String, trim: true, default: "" }, // e.g. GTM-XXXXXXX
    facebookPixelId: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoogleIntegration", GoogleIntegrationSchema);
