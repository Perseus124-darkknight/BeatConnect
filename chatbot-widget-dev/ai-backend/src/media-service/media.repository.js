import db from '../shared/db.pool.js';

/**
 * Get a list of all structured artist names in the database.
 */
export async function getArtists() {
  try {
    const [artists] = await db.query("SELECT name FROM artists WHERE is_deleted = 0 ORDER BY name ASC");

    return artists.map(a => a.name);
  } catch (err) {
    console.error('DB getArtists error:', err);
    return [];
  }
}

/**
 * Get the structured profile and discography for a specific artist.
 */
export async function getArtistDetails(artistName) {
  try {
    // 1. Fetch Artist Profile (Ensuring it's not deleted)
    const [artistRows] = await db.query('SELECT * FROM artists WHERE name = ? AND is_deleted = 0', [artistName]);

    if (artistRows.length === 0) return null;
    const artist = artistRows[0];

    // 2. Fetch Albums & Tracks (Joined)
    const [discography] = await db.query(`
      SELECT 
        al.id as album_id, al.title as album_title, al.type as album_type, 
        al.release_date, al.cover_image, al.itunes_id, al.copyright,
        tr.id as track_id, tr.title as track_title, tr.track_number, tr.duration_seconds
      FROM albums al
      LEFT JOIN tracks tr ON al.id = tr.album_id
      WHERE al.artist_id = ?
      ORDER BY al.release_date DESC, tr.track_number ASC
    `, [artist.id]);

    // Format the response to be a structured artist object with a discography array
    const albumsMap = {};
    discography.forEach(row => {
      if (!albumsMap[row.album_id]) {
        albumsMap[row.album_id] = {
          id: row.album_id,
          title: row.album_title,
          type: row.album_type,
          release_date: row.release_date,
          cover_image: row.cover_image,
          itunes_id: row.itunes_id,
          copyright: row.copyright,
          tracks: []
        };
      }
      if (row.track_id) {
        albumsMap[row.album_id].tracks.push({
          id: row.track_id,
          title: row.track_title,
          number: row.track_number,
          duration: row.duration_seconds
        });
      }
    });

    // 3. Fetch Related Knowledge Items (Legacy Content: Members, Tours, Achievements)
    const [knowledgeItems] = await db.query(
      "SELECT category, title, content, hero_image FROM knowledge_items WHERE title LIKE ?",
      [`%${artistName}%`]
    );

    return {
      ...artist,
      discography: Object.values(albumsMap),
      knowledgeItems
    };

  } catch (err) {
    console.error('DB getArtistDetails error:', err);
    return null;
  }
}
