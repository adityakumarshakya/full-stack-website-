# API Documentation

Base URL: `http://localhost:5000/api` (or `https://yourdomain.com/api` in production)

All responses are JSON with a `success: boolean` field. Errors look like:
```json
{ "success": false, "message": "Human readable message", "errors": [{ "field": "email", "message": "..." }] }
```

**Auth:** every route except `POST /auth/login` and `POST /contact` requires
either header `Authorization: Bearer <token>` or the `orinnovative_token`
httpOnly cookie set automatically on login. Get a token from `POST /auth/login`.

---

## Auth

### `POST /auth/login`
Body: `{ "email": "admin@orinnovative.com", "password": "..." }`
Response: `{ success, token, admin: { id, name, email, role, lastLoginAt } }`
Also sets an httpOnly `orinnovative_token` cookie. Rate-limited (8/15min by default).

### `GET /auth/me`
Response: `{ success, admin }`

### `POST /auth/logout`
Clears the cookie. Response: `{ success, message }`

### `PUT /auth/change-password`
Body: `{ "currentPassword": "...", "newPassword": "..." }` (min 8 chars)

---

## Dashboard

### `GET /dashboard/overview`
Response:
```json
{
  "success": true,
  "overview": { "siteUrl": "...", "totalPages": 12, "seoConfiguredPages": 3, "totalMessages": 10, "unreadMessages": 2, "totalMedia": 15 },
  "recentMessages": [ /* last 5 ContactMessage docs */ ]
}
```

---

## SEO

Page slugs: `home, about, team, partners, services, portfolio, blog, contact, disclaimer, nda, privacy, terms`

### `GET /seo`
List every page with its current SEO document (creates a blank one on first access).

### `GET /seo/:page`
### `PUT /seo/:page`
Body (all optional): `metaTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage, ogType, ogUrl, twitterCard, twitterTitle, twitterDescription, twitterImage, canonicalUrl, robotsMeta, schemaMarkup`.
`schemaMarkup` must be a valid JSON string (validated before saving) or the request is rejected with 400.

---

## Google / Analytics Integration

### `GET /google`
### `PUT /google`
Body: `{ gaMeasurementId, gscVerificationCode, gtmContainerId, facebookPixelId }` — all optional strings.

---

## Website Settings

### `GET /settings`
### `PUT /settings`
Body: `{ siteName, logoUrl, faviconUrl, contactEmail, contactPhone, address, businessHours, footerText, socialLinks: { facebook, twitter, instagram, linkedin, youtube, whatsapp } }`

### `GET /settings/robots`
### `PUT /settings/robots`
Body: `{ robotsTxt, sitemapEnabled }`

### `GET /public/site-settings` — **public, no auth**
Safe subset consumed by the live site's `site-content.js`:
```json
{ "success": true, "settings": { "siteName", "logoUrl", "faviconUrl", "contactEmail", "contactPhone", "address", "footerText", "businessHours", "socialLinks" } }
```

---

## Contact Messages

### `POST /contact` — **public, rate-limited (15/hour)**
Body: `{ name, email, phone?, service?, subject?, message, sourcePage? }`
`ipAddress`, `userAgent`, and `sourcePage` (falls back to the `Referer` header) are captured automatically.
Response: `{ success, message, id }`

### `GET /contact?page=1&limit=20&unread=true`
Paginated inbox. Response includes `unreadCount` and `pagination`.

### `GET /contact/:id` — marks the message as read as a side effect

### `PATCH /contact/:id/read`
Body: `{ "isRead": true }` (omit to toggle)

### `DELETE /contact/:id`

---

## Media

### `GET /media?page=1&limit=30&folder=logos`
Response includes `media[]`, `folders[]` (distinct folder names in use), and `pagination`.

### `POST /media/upload`
`multipart/form-data`, field `images` (up to 10 files), optional field `label`, optional field `folder` (defaults to `"general"`).
Stores to Cloudinary automatically if `CLOUDINARY_*` env vars are set, otherwise to local disk.

### `PUT /media/:id/replace`
`multipart/form-data`, field `image` (single file). Deletes the old underlying file/Cloudinary asset.

### `DELETE /media/:id`
Deletes the DB record and the underlying file/Cloudinary asset.

---

## Public (non-API) routes

| Route | Description |
|---|---|
| `GET /sitemap.xml` | Generated from `pageMap.js` + `sitemapEnabled` setting |
| `GET /robots.txt` | Generated from the saved `robotsTxt` setting |
| `GET /<page>.html` | Static page from `/public`, with SEO tags injected server-side |
| `GET /uploads/<file>` | Locally stored media (not used when Cloudinary is active) |
| `GET /admin` | Admin CMS UI |
