# Deployment Guide (general / VPS)

This covers deploying to any Linux server (DigitalOcean, EC2, a VPS, etc).
For Hostinger specifically, see [`HOSTINGER_DEPLOYMENT.md`](HOSTINGER_DEPLOYMENT.md).

## 1. Prerequisites on the server

- Node.js 18+ (`node -v`)
- MongoDB 6+ — either installed locally or a connection string to MongoDB Atlas (recommended for most hosts)
- A domain pointed at the server (A record)
- (Optional) Cloudinary account if you don't want to rely on local disk storage for uploads

## 2. Get the code onto the server

```bash
git clone <your-repo-url> orinnovative
cd orinnovative/backend
npm install --omit=dev
```

## 3. Configure environment

```bash
cp .env.example .env
nano .env
```

Set at minimum:
- `NODE_ENV=production`
- `PORT=5000` (or whatever your reverse proxy expects)
- `SITE_URL=https://www.yourdomain.com` (no trailing slash — used for canonical URLs, sitemap, CORS)
- `MONGO_URI=` your production connection string
- `JWT_SECRET=` a long random string (`openssl rand -hex 32`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — change the password immediately after first login
- `CLOUDINARY_*` — only if you want Cloudinary instead of local disk

## 4. Run it as a persistent process

Using `pm2` (recommended):

```bash
npm install -g pm2
pm2 start server.js --name orinnovative
pm2 save
pm2 startup   # follow the printed instructions to enable on-boot start
```

## 5. Put a reverse proxy + TLS in front of it

Nginx example (`/etc/nginx/sites-available/orinnovative`):

```nginx
server {
    listen 80;
    server_name www.yourdomain.com yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/orinnovative /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

`app.set("trust proxy", 1)` is already set in `backend/src/app.js`, so
`req.ip` (used for contact-message logging and rate limiting) will resolve
correctly behind Nginx.

## 6. Verify

- `https://yourdomain.com/` loads the site
- `https://yourdomain.com/admin` loads the login page
- `https://yourdomain.com/api/health` returns `{"success":true,...}`
- `https://yourdomain.com/sitemap.xml` and `/robots.txt` load
- Log in with `ADMIN_EMAIL`/`ADMIN_PASSWORD`, then change the password immediately

## 7. Backups

MongoDB Atlas handles automatic backups if you use it. For a self-hosted
MongoDB, schedule `mongodump` on a cron job. Also back up `backend/uploads/`
if you're using local disk storage (not needed if using Cloudinary — it's
already redundant/hosted).

## 8. Updating the site later

```bash
cd orinnovative
git pull
cd backend
npm install --omit=dev
pm2 restart orinnovative
```

No database migration step is required for the changes in this rebuild —
new fields on existing documents simply default to empty strings/arrays.
