const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const { contactLimiter } = require("../middleware/rateLimiters");
const {
  submitContactMessage,
  listContactMessages,
  getContactMessage,
  markContactMessage,
  deleteContactMessage,
} = require("../controllers/contactController");

const router = express.Router();

// Public: submit the contact form
router.post(
  "/",
  contactLimiter,
  [
    body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Name must be 2-120 characters."),
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("phone").optional({ checkFalsy: true }).isString().isLength({ max: 40 }),
    body("service").optional({ checkFalsy: true }).isString().isLength({ max: 120 }),
    body("subject").optional({ checkFalsy: true }).isString().isLength({ max: 200 }),
    body("sourcePage").optional({ checkFalsy: true }).isString().isLength({ max: 300 }),
    body("message").trim().isLength({ min: 5, max: 5000 }).withMessage("Message must be 5-5000 characters."),
  ],
  validate,
  submitContactMessage
);

// Private: admin inbox management
router.get("/", protect, listContactMessages);
router.get("/:id", protect, getContactMessage);
router.patch("/:id/read", protect, markContactMessage);
router.delete("/:id", protect, deleteContactMessage);

module.exports = router;
