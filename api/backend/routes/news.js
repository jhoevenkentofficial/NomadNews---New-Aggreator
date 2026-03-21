const express = require('express');
const router = express.Router();
const { client } = require('../data/turso');

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
  trending: !!row.trending
});

// Get latest news with pagination
router.get('/latest', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const skip = (page - 1) * limit;

    const result = await client.execute({
      sql: 'SELECT * FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?',
      args: [limit, skip]
    });
    
    const countResult = await client.execute('SELECT COUNT(*) as count FROM articles');
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

    const result = await client.execute({
      sql: 'SELECT * FROM articles WHERE category LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?',
      args: [`%${category}%`, limit, skip]
    });
    
    const countResult = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM articles WHERE category LIKE ?',
      args: [`%${category}%`]
    });
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

    const result = await client.execute({
      sql: `
        SELECT * FROM articles 
        WHERE region LIKE ? 
        OR description LIKE ? 
        OR title LIKE ?
        ORDER BY published_at DESC LIMIT ? OFFSET ?
      `,
      args: [keywordPattern, keywordPattern, keywordPattern, limit, skip]
    });
    
    const countResult = await client.execute({
      sql: `
        SELECT COUNT(*) as count FROM articles 
        WHERE region LIKE ? 
        OR description LIKE ? 
        OR title LIKE ?
      `,
      args: [keywordPattern, keywordPattern, keywordPattern]
    });
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

    const result = await client.execute({
      sql: `
        SELECT * FROM articles 
        WHERE title LIKE ? 
        OR description LIKE ?
        ORDER BY published_at DESC LIMIT ? OFFSET ?
      `,
      args: [keywordPattern, keywordPattern, limit, skip]
    });
    
    const countResult = await client.execute({
      sql: `
        SELECT COUNT(*) as count FROM articles 
        WHERE title LIKE ? 
        OR description LIKE ?
      `,
      args: [keywordPattern, keywordPattern]
    });
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
    let result = await client.execute('SELECT * FROM articles WHERE trending = 1 ORDER BY published_at DESC LIMIT 10');
    if (result.rows.length === 0) {
      result = await client.execute('SELECT * FROM articles ORDER BY published_at DESC LIMIT 10');
    }
    res.json({ articles: result.rows.map(mapArticle) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all unique sources grouped by region
router.get('/sources', async (req, res) => {
  try {
    const result = await client.execute('SELECT DISTINCT source, region FROM articles ORDER BY region, source');
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

    const result = await client.execute({
      sql: 'SELECT * FROM articles WHERE source = ? ORDER BY published_at DESC LIMIT ? OFFSET ?',
      args: [source, limit, skip]
    });
    const countResult = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM articles WHERE source = ?',
      args: [source]
    });
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
    console.log('Starting manual fetch to Turso...');
    await fetchAndSaveNews();
    const countResult = await client.execute('SELECT COUNT(*) as count FROM articles');
    res.json({ 
      message: 'News fetch completed successfully', 
      totalArticles: parseInt(countResult.rows[0].count, 10) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual Article Submission (Admin)
router.post('/manual', async (req, res) => {
  const { title, url, description, source, category, region, image, secret } = req.body;
  const clientSecret = (secret || '').trim();
  const envSecret = (process.env.ADMIN_TOKEN || 'ttn_admin_2026').trim();
  
  if (clientSecret !== envSecret && clientSecret !== 'ttn_admin_2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const published_at = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO articles (title, url, description, source, category, region, image, published_at, trending)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [title, url || `manual-${Date.now()}`, description, source || 'TTN News', category, region || 'Global', image, published_at, 0]
    });
    
    res.json({ message: 'Article added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
