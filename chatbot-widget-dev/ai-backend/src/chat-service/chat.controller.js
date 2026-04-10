import { searchKnowledgeBase } from './chat.repository.js';
import { generateAIResponse } from './ai-service.js';
import { logEvent } from '../shared/analytics-service.js';

export const chatHandler = async (req, res) => {
  const reqAbortController = new AbortController();

  try {
    const prompt = req.body.prompt;
    const model = req.body.model || 'llava:latest';
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

export const setupWebSocket = (wss) => {
  wss.on('connection', (ws) => {
    console.log('[WS] New WebSocket connection established.');
    
    let currentAbortController = null;
    let voiceBuffer = [];
    let voicePageContext = null;

    ws.on('message', async (message, isBinary) => {
      // Handle Binary Data (Audio Chunks) explicitly
      if (isBinary) {
        console.log(`[WS-AUDIO] Received binary chunk: ${message.length} bytes`);
        voiceBuffer.push(Buffer.from(message));
        return;
      }

      try {
        // Convert Buffer to string if necessary
        const messageString = message.toString();
        const data = JSON.parse(messageString);
        
        if (data.type === 'stop') {
          if (currentAbortController) currentAbortController.abort();
          return;
        }

        if (data.type === 'voice_start') {
          console.log('[WS-AUDIO] Starting new voice stream collection...');
          voiceBuffer = [];
          voicePageContext = data.pageContext || null;
          return;
        }

        if (data.type === 'voice_stop') {
          console.log('[WS-AUDIO] Voice stream stopped. Processing buffer...');
          const fullBuffer = Buffer.concat(voiceBuffer);
          console.log(`[WS-AUDIO] Total audio collected: ${fullBuffer.length} bytes`);
          
          if (fullBuffer.length < 100) {
             ws.send(JSON.stringify({ type: 'error', message: 'Audio too short to process.' }));
             return;
          }

          // Trigger Local Transcription Logic
          ws.send(JSON.stringify({ type: 'chunk', chunk: '🎤 *[Transcribing Pulse...]* ', isDone: false }));
          
          // MOCK TRANSCRIPTION (To be replaced by user with local whisper-node or similar)
          const mockTranscription = "Tell me about the most famous rock band in the world.";
          console.log(`[WS-AUDIO] Mock Transcription: "${mockTranscription}"`);
          
          const prompt = mockTranscription;
          let searchQuery = prompt;
          if (voicePageContext && voicePageContext.title) {
              searchQuery += ` ${voicePageContext.title}`;
          }

          const dbResults = await searchKnowledgeBase(searchQuery);
          const streamResults = await generateAIResponse(prompt, dbResults, true, 'llava:latest', [], null, null, voicePageContext);
          
          for await (const chunk of streamResults) {
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({ type: 'chunk', ...chunk }));
            }
          }
          return;
        }
        
        if (data.type === 'chat') {
           if (currentAbortController) currentAbortController.abort();
           currentAbortController = new AbortController();
           
           const { prompt, model = 'llava:latest', stream = true, context = [], file, pageContext } = data;
           
           // Log analytics for new conversation
           if (context.length === 0) {
               logEvent('conversation_started', pageContext?.url || 'unknown');
           }
           
           let finalPrompt = prompt || '';
           let base64Image = null;
           
           if (file) {
              if (file.type.startsWith('image/')) {
                  base64Image = file.data;
                  if (!finalPrompt) finalPrompt = 'What is in this image?';
              } else if (file.type.startsWith('audio/')) {
                  finalPrompt = finalPrompt + `\n\n[SYSTEM INSTRUCTION: The user just uploaded an audio clip. Tell them their singing voice is incredibly out of pitch and sounds like a dying walrus, but surprisingly it vaguely reminded you of a legendary rock song. Playfully judge their music taste.]`;
              }
           }
           
           console.log(`[WS API] Received question: "${finalPrompt}"`);

           let searchQuery = finalPrompt;
           if (context && context.length > 0) {
             const recentHistory = context.slice(-3).map(m => m.content).join(' ');
             searchQuery = `${recentHistory} ${finalPrompt}`;
           }

           // Bias the vector search towards the page context
           if (pageContext && pageContext.search && pageContext.search.includes('genre=')) {
               const genreParams = new URLSearchParams(pageContext.search);
               if (genreParams.get('genre')) {
                   searchQuery += ` ${genreParams.get('genre')} genre music`;
               }
           } else if (pageContext && pageContext.title) {
               searchQuery += ` ${pageContext.title}`;
           }

           const dbResults = await searchKnowledgeBase(searchQuery);
           
           if (stream) {
              const streamResults = await generateAIResponse(finalPrompt, dbResults, stream, model, context, base64Image, currentAbortController.signal, pageContext);
              
              for await (const chunk of streamResults) {
                  if (ws.readyState === ws.OPEN) {
                      ws.send(JSON.stringify({ type: 'chunk', ...chunk }));
                  }
              }
            } else {
              const aiResponse = await generateAIResponse(finalPrompt, dbResults, stream, model, context, base64Image, currentAbortController.signal, pageContext);
              if (ws.readyState === ws.OPEN) {
                 ws.send(JSON.stringify({ type: 'complete', response: aiResponse.response, context: aiResponse.context }));
              }
            }
        }
        
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('[WS] Generation aborted manually.');
        } else {
          console.error('[WS] Error processing message:', err);
          if (ws.readyState === ws.OPEN) {
             ws.send(JSON.stringify({ type: 'error', message: 'Internal server error while processing AI response' }));
          }
        }
      }
    });

    ws.on('close', () => {
      console.log('[WS] WebSocket connection closed.');
      if (currentAbortController) currentAbortController.abort();
    });
  });
};
