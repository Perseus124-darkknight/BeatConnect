import mysql from 'mysql2/promise';

async function recreateDb() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Ben061024@',
    database: process.env.DB_NAME || 'BeatConnect'
  });

  console.log('Connected to MySQL. Recreating tables for structured architecture...');

  // Dropping tables in reverse order of dependencies
  await db.execute('DROP TABLE IF EXISTS artist_chat_history');
  await db.execute('DROP TABLE IF EXISTS user_ratings');
  await db.execute('DROP TABLE IF EXISTS user_favorites');
  await db.execute('DROP TABLE IF EXISTS user_posts');
  await db.execute('DROP TABLE IF EXISTS tracks');
  await db.execute('DROP TABLE IF EXISTS albums');
  await db.execute('DROP TABLE IF EXISTS artists');
  await db.execute('DROP TABLE IF EXISTS analytics_events');
  await db.execute('DROP TABLE IF EXISTS daily_reports');
  await db.execute('DROP TABLE IF EXISTS knowledge_items');
  await db.execute('DROP TABLE IF EXISTS users');

  // --- Foundation Tables ---
  await db.execute(`
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      bio TEXT,
      favorite_genre VARCHAR(255) DEFAULT 'Rock',
      theme VARCHAR(50) DEFAULT 'glass',
      is_pro TINYINT(1) DEFAULT 0,
      spotify_id VARCHAR(255),
      spotify_access_token TEXT,
      spotify_refresh_token TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE knowledge_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(50),
      title VARCHAR(255),
      content TEXT,
      embedding JSON,
      hero_image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // --- Artist & Discography Tables ---
  await db.execute(`
    CREATE TABLE artists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      bio TEXT,
      specialized_genres JSON,
      profile_image VARCHAR(255),
      social_links JSON,
      persona_prompt TEXT,
      custom_nudge_message VARCHAR(255),
      theme_config JSON,
      is_deleted TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )

  `);

  await db.execute(`
    CREATE TABLE albums (
      id INT AUTO_INCREMENT PRIMARY KEY,
      artist_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      type ENUM('album', 'single', 'ep') DEFAULT 'album',
      release_date DATE,
      cover_image VARCHAR(255),
      itunes_id VARCHAR(255),
      copyright TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE tracks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      album_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      duration_seconds INT,
      track_number INT,
      is_explicit TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    )
  `);

  // --- User Interaction Tables ---
  await db.execute(`
    CREATE TABLE user_favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      entity_type ENUM('artist', 'album', 'track') NOT NULL,
      entity_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_fav (user_id, entity_type, entity_id)
    )
  `);

  await db.execute(`
    CREATE TABLE user_ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      entity_type ENUM('artist', 'album', 'track') NOT NULL,
      entity_id INT NOT NULL,
      rating TINYINT UNSIGNED CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_rating (user_id, entity_type, entity_id)
    )
  `);

  await db.execute(`
    CREATE TABLE artist_chat_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      artist_id INT NOT NULL,
      message TEXT NOT NULL,
      role ENUM('user', 'assistant') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
    )
  `);

  // --- Legacy Support & Analytics ---
  await db.execute(`
    CREATE TABLE user_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      artist_name VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE daily_reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_date VARCHAR(15),
      front_page_title VARCHAR(255),
      front_page_content TEXT,
      history_title VARCHAR(255),
      history_content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE analytics_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_type VARCHAR(255) NOT NULL,
      value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Structured database successfully initialized with Artists, Albums, Tracks, Favorites, and Ratings.');
  await db.end();
}

recreateDb().catch(console.error);
