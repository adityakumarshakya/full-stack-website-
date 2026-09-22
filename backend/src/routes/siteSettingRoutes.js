const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getSiteSettings,
  updateSiteSettings,
  getRobotsTxt,
  updateRobotsTxt,
} = require("../controllers/siteSettingController");

const router = express.Router();

router.use(protect);

router.get("/", getSiteSettings);
router.put("/", updateSiteSettings);

router.get("/robots", getRobotsTxt);
router.put("/robots", updateRobotsTxt);

module.exports = router;
