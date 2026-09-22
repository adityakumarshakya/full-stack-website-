const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const { listSeo, getSeoByPage, updateSeoByPage } = require("../controllers/seoController");

const router = express.Router();

router.use(protect);

router.get("/", listSeo);
router.get("/:page", getSeoByPage);

router.put(
  "/:page",
  [
    body("metaTitle").optional().isString().isLength({ max: 160 }),
    body("metaDescription").optional().isString().isLength({ max: 320 }),
    body("metaKeywords").optional().isString().isLength({ max: 500 }),
    body("canonicalUrl").optional().isString(),
    body("robotsMeta").optional().isString(),
  ],
  validate,
  updateSeoByPage
);

module.exports = router;
