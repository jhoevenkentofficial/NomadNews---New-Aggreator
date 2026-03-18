const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// Get latest news with pagination
router.get('/latest', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40; // Increased limit
    const skip = (page - 1) * limit;

    const articles = await Article.find().sort({ publishedAt: -1 }).skip(skip).limit(limit);
    const total = await Article.countDocuments();

    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArticles: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    // Case-insensitive match
    const articles = await Article.find({ category: new RegExp(`^${category}$`, 'i') }).sort({ publishedAt: -1 }).limit(40);
    res.json({ articles, pagination: { totalPages: 1 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news by region
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    // Case-insensitive match for region field or keywords
    const articles = await Article.find({ 
      $or: [
        { region: new RegExp(`^${region}$`, 'i') },
        { description: new RegExp(region, 'i') },
        { title: new RegExp(region, 'i') }
      ]
    }).sort({ publishedAt: -1 }).limit(40);
    
    res.json({ articles, pagination: { totalPages: 1 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search news
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ articles: [] });

    const articles = await Article.find({ $text: { $search: q } }).sort({ publishedAt: -1 }).limit(28);
    res.json({ articles, pagination: { totalPages: 1 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { fetchAndSaveNews } = require('../services/newsFetcher');

// ... (existing routes)

// Get trending news
router.get('/trending', async (req, res) => {
  try {
    let articles = await Article.find({ trending: true }).sort({ publishedAt: -1 }).limit(10);
    if (articles.length === 0) {
      articles = await Article.find().sort({ publishedAt: -1 }).limit(10);
    }
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual Fetch Trigger
router.get('/fetch', async (req, res) => {
  try {
    await fetchAndSaveNews();
    res.json({ message: 'News fetch triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
