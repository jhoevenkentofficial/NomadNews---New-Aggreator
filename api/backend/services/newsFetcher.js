const axios = require('axios');
const Parser = require('rss-parser');
const { client } = require('../data/turso');
const parser = new Parser();

const fetchAndSaveNews = async () => {
  try {
    const feeds = [
      // North America
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world', region: 'North America' },
      { url: 'http://rss.cnn.com/rss/edition.rss', category: 'world', region: 'North America' },
      { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', category: 'world', region: 'North America' },
      { url: 'https://www.cbc.ca/cmlink/rss-topstories', category: 'world', region: 'North America' },

      // Central America
      { url: 'https://www.newsamericasnow.com/feed/', category: 'world', region: 'Central America' },
      { url: 'https://latinamericareports.com/feed/', category: 'world', region: 'Central America' },
      { url: 'https://elsalvadorinfo.net/feed/', category: 'world', region: 'Central America' },
      { url: 'https://costaricanewssite.com/feed/', category: 'world', region: 'Central America' },

      // Caribbean
      { url: 'https://caribbeannewsglobal.com/feed/', category: 'world', region: 'Caribbean' },
      { url: 'https://www.stvincenttimes.com/feed/', category: 'world', region: 'Caribbean' },
      { url: 'https://antiguaobserver.com/feed/', category: 'world', region: 'Caribbean' },
      { url: 'https://caribbean.loopnews.com/rss-feed', category: 'world', region: 'Caribbean' },

      // South America
      { url: 'https://en.mercopress.com/rss/', category: 'world', region: 'South America' },
      { url: 'https://www.batimes.com.ar/feed/', category: 'world', region: 'South America' },
      { url: 'https://thecitypaperbogota.com/feed/', category: 'world', region: 'South America' },

      // U.K. & Ireland
      { url: 'https://www.independent.co.uk/news/uk/rss', category: 'world', region: 'U.K. & Ireland' },
      { url: 'https://www.irishtimes.com/arc/outboundfeeds/rss/?outputType=xml', category: 'world', region: 'U.K. & Ireland' },
      { url: 'http://feeds.bbci.co.uk/news/uk/rss.xml', category: 'world', region: 'U.K. & Ireland' },

      // Western Europe
      { url: 'http://feeds.bbci.co.uk/news/world/europe/rss.xml', category: 'world', region: 'Western Europe' },
      { url: 'https://www.france24.com/en/europe/rss', category: 'world', region: 'Western Europe' },
      { url: 'https://rss.dw.com/rdf/rss-en-eu', category: 'world', region: 'Western Europe' },
      { url: 'https://www.theguardian.com/europe/rss', category: 'world', region: 'Western Europe' },

      // Eastern Europe
      { url: 'https://kyivindependent.com/feed', category: 'world', region: 'Eastern Europe' },
      { url: 'https://neweasterneurope.eu/feed/', category: 'world', region: 'Eastern Europe' },
      { url: 'https://balkaninsight.com/feed/', category: 'world', region: 'Eastern Europe' },

      // East Asia
      { url: 'https://www.scmp.com/rss/91/feed', category: 'world', region: 'East Asia' },
      { url: 'https://www.japantimes.co.jp/feed/', category: 'world', region: 'East Asia' },
      { url: 'https://www.koreatimes.co.kr/www/rss/world.xml', category: 'world', region: 'East Asia' },
      { url: 'https://en.yna.co.kr/RSS/news.xml', category: 'world', region: 'East Asia' },

      // Southeast Asia
      { url: 'https://www.bangkokpost.com/rss/data/topstories.xml', category: 'world', region: 'Southeast Asia' },
      { url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', category: 'world', region: 'Southeast Asia' },
      { url: 'https://www.inquirer.net/fullfeed', category: 'world', region: 'Southeast Asia' },
      { url: 'https://www.thestar.com.my/rss/news', category: 'world', region: 'Southeast Asia' },

      // South Asia
      { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', category: 'world', region: 'South Asia' },
      { url: 'https://www.thehindu.com/news/feeder/default.rss', category: 'world', region: 'South Asia' },
      { url: 'https://www.dawn.com/feeds/home/', category: 'world', region: 'South Asia' },

      // Central Asia
      { url: 'https://akipress.com/rss/', category: 'world', region: 'Central Asia' },
      { url: 'https://timesca.com/feed/', category: 'world', region: 'Central Asia' },
      { url: 'https://centralasia.media/rss', category: 'world', region: 'Central Asia' },

      // Africa
      { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', category: 'world', region: 'Africa' },
      { url: 'http://feeds.bbci.co.uk/news/world/africa/rss.xml', category: 'world', region: 'Africa' },
      { url: 'https://mg.co.za/rss.xml', category: 'world', region: 'Africa' },
      { url: 'https://www.independent.co.ug/feed/', category: 'world', region: 'Africa' },

      // Middle East
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world', region: 'Middle East' },
      { url: 'http://feeds.bbci.co.uk/news/world/middle_east/rss.xml', category: 'world', region: 'Middle East' },
      { url: 'https://www.timesofisrael.com/feed/', category: 'world', region: 'Middle East' },

      // Oceania
      { url: 'https://www.abc.net.au/news/feed/51120/rss.xml', category: 'world', region: 'Oceania' },
      { url: 'https://www.smh.com.au/rss/feed.xml', category: 'world', region: 'Oceania' },
      { url: 'https://www.rnz.co.nz/rss/news.xml', category: 'world', region: 'Oceania' },
      { url: 'https://www.nzherald.co.nz/rss', category: 'world', region: 'Oceania' },
      
      // Thailand Specific (Requested by user)
      { url: 'https://www.bangkokpost.com/rss/data/topstories.xml', category: 'thailand', region: 'Southeast Asia' },
      { url: 'https://www.thaiexaminer.com/feed/', category: 'thailand', region: 'Southeast Asia' },
      { url: 'https://thethaiger.com/feed', category: 'thailand', region: 'Southeast Asia' },
      
      // Business
      { url: 'https://skift.com/feed/', category: 'Business', region: 'Global' },
      { url: 'https://www.economist.com/business/rss.xml', category: 'Business', region: 'Global' },
      
      // Travel & Lifestyle
      { url: 'https://www.travelpulse.com/rss/news.rss', category: 'Travel', region: 'Global' },
      { url: 'https://www.cntraveler.com/feed/rss', category: 'Travel', region: 'Global' },
      { url: 'https://www.wired.com/feed/rss', category: 'Lifestyle', region: 'Global' },
      
      { url: 'https://www.theguardian.com/commentisfree/rss', category: 'Opinion', region: 'Global' },
      
      // Flights & Aviation
      { url: 'https://simpleflying.com/feed/', category: 'flights', region: 'Global' },

      // Video (Requested by user)
      { url: 'http://feeds.bbci.co.uk/news/video_and_audio/news_front_page/rss.xml', category: 'video', region: 'Global' },
      { url: 'http://feeds.bbci.co.uk/news/video_and_audio/world/rss.xml', category: 'video', region: 'Global' },
      { url: 'https://www.france24.com/en/rss', category: 'video', region: 'Global' }
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
      const queries = ['travel', 'technology', 'world', 'business', 'thailand'];
      for (const q of queries) {
        try {
          const gNewsRes = await axios.get(`https://gnews.io/api/v4/search?q=${q}&token=${process.env.NEWS_API_KEY}&lang=en&max=20`);
          const gNewsArticles = gNewsRes.data.articles.map(item => ({
            title: item.title,
            url: item.url,
            description: item.description,
            source: item.source.name,
            category: q.toLowerCase(),
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
