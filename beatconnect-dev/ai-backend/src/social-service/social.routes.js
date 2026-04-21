import express from 'express';
import { createPost, getArtistPosts } from './post-service.js';
import { toggleFavorite, submitRating, getMyInteractions } from './interaction.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/user/post:
 *   post:
 *     summary: Create a post/opinion about an artist
 *     tags: [Social]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [artist_name, content]
 *             properties:
 *               artist_name: { type: string }
 *               content: { type: string }
 *     responses:
 *       200:
 *         description: Post created successfully
 */
router.post('/user/post', authenticateToken, async (req, res, next) => {
    try {
        const { artist_name, content } = req.body;
        await createPost(req.user.id, artist_name, content);
        res.json({ message: 'Post created successfully' });
    } catch (err) {
        console.error('[POST] Error in /user/post:', err);
        next(err);
    }
});

/**
 * @swagger
 * /api/posts/{artist}:
 *   get:
 *     summary: Retrieve posts for a specific artist
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: artist
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the artist
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/posts/:artist', async (req, res, next) => {
    try {
        const posts = await getArtistPosts(req.params.artist);
        res.json(posts);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/user/favorite:
 *   post:
 *     summary: Toggle favorite for an artist, album, or track
 *     tags: [Interaction]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityType, entityId]
 *             properties:
 *               entityType: { type: string, enum: [artist, album, track] }
 *               entityId: { type: integer }
 *     responses:
 *       200:
 *         description: Interaction logged (added/removed)
 */
router.post('/user/favorite', authenticateToken, toggleFavorite);

/**
 * @swagger
 * /api/user/rate:
 *   post:
 *     summary: Submit a star rating (1-5)
 *     tags: [Interaction]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityType, entityId, rating]
 *             properties:
 *               entityType: { type: string, enum: [artist, album, track] }
 *               entityId: { type: integer }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *     responses:
 *       200:
 *         description: Rating updated
 */
router.post('/user/rate', authenticateToken, submitRating);

/**
 * @swagger
 * /api/user/interactions:
 *   get:
 *     summary: Get all favorites and ratings for the current user
 *     tags: [Interaction]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user interactions
 */
router.get('/user/interactions', authenticateToken, getMyInteractions);

export default router;
