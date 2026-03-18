const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

/**
 * GET latest news articles with pagination
 */
router.get('/latest', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 28;
    const skip = (page - 1) * limit;

    const totalArticles = await Article.countDocuments({});
    const articles = await Article.find({})
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({ 
      articles,
      pagination: {
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest news' });
  }
});

/**
 * GET trending news (Keeping limit 20, no pagination needed for simple sidebar)
 */
router.get('/trending', async (req, res) => {
  try {
    const articles = await Article.find({ trending: true })
      .sort({ trendingScore: -1 })
      .limit(20);
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending news' });
  }
});

/**
 * GET news by category with pagination
 */
router.get('/category/:categoryName', async (req, res) => {
  try {
    const category = req.params.categoryName;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 28;
    const skip = (page - 1) * limit;

    const totalArticles = await Article.countDocuments({ category });
    const articles = await Article.find({ category })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ 
      articles,
      pagination: {
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching news for ${req.params.categoryName}` });
  }
});

/**
 * GET news by region with pagination
 */
router.get('/region/:regionName', async (req, res) => {
  try {
    const region = req.params.regionName;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 28;
    const skip = (page - 1) * limit;

    const totalArticles = await Article.countDocuments({ region });
    const articles = await Article.find({ region })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({ 
      articles,
      pagination: {
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching news for ${req.params.regionName}` });
  }
});

/**
 * GET searching articles with pagination
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ articles: [], pagination: { totalArticles: 0, totalPages: 0, currentPage: 1, limit: 28 } });
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 28;
    const skip = (page - 1) * limit;

    const regex = new RegExp(query, 'i');
    const filter = {
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $regex: regex } },
        { region: { $regex: regex } }
      ]
    };

    const totalArticles = await Article.countDocuments(filter);
    const articles = await Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({ 
      articles,
      pagination: {
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching articles' });
  }
});

module.exports = router;
