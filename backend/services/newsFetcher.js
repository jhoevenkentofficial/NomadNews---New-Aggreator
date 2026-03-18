const axios = require('axios');
const Parser = require('rss-parser');
const Article = require('../models/Article');

const rssParser = new Parser();

const REGION_KEYWORDS = {
  'North America': ['usa', 'united states', 'canada', 'mexico', 'new york', 'california', 'toronto'],
  'Central America': ['costa rica', 'panama', 'belize', 'guatemala', 'honduras', 'el salvador', 'nicaragua'],
  'Caribbean': ['bahamas', 'jamaica', 'cuba', 'puerto rico', 'dominican republic', 'barbados'],
  'South America': ['brazil', 'argentina', 'colombia', 'peru', 'chile', 'ecuador', 'venezuela', 'patagonia'],
  'U.K. & Ireland': ['uk', 'united kingdom', 'england', 'scotland', 'wales', 'ireland', 'london', 'dublin'],
  'Western Europe': ['france', 'germany', 'italy', 'spain', 'portugal', 'netherlands', 'belgium', 'switzerland', 'paris', 'rome', 'berlin'],
  'Eastern Europe': ['poland', 'czech', 'hungary', 'romania', 'bulgaria', 'ukraine', 'russia', 'prague', 'budapest'],
  'Africa': ['egypt', 'south africa', 'morocco', 'kenya', 'nigeria', 'tanzania', 'ethiopia', 'cairo', 'cape town'],
  'Middle East': ['uae', 'dubai', 'saudi arabia', 'israel', 'qatar', 'turkey', 'iran', 'jordan'],
  'Central Asia': ['kazakhstan', 'uzbekistan', 'kyrgyzstan', 'tajikistan', 'turkmenistan'],
  'East Asia': ['china', 'japan', 'south korea', 'taiwan', 'hong kong', 'tokyo', 'beijing', 'seoul'],
  'South Asia': ['india', 'pakistan', 'bangladesh', 'sri lanka', 'nepal', 'maldives', 'mumbai', 'delhi'],
  'Southeast Asia': ['thailand', 'vietnam', 'indonesia', 'malaysia', 'singapore', 'philippines', 'bali', 'bangkok'],
  'Oceania': ['australia', 'new zealand', 'fiji', 'sydney', 'melbourne', 'auckland'],
  'Antarctica': ['antarctica', 'south pole']
};

const CATEGORY_KEYWORDS = {
  'Flights': ['airline', 'flight', 'airport', 'boeing', 'airbus', 'pilot', 'carrier', 'aviation', 'dxb', 'sky', 'cabin'],
  'Thailand': ['thailand', 'bangkok', 'phuket', 'chiang mai', 'pattaya', 'koh samui'],
  'Business': ['business', 'economy', 'market', 'industry', 'investment', 'merger', 'acquisition'],
  'Lifestyle': ['lifestyle', 'food', 'culture', 'fashion', 'design', 'art', 'festival'],
  'Opinion': ['opinion', 'column', 'perspective', 'viewpoint', 'editorial'],
  'Video': ['video', 'watch', 'vlog', 'documentary', 'short film'],
  'World': ['world', 'global', 'international', 'un', 'cross-border'],
  'Travel': ['resort', 'beach', 'hotel', 'museum', 'landmark', 'island', 'city guide', 'tourist attraction', 'vacation', 'trip']
};

const RSS_FEEDS = [
  'http://rss.cnn.com/rss/edition_travel.rss',
  'https://feeds.feedburner.com/boardingarea',
  'https://www.travelweekly.com/RSS/Travel-News',
  'https://skift.com/feed/'
];

const SEARCH_KEYWORDS = ['travel news', 'hidden gems', 'tourism guide', 'local food culture', 'flight deals', 'airline industry'];

function determineRegion(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) return region;
    }
  }
  return 'Global';
}

function determineCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('flight') || text.includes('airline') || text.includes('aviation') || 
      text.includes('airport') || text.includes('boeing') || text.includes('airbus')) {
    return 'Flights';
  }
  
  // Strong Thailand keywords
  if (text.includes('thailand news') || text.includes('bangkok post') || 
      (text.includes('thailand') && (text.includes('government') || text.includes('pattaya') || text.includes('chiang mai')))) {
    return 'Thailand';
  }

  if (text.includes('business') || text.includes('economy') || text.includes('market') || text.includes('industry') || text.includes('investment')) return 'Business';
  if (text.includes('lifestyle') || text.includes('food') || text.includes('culinary') || text.includes('fashion') || text.includes('wellness')) return 'Lifestyle';
  if (text.includes('opinion') || text.includes('column') || text.includes('perspective') || text.includes('editorial')) return 'Opinion';
  if (text.includes('video') || text.includes('watch') || text.includes('vlog')) return 'Video';
  
  // If it's about a specific foreign city/region and not travel-focused, it's 'World'
  if (text.includes('world') || text.includes('global') || text.includes('international') || 
      text.includes('un ') || text.includes('summit')) return 'World';
  
  return 'Travel'; // Default for travel aggregator
}

let isFetching = false;

async function fetchAndSaveRSS(io) {
  console.log(`[RSS Fetcher] Starting RSS aggregation for ${RSS_FEEDS.length} feeds.`);
  let rssSaved = 0;

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      
        for (const item of feed.items) {
          const exists = await Article.findOne({ 
            $or: [
              { url: item.link },
              { title: { $regex: new RegExp(`^${item.title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
            ]
          });

          // Secondary check: similar slug or already contains title
          if (!exists) {
            const category = determineCategory(item.title, item.contentSnippet || '');
            const region = determineRegion(item.title, item.contentSnippet || '');
            
            const newArticle = new Article({
              title: item.title,
              description: item.contentSnippet || '',
              content: item.content || item.contentSnippet || '',
              url: item.link,
              image: item.enclosure?.url || `https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=800&auto=format&fit=crop&sig=${Math.random()}`,
              publishedAt: new Date(item.pubDate || new Date()).toISOString(),
              source: { name: feed.title || 'RSS Source', url: feed.link || feedUrl },
              region,
              category,
              trending: Math.random() > 0.9,
              trendingScore: Math.floor(Math.random() * 100),
            });
            
            const saved = await newArticle.save();
            rssSaved++;
            if (io) io.emit('new-article', saved);
          }
        }
    } catch (error) {
      console.error(`[RSS Error] Failed to fetch ${feedUrl}:`, error.message);
    }
  }
  console.log(`[RSS Fetcher] Complete. Saved ${rssSaved} new unique RSS articles.`);
  return rssSaved;
}

async function fetchAndSaveNews(io) {
  if (isFetching) return;
  isFetching = true;

  const apiKey = process.env.NEWS_API_KEY;
  if (apiKey && apiKey !== 'your_news_api_key_here') {
    const regions = Object.keys(REGION_KEYWORDS);
    console.log(`[GNews Fetcher] Starting search aggregation for ${regions.length} regions.`);

    for (const regionName of regions) {
      for (const keyword of SEARCH_KEYWORDS) {
        try {
          const cleanRegion = regionName.replace(/&/g, '').replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
          const query = encodeURIComponent(`${cleanRegion} ${keyword}`);
          const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&apikey=${apiKey}`;
          
          const response = await axios.get(url, { timeout: 15000 });
          const articles = response.data.articles || [];
          
          for (const articleData of articles) {
            const exists = await Article.findOne({ 
              $or: [
                { url: articleData.url },
                { title: { $regex: new RegExp(`^${articleData.title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
              ]
            });
            
            if (!exists) {
              const category = determineCategory(articleData.title, articleData.description);
              const region = determineRegion(articleData.title, articleData.description);
              const newArticle = new Article({
                title: articleData.title,
                description: articleData.description,
                content: articleData.content,
                url: articleData.url,
                image: articleData.image + `?sig=${Math.random()}`,
                publishedAt: new Date(articleData.publishedAt).toISOString(),
                source: { name: articleData.source.name, url: articleData.source.url },
                region: region || regionName,
                category,
                trending: Math.random() > 0.9,
                trendingScore: Math.floor(Math.random() * 100),
              });
              await newArticle.save();
            }
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          if (error.response && (error.response.status === 403 || error.response.status === 429)) {
            console.warn('[GNews] API Limit reached. Switching to RSS only.');
            break;
          }
        }
      }
    }
  }

  await fetchAndSaveRSS(io);

  isFetching = false;
  console.log(`[Fetcher] ALL SOURCES complete.`);
}

module.exports = { fetchAndSaveNews };
