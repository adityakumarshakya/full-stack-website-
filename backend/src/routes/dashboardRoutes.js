const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getOverview } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/overview", protect, getOverview);

module.exports = router;
