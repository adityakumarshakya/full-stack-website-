const express = require("express");
const { getPublicSiteSettings } = require("../controllers/siteSettingController");

// Public, unauthenticated, read-only endpoints consumed by the static
// frontend (kept separate from siteSettingRoutes.js, which is fully
// behind the `protect` admin-auth middleware).
const router = express.Router();

router.get("/site-settings", getPublicSiteSettings);

module.exports = router;
