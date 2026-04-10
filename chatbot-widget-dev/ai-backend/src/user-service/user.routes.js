import express from 'express';
import { register, login, resetPassword, getProfile, updateProfile, upgradeToPro } from './user.controller.js';
import { getDashboardMetrics, trackEvent, removePost, updateArtistConfig, saveCatalogArtist, getArtistList, deleteArtist, restoreArtist } from './admin.controller.js';

import { createPost, getArtistPosts } from './post-service.js';
import { toggleFavorite, submitRating, getMyInteractions } from './interaction.controller.js';
import { authenticateToken } from '../shared/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post('/register', register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT Token returned
 */
router.post('/login', login);

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, new_password]
 *             properties:
 *               email: { type: string }
 *               new_password: { type: string }
 *     responses:
 *       200:
 *         description: Password updated
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.get('/user/profile', authenticateToken, getProfile);
router.put('/user/profile', authenticateToken, updateProfile);

/**
 * @swagger
 * /api/user/upgrade:
 *   post:
 *     summary: Upgrade user to BeatConnect PRO
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account upgraded to PRO
 */
router.post('/user/upgrade', authenticateToken, upgradeToPro);

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
router.post('/user/post', authenticateToken, async (req, res) => {
    try {
        const { artist_name, content } = req.body;
        await createPost(req.user.id, artist_name, content);
        res.json({ message: 'Post created successfully' });
    } catch (err) {
        console.error('[POST] Error in /user/post:', err);
        res.status(500).json({ error: 'Failed to create post', details: err.message });
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
router.get('/posts/:artist', async (req, res) => {
    const posts = await getArtistPosts(req.params.artist);
    res.json(posts);
});

/**
 * @swagger
 * /api/analytics/track:
 *   post:
 *     summary: Track a frontend event for analytics
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [event_type]
 *             properties:
 *               event_type: { type: string }
 *               value: { type: string }
 *     responses:
 *       200:
 *         description: Event logged
 */
router.post('/analytics/track', trackEvent);

/**
 * @swagger
 * /api/admin/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated analytics metrics
 */
router.get('/admin/metrics', authenticateToken, getDashboardMetrics);

/**
 * @swagger
 * /api/admin/post/{id}:
 *   delete:
 *     summary: Delete a post (Admin moderation)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post removed
 */
router.delete('/admin/post/:id', authenticateToken, removePost);

/**
 * @swagger
 * /api/admin/artist/config:
 *   put:
 *     summary: Update artist personality and theme
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [artistId, personaPrompt]
 *             properties:
 *               artistId: { type: integer }
 *               personaPrompt: { type: string }
 *               themeConfig: { type: object }
 *     responses:
 *       200:
 *         description: Config updated
 */
router.put('/admin/artist/config', authenticateToken, updateArtistConfig);

/**
 * @swagger
 * /api/admin/artist/save:
 *   post:
 *     summary: Create or update artist catalog entry
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, bio]
 *     responses:
 *       200:
 *         description: Artist saved
 */
router.post('/admin/artist/save', authenticateToken, saveCatalogArtist);

/**
 * @swagger
 * /api/admin/artists:
 *   get:
 *     summary: Get all artists (Admin roster)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Array of artists
 */
router.get('/admin/artists', authenticateToken, getArtistList);

/**
 * @swagger
 * /api/admin/artist/{id}:
 *   delete:
 *     summary: Delete an artist
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Artist removed
 */
router.delete('/admin/artist/:id', authenticateToken, deleteArtist);

/**
 * @swagger
 * /api/admin/artist/restore/{id}:
 *   post:
 *     summary: Restore a deleted artist
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Artist restored
 */
router.post('/admin/artist/restore/:id', authenticateToken, restoreArtist);



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
