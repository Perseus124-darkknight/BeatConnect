jest.mock('ws', () => {
  return {
    WebSocketServer: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn()
    })),
    default: {
      WebSocketServer: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        close: jest.fn()
      }))
    }
  };
});

import request from 'supertest';
import { app } from '../../ai-backend/src/server.js';
jest.mock('../../ai-backend/src/chat-service/chat.repository.js', () => ({
  searchKnowledgeBase: jest.fn().mockResolvedValue([{ title: 'Nirvana', content: 'Grunge band' }]),
  initEmbeddings: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../ai-backend/src/chat-service/ai-service.js', () => ({
  generateAIResponse: jest.fn().mockResolvedValue({
    response: 'Nirvana is a famous grunge band.',
    context: [{ role: 'assistant', content: 'Nirvana is a famous grunge band.' }]
  })
}));

describe('Chat Flow Integration', () => {
  test('POST /api/chat should return a valid AI response', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        prompt: 'Who is Nirvana?',
        model: 'llava',
        stream: false
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('response');
    expect(res.body.response).toContain('Nirvana');
  });

  test('POST /api/chat should return 400 if prompt is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        model: 'llava',
        stream: false
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('ok');
  });
});
