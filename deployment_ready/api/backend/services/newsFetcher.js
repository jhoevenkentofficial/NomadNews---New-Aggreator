const Parser = require('rss-parser');
const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
});
const axios = require('axios');
const cheerio = require('cheerio');
const { client } = require('../data/turso');

/**
 * Attempt to scrape the full article content from a URL
 */
const scrapeFullContent = async (url) => {
    if (!url) return '';
    try {
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            timeout: 10000
        });
        const $ = cheerio.load(res.data);
        
        // Remove known noisy elements
        $('script, style, nav, footer, header, aside, iframe, form, button, .ad-container, .social-share, .newsletter, .promo, .related, .tags, .comments').remove();
        
        // Remove empty tags
        $('div, p, section, article').each((i, el) => {
            if ($(el).text().trim().length === 0 && $(el).find('img').length === 0) {
                $(el).remove();
            }
        });

        // Common article selectors
        const selectors = [
            'article', 'main', '.article-content', '.article-body', '.post-content', '.entry-content', '.story-body'
        ];

        let content = '';
        for (const selector of selectors) {
            const found = $(selector).first();
            if (found.length > 0) {
                content = found.html();
                if (found.text().length > 300) break;
            }
        }

        if (!content || content.length < 300) {
            // Fallback: Take all P tags
            content = '';
            $('p').each((i, el) => {
                if ($(el).text().length > 50) {
                    content += `<p>${$(el).html()}</p>`;
                }
            });
        }

        // Final Clean up
        if (content) {
            content = content.replace(/on\w+="[^"]*"/gi, ''); // Remove inline events
            content = content.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1'); // Strip links
            content = content.replace(/<p>\s*<\/p>/gi, ''); // Remove empty paragraphs
            content = content.replace(/<div\b[^>]*>\s*<\/div>/gi, ''); // Remove empty divs
        }

        return content || '';
    } catch (e) {
        return '';
    }
};

const fetchAndSaveNews = async () => {
  try {
    const feeds = [
      { url: 'https://skift.com/feed/', category: 'Travel News', region: 'Global' },
      { url: 'https://www.cntraveler.com/feed/rss', category: 'Popular Destinations', region: 'Global' },
      { url: 'https://www.travelweekly.co.uk/rss/news', category: 'Travel News', region: 'Europe' },
      { url: 'https://www.travelnewsasia.com/travelnews.xml', category: 'Travel News', region: 'Asia' },
      { url: 'https://thethaiger.com/category/travel/feed', category: 'Popular Destinations', region: 'Asia' },
      { url: 'https://ttgasia.com/feed/', category: 'Travel News', region: 'Asia' },
      { url: 'https://www.travelpulse.com/rss/news.rss', category: 'Travel News', region: 'North America' },
      { url: 'https://www.caribbeanjournal.com/feed/', category: 'Travel News', region: 'South America' },
      { url: 'https://www.tourismupdate.co.za/rss.xml', category: 'Travel News', region: 'Africa' },
      { url: 'https://www.hoteliermiddleeast.com/feed', category: 'Hotels', region: 'Middle East' },
      { url: 'https://www.travelweekly.com.au/feed/', category: 'Travel News', region: 'Oceania' },
      { url: 'https://simpleflying.com/feed/', category: 'Airport News', region: 'Global' },
      { url: 'https://www.hotelmanagement.net/rss.xml', category: 'Hotels', region: 'Global' }
    ];

    const regionKeywords = {
      'North America': ['USA', 'United States', 'Canada', 'Mexico', 'NY', 'California', 'Florida', 'Toronto', 'Vancouver', 'Los Angeles', 'Las Vegas', 'San Francisco', 'Miami', 'Orlando', 'Chicago', 'Montreal', 'Mexico City', 'Cancun', 'Havana', 'Panama City'],
      'South America': ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Caribbean', 'Jamaica', 'Bahamas', 'Latin America', 'Lima', 'Cusco', 'Rio de Janeiro', 'Sao Paulo', 'Buenos Aires', 'Santiago', 'Bogota', 'Cartagena'],
      'Europe': ['UK', 'London', 'France', 'Paris', 'Germany', 'Italy', 'Spain', 'Europe', 'Greece', 'Amsterdam', 'Berlin', 'Vienna', 'Prague', 'Budapest', 'Lisbon', 'Athens', 'Milan', 'Florence', 'Venice', 'Munich', 'Copenhagen', 'Stockholm', 'Dublin', 'Edinburgh', 'Brussels', 'Zurich', 'Geneva', 'Oslo', 'Helsinki', 'Reykjavik', 'Moscow', 'St. Petersburg', 'Warsaw', 'Krakow', 'Tallinn', 'Riga'],
      'Asia': ['China', 'Japan', 'Korea', 'Thailand', 'Vietnam', 'Singapore', 'India', 'Bali', 'Tokyo', 'Bangkok', 'Asia', 'South Asia', 'Southeast Asia', 'Phuket', 'Chiang Mai', 'Manila', 'Cebu', 'Phnom Penh', 'Siem Reap', 'Yangon', 'Colombo', 'Male', 'Kathmandu'],
      'Middle East': ['Dubai', 'UAE', 'Saudi', 'Qatar', 'Israel', 'Turkey', 'Jordan', 'Egypt', 'Middle East', 'Kuwait', 'Bahrain', 'Abu Dhabi', 'Tel Aviv', 'Jerusalem', 'Doha', 'Mecca'],
      'Africa': ['Africa', 'South Africa', 'Kenya', 'Morocco', 'Nigeria', 'Tanzania', 'Nairobi', 'Cairo', 'Cape Town', 'Johannesburg', 'Marrakech', 'Luxor', 'Zanzibar City', 'Addis Ababa'],
      'Oceania': ['Australia', 'Sydney', 'New Zealand', 'Fiji', 'Pacific', 'Melbourne', 'Auckland', 'Oceania', 'Brisbane', 'Queenstown']
    };

    const majorCities = [
      'Paris', 'London', 'Bangkok', 'Dubai', 'Singapore', 'New York City', 'Istanbul', 'Tokyo', 'Kuala Lumpur', 'Hong Kong',
      'Rome', 'Barcelona', 'Amsterdam', 'Madrid', 'Berlin', 'Vienna', 'Prague', 'Budapest', 'Lisbon', 'Athens', 'Milan',
      'Florence', 'Venice', 'Munich', 'Copenhagen', 'Stockholm', 'Dublin', 'Edinburgh', 'Brussels', 'Zurich', 'Geneva',
      'Oslo', 'Helsinki', 'Reykjavik', 'Moscow', 'St. Petersburg', 'Warsaw', 'Krakow', 'Tallinn', 'Riga', 'Beijing',
      'Shanghai', 'Seoul', 'Osaka', 'Kyoto', 'Taipei', 'Hanoi', 'Ho Chi Minh City', 'Bali', 'Jakarta', 'Phuket',
      'Chiang Mai', 'Manila', 'Cebu', 'Phnom Penh', 'Siem Reap', 'Yangon', 'Colombo', 'Male', 'Kathmandu', 'Sydney',
      'Melbourne', 'Brisbane', 'Auckland', 'Queenstown', 'Los Angeles', 'Las Vegas', 'San Francisco', 'Miami', 'Orlando',
      'Chicago', 'Toronto', 'Vancouver', 'Montreal', 'Mexico City', 'Cancun', 'Havana', 'San Jose', 'Panama City', 'Lima',
      'Cusco', 'Rio de Janeiro', 'Sao Paulo', 'Buenos Aires', 'Santiago', 'Bogota', 'Cartagena', 'Cape Town', 'Johannesburg',
      'Marrakech', 'Cairo', 'Luxor', 'Nairobi', 'Zanzibar City', 'Addis Ababa', 'Tel Aviv', 'Jerusalem', 'Doha', 'Abu Dhabi', 'Mecca'
    ];

    const detectRegion = (title, desc) => {
      const text = `${title} ${desc}`.toLowerCase();
      for (const [region, keywords] of Object.entries(regionKeywords)) {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
          return region;
        }
      }
      return 'Global';
    };

    const detectCity = (title, desc) => {
      const text = `${title} ${desc}`.toLowerCase();
      return majorCities.find(city => text.includes(city.toLowerCase())) || null;
    };

    const detectCategory = (title, desc, current) => {
      const text = `${title} ${desc}`.toLowerCase();
      if (text.includes('airport') || text.includes('terminal') || text.includes('aviation')) return 'Airport News';
      if (text.includes('breaking') || text.includes('urgent') || text.includes('explosion') || text.includes('attack') || text.includes('war')) return 'Breaking News';
      return current;
    };

    const extractMultiParagraphDescription = (content) => {
        if (!content) return '';
        const $ = cheerio.load(content);
        const paragraphs = [];
        $('p').each((i, el) => {
            if (paragraphs.length < 3) {
                const text = $(el).text().trim();
                if (text.length > 60) {
                    paragraphs.push(text);
                }
            }
        });
        
        if (paragraphs.length > 0) {
            return paragraphs.join('\n\n');
        }
        
        // Fallback: if no P tags, take a chunk of text
        const text = $.text().trim();
        return text.substring(0, 500).trim() + '...';
    };

    const saveArticles = async (articles) => {
        let savedCount = 0;
        for (const article of articles) {
            try {
                const existing = await client.execute({
                    sql: 'SELECT id FROM articles WHERE url = ?',
                    args: [article.url]
                });

                if (existing.rows.length === 0) {
                    // Scrape full content if description is short or missing
                    if (!article.content || article.content.length < 300) {
                        article.content = await scrapeFullContent(article.url);
                    }

                    // Update description to be 2-3 paragraphs from the content
                    if (article.content && article.content.length > 300) {
                        const longDesc = extractMultiParagraphDescription(article.content);
                        if (longDesc) {
                            article.description = longDesc;
                        }
                    }

                    await client.execute({
                        sql: `INSERT INTO articles (title, url, description, content, source, category, region, image, published_at, trending, author, city, is_breaking)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        args: [
                            article.title, 
                            article.url, 
                            article.description, 
                            article.content || '',
                            article.source, 
                            article.category, 
                            article.region, 
                            article.image, 
                            article.publishedAt, 
                            article.trending ? 1 : 0,
                            article.author || '',
                            article.city || null,
                            article.isBreaking ? 1 : 0
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
          const author = item.creator || item.author || '';
          const category = detectCategory(title, description, feed.category);
          
          articles.push({
            title,
            url,
            description,
            content: item['content:encoded'] || item.content || '',
            source: feed.name || feed.url.split('/')[2] || 'News Source',
            category: category,
            region: feed.region || detectRegion(title, description),
            image: item.enclosure?.url || item.media?.[0]?.url || `https://picsum.photos/seed/${encodeURIComponent(title)}/800/400`,
            publishedAt: pubDate.toISOString(),
            trending: false,
            author,
            city: detectCity(title, description),
            isBreaking: category === 'Breaking News'
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
      const queries = ['travel news', 'breaking news', 'airport aviation', 'tourism destinations', 'world major cities'];
      for (const q of queries) {
        try {
          const gNewsRes = await axios.get(`https://gnews.io/api/v4/search?q=${q}&token=${process.env.NEWS_API_KEY}&lang=en&max=20`);
          const gNewsArticles = gNewsRes.data.articles.map(item => {
            const category = detectCategory(item.title, item.description, q.includes('airport') ? 'Airport News' : q.includes('breaking') ? 'Breaking News' : 'Travel News');
            return {
              title: item.title,
              url: item.url,
              description: item.description,
              source: item.source.name,
              category: category,
              region: detectRegion(item.title, item.description),
              image: item.image || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/400`,
              publishedAt: new Date(item.publishedAt).toISOString(),
              trending: Math.random() > 0.9,
              author: item.source.name,
              city: detectCity(item.title, item.description),
              isBreaking: category === 'Breaking News',
              content: item.content || ''
            };
          });
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

