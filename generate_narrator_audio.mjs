/**
 * generate_narrator_audio.mjs
 * Genera tutti i file MP3 del narratore usando il proxy Vercel dell'app.
 * Non serve nessuna API key — usa quella già configurata su Vercel.
 * Esegui con: node generate_narrator_audio.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────
// Usa il proxy Vercel — la chiave ElevenLabs è già lì
const PROXY_URL = 'https://lupus-in-fabula-eight.vercel.app/api/speak';
const VOICE_ID  = 'onwK4e9ZLuTAKqWW03F9'; // Daniel
const OUT_DIR   = path.join(__dirname, 'public', 'narrator');
const DELAY_MS  = 800; // pausa tra una chiamata e l'altra (evita rate limit)

// ── Tutte le frasi da generare ───────────────────────────────────
const FILES = [
  // Apertura notte
  { file: 'night_open.mp3',
    text: 'La notte cala sul villaggio. Il silenzio inghiotte ogni suono, ogni movimento.' },

  // Cupido
  { file: 'cupido_open.mp3',
    text: "Cupido, apra gli occhi. Scegli i due cuori che batteranno all'unisono — la tua freccia deciderà il loro destino per sempre." },
  { file: 'cupido_close.mp3',
    text: 'Cupido, chiuda gli occhi.' },

  // Mitomane
  { file: 'mitomane_open.mp3',
    text: 'Il Mitomane, apra gli occhi. Scegli la maschera che indosserai per tutta la partita.' },
  { file: 'mitomane_close.mp3',
    text: 'Il Mitomane, chiuda gli occhi.' },

  // Veggente
  { file: 'veggente_open.mp3',
    text: 'Il Veggente, apra gli occhi. Scegli chi vuoi osservare questa notte.' },
  { file: 'veggente_close.mp3',
    text: 'Il Veggente, chiuda gli occhi.' },

  // Guardia
  { file: 'guardia_open.mp3',
    text: 'La Guardia del Corpo, apra gli occhi. Chi proteggerai stanotte con la tua vita?' },
  { file: 'guardia_close.mp3',
    text: 'La Guardia del Corpo, chiuda gli occhi.' },

  // Figlio dei Lupi
  { file: 'figlio_dei_lupi_open.mp3',
    text: 'Il Figlio dei Lupi, apra gli occhi. Il sangue chiama, ma ancora non risponde. Osserva in silenzio.' },
  { file: 'figlio_dei_lupi_close.mp3',
    text: 'Il Figlio dei Lupi, chiuda gli occhi.' },

  // Lupi
  { file: 'lupi_open.mp3',
    text: "I Lupi, aprano gli occhi. Riconoscetevi nell'oscurità. Il branco decide — chi cade stanotte?" },
  { file: 'lupi_close.mp3',
    text: 'I Lupi, chiudano gli occhi.' },

  // Strega
  { file: 'strega_open.mp3',
    text: 'La Strega, apra gli occhi. I lupi hanno già deciso chi uccidere. Salvi, avveleni, oppure passi?' },
  { file: 'strega_close.mp3',
    text: 'La Strega, chiuda gli occhi.' },

  // Medium
  { file: 'medium_open.mp3',
    text: 'Il Medium, apra gli occhi. I morti parlano, se sai ascoltare. Indica uno spirito — scoprirai il suo segreto.' },
  { file: 'medium_close.mp3',
    text: 'Il Medium, chiuda gli occhi.' },

  // Sciamano
  { file: 'sciamano_open.mp3',
    text: "Lo Sciamano, apra gli occhi. Puoi richiamare un'anima perduta — scegli chi riportare tra i vivi." },
  { file: 'sciamano_close.mp3',
    text: 'Lo Sciamano, chiuda gli occhi.' },

  // Apertura partita
  { file: 'role_reveal.mp3',
    text: 'Ogni mascella nasconde la verità. Scopri chi sei davvero.' },

  // Alba
  { file: 'dawn_victim_reveal.mp3',
    text: 'La notte ha reclamato una vittima. Il suo nome apparirà adesso sui vostri schermi.' },
  { file: 'dawn_no_victim.mp3',
    text: "L'alba arriva silenziosamente. Le ombre si ritirano. La notte è passata senza sangue. Il villaggio si ritrova intatto al nuovo giorno." },
  { file: 'dawn_strega_heal.mp3',
    text: "L'alba arriva silenziosamente. Le ombre si ritirano. Una pozione misteriosa ha respinto la morte. Stanotte non ci sono vittime." },
  { file: 'dawn_figlio_transformed.mp3',
    text: "L'alba arriva silenziosamente. Le ombre si ritirano. Nel bosco, una creatura si è svegliata. Il villaggio rimane intatto — per ora." },

  // Giorno — votazione
  { file: 'day_victim_reveal.mp3',
    text: 'Colui che è stato nominato apparirà adesso sui vostri schermi.' },
  { file: 'day_no_majority.mp3',
    text: 'Nessuno raggiunge la maggioranza. Il villaggio rimane spaccato. La notte sta arrivando…' },

  // Fine partita
  { file: 'end_lupi_win.mp3',
    text: "Il villaggio è caduto. I lupi escono dall'ombra, il loro ululato riecheggia nella notte. Il branco ha trionfato." },
  { file: 'end_villaggio_win.mp3',
    text: 'Ultimo lupo svelato. Il villaggio esulta — la pace torna tra le case, le porte si riaprono, le candele si riaccendono.' },
  { file: 'end_lupi_win_short.mp3',
    text: 'Il branco ha trionfato. Il villaggio è caduto.' },
  { file: 'end_villaggio_win_short.mp3',
    text: 'Il villaggio ha vinto. La pace è tornata.' },

  // Test voce (pannello impostazioni)
  { file: 'test_voice.mp3',
    text: 'La notte. I segreti del villaggio si risvegliano.' },
];

// ── Helpers ──────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function generateFile({ file, text }) {
  const outPath = path.join(OUT_DIR, file);

  // Salta se già esiste
  if (fs.existsSync(outPath)) {
    console.log(`  ⏭  ${file} — già presente, skip`);
    return;
  }

  // Chiama il proxy Vercel (la chiave ElevenLabs è già configurata lì)
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId: VOICE_ID }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err}`);
  }

  const buffer = await res.arrayBuffer();
  fs.writeFileSync(outPath, Buffer.from(buffer));
  console.log(`  ✅  ${file}`);
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🎙  Generazione audio narratore — ${FILES.length} file\n`);
  console.log(`   Proxy    : ${PROXY_URL}`);
  console.log(`   Voice ID : ${VOICE_ID}`);
  console.log(`   Output   : ${OUT_DIR}\n`);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0, skipped = 0, errors = 0;

  for (const item of FILES) {
    process.stdout.write(`  ⏳ ${item.file} … `);
    // Rimuovi il cursore dalla riga precedente sovrascrivendo
    process.stdout.write('\r');
    try {
      const existed = fs.existsSync(path.join(OUT_DIR, item.file));
      await generateFile(item);
      existed ? skipped++ : ok++;
    } catch (e) {
      console.error(`  ❌  ${item.file} — ${e.message}`);
      errors++;
    }
    await sleep(DELAY_MS);
  }

  console.log('\n────────────────────────────────');
  console.log(`  ✅  Generati  : ${ok}`);
  console.log(`  ⏭  Saltati   : ${skipped} (già presenti)`);
  console.log(`  ❌  Errori    : ${errors}`);
  if (errors === 0) {
    console.log('\n🎉  Tutti i file sono pronti in public/narrator/');
    console.log('   Esegui ora: npm run build\n');
  } else {
    console.log('\n⚠️  Risolvi gli errori e riesegui — i file già presenti verranno saltati.\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
