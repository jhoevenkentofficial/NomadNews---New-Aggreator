const app = require('./backend/server');
const connectDB = require('./backend/data/mongodb');

module.exports = async (req, res) => {
  try {
    // Ensure DB connection is established
    await connectDB();
    
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
