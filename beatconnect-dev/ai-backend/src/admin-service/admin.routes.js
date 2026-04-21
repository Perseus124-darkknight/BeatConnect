import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDashboardMetrics, trackEvent, removePost, updateArtistConfig, saveCatalogArtist, getArtistList, deleteArtist, restoreArtist, uploadArtistImage, getKnowledgeBase, updateKnowledgeBase, getUsers, removeUser } from './admin.controller.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

const router = express.Router();

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
router.get('/admin/metrics', authenticateToken, authorizeAdmin, getDashboardMetrics);

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
router.delete('/admin/post/:id', authenticateToken, authorizeAdmin, removePost);

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
router.put('/admin/artist/config', authenticateToken, authorizeAdmin, updateArtistConfig);

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
router.post('/admin/artist/save', authenticateToken, authorizeAdmin, saveCatalogArtist);

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
router.get('/admin/artists', authenticateToken, authorizeAdmin, getArtistList);

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
router.delete('/admin/artist/:id', authenticateToken, authorizeAdmin, deleteArtist);

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
router.post('/admin/artist/restore/:id', authenticateToken, authorizeAdmin, restoreArtist);
router.post('/admin/upload-image', authenticateToken, authorizeAdmin, upload.single('image'), uploadArtistImage);

/**
 * @swagger
 * /api/admin/knowledge:
 *   get:
 *     summary: Read current chatbot_faq.md content
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *   post:
 *     summary: Update chatbot_faq.md and re-sync weights
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 */
router.get('/admin/knowledge', authenticateToken, authorizeAdmin, getKnowledgeBase);
router.post('/admin/knowledge', authenticateToken, authorizeAdmin, updateKnowledgeBase);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all system users
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Array of users
 */
router.get('/admin/users', authenticateToken, authorizeAdmin, getUsers);

/**
 * @swagger
 * /api/admin/user/{id}:
 *   delete:
 *     summary: Hard delete a system user
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
 *         description: User removed
 */
router.delete('/admin/user/:id', authenticateToken, authorizeAdmin, removeUser);

export default router;
