const xss = require("xss");

/**
 * Recursively strips dangerous HTML/script content from all string values
 * in req.body and req.query. Applied globally in app.js, in addition to
 * express-mongo-sanitize (NoSQL injection) and helmet (headers).
 * Fields that legitimately contain HTML-ish content (schemaMarkup, robotsTxt)
 * are skipped by name so valid JSON-LD / plain text is not mangled.
 */
const SKIP_FIELDS = new Set(["schemaMarkup", "robotsTxt"]);

function cleanValue(value) {
  if (typeof value === "string") {
    return xss(value, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ["script", "style"] });
  }
  if (Array.isArray(value)) {
    return value.map((v) => cleanValue(v));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = SKIP_FIELDS.has(key) ? value[key] : cleanValue(value[key]);
    }
    return out;
  }
  return value;
}

function xssSanitize(req, res, next) {
  if (req.body && typeof req.body === "object") req.body = cleanValue(req.body);
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      req.query[key] = cleanValue(req.query[key]);
    }
  }
  next();
}

module.exports = xssSanitize;
