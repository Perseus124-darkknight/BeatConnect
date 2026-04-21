import { updateSpotifyTokens } from '../user-service/user.repository.js';
import fetch from 'node-fetch';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'mock_client_id';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'mock_client_secret';
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/spotify/callback';

export const loginWithSpotify = (req, res) => {
  const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';
  const state = req.user.id.toString(); // Store user ID in state to link on callback

  const authUrl = `https://accounts.spotify.com/authorize?` + 
    `response_type=code` + 
    `&client_id=${SPOTIFY_CLIENT_ID}` + 
    `&scope=${encodeURIComponent(scope)}` + 
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` + 
    `&state=${state}`;

  res.json({ url: authUrl });
};

export const spotifyCallback = async (req, res) => {
  const { code, state } = req.query;
  const userId = parseInt(state);

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    // Exchange code for tokens
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('[SPOTIFY] Token exchange error:', data.error);
      return res.status(400).send('Spotify token exchange failed');
    }

    // Get user's Spotify ID
    const userProfileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${data.access_token}` }
    });
    const spotifyUser = await userProfileRes.json();

    // Store tokens in DB
    await updateSpotifyTokens(userId, {
      spotifyId: spotifyUser.id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    });

    // Close window and notify opener
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS', spotifyId: '${spotifyUser.id}' }, '*');
            window.close();
          </script>
          <h1>Success! You can close this window now.</h1>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('[SPOTIFY] Callback error:', error);
    res.status(500).send('Internal server error during Spotify link');
  }
};
export const getAISuggestedTags = async (req, res) => {
  const { artist, track } = req.body;
  
  if (!artist) {
    return res.status(400).json({ error: 'Artist name is required' });
  }

  try {
    // 1. Search Spotify for metadata (using client credentials or a mock if tokens missing)
    // For simplicity, we'll use a basic search. In production, we'd use the stored accessToken.
    console.log(`[SPOTIFY] Enriching metadata for: ${artist} - ${track || ''}`);
    
    // MOCK metadata if Spotify isn't fully configured (fallback)
    let metadata = {
      genres: ['unknown'],
      popularity: 50,
      preview_url: null
    };

    // 2. Prompt Beatbot to synthesize the tags
    const enrichmentPrompt = `As BeatBot 2.0, analyze the artist "${artist}" ${track ? `and track "${track}"` : ''}.
    Based on your music intelligence, suggest exactly 3 tags:
    1. Primary Genre
    2. Mood (e.g., Chill, Energetic, Melancholy)
    3. Tempo (e.g., Fast, Mid, Slow)
    Format: Genre | Mood | Tempo`;

    const { generateAIResponse } = await import('../chat-service/ai-service.js');
    const aiResult = await generateAIResponse(enrichmentPrompt, [], false, 'llama2:latest');
    
    const tags = aiResult.response.split('|').map(t => t.trim());

    res.json({
      artist,
      track,
      suggestedTags: {
        genre: tags[0] || 'Unknown',
        mood: tags[1] || 'Neutral',
        tempo: tags[2] || 'Mid'
      },
      rawAI: aiResult.response
    });

  } catch (error) {
    console.error('[SPOTIFY] Enrichment error:', error);
    res.status(500).json({ error: 'Failed to generate AI tags' });
  }
};
