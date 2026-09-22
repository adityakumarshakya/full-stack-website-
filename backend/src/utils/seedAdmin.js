/**
 * Ensures a default admin account and default settings documents exist.
 * Safe to run multiple times (idempotent). Runs automatically on server
 * boot, and can also be run manually with `npm run seed:admin`.
 */
const connectDB = require("../config/db");
const env = require("../config/env");
const Admin = require("../models/Admin");
const SiteSetting = require("../models/SiteSetting");
const GoogleIntegration = require("../models/GoogleIntegration");
const SeoSetting = require("../models/SeoSetting");
const { PAGES } = require("./pageMap");

async function seedAdmin() {
  const existing = await Admin.countDocuments();
  if (existing === 0) {
    await Admin.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: "superadmin",
    });
    console.log(`[seed] Default admin created -> ${env.ADMIN_EMAIL} (change the password after first login!)`);
  }
}

async function seedSiteSettings() {
  const existing = await SiteSetting.findOne({ singletonKey: "site-settings" });
  if (!existing) {
    await SiteSetting.create({
      siteName: "Orinnovative",
      contactEmail: "info@orinnovative.com",
      contactPhone: "+91 75032 87360",
      address: "Building No. WZ 53/1, Nawada Metro, Uttam Nagar, New Delhi - 110059, India",
    });
    console.log("[seed] Default site settings created");
  }
}

async function seedGoogleIntegration() {
  const existing = await GoogleIntegration.findOne({ singletonKey: "google-integration" });
  if (!existing) {
    await GoogleIntegration.create({});
    console.log("[seed] Default Google integration document created");
  }
}

async function seedSeoDefaults() {
  for (const page of PAGES) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await SeoSetting.findOne({ page: page.slug });
    if (!existing) {
      // eslint-disable-next-line no-await-in-loop
      await SeoSetting.create({ page: page.slug });
    }
  }
  console.log("[seed] SEO defaults ensured for all pages");
}

async function runAllSeeds() {
  await seedAdmin();
  await seedSiteSettings();
  await seedGoogleIntegration();
  await seedSeoDefaults();
}

// Allow running directly: `npm run seed:admin`
if (require.main === module) {
  connectDB()
    .then(runAllSeeds)
    .then(() => {
      console.log("[seed] Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[seed] Failed:", err);
      process.exit(1);
    });
}

module.exports = runAllSeeds;
