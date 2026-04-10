import db from './src/shared/db.pool.js';

async function test() {
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM knowledge_items');
    console.log('Knowledge items count:', rows[0].count);
    
    const [artists] = await db.execute('SELECT title, category FROM knowledge_items WHERE category = "band" OR category = "artist"');
    console.log('Artists found:', artists.length);
    if (artists.length > 0) {
      console.log('First artist:', artists[0]);
    }
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    process.exit();
  }
}

test();
