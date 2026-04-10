import db from '../shared/db.pool.js';

export async function createUser(username, passwordHash) {
  try {
    const [result] = await db.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
    return result.insertId;
  } catch (err) {
    console.error('DB createUser error:', err);
    throw err;
  }
}

export async function getUserByUsername(username) {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      is_pro: !!rows[0].is_pro // Convert 0/1 to true/false
    };
  } catch (err) {
    console.error('DB getUserByUsername error:', err);
    return null;
  }
}

export async function getUserById(id) {
  try {
    const [rows] = await db.execute('SELECT id, username, bio, favorite_genre, theme, is_pro, spotify_id, created_at FROM users WHERE id = ?', [id]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      is_pro: !!rows[0].is_pro
    };
  } catch (err) {
    console.error('DB getUserById error:', err);
    return null;
  }
}

export async function updateUserProfile(id, { username, bio, favorite_genre, theme }) {
  try {
    const [result] = await db.execute(`
      UPDATE users 
      SET username = COALESCE(?, username),
          bio = COALESCE(?, bio), 
          favorite_genre = COALESCE(?, favorite_genre), 
          theme = COALESCE(?, theme)
      WHERE id = ?
    `, [username ?? null, bio ?? null, favorite_genre ?? null, theme ?? null, id]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error('DB updateUserProfile error:', err);
    return false;
  }
}

export async function updateUserPassword(username, newPasswordHash) {
  try {
    const [result] = await db.execute('UPDATE users SET password_hash = ? WHERE username = ?', [newPasswordHash, username]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error('DB updateUserPassword error:', err);
    throw err;
  }
}

export async function updateUserSubscription(id, isPro) {
  try {
    const [result] = await db.execute('UPDATE users SET is_pro = ? WHERE id = ?', [isPro ? 1 : 0, id]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error('DB updateUserSubscription error:', err);
    return false;
  }
}

export async function updateSpotifyTokens(id, { spotifyId, accessToken, refreshToken }) {
  try {
    const [result] = await db.execute(`
      UPDATE users 
      SET spotify_id = ?,
          spotify_access_token = ?,
          spotify_refresh_token = ?
      WHERE id = ?
    `, [spotifyId, accessToken, refreshToken, id]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error('DB updateSpotifyTokens error:', err);
    return false;
  }
}
