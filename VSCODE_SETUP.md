# Local Setup in VS Code

## 1. Prerequisites

- [Node.js 18+](https://nodejs.org) — `node -v` to check
- MongoDB running locally, **or** a free [MongoDB Atlas](https://mongodb.com/atlas) cluster (easier — no local install)
- [VS Code](https://code.visualstudio.com)

## 2. Open the project

```
File → Open Folder → select the extracted project folder
```

Recommended extensions (VS Code will usually prompt you): ESLint, Prettier.

## 3. Install dependencies

Open a terminal in VS Code (`` Ctrl+` ``):

```bash
cd backend
npm install
```

## 4. Configure environment

```bash
cp .env.example .env
```

Open `.env` in VS Code and set:
- `MONGO_URI` — `mongodb://127.0.0.1:27017/orinnovative` for a local Mongo install, or your Atlas connection string
- `JWT_SECRET` — any long random string for local dev is fine
- Leave `CLOUDINARY_*` blank to use local disk storage for uploads during development

## 5. Run it

```bash
npm run dev
```

This uses `nodemon`, so the server restarts automatically when you edit
backend files. You should see:

```
🚀 Orinnovative backend running in development mode on port 5000
   Public site:   http://localhost:5000/
   Admin panel:   http://localhost:5000/admin
   API base:      http://localhost:5000/api
```

Open `http://localhost:5000/admin` and log in with the `ADMIN_EMAIL` /
`ADMIN_PASSWORD` from your `.env` (created automatically on first boot).

## 6. Editing the frontend

The live site is the static HTML/CSS/JS in `/public` — edit those files
directly and refresh the browser, no build step. `public/js/main.js`
handles the contact form; `public/js/site-content.js` pulls dynamic
settings from the API.

## 7. Editing the backend

Everything under `backend/src/` follows a standard MVC layout:
`models/` → `controllers/` → `routes/`. `backend/src/app.js` wires it all
together. Changes hot-reload via `nodemon`.

## 8. Recommended `.vscode/settings.json` (optional)

```json
{
  "editor.formatOnSave": true,
  "eslint.workingDirectories": ["backend"]
}
```

## 9. Common issues

| Symptom | Fix |
|---|---|
| `MongoServerSelectionError` on boot | MongoDB isn't running locally, or your Atlas IP allowlist doesn't include your current IP |
| Admin login fails with correct password | Delete/recreate the admin: stop the server, drop the `admins` collection, restart — a fresh default admin is seeded automatically |
| Uploaded images 404 | Local storage: confirm `backend/uploads/` exists and `/uploads` isn't blocked by a firewall/proxy rule in your setup |
| Port 5000 already in use | Change `PORT` in `.env` |
