import { getArtists } from '../media-service/media.repository.js';
import db from '../config/db.pool.js';
/**
 * Configure local Ollama API details here.
 * If running the Node app inside Docker to reach Ollama on the host, use http://host.docker.internal:11434
 */
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';

let artistsCache = null;
let lastArtistsFetch = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function generateAIResponse(userPrompt, dbContext, stream = false, model = 'llava', chatHistory = [], base64Image = null, clientSignal = null, pageContext = null) {

  // Format the knowledge base data into a prompt friendly string
  let contextString = '';
  if (dbContext && dbContext.length > 0) {
    contextString = 'Core Knowledge & Real-time Grounding:\n';
    dbContext.forEach(item => {
      let snippet = '';
      if (item._source === 'artists') {
        snippet = `[ARTIST PROFILE] ${item.name}: ${item.bio || item.persona_prompt}`;
      } else if (item._source === 'daily_reports') {
        snippet = `[TODAY'S DISPATCH - ${item.report_date}] ${item.front_page_title}: ${item.front_page_content}`;
      } else {
        snippet = `[LEGACY FAQ] ${item.title}: ${item.content}`;
      }
      contextString += `${snippet}\n---\n`;
    });
  }

  // Fetch artists once and cache for 5 minutes
  if (!artistsCache || Date.now() - lastArtistsFetch > CACHE_TTL) {
    try {
      artistsCache = await getArtists();
      lastArtistsFetch = Date.now();
    } catch(e) { console.error('Error caching artists:', e); }
  }
  const optionsString = (artistsCache || []).join(', ');

  // 1. Strict Context Fallback (No AI call if no context found)
  const greetings = ['hi', 'hello', 'hey', 'who are you', 'what is this', 'help', 'beatbot', '2.0'];
  const isGreeting = greetings.some(g => userPrompt.toLowerCase().includes(g));

  if (!base64Image && !isGreeting && (!dbContext || dbContext.length === 0)) {
    const responseText = "I'm not sure I get you. I only know details about the artists on this platform and the latest dispatches.";
    if (stream) {
      return (async function* () {
         const words = responseText.split(' ');
         for(let w of words) {
            yield { chunk: w + ' ', isDone: false };
            await new Promise(r => setTimeout(r, 50));
         }
         yield { chunk: '', isDone: true, context: chatHistory };
      })();
    } else {
      return { response: responseText, context: chatHistory };
    }
  }

  let pageContextString = '';
  if (pageContext) {
    let genreInstruction = '';
    if (pageContext.search && pageContext.search.includes('genre=')) {
        const params = new URLSearchParams(pageContext.search);
        const genre = params.get('genre');
        if (genre) {
            genreInstruction = `\n[CONTEXT: User exploring ${genre}]`;
        }
    }
    pageContextString = `\n[LOCATION: ${pageContext.title || 'Unknown'}]${genreInstruction}`;
  }

  // 1. Fetch artist-specific persona if applicable
  let artistPersona = '';
  if (pageContext && pageContext.title) {
    try {
      const [artistData] = await db.execute('SELECT persona_prompt FROM artists WHERE name = ? AND is_deleted = 0', [pageContext.title]);

      if (artistData && artistData[0] && artistData[0].persona_prompt) {
        artistPersona = `\n[OVERRIDE PERSONA: ${artistData[0].persona_prompt}]`;
        console.log(`[AI] Applying custom persona for: ${pageContext.title}`);
      }
    } catch(e) { console.error('Error fetching artist persona:', e); }
  }

  const systemPrompt = `You are "BeatBot 2.0", an elite, real-time music intelligence layer for BeatConnect.${artistPersona}

CORE IDENTITY:
- You are a witty, slightly snarky music journalist with deep industry knowledge.
- You ground your answers in the "Core Knowledge" provided.
- If information is from [TODAY'S DISPATCH], treat it as breaking news.
- If information is from [ARTIST PROFILE], treat it as definitive truth about that artist.

RULES:
1. ONLY discuss music and BeatConnect.
2. Never mention AI. You are a human journalist with high-speed access to data.
3. GROUNDING: If an artist or news item isn't in your context, say: "I only know details about the artists on this platform and the latest dispatches."
4. PRIORITY: If an image is uploaded, identify it using context [${optionsString}]. (e.g., "This looks like **U2**").
5. STYLE: Bold **names** and **titles**. Be concise, snappy, and premium.
6. FORMATTING: Use [Name](Wikipedia_URL) for band members.
7. ACTIONABLE: If a specific song is relevant, append [TRACK: Song Name - Artist Name] to suggest playback.
8. TONE: Professional but edgy. No generic pleasantries.

Core Knowledge:
${contextString}${pageContextString}`;

  const userMessage = { role: 'user', content: userPrompt };
  if (base64Image) {
    userMessage.images = [base64Image];
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    userMessage
  ];

  let formattedPrompt = `${systemPrompt}\n\n`;
  if (chatHistory && chatHistory.length > 0) {
    formattedPrompt += '### Previous Conversation:\n';
    chatHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      formattedPrompt += `${role}: ${msg.content}\n`;
    });
    formattedPrompt += '\n';
  }
  formattedPrompt += `### Current Turn:\nUser: ${userPrompt}\nAssistant:`;

  // Determine dynamic model: If an image is present, we absolutely must use a vision model like 'llava'.
  // We override the default requested model if it's not a vision model and an image is present.
  const dynamicModel = base64Image && !model.includes('llava') ? 'llava' : model;

  const payload = {
    model: dynamicModel,
    prompt: formattedPrompt,
    stream: stream,
    images: base64Image ? [base64Image] : undefined,
    options: {
      temperature: 0.2,
      num_predict: 1000, // Allow enough tokens to finish long responses like lists
      top_p: 0.8,
      stop: ["User:", "Assistant:", "\nUser:", "\nAssistant:", "###"]
    }
  };

  const controller = new AbortController();

  if (clientSignal) {
    clientSignal.addEventListener('abort', () => {
      controller.abort();
    });
    if (clientSignal.aborted) {
      controller.abort();
    }
  }

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Ollama API error! status: ${response.status}`);
    }

    if (stream) {
      async function* generateStream() {
        let fullResponse = '';
        
        let streamSource;
        if (typeof response.body.getReader === 'function') {
          // Web Streams API (Standard in Node 18+ native fetch)
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          streamSource = (async function* () {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              yield decoder.decode(value, { stream: true });
            }
          })();
        } else {
          // Node.js Streams API (node-fetch or older Node)
          streamSource = response.body;
        }

        let streamBuffer = '';
        
        // Pre-fetch artists list for final suggestion calculation
        let allArtistsCached = [];
        try {
          allArtistsCached = await getArtists();
        } catch(e) {}

        for await (const chunk of streamSource) {
          streamBuffer += chunk.toString();
          const lines = streamBuffer.split('\n');
          streamBuffer = lines.pop(); 
          
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.response) {
                fullResponse += data.response;
                const tokens = data.response.split(/(?<=\s)/);
                for (const token of tokens) {
                  yield { chunk: token, isDone: false };
                  await new Promise(resolve => setTimeout(resolve, 2));
                }
              }
              if (data.done) break;
            } catch (e) {
              console.error('[AI] Incomplete JSON chunk received, skipping:', line);
            }
          }
        }

        // Post-processing suggestion tags after the full response is streamed out
        fullResponse = fullResponse.replace(/\[SUGGESTION:[^\]]+\]/gi, '').trim();
        let matchedArtistName = null;
        try {
          // Scan AI response directly for known artists using the pre-fetched list
          for (const artist of allArtistsCached) {
            if (fullResponse.toLowerCase().includes(artist.toLowerCase())) {
               matchedArtistName = artist;
               break;
            }
          }

          // Fallback to DB Context ONLY IF the user prompt matches it strongly
          if (!matchedArtistName && dbContext && dbContext.length > 0) {
            const contextTitle = dbContext[0].title.replace(' Members', '').replace(' Albums', '').replace(' Tours', '').replace(' Popular Songs', '').replace(' Achievements', '').trim();
            if (userPrompt.toLowerCase().includes(contextTitle.toLowerCase())) {
               matchedArtistName = contextTitle;
            }
          }
        } catch(e) { console.error('Error finding matching artist:', e); }
        
        let finalSuggestionHtml = '';
        if (matchedArtistName) {
           finalSuggestionHtml = ` [SUGGESTION: ${matchedArtistName}|/artist.html?artist=${encodeURIComponent(matchedArtistName)}]`;
        }
        
        const updatedContext = [
          ...chatHistory,
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: fullResponse + finalSuggestionHtml }
        ];

        yield { chunk: finalSuggestionHtml, isDone: true, context: updatedContext };
      }
      
      return generateStream();
    } else {
      const result = await response.json();
      
      let finalResponse = result.response;
      const lowerPrompt = userPrompt.toLowerCase();
      
      // Strip any hallucinated or context-bleeding suggestion tags from the AI first
      finalResponse = finalResponse.replace(/\[SUGGESTION:[^\]]+\]/gi, '').trim();
      
      let matchedArtistName = null;
      try {
        const allArtists = await getArtists();
        // Scan AI response directly for known artists
        for (const artist of allArtists) {
          if (finalResponse.toLowerCase().includes(artist.toLowerCase())) {
             matchedArtistName = artist;
             break;
          }
        }

        // Fallback to DB Context ONLY IF the user prompt matches it strongly (to avoid random image guessing)
        if (!matchedArtistName && dbContext && dbContext.length > 0) {
          const contextTitle = dbContext[0].title.replace(' Members', '').replace(' Albums', '').replace(' Tours', '').replace(' Popular Songs', '').replace(' Achievements', '').trim();
          if (userPrompt.toLowerCase().includes(contextTitle.toLowerCase())) {
             matchedArtistName = contextTitle;
          }
        }
      } catch(e) { console.error('Error finding matching artist:', e); }
      
      if (matchedArtistName) {
        finalResponse += ` [SUGGESTION: ${matchedArtistName}|/artist.html?artist=${encodeURIComponent(matchedArtistName)}]`;
      }
      
      // Create new context array for next time
      const updatedContext = [
        ...chatHistory,
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: finalResponse }
      ];

      return {
        response: finalResponse,
        context: updatedContext
      };
    }

  } catch (err) {
    if (clientSignal && clientSignal.aborted) {
      console.log('[AI Service] Request aborted by client, terminating generation.');
      if (stream) {
        return (async function*() {})(); // Return empty iterator
      } else {
        return { response: '', context: chatHistory };
      }
    }

    console.warn('Ollama is currently unreachable. Generating a fallback mock response based on the DB context.', err.message);

    // Fallback response for demonstration if Ollama isn't running
    let fallbackText = "I'm currently running in offline mode. However, based on my database context:\n";
    if (dbContext && dbContext.length > 0) {
      dbContext.forEach(item => {
        if (item && item.content) {
          fallbackText += `- ${item.content}\n`;
        }
      });
    } else {
      fallbackText += "- I couldn't find any relevant information for your query.";
    }

    if(stream) {
      async function* generateStream() {
         const words = fallbackText.split(' ');
         for(let w of words) {
            yield { chunk: w + ' ', isDone: false };
            await new Promise(r => setTimeout(r, 50));
         }
         yield { chunk: '', isDone: true, context: [] }
      }
      return generateStream();
    } else {
      return {
        response: fallbackText,
        context: []
      }
    }
  }
}
