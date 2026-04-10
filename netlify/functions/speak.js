// Netlify Function: proxy ElevenLabs TTS
// La API key vive in Netlify → Environment variables → ELEVENLABS_API_KEY
// La voice ID vive in ELEVENLABS_VOICE_ID (opzionale, default: Daniel)

const DEFAULT_VOICE = 'onwK4e9ZLuTAKqWW03F9'; // Daniel

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  // Preflight CORS (richiesto dal browser per chiamate cross-origin da GitHub Pages)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: 'ElevenLabs non configurato sul server.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: 'Invalid JSON' };
  }

  const text    = body.text    || '';
  const voiceId = body.voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;

  if (!text.trim()) {
    return { statusCode: 400, headers: CORS_HEADERS, body: 'Testo vuoto' };
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        speed: 1.4,
        voice_settings: {
          stability: 0.70,
          similarity_boost: 0.85,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs error:', response.status, err);
      return { statusCode: response.status, headers: CORS_HEADERS, body: err };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'audio/mpeg' },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: 'Errore interno' };
  }
};
