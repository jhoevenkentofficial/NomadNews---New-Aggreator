const express = require('express');
const cors = require('cors');
const newsRoutes = require('./routes/news');
const { fetchAndSaveNews } = require('./services/newsFetcher');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const { initDB } = require('./data/turso');

// Initialize database
initDB().catch(console.error);

// Routes - more flexible matching for Vercel rewrites
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Primary news routes - handle cases with/without prefixes
app.use(['/api/news', '/news'], newsRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => res.json({ 
  status: 'ok', 
  db: 'turso', 
  time: new Date().toISOString(),
  env: process.env.NODE_ENV
}));

// Robust Debug Diagnostic
app.get(['/api/debug', '/debug'], async (req, res) => {
  let count = 0;
  let sample = [];
  let dbError = null;
  try {
    const { client } = require('./data/turso');
    const r = await client.execute('SELECT count(*) as count FROM articles');
    count = r.rows[0].count;
    const s = await client.execute('SELECT title, region, category FROM articles LIMIT 3');
    sample = s.rows;
  } catch (e) {
    dbError = e.message;
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    db_connected: !dbError,
    db_error: dbError,
    article_count: count,
    sample_articles: sample,
    env_vars: {
      has_turso_url: !!process.env.TURSO_URL,
      has_turso_token: !!process.env.TURSO_AUTH_TOKEN,
      has_news_key: !!process.env.NEWS_API_KEY
    },
    request: {
      url: req.url,
      path: req.path,
      headers_host: req.headers.host
    }
  });
});

// Fallback for direct news routes if prefix was already stripped by Vercel
app.use('/', newsRoutes);

// Export for Vercel
module.exports = app;

// Listen locally (Vercel handles this in production)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
