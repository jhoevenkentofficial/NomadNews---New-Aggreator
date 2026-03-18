const axios = require('axios');
const Parser = require('rss-parser');
const Article = require('../models/Article');
const parser = new Parser();

const fetchAndSaveNews = async () => {
  console.log('--- News Fetch Started ---');
  try {
    const feeds = [
      { url: 'https://www.travelpulse.com/rss/news.rss', category: 'General' },
      { url: 'https://www.cntraveler.com/feed/rss', category: 'Luxury' },
      { url: 'https://www.lonelyplanet.com/news/feed', category: 'Adventure' },
      { url: 'https://skift.com/feed/', category: 'Business' }
    ];

    for (const feed of feeds) {
      try {
        console.log(`Fetching feed: ${feed.url} (${feed.category})`);
        const feedData = await parser.parseURL(feed.url);
        console.log(`Feed parsed: ${feedData.title || 'Untitled'} - ${feedData.items?.length || 0} items`);
        
        for (const item of feedData.items) {
          const article = {
            title: item.title,
            url: item.link,
            description: item.contentSnippet || item.content || '',
            source: feedData.title || 'Travel News',
            category: feed.category,
            image: item.enclosure?.url || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/400`,
            publishedAt: new Date(item.pubDate || Date.now())
          };

          if (!article.url || !article.title) {
            console.warn('Skipping item with missing title or url');
            continue;
          }

          await Article.findOneAndUpdate(
            { url: article.url },
            article,
            { upsert: true, new: true }
          );
        }
      } catch (feedError) {
        console.error(`Error processing feed ${feed.url}:`, feedError.message);
      }
    }

    // GNews API Fallback/Supplement
    if (process.env.NEWS_API_KEY) {
      console.log('Fetching GNews API...');
      try {
        const gNewsRes = await axios.get(`https://gnews.io/api/v4/search?q=travel&token=${process.env.NEWS_API_KEY}&lang=en`);
        console.log(`GNews Response: ${gNewsRes.data.articles?.length || 0} articles found`);
        
        for (const item of gNewsRes.data.articles) {
          const article = {
            title: item.title,
            url: item.url,
            description: item.description,
            source: item.source.name,
            category: 'Trending',
            image: item.image || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/400`,
            publishedAt: new Date(item.publishedAt)
          };

          await Article.findOneAndUpdate(
            { url: article.url },
            article,
            { upsert: true, new: true }
          );
        }
      } catch (gnewsError) {
        console.error('GNews Fetcher Error:', gnewsError.message);
      }
    } else {
      console.log('GNews API Key missing - skipping');
    }
    console.log('--- News Fetch Completed ---');
  } catch (error) {
    console.error('Critical Fetcher Error:', error);
  }
};

module.exports = { fetchAndSaveNews };
