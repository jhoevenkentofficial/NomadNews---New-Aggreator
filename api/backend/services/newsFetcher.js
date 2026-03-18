const axios = require('axios');
const Parser = require('rss-parser');
const Article = require('../models/Article');
const parser = new Parser();

const fetchAndSaveNews = async () => {
  try {
    const feeds = [
      // Thailand
      { url: 'https://www.bangkokpost.com/rss/data/topstories.xml', category: 'Thailand', region: 'Southeast Asia' },
      
      // World
      { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'World', region: 'Global' },
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'World', region: 'Global' },
      
      // Business
      { url: 'https://skift.com/feed/', category: 'Business', region: 'Global' },
      { url: 'https://www.economist.com/business/rss.xml', category: 'Business', region: 'Global' },
      
      // Travel & Lifestyle
      { url: 'https://www.travelpulse.com/rss/news.rss', category: 'Travel', region: 'Global' },
      { url: 'https://www.cntraveler.com/feed/rss', category: 'Travel', region: 'Global' },
      { url: 'https://www.lonelyplanet.com/news/feed', category: 'Travel', region: 'Global' },
      { url: 'https://www.wired.com/feed/rss', category: 'Lifestyle', region: 'Global' },
      
      { url: 'https://www.theguardian.com/commentisfree/rss', category: 'Opinion', region: 'Global' },
      
      // Flights & Aviation
      { url: 'https://simpleflying.com/feed/', category: 'flights', region: 'Global' },
      
      // Video (The Guardian Video RSS)
      { url: 'https://www.theguardian.com/world/video/rss', category: 'video', region: 'Global' }
    ];

    const regionKeywords = {
      'North America': ['USA', 'Canada', 'Mexico', 'American', 'Washington', 'New York'],
      'Western Europe': ['UK', 'France', 'Germany', 'Europe', 'London', 'Paris', 'Berlin', 'EU'],
      'East Asia': ['China', 'Japan', 'Korea', 'Tokyo', 'Beijing', 'Seoul'],
      'Southeast Asia': ['Thailand', 'Vietnam', 'Singapore', 'Malaysia', 'Philippines', 'Bangkok'],
      'South Asia': ['India', 'Pakistan', 'Bangladesh', 'Delhi', 'Mumbai'],
      'Africa': ['Africa', 'Nigeria', 'Kenya', 'Egypt', 'South Africa', 'Nairobi', 'Cairo'],
      'Middle East': ['Middle East', 'Dubai', 'Saudi', 'Iran', 'Israel', 'Qatar', 'UAE'],
      'Oceania': ['Australia', 'New Zealand', 'Sydney', 'Melbourne', 'Auckland']
    };

    const detectRegion = (title, desc) => {
      const text = `${title} ${desc}`.toLowerCase();
      for (const [region, keywords] of Object.entries(regionKeywords)) {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
          return region;
        }
      }
      return 'Global';
    };

    for (const feed of feeds) {
      try {
        const feedData = await parser.parseURL(feed.url);
        for (const item of feedData.items) {
          const title = item.title || '';
          const description = item.contentSnippet || item.content || '';
          const detectedRegion = detectRegion(title, description);

          const article = {
            title: title,
            url: item.link,
            description: description,
            source: feedData.title || 'Travel News',
            category: feed.category.toLowerCase(),
            region: feed.region !== 'Global' ? feed.region : detectedRegion,
            image: item.enclosure?.url || `https://picsum.photos/seed/${encodeURIComponent(title)}/800/400`,
            publishedAt: new Date(item.pubDate || Date.now())
          };

          if (!article.url || !article.title) continue;

          await Article.findOneAndUpdate(
            { url: article.url },
            article,
            { upsert: true, new: true }
          );
        }
      } catch (e) {
        console.error(`Feed Error (${feed.url}):`, e.message);
      }
    }

    // GNews API
    if (process.env.NEWS_API_KEY) {
      const queries = ['travel', 'technology', 'world', 'business', 'thailand'];
      for (const q of queries) {
        try {
          const gNewsRes = await axios.get(`https://gnews.io/api/v4/search?q=${q}&token=${process.env.NEWS_API_KEY}&lang=en&max=20`);
          for (const item of gNewsRes.data.articles) {
            const detectedRegion = detectRegion(item.title, item.description);
            const article = {
              title: item.title,
              url: item.url,
              description: item.description,
              source: item.source.name,
              category: q.toLowerCase(),
              region: detectedRegion,
              image: item.image || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/400`,
              publishedAt: new Date(item.publishedAt)
            };

            await Article.findOneAndUpdate(
              { url: article.url },
              article,
              { upsert: true, new: true }
            );
          }
        } catch (e) {
          console.error(`GNews Error (${q}):`, e.message);
        }
      }
    }
  } catch (error) {
    console.error('Fetcher Error:', error);
  }
};

module.exports = { fetchAndSaveNews };
