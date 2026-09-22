const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const env = require("../config/env");
const SeoSetting = require("../models/SeoSetting");
const GoogleIntegration = require("../models/GoogleIntegration");
const SiteSetting = require("../models/SiteSetting");
const { findByFile } = require("../utils/pageMap");

const PUBLIC_DIR = path.join(__dirname, "..", "..", "..", "public");

function escapeAttr(str = "") {
  return String(str).replace(/"/g, "&quot;");
}

function buildExtraHead({ seo, google, site, page, existingTitle, existingDescription }) {
  const parts = [];

  const finalTitle = seo?.metaTitle || existingTitle || "";
  const finalDescription = seo?.metaDescription || existingDescription || "";
  const canonical = seo?.canonicalUrl || `${env.SITE_URL}${page.route}`;

  if (seo?.metaKeywords) {
    parts.push(`<meta name="keywords" content="${escapeAttr(seo.metaKeywords)}" />`);
  }

  parts.push(`<meta name="robots" content="${escapeAttr(seo?.robotsMeta || "index, follow")}" />`);
  parts.push(`<link rel="canonical" href="${escapeAttr(canonical)}" />`);

  // Open Graph
  parts.push(`<meta property="og:type" content="${escapeAttr(seo?.ogType || "website")}" />`);
  parts.push(`<meta property="og:site_name" content="${escapeAttr(site?.siteName || "Orinnovative")}" />`);
  parts.push(`<meta property="og:title" content="${escapeAttr(seo?.ogTitle || finalTitle)}" />`);
  parts.push(`<meta property="og:description" content="${escapeAttr(seo?.ogDescription || finalDescription)}" />`);
  parts.push(`<meta property="og:url" content="${escapeAttr(seo?.ogUrl || canonical)}" />`);
  if (seo?.ogImage) parts.push(`<meta property="og:image" content="${escapeAttr(seo.ogImage)}" />`);

  // Twitter Card
  parts.push(`<meta name="twitter:card" content="${escapeAttr(seo?.twitterCard || "summary_large_image")}" />`);
  parts.push(`<meta name="twitter:title" content="${escapeAttr(seo?.twitterTitle || finalTitle)}" />`);
  parts.push(
    `<meta name="twitter:description" content="${escapeAttr(seo?.twitterDescription || finalDescription)}" />`
  );
  if (seo?.twitterImage) parts.push(`<meta name="twitter:image" content="${escapeAttr(seo.twitterImage)}" />`);

  // Google Search Console verification
  if (google?.gscVerificationCode) {
    parts.push(`<meta name="google-site-verification" content="${escapeAttr(google.gscVerificationCode)}" />`);
  }

  // JSON-LD schema markup
  if (seo?.schemaMarkup) {
    try {
      const parsed = JSON.parse(seo.schemaMarkup);
      parts.push(`<script type="application/ld+json">${JSON.stringify(parsed)}</script>`);
    } catch (e) {
      // invalid JSON stored - skip silently rather than breaking the page
    }
  }

  // Google tag Manager (head snippet)
  if (google?.gtmContainerId) {
    parts.push(
      `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${escapeAttr(google.gtmContainerId)}');</script>`
    );
  }

  // Google Analytics (GA4)
  if (google?.gaMeasurementId) {
    parts.push(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeAttr(google.gaMeasurementId)}"></script>`
    );
    parts.push(
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeAttr(google.gaMeasurementId)}');</script>`
    );
  }

  // Facebook Pixel
  if (google?.facebookPixelId) {
    parts.push(
      `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${escapeAttr(
        google.facebookPixelId
      )}');fbq('track','PageView');</script>`
    );
  }

  return { extraHead: parts.join("\n"), finalTitle, finalDescription };
}

function buildGtmNoscript(google) {
  if (!google?.gtmContainerId) return "";
  return `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${escapeAttr(
    google.gtmContainerId
  )}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
}

/**
 * Express middleware. If the request matches a known static page, it reads
 * the ORIGINAL file from disk untouched, then rewrites only the SEO-relevant
 * <head> tags (title, description, favicon) and appends any admin-configured
 * tags (OG/Twitter/canonical/robots/schema/analytics) right before </head>.
 * The file on disk is never modified. If anything goes wrong (DB down,
 * missing settings, etc.) it fails open and serves the original file as-is.
 */
async function seoInjector(req, res, next) {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    let fileName = null;
    if (req.path === "/" || req.path === "/index.html") {
      fileName = "index.html";
    } else if (/^\/[a-zA-Z0-9_-]+\.html$/.test(req.path)) {
      fileName = req.path.slice(1);
    }

    if (!fileName) return next();

    const page = findByFile(fileName);
    if (!page) return next(); // unknown html file, let static/404 handle it

    const filePath = path.join(PUBLIC_DIR, fileName);
    if (!fs.existsSync(filePath)) return next();

    let html = fs.readFileSync(filePath, "utf8");

    // If DB isn't connected, just serve the untouched file.
    if (mongoose.connection.readyState !== 1) {
      res.set("Content-Type", "text/html; charset=UTF-8");
      return res.send(html);
    }

    const [seo, google, site] = await Promise.all([
      SeoSetting.findOne({ page: page.slug }).lean(),
      GoogleIntegration.findOne({ singletonKey: "google-integration" }).lean(),
      SiteSetting.findOne({ singletonKey: "site-settings" }).lean(),
    ]);

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i);
    const existingTitle = titleMatch ? titleMatch[1] : "";
    const existingDescription = descMatch ? descMatch[1] : "";

    const { extraHead, finalTitle, finalDescription } = buildExtraHead({
      seo,
      google,
      site,
      page,
      existingTitle,
      existingDescription,
    });

    if (titleMatch) {
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${finalTitle}</title>`);
    }
    if (descMatch) {
      html = html.replace(
        /(<meta\s+name=["']description["']\s+content=["'])([\s\S]*?)(["']\s*\/?>)/i,
        `$1${finalDescription.replace(/"/g, "&quot;")}$3`
      );
    }

    // Favicon override
    if (site?.faviconUrl) {
      html = html.replace(
        /<link\s+rel=["']icon["']\s+href=["'][^"']*["']\s*\/?>/i,
        `<link rel="icon" href="${escapeAttr(site.faviconUrl)}" />`
      );
    }

    // Insert extra head tags right before </head>
    html = html.replace(/<\/head>/i, `${extraHead}\n</head>`);

    // Insert GTM noscript right after <body> (or <body ...> with attributes)
    const gtmNoscript = buildGtmNoscript(google);
    if (gtmNoscript) {
      html = html.replace(/<body([^>]*)>/i, `<body$1>\n${gtmNoscript}`);
    }

    res.set("Content-Type", "text/html; charset=UTF-8");
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.send(html);
  } catch (err) {
    // Fail open: never let an SEO injection bug take the public site down.
    console.error("[seoInjector] error, serving fallback:", err.message);
    return next();
  }
}

module.exports = seoInjector;
