const GoogleIntegration = require("../models/GoogleIntegration");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get Google/Analytics/Tag Manager/Pixel integration settings
// @route   GET /api/google
// @access  Private
const getGoogleIntegration = asyncHandler(async (req, res) => {
  const doc = await GoogleIntegration.findOneAndUpdate(
    { singletonKey: "google-integration" },
    { $setOnInsert: { singletonKey: "google-integration" } },
    { new: true, upsert: true }
  );
  return res.json({ success: true, google: doc });
});

// @desc    Update Google/Analytics/Tag Manager/Pixel integration settings
// @route   PUT /api/google
// @access  Private
const updateGoogleIntegration = asyncHandler(async (req, res) => {
  const { gaMeasurementId, gscVerificationCode, gtmContainerId, facebookPixelId } = req.body;

  const update = {};
  if (gaMeasurementId !== undefined) update.gaMeasurementId = String(gaMeasurementId || "").trim();
  if (gscVerificationCode !== undefined) update.gscVerificationCode = String(gscVerificationCode || "").trim();
  if (gtmContainerId !== undefined) update.gtmContainerId = String(gtmContainerId || "").trim();
  if (facebookPixelId !== undefined) update.facebookPixelId = String(facebookPixelId || "").trim();

  const doc = await GoogleIntegration.findOneAndUpdate(
    { singletonKey: "google-integration" },
    { $set: update, $setOnInsert: { singletonKey: "google-integration" } },
    { new: true, upsert: true, runValidators: true }
  );

  return res.json({ success: true, message: "Google integration settings updated.", google: doc });
});

module.exports = { getGoogleIntegration, updateGoogleIntegration };
