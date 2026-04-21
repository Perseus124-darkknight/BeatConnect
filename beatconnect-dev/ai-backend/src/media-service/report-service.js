import fetch from 'node-fetch';
import db from '../config/db.pool.js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2';

async function generateWithOllama(prompt) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 800 }
      })
    });
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('[Report Service] Ollama generation failed:', error);
    return null;
  }
}

let isGenerating = false;

export async function getDailyReport() {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if report already exists for today
  const [rows] = await db.execute('SELECT * FROM daily_reports WHERE report_date = ?', [today]);
  if (rows.length > 0) {
    return rows[0];
  }

  if (isGenerating) {
    console.log(`[Report Service] Generation already in progress for ${today}, skipping...`);
    return null;
  }

  isGenerating = true;
  try {
    // Generate new report
    console.log(`[Report Service] Generating news for ${today}...`);
  
  const [artists] = await db.execute(`
    SELECT DISTINCT k.title, k.category, k.content 
    FROM knowledge_items k
    JOIN artists a ON k.title = a.name
    WHERE a.is_deleted = 0 
    AND (k.category = 'band' OR k.category = 'artist' OR k.category = 'music') 
    AND LENGTH(k.content) > 100
  `);

  console.log(`[Report Service] Found ${artists.length} potential topics in knowledge base.`);
  if (artists.length === 0) {
    console.warn('[Report Service] No bands/artists found in knowledge_items. Generation aborted.');
    isGenerating = false;
    return null;
  }

  const randomArtist = artists[Math.floor(Math.random() * artists.length)];
  console.log(`[Report Service] Selected artist: ${randomArtist.title}`);
  
  const newsPrompt = `
    You are "BeatBot", a witty, elite music journalist for BeatConnect. 
    Write a high-impact, magazine-style "Front Page Article" about this artist: ${randomArtist.title}. 
    Context: ${randomArtist.content}
    
    RULES:
    1. Tone: Friendly, concise, enthusiastic, slightly snarky.
    2. Style: Journalistic report. Use a catchy headline.
    3. Content: Blend the artist's history with a "current" feeling narrative.
    4. Format: Return a JSON object with "title" and "content" (use markdown for body).
    5. No jargon, keep it snappy.
    
    Example JSON:
    { "title": "The Sphere: How U2 Redefined Live Performance", "content": "Last night in Las Vegas..." }
  `;

  const historyPrompt = `
    You are "BeatBot", a witty, elite music journalist.
    Generate a fascinating "On This Day in Rock History" fact for today (${new Date().toDateString()}).
    
    RULES:
    1. Highlight a legendary concert or album release.
    2. Tone: Enthusiastic and journalistic.
    3. Format: Return a JSON object with "title" and "content" (1-2 paragraphs).
    
    Example JSON:
    { "title": "August 15, 1969: Woodstock Begins", "content": "Three days of peace and music..." }
  `;

  const newsResponseRaw = await generateWithOllama(newsPrompt);
  const historyResponseRaw = await generateWithOllama(historyPrompt);

  let newsData = { title: "The Daily Groove", content: "BeatBot is catching its breath. Stay tuned." };
  let historyData = { title: "Rock Relics", content: "History in the making." };

  const sanitize = (str) => {
      if (!str) return '';
      // Strip common markdown code blocks
      let clean = str.replace(/```json|```/g, '').trim();
      
      // Try to extract the JSON object if it's buried in text
      const start = clean.indexOf('{');
      const end = clean.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        clean = clean.substring(start, end + 1);
      }
      
      // Remove any hallucinated pipe characters that often break LLM JSON
      // (Common when they try to make a table inside a string)
      // but only if they appear to be outside of quoted strings or breaking the structure
      // For now, let's just make sure we handle literal newlines which are the #1 JSON killer
      return clean;
    };

    const parseAIResponse = (raw) => {
      if (!raw) return null;
      const sanitized = sanitize(raw);
      try {
        // First try standard JSON parse
        let parsed = JSON.parse(sanitized);
        
        // Handle common nested structures
        if (parsed.news && typeof parsed.news === 'object') parsed = parsed.news;
        if (parsed.article && typeof parsed.article === 'object') parsed = parsed.article;
        if (parsed.report && typeof parsed.report === 'object') parsed = parsed.report;
        
        return parsed;
      } catch (e) {
        console.warn('[Report Service] JSON parse failed, attempting manual extraction', e);
        // Fallback: Aggressive regex extraction (handles missing closing quotes/truncated responses)
        const titleMatch = sanitized.match(/"title"\s*:\s*"([\s\S]*?)"\s*,/);
        const contentMatch = sanitized.match(/"content"\s*:\s*"([\s\S]*?)"\s*}/) || 
                             sanitized.match(/"content"\s*:\s*"([\s\S]*)/);
        
        if (titleMatch || contentMatch) {
          let content = contentMatch ? contentMatch[1].trim() : sanitized;
          if (content.endsWith('}')) content = content.substring(0, content.length - 1).trim();
          if (content.endsWith('"')) content = content.substring(0, content.length - 1).trim();

          return {
            title: titleMatch ? titleMatch[1] : "News Update",
            content: content
          };
        }
        return null;
      }
    };

    if (newsResponseRaw) {
      const parsed = parseAIResponse(newsResponseRaw);
      if (parsed) {
        newsData = { title: parsed.title || newsData.title, content: parsed.content || newsData.content };
      } else {
        newsData = { title: "Latest Rock Dispatch", content: newsResponseRaw.replace(/[{}]/g, '').trim() };
      }
    }

    if (historyResponseRaw) {
      const parsed = parseAIResponse(historyResponseRaw);
      if (parsed) {
        historyData = { title: parsed.title || historyData.title, content: parsed.content || historyData.content };
      } else {
        historyData = { title: "On This Day", content: historyResponseRaw.replace(/[{}]/g, '').trim() };
      }
    }

    // Final safety check: ensure we didn't save entire JSON into content
    const ensureClean = (data) => {
      if (data.content && typeof data.content === 'string' && data.content.trim().startsWith('{')) {
        try {
          const p = JSON.parse(data.content);
          if (p.content) data.content = p.content;
          if (p.title && (!data.title || data.title === "Latest Rock Dispatch")) data.title = p.title;
        } catch(e) {}
      }
      return data;
    };

    newsData = ensureClean(newsData);
    historyData = ensureClean(historyData);

  // Save or Update today's report
  const [existing] = await db.execute('SELECT id FROM daily_reports WHERE report_date = ?', [today]);
  if (existing.length > 0) {
    await db.execute(
      'UPDATE daily_reports SET front_page_title = ?, front_page_content = ?, history_title = ?, history_content = ? WHERE report_date = ?',
      [newsData.title, newsData.content, historyData.title, historyData.content, today]
    );
  } else {
    await db.execute(
      'INSERT INTO daily_reports (report_date, front_page_title, front_page_content, history_title, history_content) VALUES (?, ?, ?, ?, ?)',
      [today, newsData.title, newsData.content, historyData.title, historyData.content]
    );
  }

    return {
      report_date: today,
      front_page_title: newsData.title,
      front_page_content: newsData.content,
      history_title: historyData.title,
      history_content: historyData.content
    };
  } catch (error) {
    console.error('[Report Service] Daily report generation failed:', error);
    return null;
  } finally {
    isGenerating = false;
  }
}
