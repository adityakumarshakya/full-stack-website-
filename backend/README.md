# Orinnovative — Backend & Admin CMS

This backend was added **without changing the existing frontend in any way**.
The original site in `/public` (index.html, about.html, services.html,
portfolio.html, team.html, partners.html, blog.html, contact.html,
disclaimer.html, nda.html, privacy.html, terms.html, `css/`, `js/`,
`images/`) is served exactly as it was. Nothing in `/public` or `/src`
(the unrelated TanStack Start scaffold) was redesigned or restructured.

Two very small, non-visual edits were made so the site can talk to the new
backend:

1. **`public/contact.html`** — added `name="..."` attributes to the existing
   form fields (name, email, phone, service, subject, message) so their
   values can be read and sent. No markup, styling, or layout was touched.
2. **`public/js/main.js`** — the contact form's submit handler previously
   just faked a "Message Sent" state with `setTimeout`. It now sends the
   same data to `POST /api/contact` (saved to MongoDB) and shows the same
   button states (`Sending...` → `Message Sent ✓`), so the UX is identical.

Everything else — SEO meta tags, Open Graph/Twitter tags, canonical URLs,
robots meta, JSON-LD schema, Google Analytics/Tag Manager/Search
Console/Facebook Pixel, the favicon, and `sitemap.xml`/`robots.txt` — is
injected **at request time** by the server, directly from the files on
disk in `/public`, without ever modifying those files. If the database is
ever unreachable, the original static page is served unchanged (fail-open).

---

## 1. Project layout

```
/                     <- existing frontend (untouched)
  public/             <- the real static site (served as-is)
  src/                <- unrelated unused TanStack Start scaffold (untouched)
backend/              <- everything new lives here
  server.js           <- entry point
  src/
    app.js             <- Express app (security, static hosting, SEO injection, API mount)
    config/            <- env loader + MongoDB connection
    models/            <- Mongoose schemas
    controllers/       <- route handlers
    routes/            <- Express routers
    middleware/         <- auth, error handling, rate limiting, sanitization, uploads, SEO injector
    utils/              <- helpers, page map, admin seed script
  admin-panel/         <- static Admin CMS UI (plain HTML/CSS/JS, served at /admin)
  uploads/             <- uploaded images (created automatically)
```

## 2. Requirements

- Node.js 18+
- MongoDB 6+ (local install or a hosted cluster e.g. MongoDB Atlas)

## 3. Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, SITE_URL, ADMIN_EMAIL/ADMIN_PASSWORD, etc.
npm run dev        # starts with nodemon, auto-reload
# or
npm start          # production start
```

On first boot the server automatically:
- Connects to MongoDB
- Creates a default admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
  (only if no admin exists yet — safe to restart repeatedly)
- Creates default Site Settings, Google Integration, and per-page SEO documents

**Change the default admin password immediately after your first login**
(Admin panel → account, or `PUT /api/auth/change-password`).

## 4. Running the whole site (frontend + backend) from one process

The Express server serves:

| Path                | What it serves                                                   |
|---------------------|--------------------------------------------------------------------|
| `/`, `/about.html`, etc. | The existing static pages from `/public`, with SEO tags injected live |
| `/css/*`, `/js/*`, `/images/*` | Static assets from `/public`, unchanged                     |
| `/sitemap.xml`       | Generated dynamically from the page list + settings               |
| `/robots.txt`        | Generated dynamically from the admin-edited robots.txt content     |
| `/admin`             | The Admin CMS (static HTML/CSS/JS)                                 |
| `/api/*`             | The REST API                                                       |
| `/uploads/*`         | Uploaded images                                                    |

Just run `npm start` inside `backend/` and open `http://localhost:5000/`
for the site and `http://localhost:5000/admin` for the CMS.

## 5. REST API summary

All `/api` routes except `/api/auth/login` and `POST /api/contact` require
`Authorization: Bearer <token>` (the token returned from login).

| Method | Route                         | Description                              |
|--------|-------------------------------|-------------------------------------------|
| POST   | /api/auth/login                | Admin login                               |
| GET    | /api/auth/me                   | Current admin profile                     |
| POST   | /api/auth/logout               | Logout                                    |
| PUT    | /api/auth/change-password       | Change own password                       |
| GET    | /api/dashboard/overview         | Dashboard stats                           |
| GET    | /api/seo                        | List SEO settings for every page          |
| GET    | /api/seo/:page                  | Get SEO settings for one page             |
| PUT    | /api/seo/:page                  | Update SEO settings for one page          |
| GET    | /api/google                     | Get GA4/GSC/GTM/Pixel settings             |
| PUT    | /api/google                     | Update GA4/GSC/GTM/Pixel settings          |
| GET    | /api/settings                   | Get website settings                      |
| PUT    | /api/settings                   | Update website settings                   |
| GET    | /api/settings/robots            | Get robots.txt content (raw, for editing)  |
| PUT    | /api/settings/robots            | Update robots.txt content                 |
| GET    | /api/public/site-settings       | Public: safe subset of settings for the live site (logo, socials, footer tagline) |
| POST   | /api/contact                    | Public: submit the contact form           |
| GET    | /api/contact                    | List contact messages (paginated, `?unread=true` filter) |
| GET    | /api/contact/:id                | Get one message (marks it read)           |
| PATCH  | /api/contact/:id/read           | Toggle read/unread                        |
| DELETE | /api/contact/:id                | Delete a message                          |
| GET    | /api/media                      | List uploaded media (`?folder=` filter)   |
| POST   | /api/media/upload               | Upload image(s) (`multipart/form-data`, field `images`, optional field `folder`) |
| PUT    | /api/media/:id/replace          | Replace an image's file (field `image`)   |
| DELETE | /api/media/:id                  | Delete an image                           |

Valid page slugs for `/api/seo/:page`: `home, about, team, partners,
services, portfolio, blog, contact, disclaimer, nda, privacy, terms`
(see `backend/src/utils/pageMap.js`).

Full request/response shapes are in [`API.md`](../API.md).

## 5b. Media storage: local disk or Cloudinary

Uploads default to local disk (`backend/uploads/`, served at `/uploads/*`).
To use Cloudinary instead, set these three variables in `.env`:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

The server checks for all three on startup. If present, every upload,
replace, and delete goes through Cloudinary instead — no code changes and
no restart-time flag needed beyond setting the env vars. Leave them blank
to keep using local disk. Existing local files are not migrated
automatically when you switch.

## 5c. Dynamic content on the live site

Two separate mechanisms make the static `/public` site reflect Admin Panel
changes without any manual HTML edits:

1. **SEO tags** (title, description, OG/Twitter tags, canonical, robots,
   JSON-LD, GA/GTM/Pixel scripts, favicon) are rewritten server-side, per
   request, by `seoInjector` — see `backend/src/middleware/seoInjector.js`.
2. **Visible content** (logo, social links, WhatsApp number, footer
   tagline) is loaded client-side by `public/js/site-content.js`, which
   calls the public `GET /api/public/site-settings` endpoint on every page
   load and updates the existing `<img>`/`<a>` elements in place. It only
   overwrites an element when the admin has actually set a value, and it
   never changes markup/layout/classes.

The multi-country office cards in the footer (India/Australia/US
addresses and phone numbers) are **not** wired to the database —
they're static per-country data that doesn't fit the current single
address/phone Website Settings model. Making those editable from the
Admin Panel would need a small "Offices" list feature (an array of
{country, address, phone} instead of single fields); flagging this as a
deliberate scope decision rather than an oversight so a future change can
be made intentionally.



## 6. Security features included

- Helmet (HTTP security headers)
- CORS restricted to `SITE_URL` + `CORS_EXTRA_ORIGINS`
- Rate limiting (general API, stricter on login, and on the public contact form)
- express-validator input validation on every write endpoint
- express-mongo-sanitize (NoSQL injection protection) + `xss` sanitization on all incoming body/query values
- HPP (HTTP parameter pollution protection)
- bcrypt password hashing (12 rounds) + JWT auth (Bearer token or httpOnly cookie)
- Multer upload validation (image MIME types only, configurable size limit)
- All secrets/config via environment variables (`.env`, never committed)

## 7. Notes

- The unrelated `/src` folder (TanStack Start/React scaffold, generated by
  Lovable.dev and left as a blank placeholder) was not touched and is not
  used by this backend. The real site is the static HTML in `/public`,
  confirmed with the site owner.
- If you later want a full single-page rebuild instead of static HTML,
  the API is already independent of the templating layer and can be
  reused as-is.
- See [`DEPLOYMENT.md`](../DEPLOYMENT.md), [`TESTING.md`](../TESTING.md),
  [`API.md`](../API.md), [`HOSTINGER_DEPLOYMENT.md`](../HOSTINGER_DEPLOYMENT.md),
  and [`VSCODE_SETUP.md`](../VSCODE_SETUP.md) at the project root for the
  rest of the documentation requested alongside this rebuild.
