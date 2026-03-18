const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const newsRoutes = require('./routes/news');
const { startCronJob } = require('./cron/fetchScheduler');
const connectDB = require('./data/mongodb');
const { fetchAndSaveNews } = require('./services/newsFetcher');

dotenv.config();

// Connect to MongoDB
// Delay DB connection until request

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

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
    await fetchAndSaveNews(io);
    res.json({ message: 'News fetch triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io Connection (Note: Might not persist on Vercel)
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start Cron (Local only)
if (!process.env.VERCEL) {
  startCronJob(io);
}

// Start Server (Only if not handled by Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
