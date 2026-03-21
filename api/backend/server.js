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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'postgres' }));

// Debug check (temporary)
app.get('/api/debug', (req, res) => {
  res.json({
    has_db_url: !!process.env.DATABASE_URL,
    has_news_key: !!process.env.NEWS_API_KEY,
    node_env: process.env.NODE_ENV,
    url_preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'NONE'
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
