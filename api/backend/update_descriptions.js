const { client } = require('./data/turso');
const cheerio = require('cheerio');
require('dotenv').config();

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

async function updateDescriptions() {
    console.log("--- Starting Description Migration ---");
    
    try {
        // Find articles where description is short but content is available
        const result = await client.execute("SELECT id, description, content, title FROM articles WHERE length(description) < 200 AND length(content) > 300");
        
        console.log(`Found ${result.rows.length} articles to update.`);
        
        let count = 0;
        for (const row of result.rows) {
            const newDesc = extractMultiParagraphDescription(row.content);
            if (newDesc && newDesc !== row.description) {
                await client.execute({
                    sql: "UPDATE articles SET description = ? WHERE id = ?",
                    args: [newDesc, row.id]
                });
                count++;
                if (count % 10 === 0) {
                    process.stdout.write(`Updated ${count}/${result.rows.length} articles...\r`);
                }
            }
        }
        
        console.log(`\nMigration complete. Updated ${count} articles.`);
    } catch (error) {
        console.error("Migration failed:", error);
    }
    
    process.exit(0);
}

updateDescriptions();
