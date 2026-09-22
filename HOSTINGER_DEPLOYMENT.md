# Hostinger Deployment Guide

Hostinger's shared hosting plans do **not** run persistent Node.js
processes with a database attached the way this backend needs. Two
realistic paths, in order of recommendation:

## Option A (recommended): Hostinger VPS + MongoDB Atlas

1. **Buy/provision a Hostinger VPS plan** (KVM 1 or higher is plenty for a
   small site). Hostinger gives you root SSH access on a VPS, which this
   app needs.
2. **Create a free/shared MongoDB Atlas cluster** at mongodb.com/atlas —
   this avoids having to install and maintain MongoDB yourself. Whitelist
   your VPS's IP (or `0.0.0.0/0` while testing, then lock it down) and
   copy the connection string.
3. **SSH into the VPS** and follow [`DEPLOYMENT.md`](DEPLOYMENT.md) exactly
   (install Node 18+, clone the repo, `npm install`, configure `.env` with
   the Atlas `MONGO_URI`, run with `pm2`, put Nginx + Certbot in front).
4. **Point your domain's DNS** (in hPanel → Domains → DNS Zone) with an A
   record to the VPS's IP address.

This gives you the full app — admin panel, uploads, everything — exactly
as built.

## Option B: Hostinger shared hosting (static site only, no backend)

If you specifically must stay on shared hosting and cannot use a VPS, you
can upload just the `/public` folder's contents to `public_html` via
Hostinger's File Manager or FTP. This serves the static site, but:

- The Admin Panel will not work (no Node process to serve `/api`)
- The contact form will not save to MongoDB (no backend to receive it)
- SEO tags will be whatever's hard-coded in the HTML (no live injection)
- `sitemap.xml`/`robots.txt` will need to be static files you upload manually

This is a real functional downgrade — it's only a fallback if a VPS
genuinely isn't an option. Some Hostinger plans do offer "Node.js hosting"
via hPanel's application manager; if yours does, follow the same steps as
Option A but use hPanel's Node.js app screen instead of manual `pm2` setup,
and use the "External URL" it gives you for `SITE_URL` and DNS.

## Cloudinary note

Whichever option you use, setting the three `CLOUDINARY_*` variables in
`.env` (see `.env.example`) means uploaded media is stored on Cloudinary
instead of the server's local disk — useful on hosts with limited or
ephemeral disk space.
