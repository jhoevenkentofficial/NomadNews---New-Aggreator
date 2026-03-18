const express = require('express');
const cors = require('cors');
const newsRoutes = require('./routes/news');
const { fetchAndSaveNews } = require('./services/newsFetcher');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/news', newsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'mongodb' }));

// Manual Fetch Trigger (for Vercel Cron)
app.get('/api/news/fetch', async (req, res) => {
  try {
    await fetchAndSaveNews();
    res.json({ message: 'News fetch triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server (Only if not on Vercel)
if (!process.env.VERCEL) {
  const connectDB = require('./data/mongodb');
  const { startCronJob } = require('./cron/fetchScheduler');
  connectDB();
  startCronJob();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
