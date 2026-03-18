# NomadNews Global — News Aggregator

A modern travel news aggregator featuring **479+ unique articles** from around the world, covering travel, flights, lifestyle, business, and world news.

## Features
- 🌍 **479+ Unique Articles** from GNews API + RSS feeds
- ✈️ **Flights Category** with 70+ aviation stories
- 🔥 **Trending Sidebar** with live top-20 stories and thumbnails
- 📖 **Pagination** (28 articles/page) across all feeds
- 🔍 **Functional Search** with full-text results
- 📅 **Real-time Clock** in the navbar (live date/time)
- ☰ **Hamburger Menu** with website info and navigation

## Project Structure

```
.
├── frontend/     ← React + Vite (deploy to Vercel)
└── backend/      ← Express + NeDB (deploy to Railway or Render)
```

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Add your NEWS_API_KEY
node seedNews.js       # Seed the database
npm run dev            # Starts on port 5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # Set VITE_API_BASE_URL=http://localhost:5000
npm run dev            # Starts on port 5001
```

## Deployment

### Frontend → Vercel
1. Import this repo in Vercel
2. Vercel will auto-detect `vercel.json` and build `frontend/`
3. Add environment variable: `VITE_API_BASE_URL` = your deployed backend URL

### Backend → Railway or Render
1. Create a new project and point to this repo
2. Set **Root Directory** to `backend`
3. Set **Start Command** to `node server.js`
4. Add `NEWS_API_KEY` as an environment variable
5. Copy the deployed URL and paste into Vercel's `VITE_API_BASE_URL`

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
NEWS_API_KEY=your_gnews_api_key
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:5000
```
