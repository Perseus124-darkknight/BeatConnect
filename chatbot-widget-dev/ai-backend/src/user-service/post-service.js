// ai-backend/src/user-service/post-service.js
import db from '../shared/db.pool.js';

export const createPost = async (userId, artistName, content) => {
    try {
        const [result] = await db.execute('INSERT INTO user_posts (user_id, artist_name, content) VALUES (?, ?, ?)', [userId, artistName, content]);
        return result.insertId;
    } catch (err) {
        console.error('[POST] Error creating post:', err);
        throw err;
    }
};

export const getArtistPosts = async (artistName) => {
    try {
        const [rows] = await db.execute(`
            SELECT p.*, u.username 
            FROM user_posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.artist_name = ? 
            ORDER BY p.created_at DESC
        `, [artistName]);
        return rows;
    } catch (err) {
        console.error('[POST] Error fetching artist posts:', err);
        return [];
    }
};

export const getRecentPosts = async (limit = 10) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, u.username 
            FROM user_posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC 
            LIMIT ?
        `, [Number(limit)]);
        return rows;
    } catch (err) {
        console.error('[POST] Error fetching recent posts:', err);
        return [];
    }
};

export const deletePost = async (postId) => {
    try {
        const [result] = await db.execute('DELETE FROM user_posts WHERE id = ?', [postId]);
        return result.affectedRows > 0;
    } catch (err) {
        console.error('[POST] Error deleting post:', err);
        return false;
    }
};
