# Orinnovative Website — Full Stack

This repository contains the **existing, unmodified public website** plus a
**production-ready Node.js/Express/MongoDB backend and Admin CMS** that was
audited and rebuilt on top of it.

```
/                     project root
  public/             THE LIVE WEBSITE — static HTML/CSS/JS, served as-is
  src/                unused TanStack Start/React scaffold (not served, not touched)
  backend/            Express API + Admin CMS + everything new
    server.js         entry point
    src/               app.js, config, models, controllers, routes, middleware, utils
    admin-panel/       Admin CMS UI (plain HTML/CSS/JS, served at /admin)
    uploads/           local media storage (unless Cloudinary is configured)
```

**Start here:**

- [`backend/README.md`](backend/README.md) — full backend setup, project layout, API summary, security, dynamic-content mechanism
- [`API.md`](API.md) — every endpoint, request/response shape
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — general production deployment guide
- [`HOSTINGER_DEPLOYMENT.md`](HOSTINGER_DEPLOYMENT.md) — Hostinger-specific steps
- [`VSCODE_SETUP.md`](VSCODE_SETUP.md) — running the project locally in VS Code
- [`TESTING.md`](TESTING.md) — how to verify every feature, and what has/hasn't been run in this environment

## Quick start (local)

```bash
cd backend
npm install
cp .env.example .env
# edit .env — at minimum set MONGO_URI, JWT_SECRET, SITE_URL
npm run dev
```

Then open:
- `http://localhost:5000/` — the public website
- `http://localhost:5000/admin` — the Admin CMS (default login is created from `.env`)

## What changed vs. the original upload

This was **not a from-scratch build** — a substantial, working Express/Mongoose
backend and Admin CMS already existed in the uploaded ZIP (auth, SEO
injection, contact form, media, site settings, sitemap/robots). The audit
found it well-architected (clean MVC layout, JWT + bcrypt, Helmet, rate
limiting, mongo-sanitize, xss, hpp) but with concrete gaps against the
brief, which have been fixed:

1. **Cloudinary support was missing** — media uploads now auto-switch
   between local disk and Cloudinary based on which env vars are present.
2. **Website Settings weren't reflected in visible page content** — only
   SEO meta tags were dynamic. Added a public settings endpoint and a small
   client-side loader so the logo, social links, WhatsApp link, and footer
   tagline now update live from the Admin Panel.
3. **Contact messages didn't record the source page** — added, with a
   Referer-header fallback.
4. **Media had no folder/category organization** — added.
5. A real crash bug in the Google Integration save endpoint (`.trim()` on
   `null`) was fixed.
6. Business Hours and a Footer Tagline field were added to Website
   Settings and wired into the Admin Panel UI.

See `backend/README.md` §5c for the one deliberate scope decision made
along the way (the multi-country office cards in the footer are static
data, not yet backed by the database — see that section for why).
