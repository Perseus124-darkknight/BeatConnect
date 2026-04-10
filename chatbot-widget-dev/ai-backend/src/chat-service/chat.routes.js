import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { chatHandler } from './chat.controller.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 9999, // Development mode: allow practically unlimited requests
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ... existing configuration ...

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a message to the AI Chatbot
 *     tags: [AI Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The user's message
 *               context:
 *                 type: string
 *                 description: JSON string of conversation history
 *               model:
 *                 type: string
 *                 description: AI model to use (e.g. llava, llama3)
 *               stream:
 *                 type: string
 *                 description: "\"true\" or \"false\""
 *               pageContext:
 *                 type: string
 *                 description: JSON string of current page metadata
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional image/file for multi-modal analysis
 *     responses:
 *       200:
 *         description: Success (returns JSON or streams chunks)
 */
router.post('/chat', aiRateLimiter, upload.single('file'), chatHandler);

export default router;
