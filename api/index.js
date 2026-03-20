const app = require('./backend/server');
const { initDB } = require('./backend/data/postgres');

module.exports = async (req, res) => {
  try {
    // Ensure DB connection is established
    await initDB();
    
    // Pass the request to the Express app
    return app(req, res);
  } catch (error) {
    console.error('Vercel API Error:', error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message,
      path: req.url
    });
  }
};
