# FTP Deployment Guide - TravelTew News / NomadNews

## Upload Folder
Use this folder for FileZilla upload:

FTP_UPLOAD_READY

Upload the CONTENTS of this folder to your hosting public web folder, usually one of these:

- public_html
- htdocs
- www
- your domain's document root

Do not upload the parent folder itself unless your host specifically asks for it.

## What Is Included
This FTP package contains only the files needed for shared hosting:

- index.html
- assets/
- favicon.png
- .htaccess
- api/php/

It does not include node_modules, local database files, Vite dev files, Git files, or the Node backend.

## Before Uploading
Your live PHP API needs Turso credentials. On most shared hosting panels, choose ONE method:

### Best Method: Hosting Environment Variables
Set these in your hosting control panel if available:

- TURSO_URL
- TURSO_AUTH_TOKEN
- NEWS_API_KEY, optional for fetching fresh news
- ADMIN_TOKEN, used for manual article publishing

### FTP Method: config.local.php
If your hosting panel does not support environment variables:

1. In FTP_UPLOAD_READY/api/php/, duplicate config.local.sample.php.
2. Rename the duplicate to config.local.php.
3. Open config.local.php and fill in the real values.
4. Upload config.local.php to /api/php/config.local.php on the server.
5. Never share config.local.php publicly.

## FileZilla Upload Steps
1. Open FileZilla.
2. Connect with your FTP host, username, password, and port.
3. On the right side, open your website root folder, usually public_html.
4. On the left side, open FTP_UPLOAD_READY.
5. Select everything inside FTP_UPLOAD_READY.
6. Upload all selected files to the website root.
7. If FileZilla asks to overwrite old files, choose overwrite.
8. Make sure hidden files are visible so .htaccess uploads too.

In FileZilla, enable hidden files here:
Server > Force showing hidden files

## After Uploading: Test These URLs
Replace yourdomain.com with the real domain.

1. Frontend:
https://yourdomain.com/

2. PHP API health:
https://yourdomain.com/api/php/health

Expected API health response:
{
  "status": "ok",
  "db": "turso",
  "server": "php"
}

3. Latest news API:
https://yourdomain.com/api/php/latest?limit=3

4. SPA route test:
https://yourdomain.com/category/travel-news

If the category page refreshes without a 404, .htaccess is working.

## Common Problems
### Website loads but news is empty
Check /api/php/health. If it fails, Turso credentials are missing or incorrect.

### API returns 404
The .htaccess file may not have uploaded, or Apache rewrite rules may not be enabled on the host.

### API returns 500
Check that PHP has cURL enabled and config.local.php or environment variables are set correctly.

### Frontend works locally but not live
Do not set VITE_API_URL for normal FTP deployment. The frontend automatically uses /api/php on a live domain.

## Long-Term Stability Notes
- Keep Turso database credentials active and do not rotate them without updating hosting config.
- Keep PHP cURL enabled on hosting.
- Set ADMIN_TOKEN to a private value before using manual posting on production.
- Use a hosting cron job to call /api/php/fetch only if you want automatic news refreshes.
- Avoid uploading node_modules, local.db, .env, or Git folders.

Recommended cron URL:
https://yourdomain.com/api/php/fetch

A safe frequency is every 30-60 minutes, depending on your API limits.
