const express = require('express');
const cors = require('cors');
const newsRoutes = require('./routes/news');
const { initDB, client } = require('./data/turso');

const app = express();
const dbReady = initDB();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.get(['/api/health', '/health'], async (req, res) => {
  let dbConnected = true;
  let dbError = null;

  try {
    await dbReady;
    await client.execute('SELECT 1');
  } catch (error) {
    dbConnected = false;
    dbError = error.message;
  }

  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    db: 'turso',
    dbConnected,
    dbError,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get(['/api/debug', '/debug'], async (req, res) => {
  let count = 0;
  let sample = [];
  let dbError = null;

  try {
    await dbReady;
    const countResult = await client.execute('SELECT count(*) as count FROM articles');
    count = Number(countResult.rows[0]?.count || 0);
    const sampleResult = await client.execute('SELECT title, region, category FROM articles ORDER BY published_at DESC LIMIT 3');
    sample = sampleResult.rows;
  } catch (error) {
    dbError = error.message;
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
      url: req.originalUrl,
      path: req.path,
      host: req.headers.host
    }
  });
});

app.use(async (req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (error) {
    res.status(503).json({ error: 'Database is not ready', details: error.message });
  }
});

app.use('/api/news', newsRoutes);
app.use('/news', newsRoutes);
app.use('/api', newsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}