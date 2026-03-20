const express = require('express');
const router = express.Router();
const { pool } = require('../data/postgres');

const mapArticle = row => ({
  _id: row.id,
  title: row.title,
  url: row.url,
  description: row.description,
  source: row.source,
  category: row.category,
  region: row.region,
  image: row.image,
  publishedAt: row.published_at,
  trending: row.trending
});

// Get latest news with pagination
router.get('/latest', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;
    const skip = (page - 1) * limit;

    const result = await pool.query('SELECT * FROM articles ORDER BY published_at DESC LIMIT $1 OFFSET $2', [limit, skip]);
    const countResult = await pool.query('SELECT COUNT(*) FROM articles');
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      articles: result.rows.map(mapArticle),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
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
    const result = await pool.query('SELECT * FROM articles WHERE category ILIKE $1 ORDER BY published_at DESC LIMIT 40', [category]);
    res.json({ articles: result.rows.map(mapArticle), pagination: { totalPages: 1 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news by region
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const keywordPattern = `%${region}%`;
    const result = await pool.query(`
      SELECT * FROM articles 
      WHERE region ILIKE $1 
      OR description ILIKE $2 
      OR title ILIKE $2
      ORDER BY published_at DESC LIMIT 40
    `, [region, keywordPattern]);
    
    res.json({ articles: result.rows.map(mapArticle), pagination: { totalPages: 1 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search news
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ articles: [] });

    const keywordPattern = `%${q}%`;
    const result = await pool.query(`
      SELECT * FROM articles 
      WHERE title ILIKE $1 
      OR description ILIKE $1
      ORDER BY published_at DESC LIMIT 28
    `, [keywordPattern]);
    
    res.json({ articles: result.rows.map(mapArticle), pagination: { totalPages: 1 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { fetchAndSaveNews } = require('../services/newsFetcher');

// Get trending news
router.get('/trending', async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM articles WHERE trending = true ORDER BY published_at DESC LIMIT 10');
    if (result.rows.length === 0) {
      result = await pool.query('SELECT * FROM articles ORDER BY published_at DESC LIMIT 10');
    }
    res.json({ articles: result.rows.map(mapArticle) });
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
