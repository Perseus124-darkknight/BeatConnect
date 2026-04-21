import express from 'express';
import { getDailyReportHandler, getArtistsHandler, getArtistDetailsHandler } from './media.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/daily/report:
 *   get:
 *     summary: Get the latest daily music report
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: Markdown content of the daily report
 */
router.get('/daily/report', getDailyReportHandler);

/**
 * @swagger
 * /api/artists:
 *   get:
 *     summary: List all legendary artists in the database
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: Array of artist names
 */
router.get('/artists', getArtistsHandler);

/**
 * @swagger
 * /api/artist/{name}:
 *   get:
 *     summary: Get detailed knowledge base items for an artist
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the artist
 *     responses:
 *       200:
 *         description: Knowledge items (bio, members, albums, etc.)
 */
router.get('/artist/:name', getArtistDetailsHandler);

export default router;
