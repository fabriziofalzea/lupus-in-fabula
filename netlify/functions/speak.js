// Netlify Function: proxy ElevenLabs TTS
// La API key vive in Netlify → Environment variables → ELEVENLABS_API_KEY
// La voice ID vive in ELEVENLABS_VOICE_ID (opzionale, default: Daniel)

const DEFAULT_VOICE = 'onwK4e9ZLuTAKqWW03F9'; // Daniel

exports.handler = async (event) => {
  // Solo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'ElevenLabs non configurato sul server.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const text    = body.text    || '';
  const voiceId = body.voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;

  if (!text.trim()) {
    return { statusCode: 400, body: 'Testo vuoto' };
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
        // Voice settings ottimizzati per narrativa drammatica (2026-04-10):
        // stability 0.70: Equilibrio tra coerenza e dinamica emotiva (prev: 0.55 = robotico)
        // similarity_boost 0.85: Massima fedeltà vocale (prev: 0.80)
        // style 0.35: Enfasi dramatica e intonazione (prev: 0.20 = piatto)
        // use_speaker_boost: true = ottimizzazione vocal dynamics
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
      return { statusCode: response.status, body: err };
    }

    // Converti il body in base64 per passarlo come risposta Netlify
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: 'Errore interno' };
  }
};
