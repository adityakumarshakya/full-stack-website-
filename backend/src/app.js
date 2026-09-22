const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");

const env = require("./config/env");
const xssSanitize = require("./middleware/sanitize");
const { apiLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const seoInjector = require("./middleware/seoInjector");
const apiRoutes = require("./routes/index");
const { getSitemap, getRobotsTxt } = require("./controllers/sitemapController");
const { UPLOAD_DIR } = require("./middleware/upload");

const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");
const ADMIN_DIR = path.join(__dirname, "..", "admin-panel");

const app = express();

// Trust the first proxy (needed for correct req.ip behind reverse proxies / load balancers)
app.set("trust proxy", 1);

// ---------- Security ----------
app.use(
  helmet({
    contentSecurityPolicy: false, // the existing frontend loads third-party fonts/scripts by URL; CSP is left to the hosting layer
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = new Set([env.SITE_URL, ...env.CORS_EXTRA_ORIGINS]);
app.use(
  cors({
    origin(origin, callback) {
      // allow same-origin/non-browser requests (no Origin header) and configured origins
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(hpp());
app.use(mongoSanitize());
app.use(compression());
app.use(morgan(env.IS_PROD ? "combined" : "dev"));

// ---------- Body parsing ----------
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(xssSanitize);

// ---------- Public dynamic endpoints (must be registered before static hosting) ----------
app.get("/sitemap.xml", getSitemap);
app.get("/robots.txt", getRobotsTxt);

// SEO-injected static pages. seoInjector only acts on GET requests for "/"
// or a known "*.html" page and calls next() immediately for everything else
// (css/js/images/api/etc.), so it is safe to mount globally here.
app.use(seoInjector);

// ---------- API ----------
app.use("/api", apiLimiter, apiRoutes);

// ---------- Uploaded media ----------
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));

// ---------- Admin panel (separate static UI, does not touch the public frontend) ----------
app.use("/admin", express.static(ADMIN_DIR, { extensions: ["html"] }));

// ---------- Public static frontend (css/js/images/remaining html) ----------
app.use(express.static(PUBLIC_DIR, { extensions: ["html"] }));

// ---------- 404 + error handling ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
