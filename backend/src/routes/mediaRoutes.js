const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const { uploadMedia, listMedia, replaceMedia, deleteMedia } = require("../controllers/mediaController");

const router = express.Router();

router.use(protect);

router.get("/", listMedia);
router.post("/upload", upload.array("images", 10), uploadMedia);
router.put("/:id/replace", upload.single("image"), replaceMedia);
router.delete("/:id", deleteMedia);

module.exports = router;
