import express from 'express';
import { loginWithSpotify, spotifyCallback, getAISuggestedTags } from './spotify.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/spotify/login:
 *   get:
 *     summary: Initiate Spotify OAuth integration
 *     tags: [Spotify]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Redirects to Spotify Auth URL
 */
router.get('/spotify/login', authenticateToken, loginWithSpotify);

/**
 * @swagger
 * /api/spotify/callback:
 *   get:
 *     summary: Spotify OAuth callback (Internal use)
 *     tags: [Spotify]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success callback
 */
router.get('/spotify/callback', spotifyCallback);

/**
 * @swagger
 * /api/spotify/enrich:
 *   post:
 *     summary: Suggest tags (Genre, Mood, Tempo) via AI
 *     tags: [Spotify]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: AI-suggested tags
 */
router.post('/spotify/enrich', authenticateToken, getAISuggestedTags);

export default router;
