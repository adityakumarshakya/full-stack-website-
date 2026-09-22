/**
 * Canonical list of the static pages that make up the existing frontend
 * (found in /public). "slug" is the key used to store per-page SEO data;
 * "file" is the actual HTML file name; "route" is the public-facing path.
 * Add a new entry here if a new static page is added to /public later.
 */
const PAGES = [
  { slug: "home", file: "index.html", route: "/", priority: "1.0", changefreq: "weekly" },
  { slug: "about", file: "about.html", route: "/about.html", priority: "0.8", changefreq: "monthly" },
  { slug: "team", file: "team.html", route: "/team.html", priority: "0.6", changefreq: "monthly" },
  { slug: "partners", file: "partners.html", route: "/partners.html", priority: "0.6", changefreq: "monthly" },
  { slug: "services", file: "services.html", route: "/services.html", priority: "0.9", changefreq: "monthly" },
  { slug: "portfolio", file: "portfolio.html", route: "/portfolio.html", priority: "0.8", changefreq: "monthly" },
  { slug: "blog", file: "blog.html", route: "/blog.html", priority: "0.7", changefreq: "weekly" },
  { slug: "contact", file: "contact.html", route: "/contact.html", priority: "0.8", changefreq: "yearly" },
  { slug: "disclaimer", file: "disclaimer.html", route: "/disclaimer.html", priority: "0.3", changefreq: "yearly" },
  { slug: "nda", file: "nda.html", route: "/nda.html", priority: "0.3", changefreq: "yearly" },
  { slug: "privacy", file: "privacy.html", route: "/privacy.html", priority: "0.3", changefreq: "yearly" },
  { slug: "terms", file: "terms.html", route: "/terms.html", priority: "0.3", changefreq: "yearly" },
];

const SLUGS = PAGES.map((p) => p.slug);

function findByFile(fileName) {
  return PAGES.find((p) => p.file === fileName);
}

function findBySlug(slug) {
  return PAGES.find((p) => p.slug === slug);
}

module.exports = { PAGES, SLUGS, findByFile, findBySlug };
