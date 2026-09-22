const express = require("express");

const authRoutes = require("./authRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const seoRoutes = require("./seoRoutes");
const googleRoutes = require("./googleRoutes");
const siteSettingRoutes = require("./siteSettingRoutes");
const contactRoutes = require("./contactRoutes");
const mediaRoutes = require("./mediaRoutes");
const publicRoutes = require("./publicRoutes");

const router = express.Router();

router.get("/health", (req, res) => res.json({ success: true, message: "API is healthy." }));

router.use("/public", publicRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/seo", seoRoutes);
router.use("/google", googleRoutes);
router.use("/settings", siteSettingRoutes);
router.use("/contact", contactRoutes);
router.use("/media", mediaRoutes);

module.exports = router;
