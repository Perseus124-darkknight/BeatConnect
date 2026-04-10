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
import { WebSocketServer } from 'ws';
import http from 'http';

import userRoutes from './user-service/user.routes.js';
import chatRoutes from './chat-service/chat.routes.js';
import mediaRoutes from './media-service/media.routes.js';
import spotifyRoutes from './spotify-service/spotify.routes.js';
import { initEmbeddings } from './chat-service/chat.repository.js';
import { setupWebSocket } from './chat-service/chat.controller.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './shared/swagger.config.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// API Gateway Proxy
app.use('/api', userRoutes);
app.use('/api', chatRoutes);
app.use('/api', mediaRoutes);
app.use('/api', spotifyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'BeatConnect API Gateway' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Setup WebSocket Connections
setupWebSocket(wss);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, async () => {
    console.log(`[SYS] Application Gateway and WS Server running on port ${PORT}`);
    await initEmbeddings();
  });
}

export { app, server };
