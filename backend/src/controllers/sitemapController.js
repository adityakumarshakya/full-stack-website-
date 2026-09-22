const SiteSetting = require("../models/SiteSetting");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const { PAGES } = require("../utils/pageMap");

// @desc    Dynamically generated sitemap.xml
// @route   GET /sitemap.xml
// @access  Public
const getSitemap = asyncHandler(async (req, res) => {
  const settings = await SiteSetting.findOne({ singletonKey: "site-settings" }).lean();
  if (settings && settings.sitemapEnabled === false) {
    return res.status(404).send("Sitemap disabled by administrator.");
  }

  const today = new Date().toISOString().split("T")[0];

  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${env.SITE_URL}${p.route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.set("Content-Type", "application/xml");
  return res.send(xml);
});

// @desc    Dynamically served robots.txt (editable from the admin panel)
// @route   GET /robots.txt
// @access  Public
const getRobotsTxt = asyncHandler(async (req, res) => {
  const settings = await SiteSetting.findOne({ singletonKey: "site-settings" }).lean();
  const body =
    (settings && settings.robotsTxt) ||
    "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n";

  const sitemapLine = `\nSitemap: ${env.SITE_URL}/sitemap.xml\n`;
  res.set("Content-Type", "text/plain");
  return res.send(body.includes("Sitemap:") ? body : body + sitemapLine);
});

module.exports = { getSitemap, getRobotsTxt };
