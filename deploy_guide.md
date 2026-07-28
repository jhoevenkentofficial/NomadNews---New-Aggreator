# 🚀 Full Deployment Guide: TRAVELTEW News (PHP + Turso)

This guide provides the **complete, step-by-step details** for deploying your latest news aggregator to GoDaddy or any PHP-enabled web hosting.

---

## 📂 1. Locate Your Deployment Package
I have prepared a dedicated folder that contains everything ready for production.
- **Folder Path**: `News Aggreator/deployment_ready/`
- **What's Inside**: 
  - `index.html`, `assets/`, `favicon.png` (The Frontend)
  - `api/php/` (The Backend API)
  - `.htaccess` (Server configurations)

---

## 🌐 2. Uploading via cPanel / FileZilla

### Step A: Clean the Server
1. Log in to your **GoDaddy cPanel**.
2. Open **File Manager** and go into the `public_html` folder.
3. **Delete** any old files from previous versions (Node.js experiments, old `api` folders, etc.) to ensure a clean start.

### Step B: Upload the New Files
1. Open the `deployment_ready` folder on your computer.
2. Upload **EVERYTHING** inside `deployment_ready` directly into `public_html`.
   - Your `public_html` should look like this:
     - `assets/`
     - `api/`
     - `index.html`
     - `.htaccess`
     - `favicon.png`

---

## 🗄️ 3. Database Migration (Crucial)
Because we added the **Full Information (Content)** feature, you must update your database table once the files are uploaded.

1. Open your browser.
2. Visit this URL (replace with your actual domain):
   - `https://yourdomain.com/api/php/api.php?route=migrate`
3. You should see a message: `{"status":"success","message":"Migration complete: content column added"}`.

---

## 🗞️ 4. Trigger the News Fetcher
To populate your site with the latest news (and the new full-article information), you need to run the scraper.

1. Visit this URL:
   - `https://yourdomain.com/api/php/api.php?route=fetch`
2. **Wait** (this can take 30-60 seconds as it scrapes multiple global sources).
3. Once finished, it will show how many articles were saved.

---

## 🛠️ 5. Automated Updates (Optional but Recommended)
To keep your news fresh without manual clicking, set up a **Cron Job** in cPanel:
1. Search for **Cron Jobs** in cPanel.
2. Set it to run every **1 hour** (or your preferred frequency).
3. Use this command:
   ```bash
   /usr/bin/php -q /home/YOUR_USERNAME/public_html/api/php/api.php route=fetch
   ```
   *(Note: Replace YOUR_USERNAME with your actual GoDaddy username).*

---

## 🔐 6. Admin Portal
To manually publish your own special reports:
1. Go to `https://yourdomain.com/admin`.
2. Use the **Secret Key** defined in your system: `TRAVELTEW_2026`.
3. Use the new **Full Article Body** field to paste your complete stories.

---

### ✅ Deployment Checklist
- [ ] Files from `deployment_ready` uploaded to `public_html`.
- [ ] Visited `/api/php/api.php?route=migrate` (Done once).
- [ ] Visited `/api/php/api.php?route=fetch` to load news.
- [ ] Site loads correctly at `https://yourdomain.com`.

**Need help?** Just ask! 🚀
