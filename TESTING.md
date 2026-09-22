# Testing

## What was actually verified while building this

Be aware of this environment's real constraints before trusting the label
"tested": this rebuild was done in a sandboxed environment **with no
internet access**, so no live MongoDB instance and no `npm install`
against the real npm registry were possible here. What I did do:

- **Read every backend source file** (models, controllers, routes,
  middleware, config) line by line, cross-checking each admin-panel HTML
  page's JavaScript against the actual API it calls, to find real
  bugs/gaps rather than assumed ones.
- **`node --check` on every `.js` file** (backend and frontend) — confirms
  there are no syntax errors anywhere, including in the new/changed files.
- **Manually traced each request path** end-to-end on paper (e.g. contact
  form submit → validation middleware → controller → model → response;
  admin login → JWT issuance → `protect` middleware → route).
- **Did not** spin up a live server against a real MongoDB and click
  through the Admin Panel, because that requires network access this
  sandbox doesn't have.

So: the code is internally consistent and syntactically correct, and every
route/field the admin UI calls exists with matching names on the backend.
What it has *not* had is a live run. Please do the manual pass below
before considering it production-verified — it should take about 15
minutes and will catch anything an environment-specific issue (Node
version quirks, your specific MongoDB version, etc.) could still surface.

## Manual test checklist

Run `cd backend && npm install && cp .env.example .env` (edit `.env` with
your `MONGO_URI`) and `npm run dev` first.

### Server boot
- [ ] Console shows `MongoDB connected` and the server URLs, no errors
- [ ] `curl http://localhost:5000/api/health` → `{"success":true,...}`

### Public site
- [ ] `http://localhost:5000/` loads with styling/images/video intact
- [ ] View source on `/` — `<title>` and meta description are present
- [ ] Click through all nav links (About, Team, Partners, Services, Portfolio, Blog, Contact)
- [ ] `/sitemap.xml` and `/robots.txt` load and list all 12 pages

### Admin login
- [ ] `/admin` redirects to `/admin/login.html`
- [ ] Log in with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env`
- [ ] Wrong password shows an error, doesn't crash
- [ ] After 8 failed attempts in 15 min, login is rate-limited

### Website Settings → live site
- [ ] Admin → Website Settings → change Logo URL (upload one via Media
      Library first, paste its URL) → Save
- [ ] Reload the public site — the header AND footer logo both update
- [ ] Change a social link (e.g. Facebook) → Save → reload site → the
      footer social icon's link updated
- [ ] Change the Footer Tagline → Save → reload → the text under the
      footer logo updated
- [ ] Change WhatsApp in Social Media Links → Save → reload → both the
      floating WhatsApp button and the header's "Free Consultation" link
      point to the new number

### SEO
- [ ] Admin → SEO Management → pick a page → set a custom Meta Title →
      Save → view source on that live page → `<title>` reflects it
- [ ] Set an invalid JSON in Schema Markup → Save → rejected with a clear
      error, not a 500

### Google Integration
- [ ] Set a GA4 Measurement ID → Save → view source on the public site →
      the gtag script tag is present
- [ ] Clear a field back to empty → Save → confirm it doesn't error (this
      exercises the `.trim()` bug fix)

### Contact form
- [ ] Submit the form on `/contact.html` with valid data → success message
- [ ] Admin → Contact Messages → the new message appears, unread, with a
      populated **Source Page** column
- [ ] Click "Mark read" / delete → list updates
- [ ] Submit with an invalid email → client + server both reject it

### Media
- [ ] Upload an image with folder `logos` → appears in the grid tagged `logos`
- [ ] Folder filter dropdown lists `logos` and filters correctly
- [ ] Replace an image → old file is removed, URL/id stays the same
- [ ] Delete an image → removed from grid and from `backend/uploads/`

### Cloudinary (only if you have an account)
- [ ] Set the three `CLOUDINARY_*` env vars → restart the server → upload
      an image → confirm it appears in your Cloudinary media library
      instead of `backend/uploads/`
- [ ] Delete it from the Admin Panel → confirm it's removed from
      Cloudinary too

### Security spot checks
- [ ] Hit any `/api/settings` route without a token → `401`
- [ ] Try a NoSQL-injection-style login payload, e.g.
      `{"email": {"$ne": null}, "password": {"$ne": null}}` → rejected
      (mongo-sanitize strips the operators)
- [ ] Upload a `.php` or `.exe` file to Media → rejected (MIME allowlist)

If everything above passes, the app is genuinely production-verified —
not just code-reviewed.
