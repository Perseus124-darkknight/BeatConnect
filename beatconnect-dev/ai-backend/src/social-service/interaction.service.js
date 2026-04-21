import db from '../config/db.pool.js';

/**
 * Toggle a favorite (add if not exists, remove if it does)
 */
export async function toggleFavorite(userId, entityType, entityId) {
  try {
    const [existing] = await db.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND entity_type = ? AND entity_id = ?',
      [userId, entityType, entityId]
    );

    if (existing.length > 0) {
      await db.execute('DELETE FROM user_favorites WHERE id = ?', [existing[0].id]);
      return { status: 'removed' };
    } else {
      await db.execute(
        'INSERT INTO user_favorites (user_id, entity_type, entity_id) VALUES (?, ?, ?)',
        [userId, entityType, entityId]
      );
      return { status: 'added' };
    }
  } catch (err) {
    console.error('toggleFavorite error:', err);
    throw err;
  }
}

/**
 * Submit or update a rating (1-5 stars)
 */
export async function submitRating(userId, entityType, entityId, rating) {
  try {
    await db.execute(
      `INSERT INTO user_ratings (user_id, entity_type, entity_id, rating) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [userId, entityType, entityId, rating]
    );
    return { status: 'success', rating };
  } catch (err) {
    console.error('submitRating error:', err);
    throw err;
  }
}

/**
 * Get all user interactions for a specific entity
 */
export async function getUserInteractions(userId) {
  try {
    const [favorites] = await db.query(
      'SELECT entity_type, entity_id FROM user_favorites WHERE user_id = ?',
      [userId]
    );
    const [ratings] = await db.query(
      'SELECT entity_type, entity_id, rating FROM user_ratings WHERE user_id = ?',
      [userId]
    );

    return { favorites, ratings };
  } catch (err) {
    console.error('getUserInteractions error:', err);
    return { favorites: [], ratings: [] };
  }
}
