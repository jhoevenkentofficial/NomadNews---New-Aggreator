const axios = require('axios');
const Parser = require('rss-parser');
const Article = require('../models/Article');
const parser = new Parser();

const fetchAndSaveNews = async () => {
  try {
    const feeds = [
      // North America
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world', region: 'North America' },
      { url: 'http://rss.cnn.com/rss/edition.rss', category: 'world', region: 'North America' },
      { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', category: 'world', region: 'North America' },
      { url: 'https://www.cbc.ca/cmlink/rss-topstories', category: 'world', region: 'North America' },

      // Western Europe
      { url: 'http://feeds.bbci.co.uk/news/world/europe/rss.xml', category: 'world', region: 'Western Europe' },
      { url: 'https://www.france24.com/en/europe/rss', category: 'world', region: 'Western Europe' },
      { url: 'https://rss.dw.com/rdf/rss-en-eu', category: 'world', region: 'Western Europe' },
      { url: 'https://www.theguardian.com/europe/rss', category: 'world', region: 'Western Europe' },

      // East Asia
      { url: 'https://www.scmp.com/rss/91/feed', category: 'world', region: 'East Asia' },
      { url: 'https://www.japantimes.co.jp/feed/', category: 'world', region: 'East Asia' },
      { url: 'http://www.koreaherald.com/common/rss_xml.php?ct=102', category: 'world', region: 'East Asia' },

      // Southeast Asia
      { url: 'https://www.bangkokpost.com/rss/data/topstories.xml', category: 'world', region: 'Southeast Asia' },
      { url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', category: 'world', region: 'Southeast Asia' },
      { url: 'https://www.thestar.com.my/rss/news', category: 'world', region: 'Southeast Asia' },

      // South Asia
      { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', category: 'world', region: 'South Asia' },
      { url: 'https://www.thehindu.com/news/feeder/default.rss', category: 'world', region: 'South Asia' },
      { url: 'https://www.dawn.com/feeds/home/', category: 'world', region: 'South Asia' },

      // Africa
      { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', category: 'world', region: 'Africa' },
      { url: 'https://feeds.news24.com/articles/news24/TopStories/rss', category: 'world', region: 'Africa' },
      { url: 'https://nation.africa/kenya/rss', category: 'world', region: 'Africa' },

      // Middle East
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world', region: 'Middle East' },
      { url: 'https://gulfnews.com/arc/outboundfeeds/rss/gen/gulfnews/1.1555?outputType=xml', category: 'world', region: 'Middle East' },
      { url: 'https://www.middleeasteye.net/rss', category: 'world', region: 'Middle East' },

      // Oceania
      { url: 'https://www.abc.net.au/news/feed/51120/rss.xml', category: 'world', region: 'Oceania' },
      { url: 'https://www.smh.com.au/rss/feed.xml', category: 'world', region: 'Oceania' },
      { url: 'https://www.rnz.co.nz/rss/news.xml', category: 'world', region: 'Oceania' },
      
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
      
      // Video
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

    const fetchPromises = feeds.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed.url);
        const articleOps = [];

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
            publishedAt: new Date(item.pubDate || Date.now()),
            trending: Math.random() > 0.8
          };

          if (!article.url || !article.title) continue;

          articleOps.push({
            updateOne: {
              filter: { url: article.url },
              update: { $set: article },
              upsert: true
            }
          });
        }
        
        if (articleOps.length > 0) {
          await Article.bulkWrite(articleOps, { ordered: false });
        }
      } catch (e) {
        console.error(`Feed Error (${feed.url}):`, e.message);
      }
    });

    await Promise.allSettled(fetchPromises);

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
              publishedAt: new Date(item.publishedAt),
              trending: Math.random() > 0.5 // GNews results are 50% trending
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
