const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const newsRoutes = require('./routes/news');
const { startCronJob } = require('./cron/fetchScheduler');

dotenv.config();

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
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'local' }));

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// PASS io to cron and start server (No connection string needed!)
startCronJob(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Local database (NeDB) initialized.');
});
