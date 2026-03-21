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

// Export for Vercel
module.exports = app;

// Only listen if not running in Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
