const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getGoogleIntegration, updateGoogleIntegration } = require("../controllers/googleController");

const router = express.Router();

router.use(protect);

router.get("/", getGoogleIntegration);
router.put("/", updateGoogleIntegration);

module.exports = router;
