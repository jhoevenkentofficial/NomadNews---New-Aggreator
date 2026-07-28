const { createClient } = require('@libsql/client');
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');

const client = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

const scrapeFullContent = async (url) => {
    if (!url) return '';
    try {
        const res = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            },
            timeout: 15000,
            maxRedirects: 5
        });
        const $ = cheerio.load(res.data);
        
        // Remove noise
        $('script, style, nav, footer, header, aside, iframe, form, button, .ads, .social-share, .newsletter-signup').remove();

        const selectors = [
            'article', 
            'main', 
            '.article-content', 
            '.article-body', 
            '.post-content', 
            '.entry-content', 
            '.story-body', 
            '.td-post-content',
            '.article-text',
            '#article-body'
        ];
        
        let content = '';
        for (const selector of selectors) {
            const found = $(selector).first();
            if (found.length > 0) {
                // Remove some more potential noise inside the found container
                found.find('aside, .ad, .promo, .related').remove();
                content = found.html();
                if (found.text().trim().length > 400) break;
            }
        }
        
        // Fallback to paragraph extraction
        if (!content || $(content).text().trim().length < 300) {
            content = '';
            $('p').each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 60 && !/click here|follow us|copyright|read more/i.test(text)) {
                    content += `<p>${$(el).html()}</p>`;
                }
            });
        }
        
        if (content) {
            content = content.replace(/on\w+="[^"]*"/gi, '');
            content = content.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
            content = content.trim();
        }
        return content || '';
    } catch (e) {
        return '';
    }
};

async function repairLatest() {
    console.log("--- TTN CONTENT REPAIR START ---");
    console.log("Finding articles missing content...");
    
    // Attempt 500 articles in this run
    const result = await client.execute("SELECT id, url, title FROM articles WHERE (content IS NULL OR content = '' OR length(content) < 300) AND url LIKE 'http%' ORDER BY published_at DESC LIMIT 500");
    
    console.log(`Found ${result.rows.length} articles to repair.`);
    
    let success = 0;
    let failed = 0;
    
    for (const row of result.rows) {
        process.stdout.write(`Scraping [${success+failed+1}/${result.rows.length}]: ${row.title.substring(0, 40)}... `);
        const fullContent = await scrapeFullContent(row.url);
        
        if (fullContent && fullContent.length > 300) {
            await client.execute({
                sql: "UPDATE articles SET content = ? WHERE id = ?",
                args: [fullContent, row.id]
            });
            console.log("✅ FIXED (" + fullContent.length + " chars)");
            success++;
        } else {
            console.log("❌ FAILED");
            failed++;
        }
    }
    
    console.log(`\n--- REPAIR SUMMARY ---`);
    console.log(`Successfully fixed: ${success}`);
    console.log(`Failed to scrape: ${failed}`);
    console.log(`Remaining backlog: ~${5700 - success}`);
    process.exit(0);
}

repairLatest();
