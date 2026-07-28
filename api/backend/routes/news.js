const express = require('express');
const router = express.Router();
const { client } = require('../data/turso');
const { fetchAndSaveNews } = require('../services/newsFetcher');

const DEFAULT_LIMIT = 18;
const MAX_LIMIT = 100;

const toInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getPagination = (query) => {
  const page = toInteger(query.page, 1);
  const limit = Math.min(toInteger(query.limit, DEFAULT_LIMIT), MAX_LIMIT);
  return { page, limit, offset: (page - 1) * limit };
};

const makePagination = (total, page, limit) => ({
  currentPage: page,
  totalPages: Math.max(1, Math.ceil(total / limit)),
  totalArticles: total
});

const cleanText = (value) => String(value || '').trim();
const likePattern = (value) => `%${cleanText(value).toLowerCase()}%`;
const slugPattern = (value) => `%${cleanText(value).toLowerCase().replace(/-/g, '%')}%`;

const listColumns = `
  id, title, url, description, source, category, region, image,
  published_at, trending, author, city, is_breaking
`;

const mapArticle = (row = {}) => ({
  id: row.id,
  _id: row.id,
  title: row.title || 'Untitled Travel Report',
  url: row.url || '',
  description: row.description || '',
  source: row.source || 'Unknown',
  category: row.category || 'General',
  region: row.region || 'Global',
  image: row.image || '',
  publishedAt: row.published_at || row.publishedAt || null,
  published_at: row.published_at || row.publishedAt || null,
  trending: Boolean(row.trending),
  author: row.author || '',
  city: row.city || '',
  isBreaking: Boolean(row.is_breaking),
  is_breaking: Boolean(row.is_breaking),
  content: row.content || ''
});

const sendError = (res, error, fallback = 'Unable to complete request') => {
  console.error(error);
  res.status(500).json({ error: fallback, details: error.message });
};

router.get('/article/:id', async (req, res) => {
  try {
    const id = cleanText(req.params.id);
    if (!id) return res.status(400).json({ error: 'Article ID is required' });

    const result = await client.execute({
      sql: 'SELECT * FROM articles WHERE id = ? OR url = ? LIMIT 1',
      args: [id, id]
    });

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(mapArticle(result.rows[0]));
  } catch (error) {
    sendError(res, error, 'Unable to load article');
  }
});

router.get('/latest', async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const result = await client.execute({
      sql: `SELECT ${listColumns} FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?`,
      args: [limit, offset]
    });
    const countResult = await client.execute('SELECT COUNT(*) as count FROM articles');
    const total = Number(countResult.rows[0]?.count || 0);

    res.json({
      articles: result.rows.map(mapArticle),
      pagination: makePagination(total, page, limit)
    });
  } catch (error) {
    sendError(res, error, 'Unable to load latest news');
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const keyword = slugPattern(req.params.category);

    const result = await client.execute({
      sql: `SELECT ${listColumns} FROM articles WHERE LOWER(category) LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?`,
      args: [keyword, limit, offset]
    });
    const countResult = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM articles WHERE LOWER(category) LIKE ?',
      args: [keyword]
    });
    const total = Number(countResult.rows[0]?.count || 0);

    res.json({
      articles: result.rows.map(mapArticle),
      pagination: makePagination(total, page, limit)
    });
  } catch (error) {
    sendError(res, error, 'Unable to load category news');
  }
});

router.get('/region/:region', async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const keyword = likePattern(req.params.region);

    const result = await client.execute({
      sql: `
        SELECT ${listColumns} FROM articles
        WHERE LOWER(region) LIKE ? OR LOWER(description) LIKE ? OR LOWER(title) LIKE ?
        ORDER BY published_at DESC LIMIT ? OFFSET ?
      `,
      args: [keyword, keyword, keyword, limit, offset]
    });
    const countResult = await client.execute({
      sql: `
        SELECT COUNT(*) as count FROM articles
        WHERE LOWER(region) LIKE ? OR LOWER(description) LIKE ? OR LOWER(title) LIKE ?
      `,
      args: [keyword, keyword, keyword]
    });
    const total = Number(countResult.rows[0]?.count || 0);

    res.json({
      articles: result.rows.map(mapArticle),
      pagination: makePagination(total, page, limit)
    });
  } catch (error) {
    sendError(res, error, 'Unable to load region news');
  }
});

router.get('/search', async (req, res) => {
  try {
    const query = cleanText(req.query.q);
    const { page, limit, offset } = getPagination(req.query);

    if (!query) {
      return res.json({ articles: [], pagination: makePagination(0, page, limit) });
    }

    const keyword = likePattern(query);
    const result = await client.execute({
      sql: `
        SELECT ${listColumns} FROM articles
        WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(source) LIKE ? OR LOWER(city) LIKE ?
        ORDER BY published_at DESC LIMIT ? OFFSET ?
      `,
      args: [keyword, keyword, keyword, keyword, limit, offset]
    });
    const countResult = await client.execute({
      sql: `
        SELECT COUNT(*) as count FROM articles
        WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(source) LIKE ? OR LOWER(city) LIKE ?
      `,
      args: [keyword, keyword, keyword, keyword]
    });
    const total = Number(countResult.rows[0]?.count || 0);

    res.json({
      articles: result.rows.map(mapArticle),
      pagination: makePagination(total, page, limit)
    });
  } catch (error) {
    sendError(res, error, 'Unable to search news');
  }
});

router.get('/trending', async (req, res) => {
  try {
    let result = await client.execute(`SELECT ${listColumns} FROM articles WHERE trending = 1 ORDER BY published_at DESC LIMIT 10`);
    if (!result.rows.length) {
      result = await client.execute(`SELECT ${listColumns} FROM articles ORDER BY published_at DESC LIMIT 10`);
    }
    res.json({ articles: result.rows.map(mapArticle) });
  } catch (error) {
    sendError(res, error, 'Unable to load trending news');
  }
});

router.get('/sources', async (req, res) => {
  try {
    const result = await client.execute(`
      SELECT DISTINCT source, COALESCE(region, 'Global') as region
      FROM articles
      WHERE source IS NOT NULL AND source != ''
      ORDER BY region, source
    `);
    const sourcesByRegion = {};

    result.rows.forEach((row) => {
      const region = row.region || 'Global';
      if (!sourcesByRegion[region]) sourcesByRegion[region] = [];
      if (!sourcesByRegion[region].includes(row.source)) sourcesByRegion[region].push(row.source);
    });

    res.json(sourcesByRegion);
  } catch (error) {
    sendError(res, error, 'Unable to load sources');
  }
});

router.get('/source/:source', async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const keyword = likePattern(req.params.source);

    const result = await client.execute({
      sql: `SELECT ${listColumns} FROM articles WHERE LOWER(source) LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?`,
      args: [keyword, limit, offset]
    });
    const countResult = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM articles WHERE LOWER(source) LIKE ?',
      args: [keyword]
    });
    const total = Number(countResult.rows[0]?.count || 0);

    res.json({
      articles: result.rows.map(mapArticle),
      pagination: makePagination(total, page, limit)
    });
  } catch (error) {
    sendError(res, error, 'Unable to load source news');
  }
});

router.get('/fetch', async (req, res) => {
  try {
    console.log('Starting manual fetch to Turso...');
    await fetchAndSaveNews();
    const countResult = await client.execute('SELECT COUNT(*) as count FROM articles');
    res.json({
      message: 'News fetch completed successfully',
      totalArticles: Number(countResult.rows[0]?.count || 0)
    });
  } catch (error) {
    sendError(res, error, 'Unable to fetch news');
  }
});

router.post('/manual', async (req, res) => {
  const body = req.body || {};
  const received = cleanText(body.secret);
  const validSecrets = ['TRAVELTEW_2026', process.env.ADMIN_TOKEN]
    .filter(Boolean)
    .map((secret) => cleanText(secret));

  if (!validSecrets.includes(received)) {
    return res.status(401).json({ error: 'Unauthorized', hint: 'Please enter the correct Admin Secret Key' });
  }

  const title = cleanText(body.title);
  if (!title) {
    return res.status(400).json({ error: 'Article title is required' });
  }

  try {
    const publishedAt = new Date().toISOString();
    await client.execute({
      sql: `
        INSERT INTO articles
          (title, url, description, source, category, region, image, published_at, trending, author, city, is_breaking, content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        title,
        cleanText(body.url) || `manual-${Date.now()}`,
        cleanText(body.description),
        cleanText(body.source) || 'TTN News',
        cleanText(body.category) || 'Breaking News',
        cleanText(body.region) || 'Global',
        cleanText(body.image),
        publishedAt,
        body.trending ? 1 : 0,
        cleanText(body.author) || 'TTN Staff Reporter',
        cleanText(body.city),
        body.isBreaking || body.category === 'Breaking News' ? 1 : 0,
        cleanText(body.content) || cleanText(body.description)
      ]
    });

    res.json({ message: 'Article added successfully' });
  } catch (error) {
    if (String(error.message || '').toLowerCase().includes('unique')) {
      return res.status(409).json({ error: 'An article with this URL already exists' });
    }
    sendError(res, error, 'Unable to add article');
  }
});

module.exports = router;