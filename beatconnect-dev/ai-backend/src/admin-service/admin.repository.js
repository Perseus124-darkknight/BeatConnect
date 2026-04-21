import db from '../config/db.pool.js';

/**
 * Update an artist's configuration (persona, theme, etc.)
 */
export async function updateArtistConfig(artistId, personaPrompt, themeConfig) {
  try {
    await db.execute(
      'UPDATE artists SET persona_prompt = ?, theme_config = ? WHERE id = ?',
      [personaPrompt, JSON.stringify(themeConfig), artistId]
    );
    return true;
  } catch (err) {
    console.error('updateArtistConfig error:', err);
    throw err;
  }
}

/**
 * Get detailed analytics for songs and play counts
 */
export async function getDetailedArtistAnalytics() {
  try {
    // Top played songs from analytics_events
    const [topSongs] = await db.query(`
      SELECT value as song_name, COUNT(*) as play_count 
      FROM analytics_events 
      WHERE event_type = "vinyl_player_clicked" 
      GROUP BY value 
      ORDER BY play_count DESC 
      LIMIT 10
    `);

    // Top favorited artists
    const [topArtists] = await db.query(`
      SELECT a.name, COUNT(f.id) as fav_count
      FROM artists a
      LEFT JOIN user_favorites f ON a.id = f.entity_id AND f.entity_type = "artist"
      GROUP BY a.id
      ORDER BY fav_count DESC
      LIMIT 5
    `);

    return { topSongs, topArtists };
  } catch (err) {
    console.error('getDetailedArtistAnalytics error:', err);
    return { topSongs: [], topArtists: [] };
  }
}

export async function saveArtist(artistData) {
  const { id, name, bio, members, featured_album, genres, profile_image, persona_prompt, custom_nudge_message, achievements, tours, songs, featured_opinions, knowledge_injection, social_links } = artistData;
  try {
    let artistId = id;
    if (artistId) {
      await db.execute(
        'UPDATE artists SET name=?, bio=?, specialized_genres=?, profile_image=?, persona_prompt=?, custom_nudge_message=?, social_links=?, featured_album=? WHERE id=?',
        [name, bio, JSON.stringify(genres || []), profile_image, persona_prompt, custom_nudge_message, JSON.stringify(social_links || []), featured_album || null, artistId]
      );
    } else {
      const [res] = await db.execute(
        'INSERT INTO artists (name, bio, specialized_genres, profile_image, persona_prompt, custom_nudge_message, social_links, featured_album) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, bio, JSON.stringify(genres || []), profile_image, persona_prompt, custom_nudge_message, JSON.stringify(social_links || []), featured_album || null]
      );
      artistId = res.insertId;
    }


    // Update Knowledge Items for the 5 categories + Injection
    const knowledgeMap = [
      { cat: 'achievements', title: `${name} Achievements`, content: achievements },
      { cat: 'tours', title: `${name} Tours`, content: tours },
      { cat: 'songs', title: `${name} Popular Songs`, content: songs },
      { cat: 'featured_opinions', title: `${name} Opinions`, content: featured_opinions },
      { cat: 'backstory', title: `${name} Injection`, content: knowledge_injection }
    ];


    for (const item of knowledgeMap) {
      // First, clear existing ones to prevent duplicates
      await db.execute('DELETE FROM knowledge_items WHERE (category = ? AND title = ?) OR (category = ? AND title LIKE ?)', 
        [item.cat, item.title, item.cat, `%${name}%`]);
      
      if (item.content && item.content.trim()) {
        await db.execute('INSERT INTO knowledge_items (category, title, content) VALUES (?, ?, ?)', 
          [item.cat, item.title, item.content]);
      }
    }

    return artistId;
  } catch (err) {
    console.error('saveArtist error:', err);
    throw err;
  }
}


/**
 * Get all artists for administrative roster
 */
export async function getAllArtists() {
  try {
    const [rows] = await db.query('SELECT id, name, bio, specialized_genres, profile_image, persona_prompt, custom_nudge_message, social_links, is_deleted, created_at FROM artists ORDER BY name ASC');
    return rows;
  } catch (err) {
    console.error('getAllArtists error:', err);
    throw err;
  }
}

/**
 * Soft delete an artist by ID
 */
export async function deleteArtist(id) {
  try {
    const [res] = await db.execute('UPDATE artists SET is_deleted = 1 WHERE id = ?', [id]);
    return res.affectedRows > 0;
  } catch (err) {
    console.error('deleteArtist error:', err);
    throw err;
  }
}

/**
 * Restore a soft-deleted artist
 */
export async function restoreArtist(id) {
  try {
    const [res] = await db.execute('UPDATE artists SET is_deleted = 0 WHERE id = ?', [id]);
    return res.affectedRows > 0;
  } catch (err) {
    console.error('restoreArtist error:', err);
    throw err;
  }
}

/**
 * Get all users for administrative system users roster
 */
export async function getSystemUsers() {
  try {
    const [rows] = await db.query('SELECT id, username, role, is_pro, created_at FROM users ORDER BY created_at DESC');
    return rows;
  } catch (err) {
    console.error('getSystemUsers error:', err);
    throw err;
  }
}

/**
 * Hard delete a system user by ID
 */
export async function deleteSystemUser(id) {
  try {
    // Also delete their favorites and messages optionally, or let cascading foreign keys if they exist handle it.
    // Explicit manual cleanup for safety on core user records.
    await db.execute('DELETE FROM user_favorites WHERE user_id = ?', [id]);
    const [res] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return res.affectedRows > 0;
  } catch (err) {
    console.error('deleteSystemUser error:', err);
    throw err;
  }
}


