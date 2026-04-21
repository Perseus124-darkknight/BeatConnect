import { searchKnowledgeBase } from './chat.repository.js';
import { generateAIResponse } from './ai-service.js';
import { logEvent } from '../admin-service/analytics-service.js';

export const chatHandler = async (req, res) => {
  const reqAbortController = new AbortController();

  try {
    const prompt = req.body.prompt;
    const model = req.body.model || 'llama2:latest';
    const stream = req.body.stream === 'true' || req.body.stream === true;

    let context = [];
    if (req.body.context) {
      try {
        context = typeof req.body.context === 'string' ? JSON.parse(req.body.context) : req.body.context;
      } catch (e) {
        console.error('Failed to parse context array:', e);
      }
    }

    let base64Image = null;
    let finalPrompt = prompt || '';

    if (req.file) {
      const mimeType = req.file.mimetype || '';
      console.log(`[API] Received an uploaded file: ${req.file.originalname} (MIME: ${mimeType})`);
      
      if (mimeType.startsWith('image/')) {
        base64Image = req.file.buffer.toString('base64');
        if (!finalPrompt) finalPrompt = 'What is in this image?';
      } else if (mimeType.startsWith('audio/')) {
        finalPrompt = finalPrompt + `\n\n[SYSTEM INSTRUCTION: The user just uploaded an audio clip of them humming a tune. Pretend you listened to it. Tell them their singing voice is incredibly out of pitch and sounds like a dying walrus, but surprisingly it vaguely reminded you of a legendary rock song. Playfully judge their music taste. DO NOT mention you are AI or that you can't hear audio.]`;
      } else {
        if (!finalPrompt) finalPrompt = 'Please analyze this file: ' + req.file.originalname;
      }
    }

    if (!finalPrompt && !base64Image) {
      return res.status(400).json({ error: 'Prompt or image is required' });
    }

    console.log(`[API] Received question/prompt: "${finalPrompt}"`);

    let searchQuery = finalPrompt;
    if (context && context.length > 0) {
      const recentHistory = context.slice(-3).map(m => m.content).join(' ');
      searchQuery = `${recentHistory} ${finalPrompt}`;
    }
    
    if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); 
        res.flushHeaders();
    }

    console.log(`[API] Searching DB with query: "${searchQuery}"`);
    const dbResults = await searchKnowledgeBase(searchQuery);

    if (stream) {
        const streamResults = await generateAIResponse(finalPrompt, dbResults, stream, model, context, base64Image, reqAbortController.signal);
                
        for await (const chunk of streamResults) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        res.end();
        return;
    } else {
        const aiResponse = await generateAIResponse(finalPrompt, dbResults, stream, model, context, base64Image, reqAbortController.signal);

        return res.json({
          response: aiResponse.response,
          context: aiResponse.context 
        });
    }

  } catch (error) {
    console.error('[API] Error in /api/chat:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error while processing AI response' });
    } else {
      res.end();
    }
  }
};

export const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] New connection: ${socket.id}`);
    
    let currentAbortController = null;
    let voiceBuffer = [];
    let voicePageContext = null;

    // 1. Real-time Admin Sync: Instantly inform clients of new artist data
    socket.on('admin_update', (data) => {
       console.log(`[Socket.io] Admin update received: ${data.entity}`);
       io.emit('intelligence_refresh', { 
         message: `BeatBot 2.0 just learned about: ${data.name || 'new data'}`,
         type: data.type 
       });
    });

    // 2. Interactive Media Control Channel
    socket.on('media_command', (command) => {
       console.log(`[Socket.io] Media command broadcast: ${command.action}`);
       socket.broadcast.emit('execute_media', command);
    });

    // 3. Audio Stream Handling
    socket.on('voice_chunk', (chunk) => {
       voiceBuffer.push(Buffer.from(chunk));
    });

    socket.on('voice_start', (data) => {
       console.log('[Socket.io] Starting voice collection...');
       voiceBuffer = [];
       voicePageContext = data?.pageContext || null;
    });

    socket.on('voice_stop', async () => {
       console.log('[Socket.io] Voice stopped. Processing...');
       const fullBuffer = Buffer.concat(voiceBuffer);
       if (fullBuffer.length < 100) {
         socket.emit('error', { message: 'Audio too short.' });
         return;
       }

       socket.emit('chunk', { chunk: '🎤 *[Transcribing Pulse...]* ', isDone: false });
       
       // Mock Transcription (Replace with actual service)
       const mockPrompt = "Tell me about the latest news."; 
       const dbResults = await searchKnowledgeBase(mockPrompt);
       const streamResults = await generateAIResponse(mockPrompt, dbResults, true, 'llama2:latest', [], null, null, voicePageContext);
       
       for await (const chunk of streamResults) {
         socket.emit('chunk', chunk);
       }
    });

    // 4. Standard Chat
    socket.on('chat', async (data) => {
      if (currentAbortController) currentAbortController.abort();
      currentAbortController = new AbortController();
      
      const { prompt, model = 'llama2:latest', stream = true, context = [], file, pageContext } = data;
      
      if (context.length === 0) {
          logEvent('conversation_started', pageContext?.url || 'unknown');
      }
      
      let finalPrompt = prompt || '';
      let base64Image = null;
      
      if (file) {
         if (file.type?.startsWith('image/')) {
             base64Image = file.data;
             if (!finalPrompt) finalPrompt = 'What is in this image?';
         } else if (file.type?.startsWith('audio/')) {
             finalPrompt += `\n\n[SYSTEM INSTRUCTION: Humorous critique of the audio file.]`;
         }
      }

      let searchQuery = finalPrompt;
      if (context.length > 0) {
        searchQuery = `${context.slice(-2).map(m => m.content).join(' ')} ${finalPrompt}`;
      }

      console.log(`[Socket.io] Query: "${finalPrompt}"`);
      const dbResults = await searchKnowledgeBase(searchQuery);
      
      if (stream) {
         const streamResults = await generateAIResponse(prompt, dbResults, stream, model, context, base64Image, currentAbortController.signal, pageContext);
         for await (const chunk of streamResults) {
           socket.emit('chunk', chunk);
         }
      } else {
         const aiResponse = await generateAIResponse(prompt, dbResults, stream, model, context, base64Image, currentAbortController.signal, pageContext);
         socket.emit('complete', aiResponse);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
      if (currentAbortController) currentAbortController.abort();
    });
  });
};
