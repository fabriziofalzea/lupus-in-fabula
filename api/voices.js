// Vercel Serverless Function: ritorna la lista voci disponibili su ElevenLabs
// Usa la stessa ELEVENLABS_API_KEY configurata nelle env var del progetto

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ElevenLabs non configurato sul server.' });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).send(err);
    }

    const data = await response.json();
    const voices = (data.voices || [])
      .map(v => ({ id: v.voice_id, name: v.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json(voices);
  } catch (err) {
    console.error('voices.js error:', err);
    return res.status(500).json({ error: 'Errore interno' });
  }
}
