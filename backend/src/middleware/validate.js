const { validationResult } = require("express-validator");

// Run after any express-validator chain(s); returns a clean 400 response
// listing every failed field instead of letting bad data reach a controller.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
}

module.exports = validate;
