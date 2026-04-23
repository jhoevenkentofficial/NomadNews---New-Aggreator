const express = require('express');
const router = express.Router();
const { client } = require('../data/turso');

const mapArticle = row => ({
  id: row.id,
  _id: row.id, 
  title: row.title,
  url: row.url,
  description: row.description || '',
  source: row.source || 'Unknown',
  category: row.category || 'General',
  region: row.region || 'Global',
  image: row.image || '',
  publishedAt: row.published_at,
  published_at: row.published_at, 
  trending: !!row.trending,
  author: row.author || '',
  city: row.city || '',
  isBreaking: !!row.is_breaking
});

// Get article by ID
router.get('/article/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.execute({
      sql: 'SELECT * FROM articles WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(mapArticle(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
    const normalizedCategory = category.replace(/-/g, ' ');
    const keyword = `%${normalizedCategory}%`;

    const result = await client.execute({
      sql: 'SELECT * FROM articles WHERE category LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?',
      args: [keyword, limit, skip]
    });
    
    const countResult = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM articles WHERE category LIKE ?',
      args: [keyword]
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
  const received = (secret || '').trim();
  const valid = ['ttn_admin_2026', process.env.ADMIN_TOKEN].filter(Boolean).map(s => s.trim());
  
  console.log('Admin attempt - received:', JSON.stringify(received));
  
  if (!valid.includes(received)) {
    return res.status(401).json({ error: 'Unauthorized', hint: 'Use key: ttn_admin_2026' });
  }

  try {
    const published_at = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO articles (title, url, description, source, category, region, image, published_at, trending, author, city, is_breaking)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        title, 
        url || `manual-${Date.now()}`, 
        description, 
        source || 'TTN News', 
        category, 
        region || 'Global', 
        image, 
        published_at, 
        0,
        req.body.author || 'Admin',
        req.body.city || '',
        req.body.isBreaking ? 1 : 0
      ]
    });
    
    res.json({ message: 'Article added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
