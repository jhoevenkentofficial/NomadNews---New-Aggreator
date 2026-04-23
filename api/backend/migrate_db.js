const { createClient } = require('@libsql/client');

const url = 'libsql://nomad-news-randompro.aws-us-east-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQxMjI2NTQsImlkIjoiMDE5ZDExZjEtMGEwMS03ODcwLThkODMtZjIwMWNmNzExNzhiIiwicmlkIjoiNjlkZWNmNTEtZjg4Mi00OWVhLWE3ZmEtMTY5ZjAxMjQwOGU0In0.zCezOAqItpOP8SNTRJgPppO-SHz795-q_AAVpV_tgAZX2NVxHuJGRRilR0nvoXPztaM8tUSPw-udYgH69rI8Aw';

async function migrate() {
  const client = createClient({ url, authToken });
  
  console.log('Starting migration...');
  
  try {
    const columnsToAdd = [
      { name: 'author', type: 'TEXT' },
      { name: 'city', type: 'TEXT' },
      { name: 'is_breaking', type: 'BOOLEAN DEFAULT 0' },
      { name: 'posted_to_x', type: 'BOOLEAN DEFAULT 0' }
    ];

    for (const col of columnsToAdd) {
      try {
        await client.execute(`ALTER TABLE articles ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column: ${col.name}`);
      } catch (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`Column ${col.name} already exists.`);
        } else {
          console.error(`Error adding ${col.name}:`, err.message);
        }
      }
    }
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
