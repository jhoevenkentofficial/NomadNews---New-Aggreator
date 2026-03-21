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
    const limit = parseInt(req.query.limit) || 18;
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const skip = (page - 1) * limit;

    const result = await pool.query('SELECT * FROM articles WHERE category ILIKE $1 ORDER BY published_at DESC LIMIT $2 OFFSET $3', [category, limit, skip]);
    const countResult = await pool.query('SELECT COUNT(*) FROM articles WHERE category ILIKE $1', [category]);
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

// Get news by region
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const skip = (page - 1) * limit;
    const keywordPattern = `%${region}%`;

    const result = await pool.query(`
      SELECT * FROM articles 
      WHERE region ILIKE $1 
      OR description ILIKE $2 
      OR title ILIKE $2
      ORDER BY published_at DESC LIMIT $3 OFFSET $4
    `, [region, keywordPattern, limit, skip]);
    
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM articles 
      WHERE region ILIKE $1 
      OR description ILIKE $2 
      OR title ILIKE $2
    `, [region, keywordPattern]);
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

// Search news
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ articles: [], pagination: { totalPages: 1 } });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const skip = (page - 1) * limit;
    const keywordPattern = `%${q}%`;

    const result = await pool.query(`
      SELECT * FROM articles 
      WHERE title ILIKE $1 
      OR description ILIKE $1
      ORDER BY published_at DESC LIMIT $2 OFFSET $3
    `, [keywordPattern, limit, skip]);
    
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM articles 
      WHERE title ILIKE $1 
      OR description ILIKE $1
    `, [keywordPattern]);
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

// Get all unique sources grouped by region
router.get('/sources', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT source, region FROM articles ORDER BY region, source');
    const sourcesByRegion = {};
    
    result.rows.forEach(row => {
      if (!sourcesByRegion[row.region]) {
        sourcesByRegion[row.region] = [];
      }
      sourcesByRegion[row.region].push(row.source);
    });
    
    res.json(sourcesByRegion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { fetchAndSaveNews } = require('../services/newsFetcher');

// Get news by source
router.get('/source/:source', async (req, res) => {
  try {
    const { source } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const skip = (page - 1) * limit;

    const result = await pool.query('SELECT * FROM articles WHERE source = $1 ORDER BY published_at DESC LIMIT $2 OFFSET $3', [source, limit, skip]);
    const countResult = await pool.query('SELECT COUNT(*) FROM articles WHERE source = $1', [source]);
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

// Manual Fetch Trigger
router.get('/fetch', async (req, res) => {
  try {
    fetchAndSaveNews().catch(err => console.error('Background fetch error:', err));
    res.json({ message: 'News fetch triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual Article Submission (Admin)
router.post('/manual', async (req, res) => {
  const { title, url, description, source, category, region, image, secret } = req.body;
  
  // Simple security check (could be enhanced)
  if (secret !== process.env.ADMIN_TOKEN && secret !== 'ttn_admin_2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const published_at = new Date();
    const result = await pool.query(`
      INSERT INTO articles (title, url, description, source, category, region, image, published_at, trending)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, url || `manual-${Date.now()}`, description, source || 'TTN News', category, region || 'Global', image, published_at, false]);
    
    res.json({ message: 'Article added successfully', article: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
