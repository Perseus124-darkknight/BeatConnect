import express from 'express';
import { getSettings, updateSetting } from './settings.controller.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/system/settings:
 *   get:
 *     summary: Get all system settings (avatars, themes, etc.)
 *     tags: [System]
 */
router.get('/system/settings', authenticateToken, getSettings);

/**
 * @swagger
 * /api/system/settings:
 *   post:
 *     summary: Update a system setting
 *     tags: [System]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 */
router.post('/system/settings', authenticateToken, authorizeAdmin, updateSetting);

export default router;
