import db from '../shared/db.pool.js';

/**
 * Initialize Vector Search Embeddings in the Background
 */
let isEmbeddingReady = false;
let embeddingsMemory = [];
const OLLAMA_EMBED_URL = process.env.OLLAMA_EMBED_URL || (process.env.OLLAMA_URL ? process.env.OLLAMA_URL.replace('generate', 'embeddings') : 'http://localhost:11434/api/embeddings');
const EMBED_MODEL = 'llama3.2'; // Using lightweight 3B parameter model to reduce RAG latency

async function getEmbedding(text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  try {
    const response = await fetch(OLLAMA_EMBED_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
      signal: controller.signal
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.embedding;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function initEmbeddings(retries = 10) {
  console.log('[RAG] Starting vector search index building...');
  
  try {
    const [items] = await db.query('SELECT * FROM knowledge_items');
    
    // Background processing
    (async () => {
      let processed = 0;
      for (const item of items) {
        if (item.embedding) {
          try {
            // Load from DB if already computed
            const parsedEmbedding = typeof item.embedding === 'string' ? JSON.parse(item.embedding) : item.embedding;
            embeddingsMemory.push({ ...item, embedding: parsedEmbedding });
            processed++;
          } catch (e) {
            console.warn(`[RAG] Invalid embedding JSON for item ${item.id}`, e);
          }
          continue;
        }

        // Compute missing embedding
        const textToEmbed = `${item.title}: ${item.content}`;
        const embedding = await getEmbedding(textToEmbed);
        if (embedding) {
          embeddingsMemory.push({ ...item, embedding });
          // Save to DB so we don't recalculate it next boot
          await db.execute('UPDATE knowledge_items SET embedding = ? WHERE id = ?', [JSON.stringify(embedding), item.id]);
          processed++;
        }
      }
      isEmbeddingReady = true;
      console.log(`[RAG] Vector index ready. Loaded ${processed}/${items.length} semantic vectors.`);
    })();
  } catch (error) {
    if (retries > 0 && (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST')) {
      console.warn(`[RAG] Database not ready, retrying in 5s... (${retries} retries left)`);
      setTimeout(() => initEmbeddings(retries - 1), 5000);
    } else {
      console.error('[RAG] Error initializing embeddings:', error);
    }
  }
}

export async function searchKnowledgeBase(query) {
  const words = query.toLowerCase().trim().split(/[ \n.,!?]+/);
  const greetings = ['hi', 'hello', 'hey', 'yo', 'greeting', 'greetings', 'help', 'who'];
  
  // If the query is just a greeting, bypass RAG to save latency
  if (words.length <= 2 && words.every(w => greetings.includes(w))) {
    console.log('[RAG] Greeting detected, bypassing vector search.');
    return [];
  }

  // If vector search is not ready or failed, fallback to naive SQL search
  if (!isEmbeddingReady || embeddingsMemory.length === 0) {
    return fallbackNaiveSearch(query);
  }

  const queryEmbedding = await getEmbedding(query);
  if (!queryEmbedding) return fallbackNaiveSearch(query);

  const scoredItems = embeddingsMemory.map(item => ({
    ...item,
    score: cosineSimilarity(queryEmbedding, item.embedding)
  }));

  const results = scoredItems
    .filter(i => i.score > 0.45) // Adjust semantic threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(i => {
      const { embedding, score, ...rest } = i;
      return rest;
    });

  if (results.length > 0) {
    return results;
  } else {
    // If strict semantic match fails, combine with naive keyword search
    return fallbackNaiveSearch(query);
  }
}

async function fallbackNaiveSearch(query) {
  const words = query.toLowerCase().split(/[ \n.,!?]+/);
  let sql = 'SELECT * FROM knowledge_items WHERE ';
  const conditions = [];
  const params = [];

  const stopWords = ['the', 'and', 'how', 'who', 'for', 'are', 'you', 'this', 'that', 'with', 'from', 'what', 'your', 'have'];
  const greetings = ['hi', 'hello', 'hey', 'yo', 'greeting', 'greetings'];

  for (const word of words) {
    if (word.length > 2 && !stopWords.includes(word) && !greetings.includes(word)) {
      conditions.push('(content LIKE ? OR title LIKE ?)');
      params.push(`%${word}%`, `%${word}%`);
    }
  }

  if (conditions.length === 0) return [];
  sql += conditions.join(' OR ') + ' LIMIT 2';
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (err) {
    console.error('fallbackNaiveSearch error:', err);
    return [];
  }
}
