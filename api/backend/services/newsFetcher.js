const axios = require('axios');
const Parser = require('rss-parser');
const { client } = require('../data/turso');
const parser = new Parser();

const fetchAndSaveNews = async () => {
  try {
    const feeds = [
      // --- GLOBAL PRIMARY ---
      { url: 'https://skift.com/feed/', category: 'travel-news', region: 'Global' },
      { url: 'https://www.travelpulse.com/rss/news.rss', category: 'travel-news', region: 'Global' },
      { url: 'https://www.cntraveler.com/feed/rss', category: 'destinations', region: 'Global' },
      
      // --- REGIONAL TRAVEL ---
      // North America
      { url: 'https://www.travelweekly.com/RSS/News', category: 'travel-news', region: 'North America' },
      
      // Europe
      { url: 'https://www.travelweekly.co.uk/rss/news', category: 'travel-news', region: 'Western Europe' },
      { url: 'https://www.schengenvisainfo.com/news/feed/', category: 'travel-news', region: 'Western Europe' },
      
      // Asia
      { url: 'https://www.traveldailymedia.com/category/asia/feed/', category: 'travel-news', region: 'South Asia' },
      { url: 'https://thethaiger.com/category/travel/feed', category: 'destinations', region: 'Southeast Asia' },
      
      // Africa
      { url: 'https://www.africantravelcanvas.com/feed/', category: 'tips', region: 'Africa' },
      
      // Middle East
      { url: 'https://gulfbusiness.com/industry/tourism/feed/', category: 'travel-news', region: 'Middle East' },
      
      // Oceania
      { url: 'https://www.travelweekly.com.au/feed/', category: 'travel-news', region: 'Oceania' },

      // --- NICHES ---
      // Flights
      { url: 'https://simpleflying.com/feed/', category: 'flights', region: 'Global' },
      { url: 'https://onemileatatime.com/feed/', category: 'flights', region: 'Global' },
      // Hotels
      { url: 'https://www.hotelmanagement.net/rss.xml', category: 'hotels', region: 'Global' },
      // Cruises
      { url: 'https://www.cruisecritic.com/rss/news', category: 'cruises', region: 'Global' }
    ];

    const regionKeywords = {
      'North America': ['USA', 'Canada', 'Mexico', 'American', 'Washington', 'New York'],
      'Central America': ['Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Belize'],
      'Caribbean': ['Caribbean', 'Jamaica', 'Cuba', 'Puerto Rico', 'Bahamas', 'Barbados', 'Trinidad', 'Haiti'],
      'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador', 'Uruguay'],
      'U.K. & Ireland': ['UK', 'Britain', 'England', 'Scotland', 'Wales', 'Ireland', 'London', 'Dublin', 'Belfast'],
      'Western Europe': ['France', 'Germany', 'Italy', 'Spain', 'Europe', 'Paris', 'Berlin', 'Madrid', 'EU'],
      'Eastern Europe': ['Russia', 'Ukraine', 'Poland', 'Romania', 'Balkans', 'Kyiv', 'Warsaw', 'Prague'],
      'Africa': ['Africa', 'Nigeria', 'Kenya', 'Egypt', 'South Africa', 'Nairobi', 'Cairo', 'Lagos'],
      'Middle East': ['Middle East', 'Dubai', 'Saudi', 'Iran', 'Israel', 'Qatar', 'UAE', 'Tel Aviv'],
      'Central Asia': ['Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Almaty', 'Tashkent'],
      'East Asia': ['China', 'Japan', 'Korea', 'Tokyo', 'Beijing', 'Seoul'],
      'South Asia': ['India', 'Pakistan', 'Bangladesh', 'Delhi', 'Mumbai'],
      'Southeast Asia': ['Thailand', 'Vietnam', 'Singapore', 'Malaysia', 'Philippines', 'Bangkok'],
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

    const saveArticles = async (articles) => {
        let savedCount = 0;
        for (const article of articles) {
            try {
                // Check for duplicates
                const existing = await client.execute({
                    sql: 'SELECT id FROM articles WHERE url = ?',
                    args: [article.url]
                });

                if (existing.rows.length === 0) {
                    await client.execute({
                        sql: `INSERT INTO articles (title, url, description, source, category, region, image, published_at, trending)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        args: [
                            article.title, 
                            article.url, 
                            article.description, 
                            article.source, 
                            article.category, 
                            article.region, 
                            article.image, 
                            article.publishedAt, 
                            article.trending ? 1 : 0
                        ]
                    });
                    savedCount++;
                }
            } catch (error) {
                console.error('Error saving article to Turso:', error);
            }
        }
        return savedCount;
    };

    const detectImage = (item) => {
      if (item.enclosure?.url) return item.enclosure.url;
      if (item.media?.[0]?.url) return item.media[0].url;
      if (item.image) return item.image;
      return `https://picsum.photos/seed/${encodeURIComponent(item.title || Math.random())}/800/400`;
    };

    const fetchPromises = feeds.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed.url);
        const articles = [];

        for (const item of feedData.items) {
          const title = item.title || '';
          const url = item.link || item.guid || '';
          if (!url) continue;

          const description = item.contentSnippet || item.description || item.summary || '';
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          
          articles.push({
            title,
            url,
            description,
            source: feed.name || feed.url.split('/')[2] || 'News Source',
            category: feed.category || 'General',
            region: feed.region || detectRegion(title, description),
            image: detectImage(item),
            publishedAt: pubDate.toISOString(),
            trending: false
          });
        }
        
        await saveArticles(articles);
      } catch (e) {
        console.error(`Feed Error (${feed.url}):`, e.message);
      }
    });

    await Promise.allSettled(fetchPromises);

    // GNews API
    if (process.env.NEWS_API_KEY) {
      const queries = [
        'travel North America', 
        'travel Europe', 
        'travel Asia', 
        'travel Africa', 
        'travel South America', 
        'travel Middle East', 
        'travel Oceania',
        'flights airlines', 
        'tourism destinations', 
        'hotels resorts', 
        'cruises'
      ];
      for (const q of queries) {
        try {
          const gNewsRes = await axios.get(`https://gnews.io/api/v4/search?q=${q}&token=${process.env.NEWS_API_KEY}&lang=en&max=20`);
          const gNewsArticles = gNewsRes.data.articles.map(item => ({
            title: item.title,
            url: item.url,
            description: item.description,
            source: item.source.name,
            category: q.includes('flight') ? 'flights' : q.includes('hotel') ? 'hotels' : q.includes('cruise') ? 'cruises' : 'travel-news',
            region: detectRegion(item.title, item.description),
            image: item.image || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/400`,
            publishedAt: new Date(item.publishedAt).toISOString(),
            trending: Math.random() > 0.8
          }));

          await saveArticles(gNewsArticles);
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
