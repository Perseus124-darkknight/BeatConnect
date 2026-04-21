import dotenv from 'dotenv';
dotenv.config();
// Suppress DeprecationWarning: url.parse() from swagger-jsdoc/swagger-parser
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  if (typeof warning === 'string' && warning.includes('url.parse()')) return;
  if (warning instanceof Error && warning.message.includes('url.parse()')) return;
  originalEmitWarning(warning, ...args);
};
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from './user-service/user.routes.js';
import adminRoutes from './admin-service/admin.routes.js';
import socialRoutes from './social-service/social.routes.js';
import chatRoutes from './chat-service/chat.routes.js';
import mediaRoutes from './media-service/media.routes.js';
import spotifyRoutes from './spotify-service/spotify.routes.js';
import systemRoutes from './system-service/settings.routes.js';
import { initEmbeddings } from './chat-service/chat.repository.js';
import { initSettingsTable } from './system-service/settings.controller.js';
import { setupSocketIO } from './chat-service/chat.controller.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, '../public')));

// API Gateway Proxy
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.use('/api', socialRoutes);
app.use('/api', chatRoutes);
app.use('/api', mediaRoutes);
app.use('/api', spotifyRoutes);
app.use('/api', systemRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'BeatConnect API Gateway' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import { protectAdminPortal } from './middleware/admin.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

// Global Error Handler must be registered after all routes
app.use(errorHandler);

// Setup Socket.io Connections
setupSocketIO(io);

// Static file serving and SPA routing for production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  // Serve admin SPA (Protected)
  app.get('/admin', protectAdminPortal, (req, res) => {
    res.sendFile(path.join(distPath, 'admin.html'));
  });
  app.get('/admin/*', protectAdminPortal, (req, res) => {
    res.sendFile(path.join(distPath, 'admin.html'));
  });

  // Serve main SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, async () => {
    console.log(`[SYS] Application Gateway and WS Server running on port ${PORT}`);
    await initSettingsTable();
    await initEmbeddings();
  });
}

export { app, server };
