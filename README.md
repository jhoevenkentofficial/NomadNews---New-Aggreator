# NomadNews Global - News Aggregator

A modern travel news aggregator for travel, flights, lifestyle, business, and world news.

## Features
- Global travel news aggregation from API and RSS sources
- Flight and aviation news categories
- Trending sidebar with live story thumbnails
- Search across headlines, descriptions, sources, and cities
- Category, region, source, and article pages
- Admin publishing workflow
- PHP shared-hosting fallback API and Node API backend

## Project Structure

```
.
├── src/                 React + Vite frontend
├── api/backend/         Node/Express API backed by Turso
├── api/php/             PHP API fallback for shared hosting
├── backend/             Legacy Node backend
├── public/              Static assets and shared-hosting rewrites
└── deployment_ready/    Static deployment copy
```

## Local Development

### Frontend
```bash
npm install
npm run dev
```

### Node API
```bash
cd api/backend
npm install
npm run dev
```

The frontend defaults to `http://localhost:5000/api/news` when opened from `localhost` or `127.0.0.1`. For hosted deployments, set `VITE_API_URL` only when you need to point the frontend to a separate API origin.

## Deployment

For static/shared hosting, upload the built frontend with the `api/php` folder and the `.htaccess` rewrite files. The frontend falls back to `/api/php` outside local development.

For Node hosting, run `api/backend/server.js` with the required environment variables and point `VITE_API_URL` to that API origin if it is hosted separately.

## Environment Variables

### Node API
```
PORT=5000
TURSO_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
NEWS_API_KEY=your_gnews_api_key
ADMIN_TOKEN=optional_admin_secret
```

### Frontend
```
VITE_API_URL=https://your-api-host.example.com
```