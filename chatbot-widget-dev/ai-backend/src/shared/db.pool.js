import mysql from 'mysql2/promise';

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = dbHost === 'db' ? 3306 : (parseInt(process.env.DB_PORT) || 3307);

const db = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Ben061024@',
  database: process.env.DB_NAME || 'BeatConnect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;
