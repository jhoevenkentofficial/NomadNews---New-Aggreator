const express = require('express');
const cors = require('cors');
const newsRoutes = require('./routes/news');
const { fetchAndSaveNews } = require('./services/newsFetcher');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const { initDB } = require('./data/postgres');

// Initialize DB connection (Async)
initDB();

// Routes
app.use('/api/news', newsRoutes);

// Health check (Handle both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => res.json({ status: 'ok', db: 'postgres' }));

// Debug check (Handle both /api/debug and /debug)
app.get(['/api/debug', '/debug'], (req, res) => {
  res.json({
    db_env: !!process.env.DATABASE_URL,
    news_env: !!process.env.NEWS_API_KEY,
    preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'MISSING',
    received_url: req.url
  });
});

// Export for Vercel
module.exports = app;

// Only listen if not running in Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
