// Netlify Function: ritorna la lista voci disponibili su ElevenLabs
// Usa la stessa ELEVENLABS_API_KEY configurata nelle env var del progetto

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'ElevenLabs non configurato.' }) };
  }

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!res.ok) {
      return { statusCode: res.status, body: await res.text() };
    }

    const data = await res.json();

    // Restituisce solo id + name, ordinati per nome
    const voices = (data.voices || [])
      .map(v => ({ id: v.voice_id, name: v.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(voices),
    };
  } catch (err) {
    console.error('voices.js error:', err);
    return { statusCode: 500, body: 'Errore interno' };
  }
};
