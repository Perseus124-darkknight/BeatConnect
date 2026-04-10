import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Ben061024@',
    database: process.env.DB_NAME || 'BeatConnect'
  });

  try {
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables in BeatConnect:', rows);
    
    if (rows.some(row => Object.values(row).includes('artists'))) {
      console.log('SUCCESS: artists table exists!');
      const [artistCount] = await connection.query('SELECT COUNT(*) as count FROM artists');
      console.log('Artist count:', artistCount[0].count);
    } else {
      console.log('FAILURE: artists table NOT found.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

testConnection();
