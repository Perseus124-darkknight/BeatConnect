import express from 'express';
import { loginWithSpotify, spotifyCallback } from './spotify.controller.js';
import { authenticateToken } from '../shared/auth.middleware.js';

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

export default router;
