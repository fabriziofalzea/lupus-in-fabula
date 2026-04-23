import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';

// === FIREBASE IMPORTS ====
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

// Riassegna per i riferimenti globali
window.firebase = firebase;

// === GLOBAL HELPERS E LOGIC ===

    export default function AppWrapper() { return <App />; }

      
      
      
      const checkGlobal = (name, obj) => {
        if (!obj) {
          console.log(`CHECK FAILED: ${name} is UNDEFINED`);
          throw new Error(`Libreria critica mancante: ${name}`);
        } else {
          console.log(`CHECK OK: ${name} is present`);
        }
      };

      
      
      

      // Rimuove il caricamento
      

      console.log("App Bootstrapping inside wrapper...");
    window.NARRATOR_IMG = '/narrator.png'; // Daniel — voce narratore di default

const EL_DEFAULT_VOICE = 'onwK4e9ZLuTAKqWW03F9'; // Daniel (ElevenLabs)
window.EL_VOICES = [
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice' },
];

window.getELConfig = () => ({
  key:   localStorage.getItem('lif_el_key')   || '',
  voice: localStorage.getItem('lif_el_voice') || EL_DEFAULT_VOICE,
  customVoice: localStorage.getItem('lif_el_custom_voice') || '',
});

// --- AUDIO UNLOCK PER iOS SAFARI/WKWEBVIEW ---
window._elAudio = null;
window._globalAudio = new Audio();
window._globalAudio.autoplay = true;
window._audioUnlocked = false;

// Sblocca l'audio globale al primo tap sullo schermo
const unlockAudio = () => {
  if (!window._audioUnlocked) {
    window._globalAudio.play().catch(() => {});
    window._audioUnlocked = true;
    document.removeEventListener('pointerdown', unlockAudio);
    document.removeEventListener('click', unlockAudio);
  }
};
document.addEventListener('pointerdown', unlockAudio, { once: true });
document.addEventListener('click', unlockAudio, { once: true });

// Riproduce un blob audio e gestisce eventi narrator_start/end
window._playAudioBlob = (blob) => {
  const url = URL.createObjectURL(blob);
  // Usa l'audio globale pre-sbloccato se disponibile (essenziale per Capacitor/iOS)
  const audio = window._audioUnlocked ? window._globalAudio : new Audio();
  audio.src = url;
  window._elAudio = audio;
  
  audio.onended = () => { URL.revokeObjectURL(url); window.dispatchEvent(new Event('narrator_end')); };
  audio.onerror = () => { URL.revokeObjectURL(url); window.dispatchEvent(new Event('narrator_end')); };
  audio.play().catch(e => {
    console.warn("Audio play blocked by iOS:", e);
    URL.revokeObjectURL(url);
    window.dispatchEvent(new Event('narrator_end'));
  });
};

// ══════════════════════════════════════════════════════════════════
// HYBRID NARRATOR SYSTEM — Frasi statiche pre-registrate
// Mappa testo → path file MP3 in public/narrator/
// Le frasi che non matchano vengono generate via ElevenLabs API.
// Risparmio stimato: ~94% delle chiamate API per partita.
// Per registrare: usa ElevenLabs Playground, salva i file in public/narrator/
// ══════════════════════════════════════════════════════════════════
window.NARRATOR_STATIC_AUDIO = {
  // ── Notte: apertura ──
  'La notte cala sul villaggio. Il silenzio inghiotte ogni suono, ogni movimento.':
    '/narrator/night_open.mp3',
  // ── Cupido ──
  'Cupido, apra gli occhi. Scegli i due cuori che batteranno all\'unisono — la tua freccia deciderà il loro destino per sempre.':
    '/narrator/cupido_open.mp3',
  'Cupido, chiuda gli occhi.':
    '/narrator/cupido_close.mp3',
  // ── Mitomane ──
  'Il Mitomane, apra gli occhi. Scegli la maschera che indosserai per tutta la partita.':
    '/narrator/mitomane_open.mp3',
  'Il Mitomane, chiuda gli occhi.':
    '/narrator/mitomane_close.mp3',
  // ── Veggente ──
  'Il Veggente, apra gli occhi. Scegli chi vuoi osservare questa notte.':
    '/narrator/veggente_open.mp3',
  'Il Veggente, chiuda gli occhi.':
    '/narrator/veggente_close.mp3',
  // ── Guardia ──
  'La Guardia del Corpo, apra gli occhi. Chi proteggerai stanotte con la tua vita?':
    '/narrator/guardia_open.mp3',
  'La Guardia del Corpo, chiuda gli occhi.':
    '/narrator/guardia_close.mp3',
  // ── Figlio dei Lupi ──
  'Il Figlio dei Lupi, apra gli occhi. Il sangue chiama, ma ancora non risponde. Osserva in silenzio.':
    '/narrator/figlio_dei_lupi_open.mp3',
  'Il Figlio dei Lupi, chiuda gli occhi.':
    '/narrator/figlio_dei_lupi_close.mp3',
  // ── Lupi ──
  'I Lupi, aprano gli occhi. Riconoscetevi nell\'oscurità. Il branco decide — chi cade stanotte?':
    '/narrator/lupi_open.mp3',
  'I Lupi, chiudano gli occhi.':
    '/narrator/lupi_close.mp3',
  // ── Strega ──
  'La Strega, apra gli occhi. I lupi hanno già deciso chi uccidere. Salvi, avveleni, oppure passi?':
    '/narrator/strega_open.mp3',
  'La Strega, chiuda gli occhi.':
    '/narrator/strega_close.mp3',
  // ── Medium ──
  'Il Medium, apra gli occhi. I morti parlano, se sai ascoltare. Indica uno spirito — scoprirai il suo segreto.':
    '/narrator/medium_open.mp3',
  'Il Medium, chiuda gli occhi.':
    '/narrator/medium_close.mp3',
  // ── Sciamano ──
  'Lo Sciamano, apra gli occhi. Puoi richiamare un\'anima perduta — scegli chi riportare tra i vivi.':
    '/narrator/sciamano_open.mp3',
  'Lo Sciamano, chiuda gli occhi.':
    '/narrator/sciamano_close.mp3',
  // ── Apertura partita ──
  'Ogni mascella nasconde la verità. Scopri chi sei davvero.':
    '/narrator/role_reveal.mp3',
  // ── Alba ──
  'La notte ha reclamato una vittima. Il suo nome apparirà adesso sui vostri schermi.':
    '/narrator/dawn_victim_reveal.mp3',
  'L\'alba arriva silenziosamente. Le ombre si ritirano. La notte è passata senza sangue. Il villaggio si ritrova intatto al nuovo giorno.':
    '/narrator/dawn_no_victim.mp3',
  'L\'alba arriva silenziosamente. Le ombre si ritirano. Una pozione misteriosa ha respinto la morte. Stanotte non ci sono vittime.':
    '/narrator/dawn_strega_heal.mp3',
  'L\'alba arriva silenziosamente. Le ombre si ritirano. Nel bosco, una creatura si è svegliata. Il villaggio rimane intatto — per ora.':
    '/narrator/dawn_figlio_transformed.mp3',
  // ── Giorno: risultato votazione ──
  'Colui che è stato nominato apparirà adesso sui vostri schermi.':
    '/narrator/day_victim_reveal.mp3',
  'Nessuno raggiunge la maggioranza. Il villaggio rimane spaccato. La notte sta arrivando…':
    '/narrator/day_no_majority.mp3',
  // ── Fine partita ──
  'Il villaggio è caduto. I lupi escono dall\'ombra, il loro ululato riecheggia nella notte. Il branco ha trionfato.':
    '/narrator/end_lupi_win.mp3',
  'Ultimo lupo svelato. Il villaggio esulta — la pace torna tra le case, le porte si riaprono, le candele si riaccendono.':
    '/narrator/end_villaggio_win.mp3',
  'Il branco ha trionfato. Il villaggio è caduto.':
    '/narrator/end_lupi_win_short.mp3',
  'Il villaggio ha vinto. La pace è tornata.':
    '/narrator/end_villaggio_win_short.mp3',
  // ── Test voce ──
  'La notte. I segreti del villaggio si risvegliano.':
    '/narrator/test_voice.mp3',
};

// Riproduce un file audio statico pre-registrato (path locale, es. /narrator/night_open.mp3)
window._playStaticAudio = (path) => {
  const audio = window._audioUnlocked ? window._globalAudio : new Audio();
  audio.src = path;
  window._elAudio = audio;
  audio.onended = () => window.dispatchEvent(new Event('narrator_end'));
  audio.onerror = () => {
    // File non ancora registrato — cade in silenzio (legge lo script)
    console.warn('[Narrator] File statico non trovato:', path);
    window.dispatchEvent(new Event('narrator_end'));
  };
  audio.play().catch(e => {
    console.warn('[Narrator] Static audio play blocked:', e);
    window.dispatchEvent(new Event('narrator_end'));
  });
};

window.speakNarration = (text) => {
  if (window._elAudio) { window._elAudio.pause(); window._elAudio = null; }

  const mode = localStorage.getItem('lif_tts_mode') || 'script';

  // ── Qualsiasi modalità tranne 'voice' = script: solo testo, nessun audio ──
  if (mode !== 'voice') {
    window.dispatchEvent(new Event('narrator_start'));
    setTimeout(() => window.dispatchEvent(new Event('narrator_end')), 200);
    return;
  }

  window.dispatchEvent(new Event('narrator_start'));

  // ── HYBRID: prova file statico pre-registrato prima di chiamare API ──
  // Cerca il testo esatto nella mappa (le frasi con nomi giocatori non matchano → API)
  const staticPath = window.NARRATOR_STATIC_AUDIO?.[text];
  if (staticPath) {
    console.log('[Narrator] 🎵 Statico:', staticPath);
    window._playStaticAudio(staticPath);
    return;
  }

  console.log('[Narrator] 🤖 API ElevenLabs (testo dinamico):', text.substring(0, 60) + '…');

  // ── Modalità voce AI (ElevenLabs) — solo per testi dinamici con nomi ──
  const cfg    = window.getELConfig();
  const voiceId = cfg.voice === 'custom' ? cfg.customVoice : cfg.voice;

  // ── 1. Prova il proxy Vercel (produzione — key sul server) ──
  const apiBase = window.IS_NATIVE_APP ? 'https://lupus-in-fabula-eight.vercel.app' : window.location.origin;
  fetch(`${apiBase}/api/speak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId }),
  })
  .then(r => { if (!r.ok) throw new Error('proxy ' + r.status); return r.blob(); })
  .then(blob => window._playAudioBlob(blob))
  .catch(() => {
    // ── 2. Fallback: ElevenLabs diretto con key locale (sviluppo) ──
    if (cfg.key && voiceId) {
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': cfg.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          speed: 1.4,
          voice_settings: { stability: 0.70, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
        }),
      })
      .then(r => { if (!r.ok) throw new Error('EL ' + r.status); return r.blob(); })
      .then(blob => window._playAudioBlob(blob))
      .catch(err => {
        console.warn('ElevenLabs diretto fallito:', err);
        window.dispatchEvent(new Event('narrator_end'));
      });
    } else {
      window.dispatchEvent(new Event('narrator_end'));
    }
  });
};

window._speakBrowser = (text) => {
  if(!window.speechSynthesis) return;

  const doSpeak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';
    utterance.volume = 1.0;

    utterance.onstart = () => window.dispatchEvent(new Event('narrator_start'));
    utterance.onend   = () => window.dispatchEvent(new Event('narrator_end'));
    utterance.onerror = ()  => window.dispatchEvent(new Event('narrator_end'));

    const voices   = window.speechSynthesis.getVoices();
    const itVoices = voices.filter(v => v.lang.startsWith('it'));

    const MALE_NAMES = ['Luca','Federico','Roberto','Paolo','Filippo','Mario','Giorgio','Cosimo','Matteo'];
    const isMale = v => MALE_NAMES.some(n => v.name.includes(n));
    const isHQ   = v => v.name.includes('Enhanced') || v.name.includes('Premium')
                      || v.name.includes('Siri')    || v.name.includes('Google');

    const voice =
      itVoices.find(v => isMale(v) && isHQ(v))   ||
      itVoices.find(v => v.name.includes('Siri')) ||
      itVoices.find(v => isMale(v))               ||
      itVoices.find(v => isHQ(v))                 ||
      itVoices[0];

    if (voice) {
      utterance.voice = voice;
      const hq = isHQ(voice);
      utterance.pitch = hq ? 0.63 : 0.40;
      utterance.rate  = hq ? 0.86 : 0.80;
    } else {
      utterance.pitch = 0.25;
      utterance.rate  = 0.68;
    }

    window.speechSynthesis.speak(utterance);

    const heartbeat = setInterval(() => {
      if (!window.speechSynthesis.speaking) clearInterval(heartbeat);
      else window.speechSynthesis.resume();
    }, 5000);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => { doSpeak(); window.speechSynthesis.onvoiceschanged = null; };
  } else {
    doSpeak();
  }
};

// Esegue callback solo dopo che il narratore finisce di parlare.
// fallbackMs: timeout di sicurezza nel caso l'evento non arrivi mai.
window.afterSpeech = (callback, fallbackMs = 8000) => {
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    window.removeEventListener('narrator_end', fire);
    setTimeout(callback, 700);
  };
  window.addEventListener('narrator_end', fire);
  setTimeout(fire, fallbackMs);
};

window.playSfx = (id) => {
  const el = document.getElementById('sfx-'+id);
  if(!el) return;
  if(id==='night') { el.volume = 0.3; el.play().catch(e=>console.log(e)); }
  else { el.currentTime=0; el.play().catch(e=>console.log(e)); }
};
window.stopSfx = (id) => {
  const el = document.getElementById('sfx-'+id);
  if(el) { el.pause(); el.currentTime=0; }
};


/* ================================================================
   APP STORE URL — aggiorna quando l'app è live su App Store
   ================================================================ */
const APP_STORE_URL = 'https://apps.apple.com/app/lupus-in-fabula/id000000000';

/* ================================================================
   FIREBASE CONFIG — inserisci i tuoi dati (vedi SETUP.md)
   ================================================================ */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCgz3kw5YESi6BYktVz3lPz4dQbXcKuUY0",
  authDomain:        "lupus-in-fabula-c1c3e.firebaseapp.com",
  databaseURL:       "https://lupus-in-fabula-c1c3e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "lupus-in-fabula-c1c3e",
  storageBucket:     "lupus-in-fabula-c1c3e.firebasestorage.app",
  messagingSenderId: "994430330214",
  appId:             "1:994430330214:web:d6ba507899d79968b054a7"
};

/* ================================================================
   ROLES DATABASE
   ================================================================ */
const ROLES = {
  lupo: {
    id:'lupo', name:'Lupo', team:'lupi', color:'#c0392b', icon:'🐺',
    abbr:'L',
    category:'lupi', wakeOrder:3, nightAction:true,
    description:'Ogni notte, insieme agli altri lupi, scegli silenziosamente una vittima da eliminare. Di giorno cerca di non essere scoperto e influenza il voto del villaggio.',
    tip:'Non attaccare mai la stessa persona due notti di fila — è prevedibile.'
  },
  villico: {
    id:'villico', name:'Villico', team:'villaggio', color:'#27ae60', icon:'👨‍🌾',
    abbr:'V',
    category:'villaggio', wakeOrder:null, nightAction:false,
    description:'Sei un abitante del villaggio. Non hai poteri speciali, ma il tuo voto e la tua capacità di ragionamento sono fondamentali per scoprire i lupi.',
    tip:'Osserva chi è troppo silenzioso di notte — potrebbe essere un lupo.'
  },
  veggente: {
    id:'veggente', name:'Veggente', team:'villaggio', color:'#8e44ad', icon:'🔮',
    abbr:'Vg',
    category:'speciale', wakeOrder:1, nightAction:true,
    description:'Ogni notte puoi indicare al narratore un giocatore: lui ti rivelerà se appartiene ai lupi o al villaggio. Usa questa informazione con strategia.',
    tip:'Non rivelare il tuo ruolo troppo presto — i lupi ti elimineranno subito.'
  },
  guardia: {
    id:'guardia', name:'Guardia del Corpo', team:'villaggio', color:'#2980b9', icon:'🛡️',
    abbr:'Gd',
    category:'speciale', wakeOrder:2, nightAction:true,
    description:'Ogni notte puoi proteggere un giocatore dall\'attacco dei lupi. Non puoi proteggere te stesso due notti consecutive.',
    tip:'Proteggi il veggente nelle prime notti — è la risorsa più preziosa.'
  },
  strega: {
    id:'strega', name:'Strega', team:'villaggio', color:'#6c3483', icon:'🧙‍♀️',
    abbr:'St', pack:'ombre',
    category:'speciale', wakeOrder:4, nightAction:true,
    description:'Hai due pozioni: una di guarigione (salva la vittima dei lupi) e una di veleno (elimina chiunque). Ogni pozione si usa una sola volta in tutta la partita.',
    tip:'Tieni il veleno per quando sei sicura al 90% dell\'identità di un lupo.'
  },
  cacciatore: {
    id:'cacciatore', name:'Cacciatore', team:'villaggio', color:'#795548', icon:'🏹',
    abbr:'Ca', pack:'ombre',
    category:'speciale', wakeOrder:null, nightAction:false,
    description:'Quando vieni eliminato (di giorno o di notte), puoi portare con te un altro giocatore. Questa è la tua unica abilità ma può essere decisiva.',
    tip:'Tieni nascosto il tuo ruolo — i lupi eviteranno di eliminarti se sanno.'
  },
  cupido: {
    id:'cupido', name:'Cupido', team:'villaggio', color:'#e91e63', icon:'💘',
    abbr:'Cu', pack:'villaggio',
    category:'speciale', wakeOrder:0, nightAction:true,
    description:'La prima notte scegli due innamorati. Se uno muore, l\'altro muore di dolore. Se sono un lupo e un villico, vincono solo se sono gli ultimi due sopravvissuti.',
    tip:'Unire due lupi o due ruoli chiave del villaggio può essere devastante.'
  },
  sindaco: {
    id:'sindaco', name:'Sindaco', team:'villaggio', color:'#f39c12', icon:'🏛️',
    abbr:'Sd', pack:'villaggio',
    category:'speciale', wakeOrder:null, nightAction:false,
    description:'Il tuo voto vale doppio durante le votazioni del giorno. Se vieni eliminato, puoi designare il tuo successore prima di morire.',
    tip:'Rivela il tuo ruolo al momento giusto per imporre l\'eliminazione del lupo.',
    voteWeight: 2
  },
  medium: {
    id:'medium', name:'Medium', team:'villaggio', color:'#00838f', icon:'👁️',
    abbr:'Md', pack:'ombre',
    category:'speciale', wakeOrder:5, nightAction:true,
    description:'Una volta per partita, durante la notte, puoi "parlare" con uno dei giocatori eliminati e scoprirne il ruolo.',
    tip:'Usa il potere dopo almeno 2-3 eliminazioni per ottenere info utili.'
  },
  mitomane: {
    id:'mitomane', name:'Mitomane', team:'villaggio', color:'#9c27b0', icon:'🎭',
    abbr:'Mi', pack:'villaggio',
    category:'speciale', wakeOrder:0.5, nightAction:true,
    description:'La prima notte sceglie segretamente un giocatore da imitare. Per tutta la partita la Veggente lo vede come quel ruolo. Vince con il villaggio.',
    tip:'Imita un lupo per sviare la Veggente — ma attento a non farti smascherare di giorno.'
  },
  figlio_dei_lupi: {
    id:'figlio_dei_lupi', name:'Figlio dei Lupi', team:'villaggio', color:'#78350f', icon:'🐺',
    abbr:'Fl', pack:'ombre',
    category:'speciale', wakeOrder:3.5, nightAction:false,
    description:'Sembri un normale villico, ma nel tuo sangue scorre qualcosa di selvatico. Se i lupi ti attaccano di notte non morirai — ti unirai al branco. La Veggente ti vedrà innocente finché la trasformazione non avviene. Se vieni eliminato al rogo di giorno, muori come chiunque altro.',
    tip:'Solo tu sai chi sei. Comportati da villico — finché il momento non arriva.',
    becomesWolfIfKilled: true
  },
  sciamano: {
    id:'sciamano', name:'Sciamano', team:'villaggio', color:'#06b6d4', icon:'🪬',
    abbr:'Sc', pack:'villaggio',
    category:'speciale', wakeOrder:8, nightAction:true,
    description:'Una volta per partita, durante la notte, puoi richiamare l\'anima di un giocatore eliminato e riportarlo in vita con il suo ruolo originale. Il risorto non sa nulla di ciò che è accaduto durante la sua assenza.',
    tip:'Aspetta il momento giusto. Resuscitare un Veggente o una Strega a metà partita può ribaltare tutto.',
  }
};

const DEFAULT_ROLES = ['lupo','lupo','villico','villico','villico','veggente'];

/* ================================================================
   ROLE VISUALS
   ================================================================ */
// image: null → usa il gradient CSS. Per il 3D: image: 'https://...' e il gradient sparisce.
const ROLE_VISUALS = {
  lupo:           { gradient:'linear-gradient(145deg,#1a0005,#3d0010,#1a0000)', glow:'#cc1a1a', particle:'🌑' },
  veggente:       { gradient:'linear-gradient(145deg,#0a001a,#1e0050,#0d0030)', glow:'#7c3aed', particle:'✨' },
  guardia:        { gradient:'linear-gradient(145deg,#001020,#003555,#001830)', glow:'#0ea5e9', particle:'🛡️' },
  strega:         { gradient:'linear-gradient(145deg,#001a05,#004015,#051800)', glow:'#16a34a', particle:'🌿' },
  figlio_dei_lupi:{ gradient:'linear-gradient(145deg,#1a0d00,#3d2200,#1a1200)', glow:'#b45309', particle:'🍂' },
  sciamano:       { gradient:'linear-gradient(145deg,#001a1a,#003838,#001a2a)', glow:'#06b6d4', particle:'🌀' },
  cupido:         { gradient:'linear-gradient(145deg,#1a0012,#450030,#1a001a)', glow:'#ec4899', particle:'💫' },
  sindaco:        { gradient:'linear-gradient(145deg,#1a1400,#3d2d00,#1a0e00)', glow:'#eab308', particle:'👁️'  },
  medium:         { gradient:'linear-gradient(145deg,#080812,#14142e,#080818)', glow:'#818cf8', particle:'🌀' },
  cacciatore:     { gradient:'linear-gradient(145deg,#051800,#103000,#0a1800)', glow:'#65a30d', particle:'🎯' },
  mitomane:       { gradient:'linear-gradient(145deg,#001a15,#003a30,#001a20)', glow:'#0d9488', particle:'🎭' },
  villico:        { gradient:'linear-gradient(145deg,#0d0a00,#201800,#0d0900)', glow:'#a16207', particle:'🌾' },
};

/* ================================================================
   NIGHT NARRATION
   ================================================================ */
const NIGHT_NARRATION = {
  open:     { open: 'La notte cala sul villaggio. Il silenzio inghiotte ogni suono, ogni movimento.', close: null },
  cupido:   { open: 'Cupido, apra gli occhi. Scegli i due cuori che batteranno all\'unisono — la tua freccia deciderà il loro destino per sempre.', close: 'Cupido, chiuda gli occhi.' },
  mitomane: { open: 'Il Mitomane, apra gli occhi. Scegli la maschera che indosserai per tutta la partita.', close: 'Il Mitomane, chiuda gli occhi.' },
  veggente: { open: 'Il Veggente, apra gli occhi. Scegli chi vuoi osservare questa notte.', close: 'Il Veggente, chiuda gli occhi.' },
  guardia:  { open: 'La Guardia del Corpo, apra gli occhi. Chi proteggerai stanotte con la tua vita?', close: 'La Guardia del Corpo, chiuda gli occhi.' },
  figlio_dei_lupi: { open: 'Il Figlio dei Lupi, apra gli occhi. Il sangue chiama, ma ancora non risponde. Osserva in silenzio.', close: 'Il Figlio dei Lupi, chiuda gli occhi.' },
  lupi:     { open: 'I Lupi, aprano gli occhi. Riconoscetevi nell\'oscurità. Il branco decide — chi cade stanotte?', close: 'I Lupi, chiudano gli occhi.' },
  strega:   { open: 'La Strega, apra gli occhi. I lupi hanno già deciso chi uccidere. Salvi, avveleni, oppure passi?', close: 'La Strega, chiuda gli occhi.' },
  medium:   { open: 'Il Medium, apra gli occhi. I morti parlano, se sai ascoltare. Indica uno spirito — scoprirai il suo segreto.', close: 'Il Medium, chiuda gli occhi.' },
  sciamano: { open: 'Lo Sciamano, apra gli occhi. Puoi richiamare un\'anima perduta — scegli chi riportare tra i vivi.', close: 'Lo Sciamano, chiuda gli occhi.' },
  close:    { open: 'L\'alba arriva silenziosamente. Le ombre si ritirano, e il villaggio deve affrontare quello che la notte ha portato.', close: null },
};

const NIGHT_STEPS = [
  { key:'open',     label:'Apertura',     icon:'🌙', hasRole:false },
  { key:'cupido',   label:'Cupido',       icon:'💘', hasRole:true,  roleId:'cupido',   firstNightOnly:true },
  { key:'mitomane', label:'Mitomane',     icon:'🎭', hasRole:true,  roleId:'mitomane', firstNightOnly:true },
  { key:'veggente', label:'Veggente',     icon:'🔮', hasRole:true,  roleId:'veggente' },
  { key:'guardia',         label:'Guardia',         icon:'🛡️', hasRole:true,  roleId:'guardia' },
  { key:'figlio_dei_lupi', label:'Figlio dei Lupi',  icon:'🐺', hasRole:true,  roleId:'figlio_dei_lupi' },
  { key:'lupi',            label:'Lupi',             icon:'🐺', hasRole:true,  roleId:'lupo' },
  { key:'strega',   label:'Strega',       icon:'🧙‍♀️', hasRole:true,  roleId:'strega' },
  { key:'medium',   label:'Medium',       icon:'👁️', hasRole:true,  roleId:'medium' },
  { key:'sciamano', label:'Sciamano',     icon:'🪬', hasRole:true,  roleId:'sciamano' },
  // 'close' rimosso: il testo alba è ora prefisso del dawn reveal (evita duplicati)
];

/* ================================================================
   UTILITIES
   ================================================================ */
function uid(len=8) {
  return Math.random().toString(36).substr(2, len).toUpperCase();
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function checkWin(players, lovers) {
  const alive = Object.values(players).filter(p => p.alive);
  const wolves = alive.filter(p => ROLES[p.role]?.team === 'lupi');
  const villagers = alive.filter(p => ROLES[p.role]?.team === 'villaggio');

  // Win condition speciale Cupido: se i soli sopravvissuti sono esattamente i due innamorati, vince l'amore
  if (lovers && Object.keys(lovers).length >= 2) {
    const loverIds = Object.keys(lovers).slice(0, 2);
    const aliveIds = new Set(Object.keys(players).filter(k => players[k]?.alive));
    const bothLoversAlive = loverIds.every(lid => aliveIds.has(lid));
    if (bothLoversAlive && aliveIds.size === 2 && loverIds.every(lid => aliveIds.has(lid))) {
      return 'amore';
    }
  }

  if (wolves.length === 0) return 'villaggio';
  if (wolves.length >= villagers.length) return 'lupi';
  return null;
}

/* ================================================================
   FIREBASE INIT
   ================================================================ */
let db = null;
let auth = null;
const isFirebaseConfigured = () =>
  FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith('INSERISCI');

function initFirebase() {
  if (!isFirebaseConfigured()) return;
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    auth = firebase.auth();
  } catch(e) { console.warn('Firebase init error:', e); }
}
initFirebase();

/* ── Safe Area iOS: CSS env() diretto, nessun JS timing issue ── */
// Segnale globale: siamo in app nativa Capacitor?
window.IS_NATIVE_APP = (
  window.location.protocol === 'capacitor:' ||
  window.location.protocol === 'file:' ||
  !!(window.Capacitor?.isNativePlatform?.())
);

/* ================================================================
   USER PROFILE (Google Auth)
   ================================================================ */
function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if(!auth) return;
    // Gestisce il ritorno dal redirect (solo su app nativa iOS)
    const isNative = !!(window.Capacitor?.isNativePlatform?.());
    if (isNative) {
      auth.getRedirectResult()
        .then(result => { if (result?.user) setUser(result.user); })
        .catch(e => console.warn('getRedirectResult error:', e.code, e.message));
    }
    return auth.onAuthStateChanged(u => setUser(u));
  }, []);
  return user;
}

function UserProfile() {
  const user = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [mode, setMode] = useState('main'); // 'main' | 'forgot' | 'forgot_sent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const isNativeApp = !!window.IS_NATIVE_APP;

  const AUTH_ERRORS = {
    'auth/user-not-found':        'Nessun account con questa email.',
    'auth/wrong-password':        'Password errata.',
    'auth/email-already-in-use':  'Email già registrata.',
    'auth/weak-password':         'Password troppo corta (min. 6 caratteri).',
    'auth/invalid-email':         'Email non valida.',
    'auth/invalid-credential':    'Email o password errati.',
    'auth/network-request-failed':'Errore di rete. Controlla la connessione.',
    'auth/too-many-requests':     'Troppi tentativi. Riprova tra poco.',
    'auth/operation-not-allowed': 'Accesso non abilitato in Firebase Console.',
  };

  const open = () => { setShowModal(true); setMode('main'); setAuthError(''); };
  const close = () => { setShowModal(false); setEmail(''); setPassword(''); setAuthError(''); setMode('main'); };

  const loginGoogle = () => {
    if (!auth || isNativeApp) return;
    setAuthError('');
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(close)
      .catch(e => setAuthError(AUTH_ERRORS[e.code] || e.message));
  };

  const loginApple = async () => {
    if (!auth) return;
    setLoading(true); setAuthError('');
    try {
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
      const result = await SignInWithApple.authorize({
        clientId: 'com.lupusinfabula.app',
        redirectURI: 'https://lupus-in-fabula-eight.vercel.app',
        scopes: 'email name',
      });
      const provider = new firebase.auth.OAuthProvider('apple.com');
      const credential = provider.credential({ idToken: result.response.identityToken });
      await auth.signInWithCredential(credential);
      close();
    } catch(e) {
      if (e?.code !== 'SIGN_IN_CANCELLED') {
        setAuthError('Accesso con Apple non riuscito. Riprova.');
      }
    } finally { setLoading(false); }
  };

  const loginEmail = async () => {
    if (!auth || !email || !password) return;
    setAuthError(''); setLoading(true);
    try {
      if (isRegister) {
        await auth.createUserWithEmailAndPassword(email, password);
      } else {
        await auth.signInWithEmailAndPassword(email, password);
      }
      close();
    } catch(e) {
      setAuthError(AUTH_ERRORS[e.code] || `Errore: ${e.message}`);
    } finally { setLoading(false); }
  };

  const sendPasswordReset = async () => {
    if (!auth || !email) { setAuthError('Inserisci la tua email sopra.'); return; }
    setLoading(true); setAuthError('');
    try {
      await auth.sendPasswordResetEmail(email);
      setMode('forgot_sent');
    } catch(e) {
      setAuthError(AUTH_ERRORS[e.code] || 'Errore invio email.');
    } finally { setLoading(false); }
  };

  const handleLogout = () => auth.signOut();

  if (!isFirebaseConfigured()) return null;

  /* ── Utente loggato: pillola in alto a destra ── */
  if (user) {
    return (
      <div className="absolute right-4 flex items-center gap-2 z-50"
           style={{top:"calc(env(safe-area-inset-top, 16px) + 8px)"}}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
             style={{background:'rgba(10,10,26,0.85)', border:'1px solid rgba(226,201,126,0.25)',
                     boxShadow:'0 0 12px rgba(226,201,126,0.08)'}}>
          {user.photoURL
            ? <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover border border-yellow-600/40" referrerPolicy="no-referrer"/>
            : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                   style={{background:'rgba(226,201,126,0.15)', color:'#e2c97e'}}>
                {user.email?.[0]?.toUpperCase()}
              </div>
          }
          <span className="text-white text-xs font-semibold max-w-[80px] truncate">
            {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
          </span>
          <button onClick={handleLogout} className="text-gray-600 hover:text-red-400 text-xs transition-colors ml-1">
            Esci
          </button>
        </div>
      </div>
    );
  }

  /* ── Non loggato: bottone + modal ── */
  return (
    <>
      {/* Trigger */}
      <div className="absolute right-4 z-50" style={{top:"calc(env(safe-area-inset-top, 16px) + 8px)"}}>
        <button onClick={open}
                className="btn-ghost px-4 py-2 rounded-full text-xs flex items-center gap-2"
                style={{boxShadow:'0 0 10px rgba(226,201,126,0.08)'}}>
          <span>👤</span> Accedi
        </button>
      </div>

      {/* Modal bottom sheet */}
      {showModal && (
        <div className="fixed inset-0 z-[998] flex items-end justify-center p-4"
             style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)'}}
             onClick={close}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden anim-fade-up"
               style={{background:'linear-gradient(180deg,#12122a 0%,#0a0a1a 100%)',
                       border:'1px solid rgba(226,201,126,0.2)'}}
               onClick={e=>e.stopPropagation()}>

            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{background:'rgba(255,255,255,0.12)'}}/>
            </div>

            <div className="px-6 pt-3 pb-7">

              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">🐺</div>
                <h2 className="font-cinzel text-moon text-lg font-bold mb-1">
                  {mode==='forgot' ? 'Recupera password' : mode==='forgot_sent' ? 'Email inviata!' : isRegister ? 'Crea il tuo profilo' : 'Entra nel branco'}
                </h2>
                {mode==='main' && (
                  <p className="text-gray-600 text-xs">Salva partite · Profilo · Classifica</p>
                )}
              </div>

              {/* ── Stato: email reset inviata ── */}
              {mode==='forgot_sent' && (
                <div className="text-center">
                  <div className="text-4xl mb-3">📬</div>
                  <p className="text-gray-300 text-sm mb-1">Controlla la tua casella email.</p>
                  <p className="text-gray-600 text-xs mb-6">Troverai un link per reimpostare la password.</p>
                  <button onClick={()=>setMode('main')}
                          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                          style={{background:'rgba(226,201,126,0.12)', border:'1px solid rgba(226,201,126,0.3)', color:'#e2c97e'}}>
                    ← Torna al login
                  </button>
                </div>
              )}

              {/* ── Stato: recupero password ── */}
              {mode==='forgot' && (
                <>
                  <p className="text-gray-500 text-xs mb-4 text-center">
                    Inserisci la tua email e ti mandiamo un link per reimpostare la password.
                  </p>
                  <input type="email" placeholder="La tua email" value={email}
                    onChange={e=>setEmail(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&sendPasswordReset()}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white mb-3 outline-none"
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)'}}/>
                  {authError && <p className="text-red-400 text-xs mb-3">{authError}</p>}
                  <button onClick={sendPasswordReset} disabled={loading}
                          className="w-full py-3.5 rounded-xl text-sm font-bold mb-3 transition-all active:scale-95"
                          style={{background:'rgba(226,201,126,0.15)', border:'1px solid rgba(226,201,126,0.35)', color:'#e2c97e'}}>
                    {loading ? '…' : 'Invia link di recupero'}
                  </button>
                  <button onClick={()=>{setMode('main'); setAuthError('');}}
                          className="w-full text-center text-gray-600 text-xs hover:text-gray-400 transition-colors">
                    ← Torna al login
                  </button>
                </>
              )}

              {/* ── Stato: login / registrazione ── */}
              {mode==='main' && (
                <>
                  {/* Social login */}
                  {isNativeApp ? (
                    <button onClick={loginApple} disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl mb-3 font-semibold text-sm transition-all active:scale-95"
                            style={{background:'#fff', color:'#000'}}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M12.5 0c.1 1.4-.4 2.8-1.2 3.8-.8 1-2 1.7-3.2 1.6-.1-1.3.5-2.7 1.3-3.6C10.2.8 11.5.1 12.5 0zm3.5 13.1c-.7 1.5-1 2.2-1.9 3.5-.9 1.4-2.2 3.4-3.8 3.4-1.4 0-1.8-.9-3.7-.9-1.9 0-2.4.9-3.8.9C1.1 20 0 17.8 0 15.6c0-4.5 2.9-6.9 5.7-6.9 1.5 0 2.8.9 3.7.9.9 0 2.4-1 4.1-1 1 0 3.5.4 4.7 2.9l-2.2 1.6z" fill="#000"/>
                      </svg>
                      {loading ? '…' : 'Continua con Apple'}
                    </button>
                  ) : (
                    <button onClick={loginGoogle} disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl mb-3 font-semibold text-sm transition-all active:scale-95"
                            style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'#fff'}}>
                      <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                        <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.174 0 7.548 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                      </svg>
                      Continua con Google
                    </button>
                  )}

                  {/* Divisore */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.08)'}}/>
                    <span className="text-gray-700 text-xs">oppure</span>
                    <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.08)'}}/>
                  </div>

                  {/* Email + Password */}
                  <input type="email" placeholder="Email" value={email}
                    onChange={e=>setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white mb-2 outline-none"
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)'}}/>
                  <input type="password" placeholder="Password" value={password}
                    onChange={e=>setPassword(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&loginEmail()}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white mb-1 outline-none"
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)'}}/>

                  {/* Recupera password */}
                  {!isRegister && (
                    <div className="flex justify-end mb-3">
                      <button onClick={()=>{setMode('forgot'); setAuthError('');}}
                              className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors">
                        Password dimenticata?
                      </button>
                    </div>
                  )}

                  {authError && <p className="text-red-400 text-xs mb-3">{authError}</p>}

                  <button onClick={loginEmail} disabled={loading || !email || !password}
                          className="w-full py-3.5 rounded-2xl font-cinzel font-bold text-sm mb-4 transition-all active:scale-95 disabled:opacity-40"
                          style={{background:'linear-gradient(135deg, #e2c97e, #c9a84c)', color:'#0b0a14'}}>
                    {loading ? '…' : isRegister ? 'Crea account' : 'Accedi'}
                  </button>

                  <button onClick={()=>{setIsRegister(v=>!v); setAuthError('');}}
                          className="w-full text-center text-gray-500 text-xs hover:text-gray-300 transition-colors">
                    {isRegister ? 'Hai già un account? Accedi →' : 'Prima volta? Registrati gratis →'}
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================================================================
   STAR FIELD
   ================================================================ */
const STARS = Array.from({length:60}, (_,i) => ({
  id:i,
  x: Math.random()*100,
  y: Math.random()*100,
  s: Math.random()*2+0.8,
  dur: (Math.random()*3+2).toFixed(1),
  delay: (Math.random()*4).toFixed(1),
}));

function StarField() {
  return (
    <div className="stars" aria-hidden="true">
      {STARS.map(s => (
        <div key={s.id} className="star" style={{
          left:`${s.x}%`, top:`${s.y}%`,
          width:s.s, height:s.s,
          '--dur':`${s.dur}s`, '--delay':`${s.delay}s`
        }}/>
      ))}
    </div>
  );
}

/* ================================================================
   MOON SVG
   ================================================================ */
function Moon({size=72}) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" style={{filter:'drop-shadow(0 0 16px rgba(226,201,126,0.6))'}}>
      <circle cx="36" cy="36" r="32" fill="url(#moonGrad)"/>
      <circle cx="26" cy="26" r="18" fill="rgba(0,0,0,0.12)"/>
      <circle cx="44" cy="20" r="5" fill="rgba(0,0,0,0.08)"/>
      <circle cx="52" cy="40" r="3" fill="rgba(0,0,0,0.06)"/>
      <defs>
        <radialGradient id="moonGrad" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#f8eecc"/>
          <stop offset="60%" stopColor="#e2c97e"/>
          <stop offset="100%" stopColor="#b89440"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ================================================================
   TIMER
   ================================================================ */
function Timer({seconds, total, running, onToggle, onReset, onEdit}) {
  const R = 42, C = 2*Math.PI*R;
  const pct = total > 0 ? seconds/total : 1;
  const offset = C*(1-pct);
  const col = pct>0.5 ? '#4ade80' : pct>0.25 ? '#facc15' : '#ef4444';
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{width:100,height:100}}>
        <svg width="100" height="100" style={{transform:'rotate(-90deg)'}}>
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
          <circle cx="50" cy="50" r={R} fill="none" stroke={col} strokeWidth="7"
            strokeDasharray={C} strokeDashoffset={offset}
            strokeLinecap="round" className="timer-path"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-cinzel text-lg font-bold text-white cursor-pointer" onClick={onEdit}
                title="Clicca per modificare">
            {fmt(seconds)}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onToggle} className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
          style={{background: running?'rgba(139,26,26,0.6)':'rgba(26,74,26,0.6)',
                  border:`1px solid ${running?'rgba(239,68,68,0.4)':'rgba(74,222,128,0.4)'}`,
                  color: running?'#fca5a5':'#86efac'}}>
          {running ? '⏸ Pausa' : '▶ Avvia'}
        </button>
        <button onClick={onReset} className="px-3 py-1 rounded-lg text-xs font-bold transition-all glass text-gray-400 hover:text-white">
          ↺
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   QR CODE COMPONENT
   ================================================================ */
function QRCodeBox({url, size=120}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !url) return;
    ref.current.innerHTML = '';
    try {
      new window.QRCode(ref.current, {
        text: url, width: size, height: size,
        colorDark: '#e2c97e', colorLight: '#060b10',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    } catch(e) { ref.current.innerHTML = '<p style="color:#666;font-size:10px">QR non disponibile</p>'; }
  }, [url, size]);
  return <div ref={ref}/>;
}

/* ================================================================
   ROLE CARD (flip)
   ================================================================ */
function RoleCard({role, playerName, flipped, onFlip, userPhoto}) {
  const r = ROLES[role];
  const v = ROLE_VISUALS[role] || { gradient:'linear-gradient(145deg,#0d0d0d,#1a1a1a)', glow:'#e2c97e', particle:'⭐' };
  if (!r) return null;

  const PARTICLES = [
    { left:'12%', delay:'0s',   dur:'4.5s' },
    { left:'30%', delay:'1.1s', dur:'5.2s' },
    { left:'52%', delay:'0.5s', dur:'4.8s' },
    { left:'70%', delay:'1.8s', dur:'5.5s' },
    { left:'88%', delay:'0.9s', dur:'4.2s' },
  ];

  return (
    <div className={`flip-container w-full mx-auto ${flipped?'flipped':''}`}
         style={{height:460, maxWidth:300}}>
      <div className="flip-inner w-full h-full">

        {/* Back = mystery */}
        <div className={`flip-face border-2 border-yellow-600/30 cursor-pointer ${!flipped?'anim-pulse':''}`}
             style={{background:'linear-gradient(145deg,#0a0a1a,#0d1117)'}}
             onClick={!flipped ? onFlip : undefined}>
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <Moon size={64}/>
            <p className="font-cinzel text-moon text-base font-semibold">Tocca per rivelare</p>
            <p className="text-gray-500 text-sm text-center">Il tuo ruolo è segreto.<br/>Assicurati di essere solo.</p>
          </div>
        </div>

        {/* Front = role revealed */}
        <div className="flip-face flip-back overflow-hidden"
             style={{
               background: v.image ? `url(${v.image}) center/cover no-repeat` : v.gradient,
               border: `2px solid ${r.color}99`,
             }}>

          {/* Overlay per leggibilità */}
          <div className="absolute inset-0 role-bg-shimmer"
               style={{background:'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)'}}/>

          {/* Particelle fluttuanti */}
          <div className="absolute inset-0 overflow-hidden">
            {PARTICLES.map((p,i) => (
              <span key={i} className="role-particle text-base"
                    style={{left:p.left, bottom:'-10%', animationDelay:p.delay, animationDuration:p.dur, opacity:0.35}}>
                {v.particle}
              </span>
            ))}
          </div>

          {/* Contenuto */}
          <div className="relative flex flex-col h-full p-5 z-10">

            {/* Header: avatar + nome */}
            <div className="flex items-center gap-2.5 mb-2">
              {userPhoto ? (
                <img src={userPhoto} alt="" referrerPolicy="no-referrer"
                     className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                     style={{border:`2px solid ${r.color}`, boxShadow:`0 0 10px ${r.color}66`}}/>
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-cinzel font-bold text-sm flex-shrink-0"
                     style={{border:`2px solid ${r.color}`, background:r.color+'22', color:r.color,
                             boxShadow:`0 0 10px ${r.color}44`}}>
                  {playerName?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white/50 text-[9px] uppercase tracking-widest">Benvenuto/a</p>
                <p className="font-cinzel text-white text-sm font-bold leading-tight">{playerName}</p>
              </div>
            </div>

            {/* Icona ruolo */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <div className="role-icon-glow text-7xl leading-none mb-1"
                   style={{'--glow-color': v.glow}}>
                {r.icon}
              </div>
              <p className="font-cinzel text-white text-2xl font-bold tracking-wide">{r.name}</p>
              <span className="text-[11px] px-3 py-1 rounded-full font-bold"
                    style={{background:r.color+'33', border:`1px solid ${r.color}66`, color:r.color}}>
                {r.team==='lupi'?'⚔️ Lupi':'🌾 Villaggio'}
              </span>
            </div>

            {/* Descrizione */}
            <div className="mt-3 overflow-y-auto flex-shrink min-h-0" style={{maxHeight:160}}>
              <p className="text-white/80 text-sm leading-snug text-center">{r.description}</p>
              {r.tip && (
                <div className="mt-2 p-2 rounded-lg text-[11px] text-white/40 italic"
                     style={{background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.07)'}}>
                  💡 {r.tip}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PRIVACY CONSENT MODAL
   ================================================================ */
function PrivacyConsentModal({ onAccept }) {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-end"
         style={{background:'rgba(11,10,20,0.97)', backdropFilter:'blur(12px)'}}>

      {/* Glow decorativo */}
      <div style={{position:'absolute',top:'15%',left:'50%',transform:'translateX(-50%)',
                   width:320,height:320,borderRadius:'50%',
                   background:'radial-gradient(ellipse, rgba(185,28,28,0.15) 0%, transparent 70%)',
                   pointerEvents:'none'}}/>

      <div className="w-full max-w-sm px-6 pb-10 pt-6 anim-fade-up">

        {/* Icona + titolo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🐺</div>
          <h1 className="font-cinzel text-moon text-xl font-bold mb-1">Lupus in Fabula</h1>
          <p className="text-gray-500 text-xs">Prima di iniziare, due parole su privacy e dati.</p>
        </div>

        {/* Punti chiave */}
        <div className="rounded-2xl p-4 mb-5 flex flex-col gap-3"
             style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">🔒</span>
            <div>
              <p className="text-white text-xs font-bold leading-tight mb-0.5">I tuoi dati restano tuoi</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">Non vendiamo né condividiamo i tuoi dati con terze parti a scopo commerciale.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">☁️</span>
            <div>
              <p className="text-white text-xs font-bold leading-tight mb-0.5">Firebase per il gioco in tempo reale</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">Usiamo Firebase (Google) per sincronizzare le partite e salvare il profilo se ti registri.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">🎙️</span>
            <div>
              <p className="text-white text-xs font-bold leading-tight mb-0.5">Voce AI opzionale</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">Se attivi la voce AI, il testo narrativo viene inviato a ElevenLabs per la sintesi audio.</p>
            </div>
          </div>
        </div>

        {/* Link privacy completa */}
        <p className="text-center text-gray-600 text-[11px] mb-4">
          Puoi leggere la{' '}
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer"
             className="underline" style={{color:'#e2c97e'}}>
            Privacy Policy completa
          </a>
          {' '}in qualsiasi momento.
        </p>

        {/* CTA */}
        <button
          onClick={onAccept}
          className="w-full py-4 rounded-2xl font-cinzel font-bold text-sm transition-all active:scale-95"
          style={{background:'linear-gradient(135deg, #e2c97e, #c9a84c)', color:'#0b0a14',
                  boxShadow:'0 4px 24px rgba(226,201,126,0.25)'}}>
          Accetto e continuo
        </button>
        <p className="text-center text-gray-700 text-[10px] mt-3">
          Continuando accetti i Termini di Servizio e la Privacy Policy.
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   FIREBASE SETUP MODAL
   ================================================================ */
function SetupModal({onClose}) {
  const [step, setStep] = useState(0);
  return (
    <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box glass p-6" style={{background:'#0d1117', border:'1px solid rgba(226,201,126,0.2)'}}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-cinzel text-moon text-lg font-bold">⚙️ Configurazione Firebase</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        {step===0 && (
          <div className="anim-fade-in">
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Per il gioco multi-dispositivo hai bisogno di un account <strong className="text-white">Firebase</strong> gratuito (Google).
              Bastano 5 minuti e zero esperienza tecnica.
            </p>
            <div className="flex flex-col gap-3 mb-5">
              {[
                ['1','Vai su','firebase.google.com','https://firebase.google.com'],
                ['2','Clicca "Inizia" e accedi con Google','',''],
                ['3','Crea un nuovo progetto (nome libero)','',''],
                ['4','Nella console vai su "Realtime Database" → "Crea database"','',''],
                ['5','Scegli una regione europea e modalità "test"','',''],
              ].map(([n,t,link,href]) => (
                <div key={n} className="flex gap-3 items-start">
                  <span className="font-cinzel text-moon font-bold text-sm w-5 shrink-0">{n}.</span>
                  <p className="text-gray-300 text-sm">
                    {t} {link && <a href={href} target="_blank" className="text-moon underline">{link}</a>}
                  </p>
                </div>
              ))}
            </div>
            <button onClick={()=>setStep(1)} className="btn-gold w-full py-3 rounded-xl text-sm">
              Continua →
            </button>
          </div>
        )}

        {step===1 && (
          <div className="anim-fade-in">
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Ora recupera le credenziali del progetto:
            </p>
            <div className="flex flex-col gap-3 mb-4">
              {[
                'Nella console Firebase, clicca sull\'icona ⚙️ → "Impostazioni progetto"',
                'Scorri fino a "Le tue app" → clicca sull\'icona "</>" (Web)',
                'Dai un nome all\'app e clicca "Registra app"',
                'Copia il blocco di codice "firebaseConfig" che appare',
              ].map((t,i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="font-cinzel text-moon font-bold text-sm w-5 shrink-0">{i+1}.</span>
                  <p className="text-gray-300 text-sm">{t}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 mb-4 text-xs font-mono text-gray-400 overflow-auto"
                 style={{background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.06)'}}>
              {`const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "mio-gioco.firebaseapp.com",
  databaseURL: "https://mio-gioco-default-rtdb...",
  projectId: "mio-gioco",
  ...
};`}
            </div>
            <button onClick={()=>setStep(2)} className="btn-gold w-full py-3 rounded-xl text-sm">
              Continua →
            </button>
          </div>
        )}

        {step===2 && (
          <div className="anim-fade-in">
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Apri il file <code className="text-moon">index.html</code> con un editor di testo (anche il Blocco Note va bene) e cerca la sezione:
            </p>
            <div className="rounded-xl p-3 mb-4 text-xs font-mono text-yellow-400 overflow-auto"
                 style={{background:'rgba(0,0,0,0.4)', border:'1px solid rgba(226,201,126,0.2)'}}>
              {`const FIREBASE_CONFIG = {
  apiKey: "INSERISCI_API_KEY",
  ...
}`}
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Sostituisci i valori <code className="text-moon">INSERISCI_...</code> con quelli del tuo progetto Firebase e salva il file.
            </p>
            <p className="text-gray-400 text-xs mb-5">
              Poi carica il file su un host (es. <a href="https://app.netlify.com/drop" target="_blank" className="text-moon underline">Netlify Drop</a> — gratis, trascina e lascia) per ottenere un link condivisibile con i giocatori.
            </p>
            <button onClick={onClose} className="btn-gold w-full py-3 rounded-xl text-sm">
              ✓ Ho capito, chiudi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   ONBOARDING / TUTORIAL
   ================================================================ */
function TutorialModal({ isOpen, onClose, isOnboarding = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const touchStartX = useRef(null);

  const steps = [
  {
    title: "Benvenuto a Lupus in Fabula",
    content: "Un villaggio di notte. Qualcuno tra voi non è quello che sembra. Lupus in Fabula è un gioco di inganno, deduzione e bluff: scopri i lupi prima che sia troppo tardi.",
    icon: "🐺"
  },
  {
    title: "Le due fazioni",
    content: "Lupi 🐺: attaccano di notte e mentono di giorno. Villaggio 🌾: deve scoprirli e votarli fuori.",
    icon: "⚔️"
  },
  {
    title: "La notte",
    content: "Di notte il villaggio dorme. I ruoli speciali si attivano in silenzio uno per volta: ogni scelta conta, ogni errore può costare una vita.",
    icon: "🌙"
  },
  {
    title: "L'alba",
    content: "All'alba si conta chi manca. Il Narratore annuncia le vittime della notte — e ogni rivelazione cambia i sospetti, le alleanze, il gioco.",
    icon: "☀️"
  },
  {
    title: "Il giorno - Discussione e dibattito",
    content: "Il villaggio discute. Puoi dire la verità, bluffare, seminare dubbi. La conversazione è la tua arma principale — usala bene prima che il tempo scada.",
    icon: "💬"
  },
  {
    title: "La votazione",
    content: "Quando il dibattito finisce, si decide. Ogni giocatore vota in silenzio dal telefono. Il più votato cade — e rivela finalmente chi era davvero.",
    icon: "🗳️"
  },
  {
    title: "Come si vince",
    content: "Il Villaggio vince eliminando tutti i Lupi. I Lupi vincono quando sono tanti quanto i villici rimasti.",
    icon: "🏆"
  },
  {
    title: "Come iniziare una partita",
    content: "Il Narratore crea la partita e sceglie i ruoli. Ogni giocatore scansiona il QR con il telefono, tocca lo schermo per scoprire il proprio ruolo segreto. Poi si spegne la luce.",
    icon: "🎮"
  }
];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completa tutorial
      localStorage.setItem('lif_tutorial_done', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleDone = () => {
    localStorage.setItem('lif_tutorial_done', 'true');
    setCurrentStep(0);
    onClose();
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50 && !isLast) handleNext();
    if (dx > 50 && !isFirst) handlePrev();
  };

  // Background diverso per ogni slide
  const slideBgs = [
    'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.15) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(30,58,138,0.25) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.15) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(226,201,126,0.18) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col screen-safe"
      style={{background: '#08081a'}}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Glow di sfondo per slide */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: slideBgs[currentStep] || slideBgs[0],
        transition: 'background 0.5s ease',
      }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                height: '3px',
                background: i <= currentStep ? '#e2c97e' : 'rgba(255,255,255,0.15)',
                width: i === currentStep ? '28px' : '14px',
              }} />
          ))}
        </div>
        {/* Salta — solo se non è onboarding al primo step, o se non è onboarding */}
        {(!isOnboarding || currentStep > 0) && (
          <button onClick={handleDone}
            className="text-xs font-bold uppercase tracking-widest transition-colors"
            style={{color: 'rgba(107,114,128,0.8)'}}>
            Salta
          </button>
        )}
      </div>

      {/* Content — area principale */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-7xl mb-6 leading-none anim-fade-up" key={`icon-${currentStep}`}>
          {step.icon}
        </div>
        <h2 className="font-cinzel text-2xl font-bold mb-4 leading-snug anim-fade-up"
            key={`title-${currentStep}`}
            style={{color: '#e2c97e'}}>
          {step.title}
        </h2>
        <p className="text-base leading-relaxed anim-fade-up max-w-sm"
           key={`content-${currentStep}`}
           style={{color: 'rgba(209,213,219,0.85)'}}>
          {step.content}
        </p>
      </div>

      {/* Bottom navigation */}
      <div className="relative z-10 px-6 pb-8 flex flex-col gap-3">
        <button
          onClick={isLast ? handleDone : handleNext}
          className="w-full py-4 rounded-2xl font-cinzel font-bold text-base transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #e2c97e 0%, #c4931a 100%)',
            color: '#0a0a1a',
            boxShadow: '0 4px 24px rgba(226,201,126,0.3)',
          }}>
          {isLast ? '🐺 Inizia a giocare!' : 'Avanti →'}
        </button>
        {!isFirst && (
          <button onClick={handlePrev}
            className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(156,163,175,0.8)',
            }}>
            ← Indietro
          </button>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   HOME SCREEN
   ================================================================ */
function HomeScreen({onCreateGame, onViewHistory, onSetup, onProfile}) {
  const isFirstLaunch = !localStorage.getItem('lif_tutorial_done');
  const [showTutorial, setShowTutorial] = useState(isFirstLaunch);
  const [isOnboarding, setIsOnboarding] = useState(isFirstLaunch);

  return (
    <div className="min-h-screen layer screen-safe flex flex-col items-center justify-center p-6 relative overflow-hidden">


      <UserProfile />

      <div className="anim-fade-up text-center w-full max-w-sm relative z-10">

        {/* Luna con anelli */}
        <div className="relative inline-flex items-center justify-center mb-6" style={{width:140, height:140}}>
          {/* Anelli che si espandono */}
          <div style={{
            position:'absolute', width:140, height:140, borderRadius:'50%',
            border:'1px solid rgba(234,204,133,0.3)',
            animation:'ringExpand 3.5s ease-out infinite'
          }} />
          <div style={{
            position:'absolute', width:140, height:140, borderRadius:'50%',
            border:'1px solid rgba(234,204,133,0.15)',
            animation:'ringExpand 3.5s ease-out infinite 1.2s'
          }} />
          <div style={{
            position:'absolute', width:140, height:140, borderRadius:'50%',
            border:'1px solid rgba(234,204,133,0.08)',
            animation:'ringExpand 3.5s ease-out infinite 2.4s'
          }} />
          {/* CSS Moon Premium */}
          <div className="moon-reveal">
            <div className="moon-float" style={{
              width: 140, height: 140, borderRadius: '50%', position: 'relative', zIndex: 10,
              background: 'radial-gradient(circle at 35% 35%, #fffbe6 0%, #eacc85 40%, #8a641c 100%)',
              boxShadow: '0 0 50px rgba(234, 204, 133, 0.5), inset -12px -12px 24px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}>
              {/* Craters that spin continuously */}
              <div className="crater-group">
                <div style={{position:'absolute', width:34, height:34, borderRadius:'50%', background:'rgba(0,0,0,0.08)', top:20, left:24, boxShadow:'inset 2px 2px 5px rgba(0,0,0,0.2)'}} />
                <div style={{position:'absolute', width:50, height:50, borderRadius:'50%', background:'rgba(0,0,0,0.06)', top:60, right:15, boxShadow:'inset 3px 3px 6px rgba(0,0,0,0.15)'}} />
                <div style={{position:'absolute', width:25, height:25, borderRadius:'50%', background:'rgba(0,0,0,0.1)', bottom:20, left:40, boxShadow:'inset 2px 2px 4px rgba(0,0,0,0.2)'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Titolo */}
        <h1 className="font-cinzel text-5xl font-bold moon-glow mb-1 leading-tight tracking-wide">
          Lupus<br/>in Fabula
        </h1>
        <p className="font-outfit text-xs tracking-[0.35em] font-normal uppercase mb-8 opacity-80" style={{color:'var(--moon)'}}>
          ✦ &nbsp;il gioco del lupo mannaro&nbsp; ✦
        </p>

        {/* Divisore dorato */}
        <div className="home-divider mb-8" />

        {/* Bottoni */}
        <div className="flex flex-col gap-3">
          <button onClick={onCreateGame}
            className="btn-gold-shimmer w-full py-4 rounded-2xl text-base shadow-2xl">
            🎮 &nbsp;Crea Nuova Partita
          </button>
          <button onClick={onViewHistory}
            className="btn-ghost w-full py-4 rounded-2xl text-base">
            📜 &nbsp;Storico Partite
          </button>
          <button onClick={onProfile}
            className="btn-ghost w-full py-4 rounded-2xl text-base">
            👤 &nbsp;Il mio Profilo
          </button>
        </div>

        {/* Come si gioca */}
        <button onClick={() => { setIsOnboarding(false); setShowTutorial(true); }}
          className="w-full py-3 rounded-2xl mt-3 flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{background:'rgba(226,201,126,0.05)', border:'1px solid rgba(226,201,126,0.15)', color:'rgba(226,201,126,0.7)'}}>
          <span className="text-sm">📖</span>
          <span className="text-sm font-semibold tracking-wide">Come si gioca</span>
        </button>

        {/* Divisore basso */}
        <div className="home-divider mt-8 mb-4" />

        <div className="flex justify-center">
          <button onClick={onSetup}
            className="text-gray-700 text-xs hover:text-gray-500 transition-colors">
            ⚙️ Configura Firebase
          </button>
        </div>

        {!isFirebaseConfigured() && (
          <div className="mt-3 px-3 py-2 rounded-xl text-xs text-yellow-700"
               style={{background:'rgba(234,179,8,0.06)', border:'1px solid rgba(234,179,8,0.12)'}}>
            ⚠️ Firebase non configurato — modalità demo attiva
          </div>
        )}

        <p className="text-xs mt-6 tracking-widest" style={{color:'rgba(226,201,126,0.2)'}}>— un viaggio nella notte —</p>
      </div>

      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} isOnboarding={isOnboarding} />
    </div>
  );
}

/* ================================================================
   PACK DEFINITIONS
   ================================================================ */
const PACKS = {
  ombre: {
    id: 'ombre',
    name: 'Personaggi Oscuri',
    icon: '🌑',
    price: '€2,99',
    color: '#6c3483',
    description: 'Ruoli oscuri che ribaltano ogni certezza',
    roles: ['strega', 'figlio_dei_lupi', 'cacciatore', 'medium'],
  },
  villaggio: {
    id: 'villaggio',
    name: 'Figure del Villaggio',
    icon: '🏘️',
    price: '€2,99',
    color: '#f39c12',
    description: 'Intrighi e poteri speciali tra i villici',
    roles: ['cupido', 'sindaco', 'sciamano', 'mitomane'],
  },
  narratore: {
    id: 'narratore',
    name: 'Voce AI Narratore',
    icon: '🎙️',
    price: '€1,99',
    color: '#e2c97e',
    description: 'Il narratore legge ogni scena con voce cinematografica',
    roles: [],
  },
  combo: {
    id: 'combo',
    name: 'Pacchetto Completo',
    icon: '⚡',
    price: '€5,99',
    color: '#e2c97e',
    description: 'Tutti i ruoli + Narratore AI — il gioco completo',
    roles: [],
    includes: ['ombre', 'villaggio', 'narratore'],
  },
};

/* ================================================================
   PAYWALL MODAL
   ================================================================ */
function PaywallModal({ packId, onClose, onUnlock }) {
  const [expandedRole, setExpandedRole] = useState(null);
  const [isTrying, setIsTrying] = useState(false);
  const [triedOnce, setTriedOnce] = useState(false);

  if (!packId) return null;
  const pack = PACKS[packId];
  if (!pack) return null;
  const combo = PACKS.combo;
  const isCombo = packId === 'combo';
  const isNarratore = packId === 'narratore';
  const showComboUpsell = !isCombo && combo;

  const tryNarrator = async () => {
    if (isTrying) return;
    setIsTrying(true);
    setTriedOnce(true);
    try {
      const appUrl = window.Capacitor?.isNativePlatform?.()
        ? 'https://lupus-in-fabula-eight.vercel.app'
        : window.location.origin;
      const res = await fetch(`${appUrl}/api/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'La notte cala sul villaggio. I lupi sono tra voi… e nessuno è al sicuro.' }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setIsTrying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setIsTrying(false);
      await audio.play();
    } catch {
      setIsTrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
         style={{background:'rgba(0,0,0,0.82)', backdropFilter:'blur(6px)'}}
         onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden anim-fade-up"
           style={{background:'linear-gradient(180deg,#12122a 0%,#0a0a1a 100%)',
                   border:`1px solid ${pack.color}44`, maxHeight:'88vh', overflowY:'auto'}}
           onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-7 pb-5 text-center"
             style={{background:`radial-gradient(ellipse at 50% 0%, ${pack.color}22 0%, transparent 70%)`}}>
          <div className="text-5xl mb-3">{pack.icon}</div>
          <h2 className="font-cinzel text-xl font-bold text-white mb-1">{pack.name}</h2>
          <p className="text-sm text-gray-400">{pack.description}</p>
        </div>

        {/* Contenuto: ruoli — cliccabili per vedere descrizione */}
        {pack.roles.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Tocca un personaggio per scoprirlo</p>
            <div className="grid grid-cols-2 gap-2">
              {pack.roles.map(rid => {
                const r = ROLES[rid]; if (!r) return null;
                const isExpanded = expandedRole === rid;
                return (
                  <button key={rid}
                          onClick={() => setExpandedRole(isExpanded ? null : rid)}
                          className="text-left rounded-xl overflow-hidden transition-all active:scale-95"
                          style={{background:`${r.color}${isExpanded ? '22' : '12'}`,
                                  border:`1px solid ${r.color}${isExpanded ? '66' : '33'}`}}>
                    <div className="flex items-center gap-2 py-2.5 px-3">
                      <span className="text-xl leading-none shrink-0">{r.icon}</span>
                      <span className="text-xs font-bold text-white leading-tight flex-1">{r.name}</span>
                      <span className="text-gray-600 text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    {isExpanded && (
                      <div className="px-3 pb-3">
                        <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-full mb-1.5 font-bold"
                              style={{background: r.team==='lupi' ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)',
                                      color: r.team==='lupi' ? '#f87171' : '#4ade80'}}>
                          {r.team==='lupi' ? '⚔️ Lupi' : '🌾 Villaggio'}
                        </span>
                        <p className="text-gray-400 text-[11px] leading-relaxed">{r.description}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Contenuto: narratore — descrizione + tasto prova */}
        {isNarratore && (
          <div className="px-6 pb-4 flex flex-col gap-3">
            <div className="p-4 rounded-2xl text-sm text-gray-400 leading-relaxed"
                 style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
              Ogni fase della notte viene narrata con voce AI cinematografica — atmosfera, tensione, suspense.<br/>
              <span className="text-xs text-gray-600 mt-1 block">Si attiva dal pannello impostazioni selezionando "Voce AI".</span>
            </div>
            <button
              onClick={tryNarrator}
              disabled={isTrying}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{background:'rgba(226,201,126,0.08)', border:'1px solid rgba(226,201,126,0.25)', color:'#e2c97e'}}>
              {isTrying
                ? <><span className="animate-spin">◌</span> Caricamento…</>
                : triedOnce
                  ? '▶ Riproduci di nuovo'
                  : '▶ Ascolta un esempio'}
            </button>
          </div>
        )}

        {/* Contenuto: combo — lista pack inclusi */}
        {isCombo && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Include</p>
            <div className="flex flex-col gap-2">
              {combo.includes.map(pid => {
                const p = PACKS[pid]; if (!p) return null;
                return (
                  <div key={pid} className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                       style={{background:`${p.color}10`, border:`1px solid ${p.color}33`}}>
                    <span className="text-2xl leading-none">{p.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.description}</p>
                    </div>
                    <span className="text-xs text-gray-600 line-through">{p.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA principale */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={() => { onUnlock(packId); onClose(); }}
            className="w-full py-4 rounded-2xl font-cinzel font-bold text-base transition-all active:scale-95"
            style={{background:`linear-gradient(135deg,${pack.color}cc,${pack.color}66)`,
                    color:'#0a0a1a', boxShadow:`0 0 24px ${pack.color}44`}}>
            Acquista · {pack.price}
          </button>

          {showComboUpsell && (
            <button
              onClick={() => { onClose(); setTimeout(() => onUnlock('_open_combo'), 50); }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{background:'rgba(226,201,126,0.06)', border:'1px solid rgba(226,201,126,0.2)', color:'rgba(226,201,126,0.7)'}}>
              ⚡ Oppure prendi tutto con il Pacchetto Completo · {combo.price}
            </button>
          )}

          <button onClick={onClose}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-400 transition-colors">
            Non ora
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   STATS + PROFILE + AVATAR
   ================================================================ */

const BG_GRADIENTS = [
  { id:'wolf',  css:'radial-gradient(circle at 35% 35%, #3d0010, #1a0005, #000)', label:'Branco' },
  { id:'seer',  css:'radial-gradient(circle at 35% 35%, #1e0050, #0a001a, #000)', label:'Visioni' },
  { id:'guard', css:'radial-gradient(circle at 35% 35%, #003555, #001020, #000)', label:'Acciaio' },
  { id:'witch', css:'radial-gradient(circle at 35% 35%, #004015, #001a05, #000)', label:'Erbe' },
  { id:'gold',  css:'radial-gradient(circle at 35% 35%, #3d2d00, #1a1400, #000)', label:'Oro' },
  { id:'teal',  css:'radial-gradient(circle at 35% 35%, #003838, #001a1a, #000)', label:'Acque' },
  { id:'rose',  css:'radial-gradient(circle at 35% 35%, #450030, #1a0012, #000)', label:'Rosa' },
  { id:'void',  css:'radial-gradient(circle at 35% 35%, #14142e, #080812, #000)', label:'Vuoto' },
];
const AVATAR_HEROES = [
  { id:'lupo', url:'/avatars/lupo.png' },
  { id:'strega', url:'/avatars/strega.png' },
  { id:'veggente', url:'/avatars/veggente.png' },
  { id:'cacciatore', url:'/avatars/cacciatore.png' },
  { id:'villico', url:'/avatars/villico.png' },
  { id:'sciamano', url:'/avatars/sciamano.png' },
];
const AVATAR_SIGILS = [
  { id:'none', icon:'' },
  { id:'moon', icon:'🌙' },
  { id:'blood', icon:'🩸' },
  { id:'skull', icon:'💀' },
  { id:'eye', icon:'👁️' },
  { id:'swords', icon:'⚔️' },
  { id:'crown', icon:'👑' },
];
const AURA_COLORS = [
  { id:'wolf',    color:'#c0392b' },
  { id:'village', color:'#27ae60' },
  { id:'moon',    color:'#e2c97e' },
  { id:'mystic',  color:'#7c3aed' },
];
const DEFAULT_AVATAR = { bg:'void', hero:'lupo', aura:'moon', sigil:'none' };

function generateProfileComment(stats) {
  const { gamesHosted = 0, villaggioWins = 0, rolesUsed = {} } = stats || {};
  if (gamesHosted === 0) return "La prima notte è ancora da vivere. Il villaggio non ti conosce. Ancora.";
  if (gamesHosted === 1) {
    return villaggioWins
      ? "Prima partita, primo villaggio salvato. Sembra facile."
      : "Prima partita, prima vittoria ai lupi. Inizio promettente.";
  }
  const villaggioWinRate = villaggioWins / gamesHosted;
  if (villaggioWinRate >= 0.75 && gamesHosted >= 5) return "Il villaggio sopravvive nelle tue notti. Sei un Narratore giusto — forse troppo.";
  if (villaggioWinRate <= 0.25 && gamesHosted >= 4) return "I lupi regnano nelle tue serate. O sei crudele o sei uno di loro.";
  let mostUsedRole = null;
  let maxCount = 0;
  for (const [key, count] of Object.entries(rolesUsed)) {
    if (count > maxCount) { maxCount = count; mostUsedRole = key; }
  }
  if (mostUsedRole) {
    if (mostUsedRole === 'lupo') return "Nessuna partita senza il Lupo. Come da copione.";
    if (mostUsedRole === 'strega') return "La Strega è di casa nelle tue notti. Le pozioni non si sprecano.";
    if (mostUsedRole === 'veggente') return "Il Veggente vede tutto. In teoria.";
    if (mostUsedRole === 'cupido') return "L'amore uccide più dei lupi nelle tue partite.";
    if (mostUsedRole === 'sciamano') return "Resuscitare i morti è la tua specialità. Strano hobby.";
  }
  if (gamesHosted >= 20) return "Veterano della notte. Il tuo villaggio ti rispetta — e ti teme.";
  if (gamesHosted >= 10) return "Due cifre. Il Narratore conosce i suoi demoni.";
  return `${gamesHosted} notti raccontate. La leggenda cresce.`;
}

function AvatarDisplay({ config = DEFAULT_AVATAR, size = 72 }) {
  const auraObj = AURA_COLORS.find(a => a.id === (config.aura || 'moon')) || AURA_COLORS[2];
  const heroObj = AVATAR_HEROES.find(h => h.id === (config.hero || 'lupo')) || AVATAR_HEROES[0];
  const sigilObj = AVATAR_SIGILS.find(s => s.id === (config.sigil || 'none')) || AVATAR_SIGILS[0];

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: '#0a0a1a', /* deep navy fallback */
      border: `2.5px solid ${auraObj.color}`,
      boxShadow: `0 0 ${size * 0.25}px ${auraObj.color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative',
    }}>
      {/* Portrait layer */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        backgroundImage: `url(${heroObj.url})`, backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      
      {/* Glow layer to restore some brightness */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        boxShadow: `inset 0 0 20px ${auraObj.color}88`, pointerEvents:'none'
      }} />
      
      {/* Sigil layer */}
      {sigilObj.id !== 'none' && (
        <div style={{
          position:'absolute', bottom:-4, right:-4, width: size*0.35, height: size*0.35,
          background:'#000', borderRadius:'50%', border:`1.5px solid ${auraObj.color}`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize: size*0.18,
          boxShadow:`0 0 10px ${auraObj.color}`, zIndex: 10
        }}>
          {sigilObj.icon}
        </div>
      )}
    </div>
  );
}

function AvatarCreator({ config = DEFAULT_AVATAR, onChange }) {
  const current = { ...DEFAULT_AVATAR, ...config };
  const [activeTab, setActiveTab] = useState('hero');
  const [popKey, setPopKey] = useState(0);

  const triggerPop = () => setPopKey(k => k + 1);

  const handleSelect = (key, val) => {
    onChange({ ...current, [key]: val });
    triggerPop();
  };

  const handleRandomize = () => {
    const rHero = AVATAR_HEROES[Math.floor(Math.random() * AVATAR_HEROES.length)].id;
    const rSigil = AVATAR_SIGILS[Math.floor(Math.random() * AVATAR_SIGILS.length)].id;
    const rAura = AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)].id;
    onChange({ ...current, hero: rHero, sigil: rSigil, aura: rAura });
    triggerPop();
  };

  return (
    <div className="glass anim-fade-up" style={{borderRadius:20, padding:20, marginTop:16}}>
      
      {/* Live Preview & Randomizer */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20}}>
        <div key={popKey} className="avatar-pop-anim">
          <AvatarDisplay config={current} size={110} />
        </div>
        <button onClick={handleRandomize} className="btn-gold-shimmer" style={{marginTop:16, padding:'8px 24px', borderRadius:12, fontSize:12, display:'flex', alignItems:'center', gap:6, fontWeight:800}}>
          <span style={{fontSize:18}}>🎲</span> Forgia Casuale
        </button>
      </div>

      {/* Tabs */}
      <div style={{display:'flex', borderBottom:'1px solid rgba(255,255,255,0.1)', marginBottom:20}}>
        <div className={`rpg-nav-tab ${activeTab==='hero'?'active':''}`} onClick={()=>setActiveTab('hero')}>Eroe</div>
        <div className={`rpg-nav-tab ${activeTab==='sigil'?'active':''}`} onClick={()=>setActiveTab('sigil')}>Sigillo</div>
        <div className={`rpg-nav-tab ${activeTab==='aura'?'active':''}`} onClick={()=>setActiveTab('aura')}>Aura</div>
      </div>

      {/* Tab Content */}
      <div style={{minHeight:140}}>
        {activeTab === 'hero' && (
          <div style={{display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center'}}>
            {AVATAR_HEROES.map(h => (
              <div key={h.id} onClick={() => handleSelect('hero', h.id)} style={{position:'relative', cursor:'pointer'}}>
                <div style={{
                  width:54, height:54, borderRadius:14, backgroundImage:`url(${h.url})`, backgroundSize:'cover', backgroundPosition:'center',
                  border: current.hero === h.id ? '2px solid #e2c97e' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: current.hero === h.id ? '0 0 15px rgba(226, 201, 126, 0.4)' : 'none',
                  transform: current.hero === h.id ? 'scale(1.1)' : 'scale(1)',
                  transition:'all 0.2s', filter: current.hero === h.id ? 'brightness(1.1)' : 'brightness(0.7)'
                }} />
                {current.hero === h.id && <div style={{position:'absolute', top:-6, right:-6, background:'#e2c97e', color:'#000', borderRadius:'50%', width:18, height:18, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', zIndex:5, boxShadow:'0 2px 5px rgba(0,0,0,0.5)'}}>✓</div>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sigil' && (
          <div style={{display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center'}}>
            {AVATAR_SIGILS.map(s => (
              <button key={s.id} onClick={() => handleSelect('sigil', s.id)}
                style={{
                  width:54, height:54, borderRadius:14, fontSize:22,
                  background: current.sigil === s.id ? 'rgba(226,201,126,0.15)' : 'rgba(255,255,255,0.03)',
                  border: current.sigil === s.id ? '2px solid #e2c97e' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: current.sigil === s.id ? '0 0 15px rgba(226, 201, 126, 0.4)' : 'none',
                  transform: current.sigil === s.id ? 'scale(1.1)' : 'scale(1)',
                  cursor:'pointer', transition:'all 0.2s', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'
                }}
              >
                {s.id === 'none' ? '🚫' : s.icon}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'aura' && (
          <div style={{display:'flex', flexWrap:'wrap', gap:16, justifyContent:'center'}}>
            {AURA_COLORS.map(a => (
              <div key={a.id} onClick={() => handleSelect('aura', a.id)}
                style={{
                  width:48, height:48, borderRadius:'50%', background:a.color, cursor:'pointer',
                  border: current.aura === a.id ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                  boxShadow: current.aura === a.id ? `0 0 20px ${a.color}` : 'inset 0 0 10px rgba(0,0,0,0.5)',
                  transform: current.aura === a.id ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s', position:'relative'
                }}>
                {current.aura === a.id && <div style={{position:'absolute', top:-2, right:-4, background:'#fff', color:'#000', borderRadius:'50%', width:16, height:16, fontSize:10, display:'flex', alignItems:'center', justifyContent:'center'}}>✨</div>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

async function writeGameStats(uid, gameResult) {
  if (!db) return;
  const { winner, players = [] } = gameResult;
  const statsRef = db.ref(`users/${uid}/stats`);
  const snapshot = await statsRef.once('value');
  const prev = snapshot.val() || { gamesHosted: 0, villaggioWins: 0, lupiWins: 0, rolesUsed: {}, lastGame: 0 };
  const rolesUsed = { ...(prev.rolesUsed || {}) };
  players.forEach(p => {
    if (p.role) rolesUsed[p.role] = (rolesUsed[p.role] || 0) + 1;
  });
  const updated = {
    gamesHosted: (prev.gamesHosted || 0) + 1,
    villaggioWins: (prev.villaggioWins || 0) + (winner === 'villaggio' ? 1 : 0),
    lupiWins: (prev.lupiWins || 0) + (winner === 'lupi' ? 1 : 0),
    lastGame: Date.now(),
    rolesUsed,
  };
  await statsRef.set(updated);
  // Init avatar if not set
  const avatarRef = db.ref(`users/${uid}/avatar`);
  const avatarSnap = await avatarRef.once('value');
  if (!avatarSnap.val()) {
    await avatarRef.set(DEFAULT_AVATAR);
  }
}

function ProfileScreen({ user, onBack }) {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);

  // Load avatar
  useEffect(() => {
    if (!user) return;
    let localAvatar = null;
    try { localAvatar = JSON.parse(localStorage.getItem('lif_avatar')); } catch(e) {}
    if (db) {
      db.ref(`users/${user.uid}/avatar`).once('value').then(snap => {
        const val = snap.val();
        if (val) { setAvatar(val); try { localStorage.setItem('lif_avatar', JSON.stringify(val)); } catch(e) {} }
        else if (localAvatar) setAvatar(localAvatar);
      }).catch(() => { if (localAvatar) setAvatar(localAvatar); });
    } else if (localAvatar) {
      setAvatar(localAvatar);
    }
  }, [user]);

  // Load stats
  useEffect(() => {
    if (!user) { setStatsLoading(false); return; }
    if (!db) { setStatsLoading(false); return; }
    db.ref(`users/${user.uid}/stats`).once('value').then(snap => {
      setStats(snap.val() || { gamesHosted: 0, villaggioWins: 0, lupiWins: 0, rolesUsed: {} });
      setStatsLoading(false);
    }).catch(() => setStatsLoading(false));
  }, [user]);

  // Load leaderboard
  useEffect(() => {
    if (!db) { setLbLoading(false); return; }
    db.ref('users').once('value').then(snap => {
      const all = snap.val() || {};
      const rows = Object.entries(all).map(([uid, data]) => ({
        uid,
        displayName: data.displayName || data.email || '???',
        avatar: data.avatar || DEFAULT_AVATAR,
        gamesHosted: data.stats?.gamesHosted || 0,
        villaggioWins: data.stats?.villaggioWins || 0,
      }));
      rows.sort((a, b) => b.gamesHosted - a.gamesHosted);
      setLeaderboard(rows.slice(0, 10));
      setLbLoading(false);
    }).catch(() => setLbLoading(false));
  }, []);

  const handleAvatarChange = (newConfig) => {
    setAvatar(newConfig);
    try { localStorage.setItem('lif_avatar', JSON.stringify(newConfig)); } catch(e) {}
    if (db && user) db.ref(`users/${user.uid}/avatar`).set(newConfig).catch(() => {});
  };

  if (!user) {
    return (
      <div className="min-h-screen screen-safe flex flex-col items-center justify-center p-6" style={{background:'#0d1117'}}>
        <p style={{color:'rgba(226,201,126,0.6)'}}>Accedi per vedere il profilo.</p>
        <button onClick={onBack} className="btn-gold mt-6 px-6 py-3 rounded-2xl">← Indietro</button>
      </div>
    );
  }

  const winRate = stats && stats.gamesHosted > 0 ? Math.round((stats.villaggioWins / stats.gamesHosted) * 100) : 0;
  let mostUsedRole = null;
  let mostUsedCount = 0;
  if (stats?.rolesUsed) {
    for (const [k, v] of Object.entries(stats.rolesUsed)) {
      if (v > mostUsedCount) { mostUsedCount = v; mostUsedRole = k; }
    }
  }
  const roleLabels = {
    lupo:'Lupo', villico:'Villico', veggente:'Veggente', guardia:'Guardia',
    strega:'Strega', cacciatore:'Cacciatore', cupido:'Cupido', sindaco:'Sindaco',
    medium:'Medium', mitomane:'Mitomane', figlio_dei_lupi:'Figlio dei Lupi',
    sciamano:'Sciamano',
  };
  const roleIcons = {
    lupo:'🐺', villico:'🧑‍🌾', veggente:'🔮', guardia:'🛡️',
    strega:'🧙‍♀️', cacciatore:'🏹', cupido:'💘', sindaco:'🏛️',
    medium:'👁️', mitomane:'🎭', figlio_dei_lupi:'🐾', sciamano:'🪬',
  };

  const currentUserInLb = user ? leaderboard.find(r => r.uid === user.uid) : null;
  const currentUserRank = user ? leaderboard.findIndex(r => r.uid === user.uid) + 1 : 0;

  return (
    <div className="min-h-screen screen-safe flex flex-col" style={{background:'#0d1117'}}>
      {/* Header */}
      <div style={{
        position:'sticky', top:0, zIndex:50,
        background:'rgba(13,17,23,0.92)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
      }}>
        <button onClick={onBack} style={{
          background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:10, padding:'6px 12px', color:'#e2c97e', fontSize:16, cursor:'pointer',
        }}>←</button>
        <h2 className="font-cinzel" style={{color:'#e2c97e', fontSize:18, fontWeight:700, flex:1}}>Il tuo Profilo</h2>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4" style={{maxWidth:480, margin:'0 auto', width:'100%'}}>

        {/* Section 1 — Avatar + name (RPG Hero Card) */}
        <div className="anim-fade-up glass" style={{
          borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', textAlign:'center',
          position:'relative'
        }}>
          {/* Cover Header */}
          <div className="rpg-cover" />
          
          {/* Overlapping Avatar */}
          <div style={{display:'flex', justifyContent:'center', marginTop:-50, position:'relative', zIndex:10}}>
            <AvatarDisplay config={avatar} size={100} />
          </div>
          
          <div style={{padding:'16px 20px', paddingBottom:24}}>
            <p className="font-cinzel" style={{color:'#e2c97e', fontSize:22, fontWeight:800, marginBottom:2, textShadow:'0 2px 10px rgba(226, 201, 126, 0.3)'}}>
              {user.displayName || 'Giocatore Misterioso'}
            </p>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:11, letterSpacing:'0.05em', marginBottom:16}}>
              {user.email || ''}
            </p>
            
            <button
              onClick={() => setShowAvatarEditor(v => !v)}
              className="btn-gold-shimmer"
              style={{
                borderRadius:12, padding:'10px 20px', fontSize:13, letterSpacing:'0.05em', margin:'0 auto',
              }}
            >
              {showAvatarEditor ? 'Chiudi' : 'Personalizza Avatar'}
            </button>
            
            {showAvatarEditor && (
              <div style={{marginTop:20, textAlign:'left'}}>
                <AvatarCreator config={avatar} onChange={handleAvatarChange} />
              </div>
            )}
          </div>
        </div>

        {/* Section 2 — Stats (Trading Card Format) */}
        <div className="anim-fade-up glass" style={{borderRadius:20, padding:24, border:'1px solid rgba(255,255,255,0.08)', position:'relative'}}>
          <div style={{position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'80%', height:1, background:'radial-gradient(ellipse, rgba(226, 201, 126, 0.4), transparent)'}} />
          
          <h3 className="font-cinzel" style={{color:'#e2c97e', fontSize:14, fontWeight:700, letterSpacing:'0.15em', marginBottom:20, textAlign:'center'}}>Compendio Battaglie</h3>
          
          {statsLoading ? (
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:13, textAlign:'center', padding:'16px 0'}}>Lettura antichi tomi...</p>
          ) : (
            <>
              {/* Grand Stat */}
              <div style={{textAlign:'center', marginBottom:24}}>
                <p style={{color:'rgba(255,255,255,0.4)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:4}}>Partite Narrate</p>
                <p className="golden-number">{stats?.gamesHosted || 0}</p>
              </div>
              
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20}}>
                <div style={{background:'linear-gradient(135deg, rgba(39,174,96,0.1), rgba(39,174,96,0.02))', border:'1px solid rgba(39,174,96,0.2)', borderRadius:16, padding:'14px 12px', textAlign:'center', boxShadow:'inset 0 0 20px rgba(39,174,96,0.05)'}}>
                  <p style={{color:'rgba(39,174,96,0.8)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6}}>Villaggio Salvo</p>
                  <p style={{color:'#27ae60', fontSize:28, fontWeight:800, textShadow:'0 0 10px rgba(39,174,96,0.4)'}}>{stats?.villaggioWins || 0}</p>
                </div>
                <div style={{background:'linear-gradient(135deg, rgba(192,57,43,0.1), rgba(192,57,43,0.02))', border:'1px solid rgba(192,57,43,0.2)', borderRadius:16, padding:'14px 12px', textAlign:'center', boxShadow:'inset 0 0 20px rgba(192,57,43,0.05)'}}>
                  <p style={{color:'rgba(192,57,43,0.8)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6}}>Trionfo dei Lupi</p>
                  <p style={{color:'#c0392b', fontSize:28, fontWeight:800, textShadow:'0 0 10px rgba(192,57,43,0.4)'}}>{stats?.lupiWins || 0}</p>
                </div>
              </div>
              
              {/* Win rate bar */}
              <div style={{marginBottom:24, padding:'0 8px'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                  <p style={{color:'rgba(255,255,255,0.4)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase'}}>Win Rate Villaggio</p>
                  <p style={{color:'#e2c97e', fontSize:13, fontWeight:800}}>{winRate}%</p>
                </div>
                <div style={{height:8, borderRadius:99, background:'rgba(255,255,255,0.05)', overflow:'hidden', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.5)'}}>
                  <div style={{height:'100%', width:`${winRate}%`, borderRadius:99, background:'linear-gradient(90deg, #27ae60, #e2c97e)', boxShadow:'0 0 10px rgba(39,174,96,0.5)'}} />
                </div>
              </div>
              
              {/* Most used role badge */}
              {mostUsedRole && (
                <div style={{display:'flex', alignItems:'center', gap:14, background:'linear-gradient(90deg, rgba(226,201,126,0.08), rgba(226,201,126,0.02))', borderRadius:16, padding:'14px 16px', border:'1px solid rgba(226,201,126,0.15)', boxShadow:'inset 1px 0 0 rgba(255,255,255,0.1)'}}>
                  <div style={{width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)', borderRadius:'50%', fontSize:24, border:'1px solid rgba(226,201,126,0.3)', boxShadow:'0 0 15px rgba(226,201,126,0.2)'}}>
                    {roleIcons[mostUsedRole] || '🎭'}
                  </div>
                  <div>
                    <p style={{color:'rgba(255,255,255,0.4)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:2}}>Maestria Ruolo</p>
                    <p className="font-cinzel" style={{color:'#e2c97e', fontSize:16, fontWeight:800}}>{roleLabels[mostUsedRole] || mostUsedRole}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Section 3 — Cinematic comment */}
        {!statsLoading && stats && (
          <div className="anim-fade-up" style={{
            background:'#12122a', borderRadius:20, padding:20,
            border:'1px solid rgba(226,201,126,0.1)',
            position:'relative',
          }}>
            <span style={{position:'absolute', top:12, left:16, color:'rgba(226,201,126,0.2)', fontSize:32, lineHeight:1, fontFamily:'Georgia, serif'}}>"</span>
            <p style={{
              color:'#e2c97e', fontStyle:'italic', fontSize:14, lineHeight:1.7,
              padding:'10px 20px 10px 28px', textAlign:'center',
            }}>
              {generateProfileComment(stats)}
            </p>
            <span style={{position:'absolute', bottom:12, right:16, color:'rgba(226,201,126,0.2)', fontSize:32, lineHeight:1, fontFamily:'Georgia, serif'}}>"</span>
          </div>
        )}

        {/* Section 4 — Leaderboard */}
        <div className="anim-fade-up" style={{background:'#12122a', borderRadius:20, padding:20, border:'1px solid rgba(255,255,255,0.08)', marginBottom:24}}>
          <h3 className="font-cinzel" style={{color:'#e2c97e', fontSize:14, fontWeight:700, letterSpacing:'0.1em', marginBottom:14}}>Classifica Narratori</h3>
          {!db ? (
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:13, textAlign:'center', padding:'12px 0'}}>Connetti Firebase per vedere la classifica</p>
          ) : lbLoading ? (
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:13, textAlign:'center', padding:'12px 0'}}>Caricamento...</p>
          ) : leaderboard.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:13, textAlign:'center', padding:'12px 0'}}>Nessun dato ancora</p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {leaderboard.map((row, i) => {
                const isMe = user && row.uid === user.uid;
                return (
                  <div key={row.uid} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:12,
                    background: isMe ? 'rgba(226,201,126,0.08)' : 'rgba(255,255,255,0.03)',
                    border: isMe ? '1px solid rgba(226,201,126,0.35)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{color: i === 0 ? '#e2c97e' : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.3)', fontSize:13, fontWeight:700, width:20, textAlign:'center'}}>
                      {i + 1}
                    </span>
                    <AvatarDisplay config={row.avatar} size={32} />
                    <span style={{color: isMe ? '#e2c97e' : 'rgba(255,255,255,0.8)', fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                      {row.displayName}
                    </span>
                    <span style={{color:'rgba(255,255,255,0.4)', fontSize:11}}>{row.gamesHosted} notti</span>
                    <span style={{color:'#27ae60', fontSize:11, fontWeight:700}}>{row.villaggioWins}V</span>
                  </div>
                );
              })}
              {/* Show current user below top 10 if not in it */}
              {user && !currentUserInLb && stats && (
                <div style={{
                  display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:12,
                  background:'rgba(226,201,126,0.08)', border:'1px solid rgba(226,201,126,0.35)',
                  marginTop:4,
                }}>
                  <span style={{color:'rgba(255,255,255,0.3)', fontSize:13, fontWeight:700, width:20, textAlign:'center'}}>—</span>
                  <AvatarDisplay config={avatar} size={32} />
                  <span style={{color:'#e2c97e', fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {user.displayName || 'Tu'}
                  </span>
                  <span style={{color:'rgba(255,255,255,0.4)', fontSize:11}}>{stats.gamesHosted} notti</span>
                  <span style={{color:'#27ae60', fontSize:11, fontWeight:700}}>{stats.villaggioWins}V</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ================================================================
   CREATE GAME SCREEN
   ================================================================ */
/* Card ruolo — variante C: tap aggiunge, badge sovrapposto rimuove, bottone i per info */
function RoleCardC({ r, count, onAdd, onRemove, onInfo, unlocked }) {
  return (
    <div className="relative" style={{overflow:'visible'}}>
      {/* Badge rimovi sovrapposto (iOS-style) */}
      {unlocked && count > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="absolute z-10 flex items-center justify-center font-bold transition-all active:scale-90"
          style={{
            top: -6, right: -6,
            width: 20, height: 20, borderRadius: '50%',
            background: r.color, color: '#0d1117',
            border: '2px solid #0d1117',
            fontSize: 9,
          }}>
          {count > 1 ? count : '✕'}
        </button>
      )}
      {/* Card principale */}
      <button
        onClick={onAdd}
        className="relative w-full flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all active:scale-95"
        style={{
          background: count > 0 ? `${r.color}22` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${count > 0 ? r.color + '88' : r.color + '33'}`,
          minHeight: 76,
          opacity: unlocked ? 1 : 0.55,
        }}>
        {!unlocked && <span className="absolute top-1 right-1 text-xs leading-none">🔒</span>}
        <span className="text-2xl leading-none">{r.icon}</span>
        <span className="text-[10px] font-bold text-white text-center leading-tight px-1"
              style={{wordBreak:'break-word'}}>{r.name}</span>
      </button>
      {/* Info button */}
      <button
        onClick={e => { e.stopPropagation(); onInfo(); }}
        className="absolute bottom-1 left-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all active:scale-90"
        style={{background:'rgba(0,0,0,0.65)', border:`1px solid ${r.color}55`, color: r.color}}>
        i
      </button>
    </div>
  );
}

function CreateGameScreen({onStart, onBack}) {
  const [step, setStep] = useState(1);
  const [players, setPlayers] = useState([]);
  const [inputName, setInputName] = useState('');
  const [roles, setRoles] = useState([]);
  const inputRef = useRef(null);

  const validPlayers = players.filter(n => n.trim().length > 0);
  const rolesNeeded = validPlayers.length;
  const canStep1 = validPlayers.length >= 4;

  const setPlayerName = (i, v) => {
    const p = [...players]; p[i]=v; setPlayers(p);
  };

  const addPlayer = () => {
    const n = inputName.trim();
    if (!n) return;
    setPlayers(p=>[...p, n]);
    setInputName('');
    setTimeout(()=>inputRef.current?.focus(),50);
  };

  const removePlayer = i => setPlayers(p => p.filter((_,j)=>j!==i));

  // wolfCount è ora uno state separato; roles contiene SOLO ruoli speciali (no lupo, no villico)
  const [wolfCount, setWolfCount] = useState(2);
  const [expandedPacks, setExpandedPacks] = useState({});

  const addRole = rid => setRoles(r=>[...r,rid]);
  const removeRole = i => setRoles(r=>r.filter((_,j)=>j!==i));
  // rimuove l'ultima occorrenza di rid (per variant C badge tap)
  const removeLastRole = rid => setRoles(r => {
    const idx = r.lastIndexOf(rid);
    if (idx === -1) return r;
    return r.filter((_,j) => j !== idx);
  });

  const roleCount = useMemo(()=>{
    const c={};
    roles.forEach(r=>c[r]=(c[r]||0)+1);
    return c;
  },[roles]);

  const [expandedRole, setExpandedRole] = useState(null);
  const [previewRole, setPreviewRole] = useState(null);
  const [paywallPack, setPaywallPack] = useState(null);
  const [purchasedPacks, setPurchasedPacks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lif_purchased_packs') || '[]'); }
    catch { return []; }
  });
  const isUnlocked = rid => {
    const r = ROLES[rid];
    return !r?.pack || purchasedPacks.includes(r.pack);
  };
  const handleUnlock = packId => {
    if (packId === '_open_combo') { setPaywallPack('combo'); return; }
    const pack = PACKS[packId];
    const toUnlock = pack?.includes ? [...pack.includes, packId] : [packId];
    const next = [...new Set([...purchasedPacks, ...toUnlock])];
    setPurchasedPacks(next);
    localStorage.setItem('lif_purchased_packs', JSON.stringify(next));
  };
  // rolesOk: almeno 1 lupo e i ruoli speciali non superano i posti disponibili
  const villiciAuto = Math.max(0, rolesNeeded - wolfCount - roles.length);
  const rolesOk = wolfCount >= 1 && (wolfCount + roles.length) <= rolesNeeded;
  // bilanciamento calcolato tenendo conto dei villici automatici
  const balanceVal = (wolfCount * 3.5) - (roles.length + villiciAuto);

  return (
    <div className="min-h-screen screen-safe layer pb-28">

      {/* Header con progress bar */}
      <div className="sticky top-0 z-10 px-4 pt-5 pb-3"
           style={{background:'rgba(13,17,23,0.97)', backdropFilter:'blur(12px)'}}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="text-gray-500 hover:text-white text-2xl transition-colors leading-none">←</button>
          <div className="flex-1">
            <h2 className="font-cinzel text-lg font-bold text-moon leading-none">
              {step===1 ? 'Chi gioca stanotte?' : 'Scegli i ruoli'}
            </h2>
            <p className="text-gray-600 text-xs mt-0.5">Passo {step} di 2</p>
          </div>
          <span className="font-cinzel text-xs text-gray-600">{step}/2</span>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 rounded-full w-full" style={{background:'rgba(255,255,255,0.07)'}}>
          <div className="h-full rounded-full transition-all duration-500"
               style={{width: step===1 ? '50%' : '100%', background:'linear-gradient(90deg,#7a5c0e,#e2c97e)'}} />
        </div>
      </div>

      <div className="px-4 pt-4">

        {/* ── STEP 1: Giocatori ── */}
        {step===1 && (
          <div className="anim-fade-up">

            {/* Contatore grande */}
            <div className="text-center mb-6">
              <div className="inline-flex items-baseline gap-1">
                <span className="font-cinzel text-6xl font-bold moon-glow">{validPlayers.length}</span>
                <span className="font-cinzel text-2xl text-gray-600">/{Math.max(validPlayers.length,4)}</span>
              </div>
              <p className="text-gray-600 text-xs mt-1 tracking-wider uppercase">
                {validPlayers.length < 4 ? 'Aggiungi almeno 4 giocatori' : '✓ Pronti a iniziare'}
              </p>
            </div>

            {/* Lista giocatori */}
            <div className="flex flex-col gap-2 mb-4">
              {players.map((name,i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl px-3 py-3"
                     style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'}}>
                  {/* Avatar numerato */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-cinzel font-bold text-sm"
                       style={{background:`hsl(${i*47+200},40%,22%)`, border:`1px solid hsl(${i*47+200},50%,35%)`, color:`hsl(${i*47+200},70%,70%)`}}>
                    {i+1}
                  </div>
                  <input type="text" value={name}
                    onChange={e=>setPlayerName(i,e.target.value)}
                    placeholder={`Giocatore ${i+1}`}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600 font-semibold"/>
                  <button onClick={()=>removePlayer(i)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm">✕</button>
                </div>
              ))}
            </div>

            {/* Input aggiunta */}
            <div className="flex gap-2 mb-3">
              <input ref={inputRef} type="text" value={inputName}
                onChange={e=>setInputName(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addPlayer()}
                placeholder="Nome giocatore…"
                className="flex-1 input-dark rounded-2xl px-4 py-3.5 text-sm"/>
              <button onClick={addPlayer}
                className="btn-gold w-12 rounded-2xl text-xl font-bold flex items-center justify-center">+</button>
            </div>

          </div>
        )}

        {/* ── STEP 2: Ruoli ── */}
        {step===2 && (
          <div className="anim-fade-up pb-44">

            {/* ── Stepper lupi + bilanciamento ── */}
            <div className="rounded-2xl px-4 py-3 mb-5"
                 style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)'}}>
              <div className="flex items-center gap-3">
                <span className="font-bold text-white text-sm flex-1">🐺 Lupi nel villaggio</span>
                <button
                  onClick={() => setWolfCount(w => Math.max(1, w - 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                  style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff'}}>
                  −
                </button>
                <span className="font-cinzel text-2xl font-bold text-white w-6 text-center">{wolfCount}</span>
                <button
                  onClick={() => setWolfCount(w => Math.min(Math.max(1, Math.floor(rolesNeeded / 2)), w + 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                  style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff'}}>
                  +
                </button>
              </div>
              {/* Bilanciamento inline */}
              <p className={`text-[10px] font-bold mt-2 ${balanceVal > 3.5 ? 'text-red-400' : balanceVal < -3 ? 'text-yellow-400' : 'text-green-400'}`}>
                {balanceVal > 3.5
                  ? '⚠️ Lupi troppo forti — considera di ridurli'
                  : balanceVal < -3
                  ? '⚠️ Villaggio molto favorito — considera un lupo in più'
                  : `✓ Bilanciato per ${rolesNeeded} giocatori`}
              </p>
            </div>

            {/* ── Ruoli speciali gratuiti ── */}
            <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Ruoli speciali</p>
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {Object.values(ROLES)
                .filter(r => !r.pack && r.category === 'speciale')
                .map(r => (
                  <RoleCardC key={r.id} r={r}
                    count={roleCount[r.id] || 0}
                    onAdd={() => addRole(r.id)}
                    onRemove={() => removeLastRole(r.id)}
                    onInfo={() => setPreviewRole(r.id)}
                    unlocked={true} />
                ))}
            </div>

            {/* ── Pack ruoli (collassabili) ── */}
            {['ombre','villaggio'].map(packId => {
              const pack = PACKS[packId];
              if (!pack || pack.roles.length === 0) return null;
              const unlocked = purchasedPacks.includes(pack.id);
              const expanded = !!expandedPacks[packId];
              return (
                <div key={packId} className="rounded-2xl overflow-hidden mb-3"
                     style={{border:`1px solid ${pack.color}${unlocked ? '44' : '22'}`,
                             background: unlocked ? `${pack.color}07` : 'rgba(255,255,255,0.02)'}}>
                  {/* Header collassabile */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all active:opacity-75"
                    style={{background:`${pack.color}${unlocked ? '14' : '09'}`}}
                    onClick={() => setExpandedPacks(p => ({...p, [packId]: !p[packId]}))}>
                    <span className="text-xl leading-none shrink-0">{pack.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm leading-tight">{pack.name}</p>
                      <p className="text-[10px] text-gray-500 leading-tight">{pack.description}</p>
                    </div>
                    {unlocked ? (
                      <span className="text-[10px] text-green-400 font-bold shrink-0 px-2 py-1 rounded-full"
                            style={{background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.25)'}}>
                        ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold shrink-0 px-2 py-1 rounded-full"
                            style={{background:`${pack.color}20`, border:`1px solid ${pack.color}44`, color:pack.color}}>
                        🔒 {pack.price}
                      </span>
                    )}
                    <span className="text-gray-600 text-sm ml-1 shrink-0">{expanded ? '↑' : '↓'}</span>
                  </button>

                  {/* Griglia ruoli (visibile solo se espanso) */}
                  {expanded && (
                    <div className="grid grid-cols-3 gap-2.5 p-3">
                      {pack.roles.map(rid => {
                        const r = ROLES[rid]; if (!r) return null;
                        return (
                          <RoleCardC key={rid} r={r}
                            count={roleCount[rid] || 0}
                            onAdd={() => unlocked ? addRole(rid) : setPaywallPack(packId)}
                            onRemove={() => removeLastRole(rid)}
                            onInfo={() => setPreviewRole(rid)}
                            unlocked={unlocked} />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Pack Narratore — riga singola ── */}
            {!purchasedPacks.includes('narratore') && (
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-3 text-left transition-all active:opacity-75"
                style={{background:'rgba(226,201,126,0.04)', border:'1px solid rgba(226,201,126,0.15)'}}
                onClick={() => setPaywallPack('narratore')}>
                <span className="text-xl leading-none shrink-0">🎙️</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm leading-tight">Voce AI Narratore</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Tono cinematografico — si attiva dalle impostazioni</p>
                </div>
                <span className="text-[10px] font-bold shrink-0 px-2 py-1 rounded-full"
                      style={{background:'rgba(226,201,126,0.12)', border:'1px solid rgba(226,201,126,0.3)', color:'#e2c97e'}}>
                  🔒 {PACKS.narratore.price}
                </span>
              </button>
            )}

            {/* ── Combo card ── */}
            {!PACKS.combo.includes.every(id => purchasedPacks.includes(id)) && (
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-3 text-left transition-all active:opacity-75"
                style={{background:'rgba(226,201,126,0.03)', border:'1px solid rgba(226,201,126,0.12)'}}
                onClick={() => setPaywallPack('combo')}>
                <span className="text-xl leading-none shrink-0">⚡</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm leading-tight">{PACKS.combo.name}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{PACKS.combo.description}</p>
                </div>
                <span className="text-[10px] font-bold shrink-0 px-2 py-1 rounded-full"
                      style={{background:'rgba(226,201,126,0.12)', border:'1px solid rgba(226,201,126,0.3)', color:'#e2c97e'}}>
                  {PACKS.combo.price}
                </span>
              </button>
            )}

            {/* ── Modal info ruolo (invariato) ── */}
            {previewRole && (() => {
              const r = ROLES[previewRole];
              const vis = ROLE_VISUALS[previewRole];
              if (!r) return null;
              return (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
                     style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)'}}
                     onClick={()=>setPreviewRole(null)}>
                  <div className="w-full max-w-sm rounded-2xl p-5 anim-fade-up"
                       style={{background: vis ? vis.gradient : '#0d1117', border:`1px solid ${r.color}44`}}
                       onClick={e=>e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl" style={{filter: vis ? `drop-shadow(0 0 12px ${vis.glow})` : 'none'}}>{r.icon}</span>
                        <div>
                          <p className="font-cinzel text-white font-bold text-lg leading-tight">{r.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{background:r.color+'33', border:`1px solid ${r.color}55`, color:r.color}}>
                            {r.team==='lupi' ? '⚔️ Lupi' : '🌾 Villaggio'}
                          </span>
                        </div>
                      </div>
                      <button onClick={()=>setPreviewRole(null)}
                              className="text-gray-500 hover:text-white text-xl leading-none px-1">✕</button>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{r.description}</p>
                    {r.tip && (
                      <div className="p-3 rounded-xl text-xs text-white/50 italic mb-4"
                           style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
                        💡 {r.tip}
                      </div>
                    )}
                    {isUnlocked(r.id) ? (
                      <button
                        onClick={()=>{ addRole(r.id); setPreviewRole(null); }}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                        style={{background:r.color+'33', border:`1px solid ${r.color}66`, color:'white'}}>
                        + Aggiungi {r.name}
                      </button>
                    ) : (
                      <button
                        onClick={()=>{ setPreviewRole(null); setPaywallPack(r.pack); }}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                        style={{background:'rgba(226,201,126,0.12)', border:'1px solid rgba(226,201,126,0.3)', color:'#e2c97e'}}>
                        🔒 Sblocca {PACKS[r.pack]?.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>

      {/* Fixed bottom CTA — step 1 */}
      {step===1 && (
        <div className="fixed bottom-0 left-0 right-0 p-4"
             style={{background:'linear-gradient(to top, rgba(13,17,23,1) 65%, transparent)'}}>
          <button
            onClick={()=>{
              if (canStep1) {
                // preset wolfCount e ruoli speciali al primo ingresso
                const n = validPlayers.length;
                const presets = {
                  4:  { wolves:1, spec:['veggente'] },
                  5:  { wolves:1, spec:['veggente','guardia'] },
                  6:  { wolves:2, spec:['veggente','guardia'] },
                  7:  { wolves:2, spec:['veggente','guardia'] },
                  8:  { wolves:2, spec:['veggente','guardia'] },
                  9:  { wolves:3, spec:['veggente','guardia'] },
                  10: { wolves:3, spec:['veggente','guardia'] },
                };
                const p = presets[n] || presets[10];
                setWolfCount(p.wolves);
                if (roles.length === 0) setRoles(p.spec);
                setStep(2);
              }
            }}
            disabled={!canStep1}
            className="btn-gold w-full py-4 rounded-2xl text-base">
            → Scegli i Ruoli
          </button>
        </div>
      )}

      {/* Fixed bottom CTA — step 2: composizione + avvio */}
      {step===2 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5"
             style={{background:'linear-gradient(to top, rgba(13,17,23,1) 70%, transparent)'}}>
          {/* Composizione attuale */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            <span className="text-[10px] px-2 py-1 rounded-full font-bold"
                  style={{background:'rgba(192,57,43,0.2)', border:'1px solid rgba(192,57,43,0.4)', color:'#ef4444'}}>
              🐺 ×{wolfCount}
            </span>
            {Object.entries(roleCount).map(([rid, cnt]) => {
              if (!cnt) return null;
              const r = ROLES[rid]; if (!r) return null;
              return (
                <span key={rid} className="text-[10px] px-2 py-1 rounded-full font-bold"
                      style={{background:`${r.color}22`, border:`1px solid ${r.color}55`, color:r.color}}>
                  {r.icon} ×{cnt}
                </span>
              );
            })}
            {villiciAuto > 0 && (
              <span className="text-[10px] px-2 py-1 rounded-full font-bold"
                    style={{background:'rgba(39,174,96,0.12)', border:'1px solid rgba(39,174,96,0.3)', color:'#4ade80'}}>
                🧑‍🌾 ×{villiciAuto} auto
              </span>
            )}
            {wolfCount + roles.length > rolesNeeded && (
              <span className="text-[10px] px-2 py-1 rounded-full font-bold text-red-400">
                ⚠️ troppi di {wolfCount + roles.length - rolesNeeded}
              </span>
            )}
          </div>
          <button
            onClick={()=>{
              if (!rolesOk) return;
              const finalRoles = [
                ...Array(wolfCount).fill('lupo'),
                ...roles,
                ...Array(villiciAuto).fill('villico'),
              ];
              const vp = validPlayers.map(n=>({id:uid(6), name:n}));
              const shuffledRoles = shuffleArray(finalRoles);
              const withRoles = vp.map((p,i)=>({...p, role:shuffledRoles[i], alive:true, ready:false}));
              onStart(withRoles, uid(6));
            }}
            disabled={!rolesOk}
            className="btn-gold w-full py-4 rounded-2xl text-base">
            🎮 Inizia la Partita!
          </button>
        </div>
      )}

      {/* Paywall Modal */}
      <PaywallModal
        packId={paywallPack}
        onClose={() => setPaywallPack(null)}
        onUnlock={handleUnlock}
      />
    </div>
  );
}

/* ================================================================
   GAME MASTER SCREEN
   ================================================================ */
function GameMasterScreen({gameId, players, onEndGame, onBack}) {
  const [phase, setPhase] = useState('waiting');
  const [nightStep, setNightStep] = useState(0);
  const [dayNum, setDayNum] = useState(1);
  const [activeQrIndex, setActiveQrIndex] = useState(0);
  const [pStates, setPStates] = useState(() =>
    players.reduce((acc,p)=>({...acc,[p.id]:{...p,alive:true,ready:false}}),{})
  );
  const [timer, setTimer] = useState(300);
  const [timerTotal, setTimerTotal] = useState(300);
  const [timerOn, setTimerOn] = useState(false);
  const [showVotesPanel, setShowVotesPanel] = useState(false);
  const [narration, setNarration] = useState('');
  const [showNarrationLog, setShowNarrationLog] = useState(false);
  const [narrationLog, setNarrationLog] = useState([]);
  const [readyCount, setReadyCount] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showEliminate, setShowEliminate] = useState(false);
  const [showCupidoModal, setShowCupidoModal] = useState(null); // id del primo innamorato
  const [showHunterModal, setShowHunterModal] = useState(false); // cacciatore morente
  const [showTimerEdit, setShowTimerEdit] = useState(false);
  const [timerInput, setTimerInput] = useState('');
  const [showRoleInfo, setShowRoleInfo] = useState(null);
  const [showRolesPanel, setShowRolesPanel] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [elKey, setElKey] = useState(() => localStorage.getItem('lif_el_key') || '');
  const [elVoice, setElVoice] = useState(() => localStorage.getItem('lif_el_voice') || '');
  const [elCustomVoice, setElCustomVoice] = useState(() => localStorage.getItem('lif_el_custom_voice') || '');
  const [elTestStatus, setElTestStatus] = useState('');
  const [elVoiceList, setElVoiceList] = useState([]);
  const [elVoicesLoading, setElVoicesLoading] = useState(false);
  const [ttsMode, setTtsMode] = useState(() => localStorage.getItem('lif_tts_mode') || 'script');
  const [dayTimerMins, setDayTimerMins] = useState(() => parseInt(localStorage.getItem('lif_day_timer') || '5'));
  const [votePrompt, setVotePrompt] = useState(false); // sollecito votazione
  const eventLogRef = useRef([]); // log eventi per il recap finale (ref = no stale closure)

  const toggleTtsMode = () => {
    const next = ttsMode === 'voice' ? 'script' : 'voice';
    setTtsMode(next);
    localStorage.setItem('lif_tts_mode', next);
  };

  const loadELVoices = () => {
    if (elVoiceList.length > 0) return; // già caricate
    setElVoicesLoading(true);
    const apiBaseVoices = window.IS_NATIVE_APP ? 'https://lupus-in-fabula-eight.vercel.app' : window.location.origin;
    fetch(`${apiBaseVoices}/api/voices`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(list => {
        const withCustom = [...list, { id: 'custom', name: 'Voice ID personalizzato…' }];
        setElVoiceList(withCustom);
        // Se non c'è ancora una voce salvata, imposta la prima della lista
        if (!localStorage.getItem('lif_el_voice') && list.length > 0) {
          setElVoice(list[0].id);
        }
      })
      .catch(() => {
        // Fallback alla lista statica se il proxy non è disponibile (sviluppo locale)
        setElVoiceList(window.EL_VOICES);
      })
      .finally(() => setElVoicesLoading(false));
  };

  const saveELConfig = () => {
    localStorage.setItem('lif_el_key', elKey);
    localStorage.setItem('lif_el_voice', elVoice);
    localStorage.setItem('lif_el_custom_voice', elCustomVoice);
    setElTestStatus('✅ Salvato!');
    setTimeout(() => setElTestStatus(''), 2000);
  };
  const testELVoice = () => {
    localStorage.setItem('lif_el_key', elKey);
    localStorage.setItem('lif_el_voice', elVoice);
    localStorage.setItem('lif_el_custom_voice', elCustomVoice);
    setElTestStatus('🔊 Test in corso…');
    window.afterSpeech(() => setElTestStatus('✅ Test completato!'), 10000);
    window.speakNarration('La notte. I segreti del villaggio si risvegliano.');
  };
  // Ref per dayTimerMins — evita stale closure nei setTimeout del night engine
  const dayTimerMinsRef = useRef(dayTimerMins);
  useEffect(() => { dayTimerMinsRef.current = dayTimerMins; }, [dayTimerMins]);

  // Sollecito votazione quando il timer giorno arriva a zero
  useEffect(() => {
    if (phase === 'day' && timer === 0 && !timerOn) {
      setVotePrompt(true);
    }
    if (phase !== 'day') {
      setVotePrompt(false);
    }
  }, [phase, timer, timerOn]);

  const [alfaMark, setAlfaMark] = useState(null);        // id del giocatore marcato dal Lupo Alfa
  const [mitomaneTarget, setMitomaneTarget] = useState(null); // id del giocatore imitato dal Mitomane
  const [lastGuardedId, setLastGuardedId] = useState(null); // id protetto dalla Guardia la notte precedente
  const timerRef = useRef(null);
  let appUrl = window.location.href.split('?')[0];
  if (appUrl.includes('localhost') || appUrl.startsWith('capacitor://') || appUrl.startsWith('file://')) {
    appUrl = 'https://lupus-in-fabula-eight.vercel.app/';
  }

  // Timer tick
  useEffect(()=>{
    clearTimeout(timerRef.current);
    if(timerOn && timer>0) {
      timerRef.current = setTimeout(()=>setTimer(t=>t-1), 1000);
    } else if(timer===0) setTimerOn(false);
    return ()=>clearTimeout(timerRef.current);
  },[timerOn, timer]);

  const [nightVotes, setNightVotes] = useState({});
  const [dayVotes, setDayVotes] = useState({});
  const [nightDecisions, setNightDecisions] = useState({});
  const [lovers, setLovers] = useState({}); // { player1id: player2id, player2id: player1id }
  const [dawnInfo, setDawnInfo] = useState(null); // info GM sull'alba: { victimId, poisonVictimId, stregaHealed, figlioTransformed, mediumResult, sciamanoResult }

  // Firebase listener for ready count and night votes
  useEffect(()=>{
    if(!db || !gameId) return;
    const ref = db.ref(`games/${gameId}`);
    ref.on('value', snap=>{
      const data = snap.val()||{};
      const playersData = data.players||{};
      setReadyCount(Object.values(playersData).filter(p=>p.ready).length);
      setPStates(prev => {
        let changed = false;
        const next = {...prev};
        for(let pid in playersData){
          if(next[pid] && next[pid].ready !== playersData[pid].ready){
            next[pid] = {...next[pid], ready: playersData[pid].ready};
            changed = true;
          }
        }
        return changed ? next : prev;
      });
      setNightVotes(data.nightVotes||{});
      setDayVotes(data.dayVotes||{});
      if(data.lovers) setLovers(data.lovers);
    });
    return ()=>ref.off();
  },[gameId]);

  const fbUpdate = useCallback((data)=>{
    if(db && gameId) db.ref(`games/${gameId}`).update(data);
  },[gameId]);

  // Aggiunge un evento al log locale (usato per costruire il recap a fine partita)
  const pushEvent = useCallback((entry) => {
    eventLogRef.current = [...eventLogRef.current, entry];
  }, []);

  // Pubblica il recap completo su Firebase quando la partita finisce
  const publishRecap = useCallback((winnerTeam, finalStates) => {
    if (!db || !gameId) return;
    // Snapshot dei giocatori con nome + ruolo + sopravvissuto
    const playersSnapshot = Object.fromEntries(
      Object.entries(finalStates).map(([id, p]) => [id, {
        name: p.name, role: p.role, alive: p.alive,
      }])
    );
    db.ref(`games/${gameId}/gameRecap`).set({
      winner: winnerTeam,
      players: playersSnapshot,
      eventLog: eventLogRef.current,
    });
  }, [gameId]);

  const setNarrationAndPhase = (p, narr, timerSecs=null, extraData={}) => {
    setPhase(p);
    setNarration(narr);
    if(narr && narr.length > 0) {
      window.speakNarration(narr);
      const ts = new Date().toLocaleTimeString('it-IT', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
      setNarrationLog(prev => [...prev, { time: ts, text: narr }]);
    }
    if(timerSecs!==null){setTimer(timerSecs); setTimerTotal(timerSecs); setTimerOn(true);}
    fbUpdate({ phase:p, ...extraData });
  };

  const eliminate = (pid, silent=false) => {
    let newStates = {...pStates, [pid]:{...pStates[pid], alive:false}};
    if(db && gameId) db.ref(`games/${gameId}/players/${pid}/alive`).set(false);
    if(!silent) window.playSfx('dead');

    // Cupido: se un innamorato muore, muore anche l'altro
    const partnerId = lovers[pid];
    if(partnerId && newStates[partnerId]?.alive) {
      newStates = {...newStates, [partnerId]:{...newStates[partnerId], alive:false}};
      if(db && gameId) db.ref(`games/${gameId}/players/${partnerId}/alive`).set(false);
    }

    setPStates(newStates);
    const w = checkWin(newStates, lovers);
    if(w) {
      const endMsg = w==='lupi'
        ? 'Il villaggio è caduto. I lupi escono dall\'ombra, il loro ululato riecheggia nella notte. Il branco ha trionfato.'
        : w==='amore'
        ? 'I due innamorati sono gli unici sopravvissuti. Il loro amore ha vinto ogni cosa — il villaggio e il branco si inchinano davanti a loro.'
        : 'Ultimo lupo svelato. Il villaggio esulta — la pace torna tra le case, le porte si riaprono, le candele si riaccendono.';
      setWinner(w);
      setNarrationAndPhase('ended', endMsg);
      fbUpdate({winner:w, phase:'ended'});
      publishRecap(w, newStates);
    }

    // Lupo Alfa: se eliminato, porta con sé il giocatore marcato
    if(pStates[pid]?.role === 'lupo_alfa' && alfaMark && newStates[alfaMark]?.alive) {
      newStates = {...newStates, [alfaMark]:{...newStates[alfaMark], alive:false}};
      if(db && gameId) db.ref(`games/${gameId}/players/${alfaMark}/alive`).set(false);
      setAlfaMark(null);
      const w2 = checkWin(newStates, lovers);
      if(w2 && !w) {
        setPStates(newStates);
        const endMsg2 = w2==='lupi' ? 'Il branco ha trionfato. Il villaggio è caduto.' : w2==='amore' ? 'I due innamorati hanno vinto.' : 'Il villaggio ha vinto. La pace è tornata.';
        setWinner(w2); setNarrationAndPhase('ended', endMsg2); fbUpdate({winner:w2, phase:'ended'});
        publishRecap(w2, newStates);
        return w2;
      }
    }

    // Cacciatore: se eliminato, può portare qualcuno con sé
    if(pStates[pid]?.role === 'cacciatore' && !w) {
      setShowHunterModal(true);
    }

    return w;
  };

  const startGame = ()=>{
    setNarrationAndPhase('role_reveal','Ogni mascella nasconde la verità. Scopri chi sei davvero.');
  };

  const goFirstNight = ()=>{
    setNightStep(0);
    setNarrationAndPhase('night', NIGHT_NARRATION.open.open, null, { currentNightStep: null, nightVotes: null, dayVotes: null, nightDecisions: null });
    setDayNum(1);
    window.playSfx('night');
  };

  const goNight = () => {
    setNightStep(0);
    setNightDecisions({});
    setNarrationAndPhase('night', NIGHT_NARRATION.open.open, null, { currentNightStep: null, nightVotes: null, dayVotes: null });
    window.playSfx('night');
  };

  const processNightStep = ()=>{
    if (phase !== 'night') return; // Blocca timer stantii che sparano dopo il cambio fase
    const step = activeNightSteps[nightStep];
    let newDecisions = { ...nightDecisions };
    
    // Tally votes for this step
    if (step && step.hasRole) {
      const tally = {};
      Object.entries(nightVotes).forEach(([vid, tId]) => {
         if(pStates[vid]?.role === step.roleId) tally[tId] = (tally[tId]||0)+1;
      });
      let maxVotes = 0; let target = null;
      Object.entries(tally).forEach(([tId, count]) => {
         if(count > maxVotes) { maxVotes = count; target = tId; }
      });
      if(target) newDecisions[step.key] = target;

      // Cupido: legge la doppia scelta "id1,id2" fatta dal telefono
      if (step.key === 'cupido' && target) {
        if (target.includes(',')) {
          // Nuovo sistema: cupido ha scelto entrambi dal telefono
          const [l1, l2] = target.split(',');
          if (l1 && l2 && pStates[l1] && pStates[l2]) {
            const newLovers = { [l1]: l2, [l2]: l1 };
            setLovers(newLovers);
            fbUpdate({ lovers: newLovers });
          }
        } else if (Object.keys(lovers).length === 0) {
          // Fallback vecchio sistema: apre modal per secondo innamorato
          setShowCupidoModal(target);
          setNightDecisions(newDecisions);
          return;
        }
      }

      // Mitomane: registra il bersaglio (prima notte)
      if (step.key === 'mitomane' && target && !mitomaneTarget) {
        setMitomaneTarget(target);
        if(db && gameId) db.ref(`games/${gameId}/mitomaneTarget`).set(target);
      }
    }
    setNightDecisions(newDecisions);

    const next = nightStep+1;
    if(next >= activeNightSteps.length){
      // ── Prima riproduci il close dell'ultimo step, poi vai all'alba ──
      const lastStepClose = NIGHT_NARRATION[activeNightSteps[nightStep]?.key]?.close || '';
      const proceedToDawn = () => {
      // ── Dawn Reveal — calcolo vittime ──
      let dawnVictim = newDecisions['lupi'];
      if(dawnVictim && ROLES[pStates[dawnVictim]?.role]?.immuneToWolves) dawnVictim = null;
      if(dawnVictim === newDecisions['guardia']) dawnVictim = null;

      // Figlio dei Lupi: si trasforma invece di morire
      let figlioTransformed = false;
      let pStatesForLog = pStates; // snapshot locale aggiornato per il recap (evita stale setPStates)
      if(dawnVictim && ROLES[pStates[dawnVictim]?.role]?.becomesWolfIfKilled) {
        const figlioId = dawnVictim;
        pStatesForLog = {...pStates, [figlioId]: {...pStates[figlioId], role: 'lupo'}};
        setPStates(pStatesForLog);
        if(db && gameId) db.ref(`games/${gameId}/players/${figlioId}/role`).set('lupo');
        dawnVictim = null;
        figlioTransformed = true;
      }

      // Strega
      const stregaDecision = newDecisions['strega'];
      const stregaUsedHeal   = stregaDecision === 'HEAL';
      const stregaUsedPoison = stregaDecision && stregaDecision !== 'HEAL' && stregaDecision !== 'PASS';
      if(stregaUsedHeal && dawnVictim) {
        dawnVictim = null;
        fbUpdate({ witchHealUsed: true });
      }

      // Medium
      const mediumDecision = newDecisions['medium'];
      let mediumResult = null;
      if(mediumDecision && pStates[mediumDecision] && !pStates[mediumDecision].alive) {
        const medRole = ROLES[pStates[mediumDecision].role];
        mediumResult = { name: pStates[mediumDecision].name, role: medRole };
      }

      // Sciamano: resuscita
      const sciamanoDecision = newDecisions['sciamano'];
      let sciamanoResult = null;
      // Sciamano: salta se ha già usato il potere (shamanUsed) o se ha passato il turno ('PASS')
      if(sciamanoDecision && sciamanoDecision !== 'PASS' && pStates[sciamanoDecision] && !pStates[sciamanoDecision].alive) {
        const risortoPStates = {...pStates, [sciamanoDecision]: {...pStates[sciamanoDecision], alive: true}};
        setPStates(risortoPStates);
        if(db && gameId) db.ref(`games/${gameId}/players/${sciamanoDecision}/alive`).set(true);
        fbUpdate({ shamanUsed: true });
        sciamanoResult = pStates[sciamanoDecision].name;
      }

      // Criceto eliminato dalla Veggente
      const veggenteScanTarget = newDecisions['veggente'];
      if(veggenteScanTarget && pStates[veggenteScanTarget]?.alive && ROLES[pStates[veggenteScanTarget]?.role]?.diesFromVeggente) {
        const wCr = eliminate(veggenteScanTarget, true);
        if(wCr) return;
      }

      // Veleno strega
      let poisonVictimId = null;
      if(stregaUsedPoison && pStates[stregaDecision]?.alive) {
        poisonVictimId = stregaDecision;
        fbUpdate({ witchPoisonUsed: true });
        const w2 = eliminate(stregaDecision, true);
        if(w2) return;
      }

      // Elimina la vittima dei lupi
      if(dawnVictim && pStates[dawnVictim]) {
        const w = eliminate(dawnVictim, true);
        if(w) return;
      }

      // ── Sceglie la frase statica del narratore (nessuna API call) ──
      let narr;
      if(dawnVictim && pStates[dawnVictim]) {
        narr = 'La notte ha reclamato una vittima. Il suo nome apparirà adesso sui vostri schermi.';
      } else if(figlioTransformed) {
        narr = "L'alba arriva silenziosamente. Le ombre si ritirano. Nel bosco, una creatura si è svegliata. Il villaggio rimane intatto — per ora.";
      } else if(stregaUsedHeal) {
        narr = "L'alba arriva silenziosamente. Le ombre si ritirano. Una pozione misteriosa ha respinto la morte. Stanotte non ci sono vittime.";
      } else {
        narr = "L'alba arriva silenziosamente. Le ombre si ritirano. La notte è passata senza sangue. Il villaggio si ritrova intatto al nuovo giorno.";
      }

      // ── Registra evento notte nel log recap ──
      // Usa pStatesForLog (aggiornato con eventuale trasformazione Figlio) per includere il nuovo lupo
      const wolvesIds = Object.keys(pStatesForLog).filter(id => pStatesForLog[id]?.alive && ROLES[pStatesForLog[id]?.role]?.team === 'lupi');
      pushEvent({
        type: 'night',
        turn: dayNum,
        wolvesIds,
        wolfTarget:         newDecisions['lupi'] || null,
        guardiaSaved:       !!(newDecisions['guardia'] && newDecisions['guardia'] === newDecisions['lupi']),
        stregaHealed:       stregaUsedHeal && !!newDecisions['lupi'],
        stregaPoison:       stregaUsedPoison ? stregaDecision : null,
        dawnVictim:         dawnVictim || null,
        poisonVictim:       poisonVictimId,
        figlioTransformed,
        sciamanoRevived:    sciamanoDecision && pStates[sciamanoDecision] ? sciamanoDecision : null,
        cupidoLovers:       dayNum === 1 && Object.keys(lovers).length ? Object.keys(lovers).slice(0,2) : null,
        mitomaneTarget:     dayNum === 1 && mitomaneTarget ? mitomaneTarget : null,
      });

      // ── Salva dawnInfo per il GM e push dawnVictimId su Firebase per i giocatori ──
      const info = {
        victimId: dawnVictim || null,
        poisonVictimId,
        stregaHealed: stregaUsedHeal && !!newDecisions['lupi'],
        figlioTransformed,
        mediumResult,
        sciamanoResult,
      };
      setDawnInfo(info);

      // Guardia: aggiorna lastGuardedId per bloccare la stessa protezione due notti di fila
      const guardiaChoice = newDecisions['guardia'] || null;
      setLastGuardedId(guardiaChoice);
      if(db && gameId) fbUpdate({ lastGuardedId: guardiaChoice });

      setNarrationAndPhase('dawn_reveal', narr, null, {
        currentNightStep: null,
        nightVotes: null,
        currentNightVictim: null,
        dawnVictimId: dawnVictim || null,
      });
      setDayNum(d=>d+1);
      window.stopSfx('night');
      window.playSfx('dawn');

      setTimeout(() => {
        setNarrationAndPhase('day', '', dayTimerMinsRef.current * 60, { dawnVictimId: null });
        setDawnInfo(null);
      }, 7000);
      }; // fine proceedToDawn

      // Riproduci il close dell'ultimo step (es. "I Lupi, chiudano gli occhi.")
      // poi procedi all'alba
      if (lastStepClose) {
        window.speakNarration(lastStepClose);
        window.afterSpeech(proceedToDawn);
      } else {
        proceedToDawn();
      }

    } else {
      const currentStepObj = activeNightSteps[nightStep];
      // Legge il testo di chiusura dalla struttura open/close di NIGHT_NARRATION
      const closingMsg = NIGHT_NARRATION[currentStepObj.key]?.close || '';

      const nextStepObj = activeNightSteps[next];
      const goNextStep = () => {
        // Legge il testo di apertura del prossimo step
        const narrationText = NIGHT_NARRATION[nextStepObj.key]?.open || '';
        setNightStep(next);
        setNarration(narrationText);
        window.speakNarration(narrationText);
        const fbData = { currentNightStep: nextStepObj.hasRole ? nextStepObj : null, nightVotes: null };
        if (nextStepObj.key === 'strega') fbData.currentNightVictim = newDecisions['lupi'] || null;
        fbUpdate(fbData);
        if(nextStepObj.key==='lupi') window.playSfx('wolf');
      };

      if(closingMsg) {
        // Aspetta che il narratore finisca di parlare, poi passa allo step successivo
        window.speakNarration(closingMsg);
        window.afterSpeech(goNextStep);
      } else {
        goNextStep();
      }
    }
  };

  const resolveDayVoting = () => {
      const tally = {};
      Object.entries(dayVotes).forEach(([voterId, tId]) => {
        const weight = ROLES[pStates[voterId]?.role]?.voteWeight || 1;
        tally[tId] = (tally[tId]||0) + weight;
      });
      let maxVotes = 0; let target = null;
      Object.entries(tally).forEach(([tId, count]) => {
         if(count > maxVotes) { maxVotes = count; target = tId; }
      });
      
      if(target && pStates[target]) {
         pushEvent({ type: 'day', turn: dayNum, dayVictim: target, noMajority: false });
         const w = eliminate(target);
         if(w) return;
         // Frase statica → MP3 pre-registrato, nessuna API call
         // Il nome del condannato arriva sui telefoni dei giocatori via Firebase (dayVictimId)
         setNarrationAndPhase('ended_voting',
           'Colui che è stato nominato apparirà adesso sui vostri schermi.',
           null, { dayVotes: null, dayVictimId: target }
         );
         setTimeout(() => {
           setNightStep(0); setNightDecisions({});
           setNarrationAndPhase('night', NIGHT_NARRATION.open.open, null,
             { currentNightStep: null, nightVotes: null, dayVictimId: null }
           );
           window.playSfx('night');
         }, 6000);
      } else {
         pushEvent({ type: 'day', turn: dayNum, dayVictim: null, noMajority: true });
         setNarrationAndPhase('ended_voting',
           'Nessuno raggiunge la maggioranza. Il villaggio rimane spaccato. La notte sta arrivando…',
           null, { dayVotes: null, dayVictimId: null }
         );
         setTimeout(() => {
           setNightStep(0); setNightDecisions({});
           setNarrationAndPhase('night', NIGHT_NARRATION.open.open, null,
             { currentNightStep: null, nightVotes: null, dayVictimId: null }
           );
           window.playSfx('night');
         }, 6000);
      }
  };

  const goVoting = ()=>{
    setNarrationAndPhase('voting','La discussione è finita. Il silenzio della votazione può cominciare. Scegliete dal vostro telefono.', null);
  };

  const clearVotes = ()=>{
    fbUpdate({ nightVotes: null, dayVotes: null });
    setNightVotes({});
    setDayVotes({});
  };

  const alivePlayers = Object.values(pStates).filter(p=>p.alive);
  const deadPlayers  = Object.values(pStates).filter(p=>!p.alive);

  const phaseLabel = {
    waiting:'⏳ In attesa',role_reveal:'🌙 Rivelazione',
    night:`🌙 Notte ${dayNum}`, day:`☀️ Giorno ${dayNum}`,
    voting:'🗳️ Votazione', ended:'🏁 Fine partita'
  }[phase]||'';

  // Solo giocatori VIVI: evita che step di ruoli morti rimangano attivi
  const presentRoleIds = new Set(Object.values(pStates).filter(p=>p.alive).map(p=>p.role));
  const activeNightSteps = NIGHT_STEPS.filter(s => (!s.hasRole || presentRoleIds.has(s.roleId)) && (!s.firstNightOnly || dayNum === 1));

  // ===================== AUTOMATED ENGINE =====================
  const engineTimer = useRef(null);
  const scheduledKey = useRef(null);
  const [actionPulse, setActionPulse] = useState(null);

  // Esegue l'azione pianificata (al sicuro da stale closures poiché al re-render le ref sono aggiornate!)
  useEffect(() => {
    if (actionPulse === 'goFirstNight') goFirstNight();
    if (actionPulse === 'processNightStep') processNightStep();
    if (actionPulse === 'goVoting') goVoting();
    if (actionPulse === 'resolveDayVoting') resolveDayVoting();
    if (actionPulse) setActionPulse(null); // reset immediato
  }, [actionPulse]);

  useEffect(() => {
    if(winner || actionPulse) return;

    let plannedAction = null;
    let delay = 0;

    if (phase === 'role_reveal' || phase === 'waiting') {
      const totalPlayers = Object.keys(pStates).length;
      if (totalPlayers > 0 && readyCount === totalPlayers) {
        plannedAction = 'goFirstNight'; delay = 4000;
      }
    } else if (phase === 'night') {
      const step = activeNightSteps[nightStep];
      if (step) {
        if (step.hasRole) {
          const aliveOfRole = Object.values(pStates).filter(p => p.alive && p.role === step.roleId);
          if (aliveOfRole.length === 0) {
            plannedAction = 'processNightStep'; delay = 7000;
          } else if (step.roleId === 'figlio_dei_lupi') {
            // Figlio dei Lupi non ha azione notturna: avanza automaticamente dopo il delay narrativo
            plannedAction = 'processNightStep'; delay = 7000;
          } else {
            const votersOfRole = Object.keys(nightVotes).filter(vid => pStates[vid]?.role === step.roleId);
            if (votersOfRole.length >= aliveOfRole.length) {
              plannedAction = 'processNightStep'; delay = 3500;
            }
          }
        } else {
          plannedAction = 'processNightStep'; delay = 9000;
        }
      }
    } else if (phase === 'day') {
      // Nessun auto-avanzamento: il GM decide quando andare al voto (con sollecito votePrompt)
    } else if (phase === 'voting') {
      const aliveCount = Object.values(pStates).filter(p=>p.alive).length;
      const voteCount = Object.keys(dayVotes).length;
      if (aliveCount > 0 && voteCount === aliveCount) {
        plannedAction = 'resolveDayVoting'; delay = 4000;
      }
    }

    if (plannedAction) {
      const currentKey = `${phase}-${nightStep}-${plannedAction}`;
      if (scheduledKey.current !== currentKey) {
        scheduledKey.current = currentKey;
        clearTimeout(engineTimer.current);
        engineTimer.current = setTimeout(() => {
          setActionPulse(plannedAction);
        }, delay);
      }
    } else {
      // Se non ci sono azioni pianificate valide ma ne avevamo una (es. un voto è stato revocato?)
      // Meglio non cancellare per ora, non è un caso supportato
    }
  }, [phase, nightStep, readyCount, pStates, nightVotes, dayVotes, activeNightSteps, timer, timerOn, winner, actionPulse]);

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsSpeaking(true);
    const handleEnd = () => setIsSpeaking(false);
    
    if (window.speechSynthesis && window.speechSynthesis.speaking) setIsSpeaking(true);

    window.addEventListener('narrator_start', handleStart);
    window.addEventListener('narrator_end', handleEnd);
    return () => {
      window.removeEventListener('narrator_start', handleStart);
      window.removeEventListener('narrator_end', handleEnd);
    };
  }, []);

  return (
    <div className={`min-h-screen layer screen-safe pb-6 ${ phase==='night'||phase==='role_reveal'||phase==='waiting' ? 'overlay-night' : phase==='dawn_reveal' ? 'overlay-dawn' : phase==='day'||phase==='voting' ? 'overlay-day' : '' }`}
         style={{maxWidth:480, margin:'0 auto'}}>

      {/* Glow atmosferico di fase */}
      {(phase==='night'||phase==='role_reveal'||phase==='waiting') && (
        <div className="phase-glow" style={{top:'-60px',width:320,height:320,
          background:'radial-gradient(ellipse, rgba(80,40,200,0.18) 0%, transparent 70%)',
          animation:'nightGlow 4s ease-in-out infinite'}} />
      )}
      {phase==='dawn_reveal' && (
        <div className="phase-glow" style={{bottom:0,top:'auto',width:420,height:260,
          background:'radial-gradient(ellipse at bottom, rgba(255,110,30,0.22) 0%, rgba(200,60,10,0.08) 50%, transparent 75%)',
          animation:'dawnGlow 3s ease-in-out infinite'}} />
      )}
      {(phase==='day'||phase==='voting') && (
        <div className="phase-glow" style={{top:'-40px',width:360,height:280,
          background:'radial-gradient(ellipse, rgba(200,140,20,0.12) 0%, transparent 70%)',
          animation:'dayGlow 5s ease-in-out infinite'}} />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 pt-5 pb-3"
           style={{background: phase==='night'||phase==='role_reveal'||phase==='waiting' ? 'rgba(10,5,25,0.95)' : phase==='dawn_reveal' ? 'rgba(25,10,0,0.95)' : 'rgba(15,10,0,0.95)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <button onClick={onBack} className="text-gray-500 hover:text-white text-2xl leading-none transition-colors">←</button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-cinzel text-moon font-bold text-base leading-none truncate">Narratore</h2>
            <span className="badge" style={{background:'rgba(226,201,126,0.1)', border:'1px solid rgba(226,201,126,0.2)', color:'rgba(226,201,126,0.7)', fontSize:'0.65rem'}}>
              #{gameId}
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">{phaseLabel} · {alivePlayers.length}/{Object.keys(pStates).length} vivi</p>
        </div>
        {/* Phase dot indicator */}
        <div className="flex gap-1">
          {['waiting','role_reveal','night','day','voting','ended'].map((p,i)=>(
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                 style={{background: p===phase||(['night','day','voting'].includes(phase)&&['night','day','voting'].includes(p)&&i<=(['waiting','role_reveal','night','day','voting','ended'].indexOf(phase)))
                   ?'#e2c97e':'rgba(255,255,255,0.12)'}}/>
          ))}
        </div>
      </div>

      <div className="px-4 mt-2">

        {/* Narrator Avatar 3D Style */}
        {phase !== 'waiting' && phase !== 'ended' && (
          <div className="flex flex-col items-center justify-center mb-8 mt-6 anim-fade-in relative z-0 narrator-3d-container">
            <div className={`narrator-3d-avatar w-40 h-40 rounded-full overflow-hidden border-4 shadow-2xl ${isSpeaking ? 'speaking' : ''}`}
                 style={{ 
                   borderColor: isSpeaking ? 'rgba(226,201,126,0.8)' : 'rgba(226,201,126,0.2)',
                   background: '#0d1117'
                 }}>
              <img src={window.NARRATOR_IMG || 'narrator.png'} alt="Silente" className="w-full h-full object-cover"
                   onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem;">🧙</div>'; }} />
            </div>
            
            {/* Magical Aura Rings */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-moon/20 pointer-events-none transition-all duration-1000 ${isSpeaking ? 'scale-110 opacity-60 rotate-45' : 'scale-100 opacity-20'}`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-moon/10 pointer-events-none transition-all duration-1000 delay-100 ${isSpeaking ? 'scale-125 opacity-40 -rotate-45' : 'scale-100 opacity-0'}`}></div>

            {isSpeaking && (
              <div className="mt-2 flex justify-center gap-1 items-end h-4">
                {[0.6, 1, 0.4, 0.8].map((h, i) => (
                  <div key={i} className="w-1 bg-moon rounded-full"
                       style={{ height: `${h*100}%`, animation: `bar-pulse 0.8s ${i*0.15}s ease-in-out infinite` }}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Script card — testo da leggere ad alta voce */}
        {narration && ttsMode === 'script' && (
          <div className="mb-5 anim-fade-up rounded-2xl p-5 relative"
               style={{background:'rgba(226,201,126,0.05)', border:'1px solid rgba(226,201,126,0.25)',
                       boxShadow:'0 0 30px rgba(226,201,126,0.06)'}}>
            {/* Icona rotolo */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📜</span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'rgba(226,201,126,0.5)'}}>
                Leggi ad alta voce
              </span>
            </div>
            {/* Testo narrazione */}
            <p className="font-cinzel text-white text-base leading-relaxed italic">
              "{narration}"
            </p>
          </div>
        )}

        {/* Log narrazione collassabile */}
        {narrationLog.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowNarrationLog(v => !v)}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span>{showNarrationLog ? '▾' : '▸'}</span>
              <span>📋 Log narratore ({narrationLog.length})</span>
            </button>
            {showNarrationLog && (
              <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 max-h-40 overflow-y-auto space-y-1">
                {narrationLog.map((entry, i) => (
                  <p key={i} className="text-[11px] text-gray-400 leading-snug">
                    <span className="text-gray-600 mr-1">[{entry.time}]</span>
                    <span className="italic">{entry.text}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== WAITING ===================== */}
        {phase==='waiting' && (
          <div className="anim-fade-up flex flex-col items-center">
            <p className="text-gray-400 text-sm mb-4 text-center">
              Fai scansionare il QR ad un giocatore alla volta.
            </p>

            <div className="flex items-center gap-4 mb-6 w-full max-w-sm">
              <button 
                onClick={() => setActiveQrIndex(i => Math.max(0, i - 1))}
                disabled={activeQrIndex === 0}
                className="w-12 h-12 rounded-full glass hover:bg-white/10 active:scale-95 disabled:opacity-20 flex items-center justify-center text-2xl transition-all pb-1">
                ←
              </button>
              
              <div className="flex-1">
                {players.map((p, i) => {
                  if (i !== activeQrIndex) return null;
                  const playerUrl = `${appUrl}?game=${gameId}&player=${p.id}`;
                  const isReady = pStates[p.id]?.ready;
                  
                  return (
                    <div key={p.id} className="glass rounded-2xl p-4 text-center anim-fade-in w-full relative">
                      {isReady && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-[0_0_10px_#22c55e]">✓</div>
                      )}
                      <a href={playerUrl} target="_blank" rel="noreferrer" className="block" title="Clicca per aprire il ruolo in una nuova scheda">
                        <div className="flex justify-center rounded-xl overflow-hidden mb-3 mx-auto max-w-[150px]" style={{background:'#060b10'}}>
                          <QRCodeBox url={playerUrl} size={150}/>
                        </div>
                        <p className="font-cinzel font-bold text-white text-lg truncate" style={{color: isReady?'#4ade80':''}}>{p.name}</p>
                        <p className="text-gray-500 text-[10px] uppercase mt-1">Giocatore {i+1} di {players.length}</p>
                      </a>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setActiveQrIndex(i => Math.min(players.length - 1, i + 1))}
                disabled={activeQrIndex === players.length - 1}
                className="w-12 h-12 rounded-full glass hover:bg-white/10 active:scale-95 disabled:opacity-20 flex items-center justify-center text-2xl transition-all pb-1">
                →
              </button>
            </div>

            {isFirebaseConfigured() && (
              <div className="glass rounded-xl p-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Giocatori pronti</p>
                  <p className="font-cinzel text-white font-bold">{readyCount} / {players.length}</p>
                </div>
                <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all"
                       style={{width:`${(readyCount/players.length)*100}%`}}/>
                </div>
              </div>
            )}

            <div className="text-center mt-2 mb-2">
              {readyCount === players.length ? (
                <p className="text-green-400 text-sm font-bold flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Avvio in corso...</p>
              ) : (
                <p className="text-gray-500 text-sm italic">In attesa dei giocatori...</p>
              )}
            </div>

            {/* ---- Modalità voce ---- */}
            <div className="mt-4 w-full">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Voce narratore</p>
              <div className="flex gap-1 rounded-xl overflow-hidden p-0.5"
                     style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'}}>
                <button
                  onClick={()=>{ setTtsMode('script'); localStorage.setItem('lif_tts_mode','script'); }}
                  className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all"
                  style={ttsMode==='script'
                    ? {background:'rgba(226,201,126,0.2)', color:'#e2c97e', border:'1px solid rgba(226,201,126,0.3)'}
                    : {color:'#6b7280'}}>
                  📖 Script
                </button>
                <button
                  onClick={()=>{ setTtsMode('voice'); localStorage.setItem('lif_tts_mode','voice'); }}
                  className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all"
                  style={ttsMode==='voice'
                    ? {background:'rgba(139,92,246,0.2)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.3)'}
                    : {color:'#6b7280'}}>
                  🎙️ Voce AI
                </button>
              </div>
            </div>

            {/* ---- Test voce narratore ---- */}
            <div className="mt-3 w-full flex gap-2">
              <button
                onClick={testELVoice}
                className="flex-1 py-3 rounded-xl text-sm font-cinzel font-bold transition-all active:scale-95"
                style={{background:'rgba(226,201,126,0.08)', border:'1px solid rgba(226,201,126,0.25)', color:'#e2c97e'}}
              >
                🔊 Test narratore
              </button>
              {elTestStatus && (
                <div className="flex items-center px-3 rounded-xl text-sm" style={{background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', color:'#4ade80'}}>
                  {elTestStatus}
                </div>
              )}
            </div>

            {/* ---- Personaggi in gioco ---- */}
            <div className="mt-4 w-full">
              <button
                onClick={()=>setShowRolesPanel(v=>!v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass hover:bg-white/10 active:scale-95 transition-all text-sm font-cinzel text-moon"
              >
                <span>📜 Personaggi in gioco ({[...new Set(players.map(p=>p.role))].length})</span>
                <span style={{fontSize:'0.9rem',transition:'transform 0.3s',display:'inline-block',transform:showRolesPanel?'rotate(180deg)':'rotate(0deg)'}}>▾</span>
              </button>
              {showRolesPanel && (
                <div className="mt-2 flex flex-col gap-2 anim-fade-up">
                  {[...new Set(players.map(p=>p.role))].map(roleId=>{
                    const r = ROLES[roleId];
                    if(!r) return null;
                    const teamColor = r.team==='lupi'?'#c0392b':'#27ae60';
                    return (
                      <div key={roleId} className="glass rounded-xl px-4 py-3 flex gap-3 items-start"
                           style={{borderLeft:`3px solid ${teamColor}`}}>
                        <span className="text-2xl shrink-0 mt-0.5">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-cinzel font-bold text-white text-sm">{r.name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{background:`${teamColor}22`,color:teamColor,border:`1px solid ${teamColor}44`}}>
                              {r.team==='lupi'?'Lupi':'Villaggio'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">{r.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== ROLE REVEAL ===================== */}
        {phase==='role_reveal' && (
          <div className="anim-fade-up">
            <div className="glass rounded-2xl p-4 mb-5">
              <p className="text-gray-400 text-sm mb-3">I giocatori stanno scoprendo i propri ruoli.</p>
              {isFirebaseConfigured() && (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Pronti</span>
                    <span className="font-bold text-white">{readyCount}/{players.length}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all"
                         style={{width:`${(readyCount/players.length)*100}%`}}/>
                  </div>
                </>
              )}
            </div>
            <div className="text-center mt-2 mb-2">
              {readyCount === players.length ? (
                <p className="text-green-400 text-sm font-bold flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Entrando nella notte...</p>
              ) : (
                <p className="text-gray-500 text-sm italic">In attesa che tutti confermino i ruoli...</p>
              )}
            </div>

            {/* ---- Personaggi in gioco ---- */}
            <div className="mt-3 w-full">
              <button
                onClick={()=>setShowRolesPanel(v=>!v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass hover:bg-white/10 active:scale-95 transition-all text-sm font-cinzel text-moon"
              >
                <span>📜 Personaggi in gioco ({[...new Set(players.map(p=>p.role))].length})</span>
                <span style={{fontSize:'0.9rem',transition:'transform 0.3s',display:'inline-block',transform:showRolesPanel?'rotate(180deg)':'rotate(0deg)'}}>▾</span>
              </button>
              {showRolesPanel && (
                <div className="mt-2 flex flex-col gap-2 anim-fade-up">
                  {[...new Set(players.map(p=>p.role))].map(roleId=>{
                    const r = ROLES[roleId];
                    if(!r) return null;
                    const teamColor = r.team==='lupi'?'#c0392b':'#27ae60';
                    return (
                      <div key={roleId} className="glass rounded-xl px-4 py-3 flex gap-3 items-start"
                           style={{borderLeft:`3px solid ${teamColor}`}}>
                        <span className="text-2xl shrink-0 mt-0.5">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-cinzel font-bold text-white text-sm">{r.name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{background:`${teamColor}22`,color:teamColor,border:`1px solid ${teamColor}44`}}>
                              {r.team==='lupi'?'Lupi':'Villaggio'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">{r.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== NIGHT ===================== */}
        {phase==='night' && (
          <div className="anim-fade-up">
            {/* Night steps progress */}
            <div className="glass rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Passi della notte</p>
                <span className="text-gray-500 text-xs">{nightStep+1}/{activeNightSteps.length}</span>
              </div>
              <div className="flex gap-1 mb-3">
                {activeNightSteps.map((_,i)=>(
                  <div key={i} className="night-step flex-1"
                       style={{background:i<nightStep?'#6366f1':i===nightStep?'#a5b4fc':'rgba(255,255,255,0.08)'}}/>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeNightSteps[nightStep]?.icon}</span>
                <div>
                  <p className="font-cinzel text-indigo-300 font-bold text-sm">{activeNightSteps[nightStep]?.label}</p>
                  {activeNightSteps[nightStep]?.hasRole && (
                    <p className="text-gray-600 text-xs">Risveglia questo ruolo</p>
                  )}
                </div>
              </div>

              {activeNightSteps[nightStep]?.hasRole && (
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-[10px] uppercase tracking-wider">
                      Voti ricevuti: {Object.keys(nightVotes).length}
                    </span>
                    <button
                      onClick={() => setShowVotesPanel(v => !v)}
                      className="text-gray-500 text-[10px] underline hover:text-gray-300"
                    >
                      {showVotesPanel ? 'Nascondi scelte' : '👁 Mostra scelte'}
                    </button>
                  </div>
                  {showVotesPanel && (
                    <div className="mt-2 p-3 rounded-xl border border-white/10 bg-black/20">
                      {Object.keys(nightVotes).length===0 ? (
                        <p className="text-gray-600 text-xs italic">Nessun giocatore ha ancora scelto...</p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {Object.entries(nightVotes).map(([vid, targetId]) => {
                            const voter = pStates[vid];
                            if(!voter) return null;
                            // Cupido: voto doppio "id1,id2"
                            if(typeof targetId === 'string' && targetId.includes(',')) {
                              const [id1, id2] = targetId.split(',');
                              const t1 = pStates[id1], t2 = pStates[id2];
                              return (
                                <div key={vid} className="flex justify-between items-center text-xs">
                                  <span className="text-gray-300">{voter.name}</span>
                                  <span className="text-pink-400 mx-2">💘</span>
                                  <span className="font-bold text-white px-2 py-0.5 rounded" style={{background:'rgba(233,30,99,0.15)'}}>
                                    {t1?.name} &amp; {t2?.name}
                                  </span>
                                </div>
                              );
                            }
                            const target = pStates[targetId];
                            if(!target) return null;
                            // Veggente: mostra l'allineamento reale (Mitomane appare come imitato)
                            const isVeggStep = activeNightSteps[nightStep]?.key === 'veggente';
                            let teamHint = null;
                            if(isVeggStep) {
                              const realRoleId = (target.role === 'mitomane' && mitomaneTarget)
                                ? pStates[mitomaneTarget]?.role
                                : target.role;
                              const realTeam = ROLES[realRoleId]?.team;
                              teamHint = realTeam === 'lupi' ? '🐺 Lupo!' : '🌾 Villaggio';
                            }
                            return (
                              <div key={vid} className="flex justify-between items-center text-xs">
                                <span className="text-gray-300">{voter.name}</span>
                                <span className="text-white mx-2">➔</span>
                                <span className="font-bold text-white px-2 py-0.5 rounded" style={{background:'rgba(255,255,255,0.1)'}}>
                                  {target.name}{teamHint ? <span className="ml-1 text-yellow-300">{teamHint}</span> : null}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <button onClick={clearVotes} className="text-gray-500 text-[10px] underline mt-3 hover:text-white">Azzera scelte</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="sticky-bottom-bar flex items-center justify-between gap-4">
              <Timer
                seconds={timer} total={timerTotal} running={timerOn}
                onToggle={()=>setTimerOn(v=>!v)}
                onReset={()=>{setTimer(timerTotal);setTimerOn(false);}}
                onEdit={()=>{setTimerInput(String(Math.floor(timer/60)));setShowTimerEdit(true);}}
              />
              <div className="flex flex-col gap-2 flex-1">
                <button onClick={processNightStep} className="btn-night w-full py-4 rounded-2xl text-sm font-bold shadow-lg">
                  {nightStep<activeNightSteps.length-1?'→ Passo successivo':'☀️ Vai al Giorno'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DAWN REVEAL ===================== */}
        {phase==='dawn_reveal' && (
          <div className="anim-fade-up">
            <div className="glass rounded-2xl p-5 mb-4 text-center">
              <span className="text-4xl mb-2 block">🌅</span>
              <p className="font-cinzel text-white text-lg font-bold mb-2">L'alba sorge</p>
              <p className="text-gray-400 text-sm">Il villaggio si sta risvegliando...</p>
            </div>
            {/* Info GM — visibili solo qui, non parlate */}
            {dawnInfo && (
              <div className="glass rounded-2xl p-4 mb-4 flex flex-col gap-2 text-sm">
                {dawnInfo.victimId && (
                  <p>🐺 <span className="text-white font-bold">{pStates[dawnInfo.victimId]?.name}</span> <span className="text-gray-400">ucciso dai lupi</span></p>
                )}
                {dawnInfo.poisonVictimId && (
                  <p>☠️ <span className="text-white font-bold">{pStates[dawnInfo.poisonVictimId]?.name}</span> <span className="text-gray-400">avvelenato dalla strega</span></p>
                )}
                {dawnInfo.stregaHealed && (
                  <p>💚 <span className="text-gray-400">Strega ha usato la pozione di guarigione</span></p>
                )}
                {dawnInfo.figlioTransformed && (
                  <p>🐺 <span className="text-gray-400">Il Figlio dei Lupi si è trasformato</span></p>
                )}
                {dawnInfo.mediumResult && (
                  <p>👁️ <span className="text-white font-bold">{dawnInfo.mediumResult.name}</span> <span className="text-gray-400">era</span> <span className="text-white">{dawnInfo.mediumResult.role?.icon} {dawnInfo.mediumResult.role?.name}</span></p>
                )}
                {dawnInfo.sciamanoResult && (
                  <p>🪬 <span className="text-white font-bold">{dawnInfo.sciamanoResult}</span> <span className="text-gray-400">è tornato/a tra i vivi</span></p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== DAY ===================== */}
        {phase==='day' && (
          <div className="anim-fade-up">

            {/* Sollecito votazione */}
            {votePrompt && (
              <div className="glass rounded-2xl p-4 mb-4 text-center anim-fade-up"
                   style={{border:'2px solid rgba(220,38,38,0.5)', background:'rgba(220,38,38,0.08)'}}>
                <p className="text-3xl mb-1">🗳️</p>
                <p className="font-cinzel text-white font-bold text-base mb-1">Tempo scaduto!</p>
                <p className="text-gray-400 text-sm mb-3">Il villaggio dovrebbe votare.</p>
                <button
                  onClick={() => {
                    setVotePrompt(false);
                    setTimer(0); setTimerOn(false);
                    setNarrationAndPhase('voting','La discussione è finita. Il silenzio della votazione può cominciare. Scegliete dal vostro telefono.', null);
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={{background:'rgba(220,38,38,0.2)', border:'1px solid rgba(220,38,38,0.5)', color:'#f87171'}}>
                  Avvia votazione →
                </button>
              </div>
            )}

            <div className="glass rounded-2xl p-4 mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 text-center">Dibattito — tempo rimasto</p>

              {/* Countdown circolare semplificato */}
              <div className="flex items-center justify-center mb-3">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5"/>
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke={timer < 30 ? '#f87171' : timer < 60 ? '#fbbf24' : '#e2c97e'}
                      strokeWidth="2.5" strokeDasharray="100" strokeLinecap="round"
                      className="timer-path"
                      strokeDashoffset={timerTotal > 0 ? 100 - (timer / timerTotal * 100) : 100}/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-cinzel font-bold text-xl leading-none ${timer<30?'text-red-400':timer<60?'text-yellow-400':'text-moon'}`}>
                      {String(Math.floor(timer/60)).padStart(2,'0')}:{String(timer%60).padStart(2,'0')}
                    </span>
                    <span className="text-gray-600 text-[9px] mt-0.5">{timerOn ? 'in corso' : 'in pausa'}</span>
                  </div>
                </div>
              </div>

              {/* Controlli */}
              <div className="flex gap-2 mb-3">
                <button onClick={()=>setTimerOn(v=>!v)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{background:timerOn?'rgba(248,113,113,0.1)':'rgba(74,222,128,0.1)',
                          border:`1px solid ${timerOn?'rgba(248,113,113,0.3)':'rgba(74,222,128,0.3)'}`,
                          color:timerOn?'#f87171':'#4ade80'}}>
                  {timerOn ? '⏸ Pausa' : '▶ Avvia'}
                </button>
                <button onClick={()=>{setTimer(dayTimerMins*60);setTimerTotal(dayTimerMins*60);setTimerOn(false);setVotePrompt(false);}}
                  className="px-4 py-2.5 rounded-xl text-sm text-gray-400 transition-all active:scale-95"
                  style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
                  ↺
                </button>
              </div>

              {/* Durata rapida */}
              <div className="flex gap-1.5 mb-1">
                <p className="text-gray-600 text-[10px] self-center mr-1">Durata:</p>
                {[3,5,8,10].map(m=>(
                  <button key={m}
                    onClick={()=>{ setDayTimerMins(m); localStorage.setItem('lif_day_timer',String(m)); setTimer(m*60); setTimerTotal(m*60); setTimerOn(false); setVotePrompt(false); }}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                    style={dayTimerMins===m
                      ? {background:'rgba(226,201,126,0.2)',border:'1px solid rgba(226,201,126,0.4)',color:'#e2c97e'}
                      : {background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#6b7280'}}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Vai al voto manuale test */}
            <div className="sticky-bottom-bar">
              <button
                onClick={() => {
                  setVotePrompt(false); setTimer(0); setTimerOn(false);
                  setNarrationAndPhase('voting','La discussione è finita. Il silenzio della votazione può cominciare. Scegliete dal vostro telefono.', null);
                }}
                className="btn-danger w-full py-4 rounded-2xl font-bold text-sm">
                Vai al Voto Subito 🗳️
              </button>
            </div>
          </div>
        )}

        {/* ===================== VOTING ===================== */}
        {phase==='voting' && (
          <div className="anim-fade-up">
            <div className="glass rounded-2xl p-4 mb-4 flex flex-col items-center">
              <p className="font-cinzel text-white text-lg font-bold mb-3">Votazione in corso...</p>
              <p className="text-gray-400 text-sm mb-4">Voti ricevuti: {Object.keys(dayVotes).length} / {alivePlayers.length}</p>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all"
                     style={{width:`${(Object.keys(dayVotes).length/Math.max(1, alivePlayers.length))*100}%`}}/>
              </div>
              <p className="text-gray-500 text-xs italic mt-3">Il rogo decreterà la vittima automaticamente quando tutti avranno votato.</p>
            </div>
          </div>
        )}

        {/* ===================== ENDED ===================== */}
        {phase==='ended' && (
          <div className="anim-fade-up py-6">
            {/* Titolo vincitore */}
            <div className="text-center mb-5">
              <div className="text-6xl mb-3" style={{filter:'drop-shadow(0 0 20px gold)'}}>
                {winner==='lupi'?'🐺':winner==='amore'?'💘':'🌾'}
              </div>
              <h3 className="font-cinzel text-2xl font-bold text-moon mb-1 win-glow">
                {winner==='lupi'?'Hanno vinto i Lupi!':winner==='amore'?'Ha vinto l\'Amore!':'Ha vinto il Villaggio!'}
              </h3>
              <p className="text-gray-500 text-sm">Partita #{gameId} · Giorno {dayNum}</p>
            </div>

            {/* Recap narrativo */}
            {(()=>{
              const allPlayers = Object.values(pStates);
              const wolves     = allPlayers.filter(p=>ROLES[p.role]?.team==='lupi');
              const villagers  = allPlayers.filter(p=>ROLES[p.role]?.team==='villaggio' && p.role!=='villico');
              const dead       = allPlayers.filter(p=>!p.alive);
              const survivors  = allPlayers.filter(p=>p.alive);

              const winReason = winner==='lupi'
                ? `I lupi (${wolves.map(p=>p.name).join(', ')}) sono riusciti a eguagliare o superare i villici in vita. Il villaggio non ha saputo fermarli in tempo.`
                : winner==='amore'
                ? `I due innamorati sono rimasti gli ultimi sopravvissuti. Il loro amore ha vinto ogni divisione — branco e villaggio si inchinano.`
                : wolves.length===0
                ? `Tutti i lupi sono stati scoperti ed eliminati dal villaggio. ${wolves.map(p=>p.name).join(', ') || 'Il branco'} è caduto.`
                : 'Il villaggio ha vinto.';

              return (
                <div className="rounded-2xl p-4 mb-4 text-left"
                     style={{background:'rgba(226,201,126,0.05)', border:'1px solid rgba(226,201,126,0.15)'}}>
                  <p className="text-moon text-xs font-bold uppercase tracking-widest mb-2">📖 Come è andata</p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{winReason}</p>

                  {survivors.length > 0 && (
                    <div className="mb-2">
                      <p className="text-green-400 text-[10px] uppercase tracking-widest mb-1.5">✓ Sopravvissuti</p>
                      <div className="flex flex-wrap gap-1.5">
                        {survivors.map(p=>{
                          const r=ROLES[p.role];
                          return <span key={p.id} className="text-xs px-2 py-0.5 rounded-full font-bold"
                                   style={{background:r?.color+'22',border:`1px solid ${r?.color}44`,color:'#fff'}}>
                            {r?.icon} {p.name} <span style={{color:r?.color}}>({r?.name})</span>
                          </span>;
                        })}
                      </div>
                    </div>
                  )}
                  {dead.length > 0 && (
                    <div>
                      <p className="text-red-400 text-[10px] uppercase tracking-widest mb-1.5 mt-2">💀 Eliminati</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dead.map(p=>{
                          const r=ROLES[p.role];
                          return <span key={p.id} className="text-xs px-2 py-0.5 rounded-full opacity-70"
                                   style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af'}}>
                            💀 {p.name} <span style={{color:r?.color+'cc'}}>({r?.name})</span>
                          </span>;
                        })}
                      </div>
                    </div>
                  )}
                  {villagers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">⭐ Ruoli speciali presenti</p>
                      <div className="flex flex-wrap gap-1.5">
                        {villagers.map(p=>{
                          const r=ROLES[p.role];
                          return <span key={p.id} className="text-[11px] px-2 py-0.5 rounded-full"
                                   style={{background:r?.color+'18',border:`1px solid ${r?.color}33`,color:r?.color}}>
                            {r?.icon} {p.name}
                          </span>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Scoreboard compatto */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {Object.values(pStates).map(p=>{
                const r=ROLES[p.role];
                return (
                  <div key={p.id} className="rounded-xl p-2.5 text-center"
                       style={{background:r?.color+'1a', border:`1px solid ${r?.color}33`,
                               opacity:p.alive?1:0.4, filter:p.alive?'':'grayscale(0.5)'}}>
                    <div className="text-xl mb-0.5">{p.alive?r?.icon:'💀'}</div>
                    <p className="text-white text-xs font-bold truncate">{p.name}</p>
                    <p className="text-[10px] font-bold" style={{color:r?.color+'cc'}}>{r?.name}</p>
                  </div>
                );
              })}
            </div>

            <button onClick={()=>{
                onEndGame({ winner, gameId, date:new Date().toISOString(), players:Object.values(pStates) });
              }}
              className="btn-gold w-full py-4 rounded-2xl text-base">
              💾 Salva e Torna alla Home
            </button>
          </div>
        )}

        {/* ===================== PLAYER LIST (always shown) ===================== */}
        {!['waiting','ended'].includes(phase) && (
          <div className="mt-5">
            <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">
              Giocatori · {alivePlayers.length} vivi · {deadPlayers.length} eliminati
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(pStates).map(p=>{
                return (
                  <div key={p.id}
                    className={`rounded-xl p-2 text-center transition-all ${!p.alive?'opacity-50 grayscale':''}`}
                    style={{background:'rgba(255,255,255,0.05)', border:`1px solid rgba(255,255,255,${p.alive?'0.1':'0.05'})`}}>
                    <div className="text-xl mb-1">{p.alive?'👤':'💀'}</div>
                    <p className="text-xs text-white font-bold truncate">{p.name}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick actions */}
            {(phase==='day'||phase==='voting') && (
              <div className="mt-3">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Elimina manualmente</p>
                <div className="flex flex-wrap gap-2">
                  {alivePlayers.map(p=>(
                    <button key={p.id}
                      onClick={()=>{
                        const w = eliminate(p.id);
                        if(!w){
                          setNarration(`${p.name} viene eliminato. Era ${ROLES[p.role]?.icon} il ${ROLES[p.role]?.name}.`);
                          if(phase==='voting') goNight();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                      style={{background:'rgba(139,26,26,0.2)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5'}}>
                      💀 {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timer edit modal */}
      {showTimerEdit && (
        <div className="modal-backdrop" onClick={()=>setShowTimerEdit(false)}>
          <div className="modal-box p-6 glass" style={{maxWidth:280, background:'#0d1117', border:'1px solid rgba(226,201,126,0.2)'}}>
            <h4 className="font-cinzel text-moon font-bold mb-4">Imposta Timer</h4>
            <div className="flex gap-2 mb-4">
              {[1,2,3,5,8,10].map(m=>(
                <button key={m} onClick={()=>{setTimer(m*60);setTimerTotal(m*60);setTimerOn(false);setShowTimerEdit(false);}}
                  className="flex-1 py-2 rounded-lg text-sm font-bold glass text-white hover:text-moon transition-colors">
                  {m}m
                </button>
              ))}
            </div>
            <button onClick={()=>setShowTimerEdit(false)} className="w-full py-3 rounded-xl btn-ghost text-sm">Chiudi</button>
          </div>
        </div>
      )}

      {/* ===== MODAL CUPIDO: scegli il secondo innamorato ===== */}
      {showCupidoModal && (
        <div className="modal-backdrop">
          <div className="modal-box p-6 glass" style={{background:'#0d1117', border:'1px solid rgba(233,30,99,0.4)'}}>
            <h4 className="font-cinzel text-pink-400 font-bold mb-2 text-lg">💘 Cupido — Secondo Innamorato</h4>
            <p className="text-gray-300 text-sm mb-1">
              <strong className="text-white">{pStates[showCupidoModal]?.name}</strong> è il primo innamorato.
            </p>
            <p className="text-gray-400 text-xs mb-4">Scegli il secondo innamorato (hanno destini legati):</p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {Object.values(pStates).filter(p=>p.alive && p.id !== showCupidoModal).map(p=>(
                <button key={p.id}
                  onClick={()=>{
                    const newLovers = {[showCupidoModal]: p.id, [p.id]: showCupidoModal};
                    setLovers(newLovers);
                    fbUpdate({lovers: newLovers});
                    setShowCupidoModal(null);
                    // Avanza al prossimo step
                    setActionPulse('processNightStep');
                  }}
                  className="p-3 rounded-xl text-left flex items-center gap-3 hover:bg-white/10 transition-all"
                  style={{background:'rgba(233,30,99,0.1)', border:'1px solid rgba(233,30,99,0.2)'}}>
                  <span className="text-xl">{ROLES[p.role]?.icon}</span>
                  <span className="font-bold text-white">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CACCIATORE: sceglie chi portare con sé ===== */}
      {showHunterModal && (
        <div className="modal-backdrop">
          <div className="modal-box p-6 glass" style={{background:'#0d1117', border:'1px solid rgba(121,85,72,0.5)'}}>
            <h4 className="font-cinzel text-amber-600 font-bold mb-2 text-lg">🏹 Il Cacciatore spara!</h4>
            <p className="text-gray-300 text-sm mb-4">Il Cacciatore muore, ma sceglie di portare qualcuno con sé. Chi elimina?</p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {alivePlayers.map(p=>(
                <button key={p.id}
                  onClick={()=>{
                    setShowHunterModal(false);
                    eliminate(p.id, false);
                  }}
                  className="p-3 rounded-xl text-left flex items-center gap-3 hover:bg-white/10 transition-all"
                  style={{background:'rgba(121,85,72,0.15)', border:'1px solid rgba(121,85,72,0.3)'}}>
                  <span className="text-xl">{ROLES[p.role]?.icon}</span>
                  <span className="font-bold text-white">{p.name}</span>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowHunterModal(false)}
              className="w-full mt-3 py-2 rounded-xl btn-ghost text-sm text-gray-500">
              Passa (nessuna vittima)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   PLAYER SCREEN (each player's device)
   ================================================================ */
function PlayerScreen({gameId, playerId}) {
  const user = useAuth();
  const [gameData, setGameData] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [markedReady, setMarkedReady] = useState(false);
  const [localVote, setLocalVote] = useState(null);
  const [debugLog, setDebugLog] = useState('');
  const [error, setError] = useState(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showRolesInGame, setShowRolesInGame] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Helper per log visibile (debug)
  const contextLog = (msg) => {
    console.log(msg);
    setDebugLog(prev => (msg + '\n' + prev).substring(0, 200));
  };

  useEffect(()=>{
    if(!gameId || !playerId) { setError('Link non valido'); return; }
    if(!db){
      // Demo mode without Firebase
      setGameData({ phase:'role_reveal', players:{ [playerId]:{ name:'Giocatore', role:'villico', alive:true, ready:false } } });
      return;
    }
    
    // Genera token dispositivo se non esiste
    let deviceToken = localStorage.getItem('lif_device_token');
    if(!deviceToken) {
      deviceToken = Math.random().toString(36).substring(2);
      localStorage.setItem('lif_device_token', deviceToken);
    }

    const ref = db.ref(`games/${gameId}`);
    ref.on('value', snap=>{
      const data = snap.val();
      if(!data){ setError('Partita non trovata'); return; }
      
      // Controllo esclusività QR
      const playerInfo = data.players?.[playerId];
      if (playerInfo) {
        if (!playerInfo.deviceToken) {
          db.ref(`games/${gameId}/players/${playerId}/deviceToken`).set(deviceToken);
        } else if (playerInfo.deviceToken !== deviceToken) {
          setError('⚠️ Attenzione: sei già connesso da un altro telefono, oppure questo QR Code è già stato rubato/utilizzato da un altro giocatore.');
          return;
        }
      }
      
      setGameData(data);
    });
    return ()=>ref.off();
  },[gameId, playerId]);

  const markReady = ()=>{
    if(markedReady) return;
    setMarkedReady(true);
    if(db && gameId && playerId) {
      db.ref(`games/${gameId}/players/${playerId}/ready`).set(true);
      window.playSfx('night'); // Unlock audio context
    }
  };

  // Spostiamo il calcolo di player e phase prima degli handler per sicurezza di scope
  const player = gameData?.players?.[playerId];
  const phase = gameData?.phase || 'waiting';
  const role = player ? ROLES[player.role] : null;

  const castVote = (targetId) => {
    if (localVote || gameData?.nightVotes?.[playerId]) return;
    contextLog('Tentativo voto notte -> ' + targetId);
    if(!db || !gameId || !playerId || !player?.alive || phase!=='night') {
      contextLog('Voto respinto: ' + (!player?.alive ? 'morto' : 'fase errata ('+phase+')'));
      return;
    }
    setLocalVote(targetId);
    db.ref(`games/${gameId}/nightVotes/${playerId}`).set(targetId)
      .then(()=>contextLog('Voto salvato su FB!'))
      .catch(e=>contextLog('Errore FB: ' + e.message));
  };

  const castDayVote = (targetId) => {
    contextLog('Tentativo voto giorno -> ' + targetId);
    if(!db || !gameId || !playerId || !player?.alive || phase!=='voting') return;
    setLocalVote(targetId);
    db.ref(`games/${gameId}/dayVotes/${playerId}`).set(targetId);
  };

  // Reset del voto locale quando cambia la fase o il turno
  useEffect(() => {
    setLocalVote(null);
  }, [phase, gameData?.currentNightStep?.key]);

  if(error) return (
    <div className="min-h-screen layer flex flex-col items-center justify-center p-6 text-center">
      <Moon size={56}/>
      <p className="font-cinzel text-moon text-xl mt-4 mb-2">Errore</p>
      <p className="text-gray-500 text-sm">{error}</p>
    </div>
  );

  if(!gameData) return (
    <div className="min-h-screen layer flex flex-col items-center justify-center p-6 text-center">
      <Moon size={56}/>
      <p className="font-cinzel text-moon text-lg mt-4">Connessione in corso…</p>
      <p className="text-gray-600 text-sm mt-2">In attesa dei dati della partita</p>
    </div>
  );

  // Rimossi doppioni (spostati sopra)


  const phaseDisplay = {
    waiting:      { icon:'⏳', label:'In attesa di iniziare',       bg:'overlay-night', tip:'Il narratore sta preparando la partita…' },
    role_reveal:  { icon:'🌙', label:'Scopri il tuo ruolo!',        bg:'overlay-night', tip:'Assicurati che nessuno guardi il tuo schermo.' },
    night:        { icon:'🌙', label:'È notte — chiudi gli occhi',  bg:'overlay-night', tip:'Fai quello che il narratore ti dice.' },
    dawn_reveal:  { icon:'🌅', label:'L\'alba sta sorgendo...',      bg:'overlay-dawn',  tip:'Guarda il tuo schermo.' },
    day:          { icon:'☀️', label:'È giorno — discutete!',       bg:'overlay-day',   tip:'Ragiona, osserva, e stai attento/a.' },
    voting:       { icon:'🗳️', label:'Votazione in corso',          bg:'overlay-day',   tip:'Chi eliminiamo oggi?' },
    ended_voting: { icon:'⚖️', label:'Il verdetto è stato emesso',  bg:'overlay-day',   tip:'' },
    ended:        { icon:'🏁', label:'Partita terminata',           bg:'',              tip:'' },
  }[phase] || { icon:'⏳', label:'…', bg:'', tip:'' };

  // Mostra banner "Apri nell'App" solo su browser mobile (non in-app nativa)
  const isNativePlatform = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
  const deepLinkUrl = `lupus://join?game=${gameId}&player=${playerId}`;

  return (
    <div className={`min-h-screen layer screen-safe px-4 py-6 pb-44 ${phaseDisplay.bg}`} style={{ pointerEvents: 'auto' }}>

      {/* Banner "Apri/Scarica l'App" — visibile solo su browser, nascosto nell'app nativa */}
      {!isNativePlatform && (
        <div className="mb-4 rounded-2xl flex items-center gap-3 px-4 py-3"
             style={{background:'rgba(226,201,126,0.06)', border:'1px solid rgba(226,201,126,0.2)'}}>
          <span className="text-2xl shrink-0">🐺</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold leading-tight">Lupus in Fabula è su App Store</p>
            <p className="text-gray-500 text-[10px] leading-tight">Gratuita · Voce AI · Profilo · Classifiche</p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <a href={deepLinkUrl}
               className="text-[10px] font-bold px-2.5 py-1 rounded-full text-center transition-all active:scale-95"
               style={{background:'rgba(226,201,126,0.15)', border:'1px solid rgba(226,201,126,0.4)', color:'#e2c97e'}}>
              Apri →
            </a>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
               className="text-[10px] font-bold px-2.5 py-1 rounded-full text-center transition-all active:scale-95"
               style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.18)', color:'#fff'}}>
              Scarica
            </a>
          </div>
        </div>
      )}

      {/* Glow atmosferico di fase */}
      {(phase==='night'||phase==='role_reveal'||phase==='waiting') && (
        <div className="phase-glow" style={{top:'-60px',width:320,height:320,
          background:'radial-gradient(ellipse, rgba(80,40,200,0.18) 0%, transparent 70%)',
          animation:'nightGlow 4s ease-in-out infinite'}} />
      )}
      {phase==='dawn_reveal' && (
        <div className="phase-glow" style={{bottom:0,top:'auto',width:420,height:260,
          background:'radial-gradient(ellipse at bottom, rgba(255,110,30,0.22) 0%, rgba(200,60,10,0.08) 50%, transparent 75%)',
          animation:'dawnGlow 3s ease-in-out infinite'}} />
      )}
      {(phase==='day'||phase==='voting') && (
        <div className="phase-glow" style={{top:'-40px',width:360,height:280,
          background:'radial-gradient(ellipse, rgba(200,140,20,0.12) 0%, transparent 70%)',
          animation:'dayGlow 5s ease-in-out infinite'}} />
      )}

      {/* Logger di debug — visibile SOLO in sviluppo (localhost) */}
      {window.location.hostname === 'localhost' && debugLog && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-[8px] text-green-400 p-1 font-mono pointer-events-none z-[9999] opacity-40">
          {debugLog}
        </div>
      )}

      {/* Phase banner */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-1">{phaseDisplay.icon}</div>
        <p className="font-cinzel text-moon text-base font-semibold">{phaseDisplay.label}</p>
        {phaseDisplay.tip && <p className="text-gray-600 text-xs mt-1">{phaseDisplay.tip}</p>}
      </div>


      {/* Role reveal */}
      {(phase==='role_reveal' || phase==='waiting') && (
        <div className="mb-5">
          <RoleCard
            role={player.role} playerName={player.name}
            flipped={flipped} onFlip={()=>setFlipped(true)}
            userPhoto={user?.photoURL}
          />
        </div>
      )}

      {/* Role info modal */}
      {showRoleInfo && role && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
             style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)'}}
             onClick={()=>setShowRoleInfo(false)}>
          <div className="w-full max-w-sm rounded-2xl p-5 anim-fade-up"
               style={{background:'#0d1117', border:`1px solid ${role.color}44`}}
               onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{role.icon}</span>
                <p className="font-cinzel text-white font-bold text-lg">{role.name}</p>
              </div>
              <button onClick={()=>setShowRoleInfo(false)}
                      className="text-gray-500 hover:text-white text-xl leading-none px-1">✕</button>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full font-bold"
                  style={{background:role.color+'33', border:`1px solid ${role.color}66`, color:role.color}}>
              {role.team==='lupi'?'⚔️ Lupi':'🌾 Villaggio'}
            </span>
            <p className="text-gray-300 text-sm leading-relaxed mt-4">{role.description}</p>
            {role.tip && (
              <div className="mt-3 p-2 rounded-lg text-[11px] text-white/50 italic"
                   style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
                💡 {role.tip}
              </div>
            )}
            <button onClick={()=>setShowRoleInfo(false)}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-gray-400"
                    style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* ══ ALBA — reveal della vittima notturna sui telefoni ══ */}
      {phase === 'dawn_reveal' && (() => {
        const victimId   = gameData?.dawnVictimId;
        const victimName = victimId ? (gameData.players?.[victimId]?.name || '???') : null;
        const isMe       = victimId === playerId;
        if (!victimName) return null; // nessuna vittima — UI normale
        if (isMe) return (
          <div className="text-center py-10 anim-fade-up">
            <div className="text-8xl mb-4" style={{filter:'drop-shadow(0 0 30px rgba(220,38,38,0.8))'}}>💀</div>
            <p className="font-cinzel text-red-400 text-2xl font-bold mb-2 tracking-wide">Sei stato eliminato</p>
            <p className="font-cinzel text-white text-3xl font-bold mb-3">{player.name}</p>
            <p className="text-gray-500 text-sm italic">I lupi ti hanno scelto nella notte.</p>
            <p className="text-gray-700 text-xs mt-4">Riponi il telefono e non rivelare il tuo ruolo.</p>
          </div>
        );
        return (
          <div className="text-center py-10 anim-fade-up">
            <div className="text-7xl mb-4" style={{filter:'drop-shadow(0 0 20px rgba(220,38,38,0.5))'}}>🌅</div>
            <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Questa notte è caduto</p>
            <p className="font-cinzel text-white text-4xl font-bold mb-3"
               style={{textShadow:'0 0 20px rgba(220,38,38,0.6)'}}>
              {victimName}
            </p>
            <p className="text-gray-500 text-sm italic">I lupi hanno colpito.</p>
          </div>
        );
      })()}

      {/* ══ VERDETTO DI GIORNO — reveal del condannato sui telefoni ══ */}
      {phase === 'ended_voting' && (() => {
        const victimId   = gameData?.dayVictimId;
        const victimName = victimId ? (gameData.players?.[victimId]?.name || '???') : null;
        const isMe       = victimId === playerId;
        if (!victimName) return (
          // Nessun condannato (parità di voti) — messaggio neutro
          <div className="text-center py-10 anim-fade-up">
            <p className="text-4xl mb-3">⚖️</p>
            <p className="font-cinzel text-white text-lg font-bold mb-1">Nessun verdetto</p>
            <p className="text-gray-500 text-sm">Il villaggio non ha raggiunto la maggioranza.</p>
          </div>
        );
        if (isMe) return (
          // Sei TU il condannato
          <div className="text-center py-10 anim-fade-up">
            <div className="text-8xl mb-4" style={{filter:'drop-shadow(0 0 30px rgba(220,38,38,0.7))'}}>🔥</div>
            <p className="font-cinzel text-red-400 text-2xl font-bold mb-2 tracking-wide">Sei stato condannato</p>
            <p className="font-cinzel text-white text-3xl font-bold mb-3">{player.name}</p>
            <p className="text-gray-500 text-sm italic">Il villaggio ti ha scelto.</p>
            <p className="text-gray-700 text-xs mt-4">Riponi il telefono e non rivelare il tuo ruolo.</p>
          </div>
        );
        return (
          // Qualcun altro è stato condannato
          <div className="text-center py-10 anim-fade-up">
            <div className="text-7xl mb-4" style={{filter:'drop-shadow(0 0 20px rgba(220,38,38,0.5))'}}>⚖️</div>
            <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Il villaggio ha deciso</p>
            <p className="font-cinzel text-white text-4xl font-bold mb-3"
               style={{textShadow:'0 0 20px rgba(220,38,38,0.6)'}}>
              {victimName}
            </p>
            <p className="text-gray-500 text-sm italic">è stato condannato.</p>
          </div>
        );
      })()}

      {/* During game */}
      {['night','dawn_reveal','day','voting'].includes(phase) && (
        <div className="text-center py-6 anim-fade-up">

          {/* Schermata morto — schermo bloccato, nessuna info sugli altri */}
          {!player.alive ? (
            <div className="flex flex-col items-center py-8">
              <div className="text-7xl mb-4">💀</div>
              <p className="font-cinzel text-white text-2xl font-bold mb-1">{player.name}</p>
              <span className="text-xs px-3 py-1 rounded-full mb-4"
                    style={{background:role?.color+'22', border:`1px solid ${role?.color}44`, color:role?.color}}>
                {role?.icon} {role?.name}
              </span>
              <p className="text-gray-600 text-sm italic">Sei stato eliminato.</p>
              <p className="text-gray-700 text-xs mt-2">Riponi il telefono e non rivelare il tuo ruolo.</p>
            </div>
          ) : (
          <>
          <div className="text-7xl mb-3 leading-none"
               style={{filter:`drop-shadow(0 0 20px ${role?.color})`}}>
            {phase==='night' ? '😴' : role?.icon}
          </div>
          <p className="font-cinzel text-xl text-white font-bold mb-1">{player.name}</p>
          <button onClick={()=>setShowRoleInfo(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-1 transition-all active:scale-95"
                  style={{background:role?.color+'33', border:`1px solid ${role?.color}66`}}>
            <span>{role?.icon}</span>
            <span className="font-bold text-white text-sm">{role?.name}</span>
          </button>
          <p className="text-gray-600 text-[10px] mb-3">Tocca per rivedere il tuo ruolo</p>
          </>
          )}
          {/* NIGHT VOTING UI */}
          {player.alive && phase==='night' && gameData.currentNightStep?.roleId === player.role && (
            <div className="mt-6 p-4 rounded-2xl anim-fade-up text-left" style={{background:role?.color+'1a', border:`1px solid ${role?.color}44`}}>
              <p className="font-cinzel font-bold text-white mb-1"><span className="text-xl">{role?.icon}</span> È il tuo turno!</p>

              {/* ── FIGLIO DEI LUPI: nessuna azione ── */}
              {player.role === 'figlio_dei_lupi' ? (
                <div className="text-center py-4 mt-2">
                  <p className="text-3xl mb-2">🐺</p>
                  <p className="text-gray-300 text-sm leading-relaxed">Rimani immobile.<br/>Osserva il buio in silenzio.</p>
                  <p className="text-gray-600 text-xs mt-3">In attesa che il narratore avanzi…</p>
                </div>
              ) : /* ── STREGA: scelta pozioni ── */
              player.role === 'strega' ? (() => {
                const victimId   = gameData.currentNightVictim;
                const victimName = victimId ? (gameData.players?.[victimId]?.name || '???') : null;
                const healUsed   = gameData.witchHealUsed || false;
                const poisonUsed = gameData.witchPoisonUsed || false;
                const voted      = localVote || gameData.nightVotes?.[playerId];

                if (voted) {
                  const label = voted === 'HEAL' ? '💚 Hai usato la Pozione di Guarigione'
                              : voted === 'PASS' ? '😴 Hai deciso di non usare pozioni'
                              : `☠️ Hai avvelenato ${gameData.players?.[voted]?.name || '???'}`;
                  return (
                    <div className="text-center py-3 mt-2">
                      <p className="text-white font-bold text-sm">{label}</p>
                      <p className="text-gray-500 text-xs mt-2">In attesa che il narratore avanzi…</p>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-3 mt-3 relative z-50">
                    <p className="text-gray-400 text-xs">Scegli una sola azione per questa notte:</p>

                    {victimName && (
                      <div className="p-3 rounded-xl text-center" style={{background:'rgba(139,26,26,0.25)', border:'1px solid rgba(239,68,68,0.3)'}}>
                        <p className="text-gray-400 text-xs">I lupi vogliono uccidere</p>
                        <p className="font-cinzel text-white font-bold text-lg">{victimName}</p>
                      </div>
                    )}

                    {!healUsed && victimName && (
                      <button onClick={(e)=>{e.stopPropagation();castVote('HEAL');}}
                        className="w-full p-4 rounded-2xl flex items-center gap-3 bg-white/10 touch-manipulation transition-all active:scale-95"
                        style={{border:'2px solid rgba(74,222,128,0.6)', pointerEvents:'auto', zIndex:999}}>
                        <span className="text-3xl">💚</span>
                        <div className="text-left">
                          <p className="font-bold text-white">Salva {victimName}</p>
                          <p className="text-gray-400 text-xs">Usa la pozione di guarigione (1 uso)</p>
                        </div>
                      </button>
                    )}

                    {!poisonUsed && (
                      <div>
                        <p className="text-gray-500 text-xs mb-2">☠️ Avvelena un giocatore (1 uso):</p>
                        <div className="flex flex-col gap-2">
                          {Object.entries(gameData.players||{}).filter(([id,p])=>p.alive && id!==playerId).map(([id,p])=>(
                            <button key={id} onClick={(e)=>{e.stopPropagation();castVote(id);}}
                              className="w-full p-4 rounded-2xl flex items-center gap-3 bg-white/10 touch-manipulation transition-all active:scale-95"
                              style={{border:'2px solid rgba(139,26,26,0.5)', pointerEvents:'auto', zIndex:999}}>
                              <span className="text-2xl">☠️</span>
                              <p className="font-bold text-white">{p.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={(e)=>{e.stopPropagation();castVote('PASS');}}
                      className="w-full p-3 rounded-2xl text-center text-gray-400 text-sm bg-white/5 touch-manipulation transition-all active:scale-95"
                      style={{border:'1px solid rgba(255,255,255,0.1)', pointerEvents:'auto', zIndex:999}}>
                      😴 Non usare pozioni questa notte
                    </button>
                  </div>
                );
              })() : (
                /* ── MEDIUM: vota tra i giocatori eliminati ── */
              player.role === 'medium' ? (
                <>
                  <p className="text-gray-400 text-xs mb-3 mt-1">Scegli uno spirito da interrogare:</p>
                  <div className="flex flex-col gap-3 relative z-50">
                    {Object.entries(gameData.players||{}).filter(([id,p])=>!p.alive).length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-3">Nessun giocatore eliminato ancora.</p>
                    )}
                    {Object.entries(gameData.players||{}).filter(([id,p])=>!p.alive).map(([id,p])=>{
                      const isSel = localVote===id || (gameData.nightVotes?.[playerId]===id);
                      return (
                        <button key={id}
                          onClick={(e)=>{e.stopPropagation(); castVote(id);}}
                          className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all cursor-pointer active:brightness-150 touch-manipulation shadow-lg ${isSel?'bg-white/40 scale-[1.02]':'bg-white/10'}`}
                          style={{border:isSel?`4px solid ${role?.color}`:'2px solid rgba(255,255,255,0.2)',
                                  boxShadow:isSel?`0 0 35px ${role?.color}aa`:'none',
                                  pointerEvents:'auto', position:'relative', zIndex:999}}>
                          <span className="font-bold text-white text-2xl pr-4 pointer-events-none">💀 {p.name}</span>
                          {isSel?<span className="text-4xl pointer-events-none">👁️</span>:<div className="w-10 h-10 rounded-full border-2 border-white/40 pointer-events-none"></div>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : player.role === 'sciamano' ? (() => {
              /* ── SCIAMANO: resuscita un morto (una volta per partita) ── */
                const shamanUsed = gameData.shamanUsed || false;
                const deadPlayers = Object.entries(gameData.players||{}).filter(([id,p])=>!p.alive);
                const voted = localVote || gameData.nightVotes?.[playerId];

                if (shamanUsed) {
                  const alreadyPassed = localVote === 'PASS' || gameData.nightVotes?.[playerId] === 'PASS';
                  return (
                    <div className="text-center py-4 mt-2">
                      <p className="text-3xl mb-2">🪬</p>
                      <p className="text-gray-400 text-sm mb-4">Il tuo potere è già stato usato questa partita.</p>
                      {!alreadyPassed ? (
                        <button onClick={(e)=>{e.stopPropagation(); castVote('PASS');}}
                          className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 touch-manipulation"
                          style={{background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#67e8f9', pointerEvents:'auto', zIndex:999}}>
                          ➜ Passa il turno
                        </button>
                      ) : (
                        <p className="text-gray-600 text-xs">In attesa che il narratore avanzi…</p>
                      )}
                    </div>
                  );
                }

                if (voted) {
                  return (
                    <div className="text-center py-3 mt-2">
                      <p className="text-cyan-400 font-bold text-sm">🪬 Hai richiamato {gameData.players?.[voted]?.name}</p>
                      <p className="text-gray-500 text-xs mt-2">In attesa che il narratore avanzi…</p>
                    </div>
                  );
                }

                if (deadPlayers.length === 0) {
                  return (
                    <div className="text-center py-4 mt-2">
                      <p className="text-3xl mb-2">🌿</p>
                      <p className="text-gray-400 text-sm mb-4">Nessun giocatore eliminato ancora.<br/>Il tuo potere non può essere usato.</p>
                      <button onClick={(e)=>{e.stopPropagation(); castVote('PASS');}}
                        className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 touch-manipulation"
                        style={{background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#67e8f9', pointerEvents:'auto', zIndex:999}}>
                        ➜ Passa il turno
                      </button>
                    </div>
                  );
                }

                return (
                  <>
                    <p className="text-gray-400 text-xs mb-3 mt-1">Scegli chi riportare in vita:</p>
                    <div className="flex flex-col gap-3 relative z-50">
                      {deadPlayers.map(([id,p])=>{
                        const isSel = localVote===id || (gameData.nightVotes?.[playerId]===id);
                        return (
                          <button key={id}
                            onClick={(e)=>{e.stopPropagation(); castVote(id);}}
                            className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all cursor-pointer active:brightness-150 touch-manipulation shadow-lg ${isSel?'bg-white/40 scale-[1.02]':'bg-white/10'}`}
                            style={{border:isSel?`4px solid #06b6d4`:'2px solid rgba(255,255,255,0.2)',
                                    boxShadow:isSel?`0 0 35px #06b6d4aa`:'none',
                                    pointerEvents:'auto', position:'relative', zIndex:999}}>
                            <span className="font-bold text-white text-2xl pr-4 pointer-events-none">💀 {p.name}</span>
                            {isSel?<span className="text-4xl pointer-events-none">🪬</span>:<div className="w-10 h-10 rounded-full border-2 border-white/40 pointer-events-none"></div>}
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })() : player.role === 'cupido' ? (() => {
              /* ── CUPIDO: sceglie due innamorati dal telefono ── */
                const submitted = (gameData.nightVotes?.[playerId] || '').includes(',') ||
                                  (localVote || '').includes(',');
                const savedVote = gameData.nightVotes?.[playerId] || localVote || '';
                if (submitted) {
                  const [n1, n2] = savedVote.split(',');
                  return (
                    <div className="text-center py-3 mt-2">
                      <p className="text-pink-300 text-sm font-bold">
                        💘 {gameData.players?.[n1]?.name} &amp; {gameData.players?.[n2]?.name}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">In attesa che il narratore avanzi…</p>
                    </div>
                  );
                }
                // localVote senza virgola = primo innamorato scelto localmente (non ancora su FB)
                const firstPick = localVote && !localVote.includes(',') ? localVote : null;
                const alivePlayers = Object.entries(gameData.players||{}).filter(([id,p])=>p.alive && id!==playerId);
                return (
                  <div className="flex flex-col gap-2 mt-2 relative z-50">
                    {firstPick ? (
                      <>
                        <div className="p-2 rounded-xl text-center mb-1" style={{background:'rgba(233,30,99,0.15)',border:'1px solid rgba(233,30,99,0.35)'}}>
                          <p className="text-pink-300 text-xs">Primo innamorato: <span className="font-bold text-white">{gameData.players?.[firstPick]?.name}</span></p>
                        </div>
                        <p className="text-gray-400 text-xs mb-1">Ora scegli il secondo:</p>
                        {alivePlayers.filter(([id])=>id!==firstPick).map(([id,p])=>(
                          <button key={id}
                            onClick={(e)=>{e.stopPropagation(); castVote(firstPick+','+id);}}
                            className="w-full p-5 rounded-2xl flex justify-between items-center bg-white/10 touch-manipulation transition-all active:brightness-150 shadow-lg"
                            style={{border:'2px solid rgba(233,30,99,0.5)', pointerEvents:'auto', zIndex:999}}>
                            <span className="font-bold text-white text-2xl pr-4 pointer-events-none">{p.name}</span>
                            <div className="w-10 h-10 rounded-full border-2 border-pink-400/40 pointer-events-none"></div>
                          </button>
                        ))}
                        <button onClick={(e)=>{e.stopPropagation(); setLocalVote(null);}}
                          className="text-xs text-gray-500 mt-1 text-center py-2 touch-manipulation">
                          ↩ Cambia scelta
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-400 text-xs mb-1">Scegli il primo innamorato:</p>
                        {alivePlayers.map(([id,p])=>(
                          <button key={id}
                            onClick={(e)=>{e.stopPropagation(); setLocalVote(id);}}
                            className="w-full p-5 rounded-2xl flex justify-between items-center bg-white/10 touch-manipulation transition-all active:brightness-150 shadow-lg"
                            style={{border:'2px solid rgba(233,30,99,0.25)', pointerEvents:'auto', zIndex:999}}>
                            <span className="font-bold text-white text-2xl pr-4 pointer-events-none">{p.name}</span>
                            <div className="w-10 h-10 rounded-full border-2 border-white/30 pointer-events-none"></div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                );
              })() : (
              /* ── ALTRI RUOLI: voto standard ── */
                <>
                  <p className="text-gray-400 text-xs mb-3 mt-1">Seleziona in silenzio:</p>
                  {player.role === 'guardia' && gameData.lastGuardedId && (
                    <p className="text-yellow-600 text-xs mb-2 italic">
                      ⚠️ Non puoi proteggere di nuovo {gameData.players?.[gameData.lastGuardedId]?.name} (notte precedente).
                    </p>
                  )}
                  <div className="flex flex-col gap-3 relative z-50">
                    {Object.entries(gameData.players||{}).filter(([id, p])=>p.alive && id!==playerId).map(([id, p])=>{
                      const isSelected = localVote === id || (gameData.nightVotes?.[playerId] === id);
                      // Guardia: non può proteggere la stessa persona due notti di fila
                      const isBlocked = player.role === 'guardia' && id === gameData.lastGuardedId;
                      return (
                        <button key={id}
                          onClick={(e) => { e.stopPropagation(); if(!isBlocked) castVote(id); }}
                          disabled={isBlocked}
                          className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all touch-manipulation shadow-lg ${isSelected ? 'bg-white/40 scale-[1.02]' : isBlocked ? 'opacity-30' : 'bg-white/10'} ${!isBlocked ? 'cursor-pointer active:brightness-150' : 'cursor-not-allowed'}`}
                          style={{
                            border: isSelected ? `4px solid ${role?.color}` : isBlocked ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(255,255,255,0.2)',
                            boxShadow: isSelected ? `0 0 35px ${role?.color}aa` : 'none',
                            pointerEvents: 'auto', position: 'relative', zIndex: 999
                          }}>
                          <span className="font-bold text-white text-2xl pr-4 pointer-events-none">{p.name}{isBlocked ? ' 🚫' : ''}</span>
                          {isSelected ? <span className="text-4xl pointer-events-none">🔮</span> : <div className="w-10 h-10 rounded-full border-2 border-white/40 pointer-events-none"></div>}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── VEGGENTE: rivela l'allineamento dopo il voto ── */}
                  {player.role === 'veggente' && localVote && (() => {
                    const rawRole = gameData.players?.[localVote]?.role;
                    // Mitomane: la Veggente vede il ruolo imitato, non "mitomane"
                    const effectiveRoleId = (rawRole === 'mitomane' && gameData.mitomaneTarget)
                      ? gameData.players?.[gameData.mitomaneTarget]?.role
                      : rawRole;
                    const isWolf = ROLES[effectiveRoleId]?.team === 'lupi';
                    return (
                      <div className="mt-4 p-4 rounded-2xl text-center anim-fade-in"
                           style={{background: isWolf ? 'rgba(139,26,26,0.35)' : 'rgba(26,74,26,0.35)',
                                   border: `2px solid ${isWolf ? 'rgba(239,68,68,0.6)' : 'rgba(74,222,128,0.6)'}`}}>
                        <p className="text-4xl mb-1">{isWolf ? '🐺' : '✨'}</p>
                        <p className="font-cinzel text-white font-bold text-lg">
                          {isWolf ? 'È un LUPO!' : 'È innocente'}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Solo tu puoi vedere questa rivelazione</p>
                      </div>
                    );
                  })()}
                </>
              ))}
            </div>
          )}

          {/* DAY VOTING UI */}
          {player.alive && phase==='voting' && (
            <div className="mt-6 p-4 rounded-2xl anim-fade-up text-left" style={{background:role?.color+'1a', border:`1px solid ${role?.color}44`}}>
              <p className="font-cinzel font-bold text-white mb-1"><span className="text-xl">🗳️</span> Vota chi condannare al rogo</p>
              <p className="text-gray-400 text-xs mb-3">Tocca un giocatore per votarlo:</p>
              <div className="flex flex-col gap-3 relative z-50">
                {Object.entries(gameData.players||{}).filter(([id, p])=>p.alive && id!==playerId).map(([id, p])=>{
                  const isSelected = localVote === id || (gameData.dayVotes?.[playerId] === id);
                  return (
                    <button key={id} 
                      onClick={(e) => { e.stopPropagation(); castDayVote(id); }}
                      className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all cursor-pointer active:brightness-150 touch-manipulation shadow-lg ${isSelected ? 'bg-white/40 scale-[1.02]' : 'bg-white/10'}`}
                      style={{
                        border: isSelected ? `4px solid #ef4444` : '3px solid rgba(255,255,255,0.2)',
                        boxShadow: isSelected ? '0 0 35px rgba(239,68,68,0.7)' : 'none',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 999
                      }}>
                      <span className="font-bold text-white text-2xl pr-4 pointer-events-none">{p.name}</span>
                      {isSelected ? <span className="text-4xl pointer-events-none">🔥</span> : <div className="w-10 h-10 rounded-full border-2 border-white/40 pointer-events-none"></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* End game */}
      {phase==='ended' && (
        <div className="py-6 anim-fade-up">
          {/* Intestazione */}
          <div className="text-center mb-5">
            <div className="text-6xl mb-3">{gameData.winner==='lupi'?'🐺':gameData.winner==='amore'?'💘':'🌾'}</div>
            <p className="font-cinzel text-moon text-2xl font-bold mb-1">
              {gameData.winner==='lupi'?'Hanno vinto i Lupi!':gameData.winner==='amore'?'Ha vinto l\'Amore!':'Ha vinto il Villaggio!'}
            </p>
            <p className="text-gray-500 text-sm">Partita terminata</p>
          </div>

          {/* Il tuo ruolo + esito personale */}
          <div className="p-4 rounded-2xl mb-4"
               style={{background:role?.color+'1a', border:`1px solid ${role?.color}44`}}>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Il tuo ruolo</p>
            <p className="font-cinzel text-white text-xl mb-1">{role?.icon} {role?.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{background:role?.color+'22',border:`1px solid ${role?.color}44`,color:role?.color}}>
                {role?.team==='lupi'?'⚔️ Lupi':'🌾 Villaggio'}
              </span>
              <span className={`text-xs font-bold ${player?.alive?'text-green-400':'text-red-400'}`}>
                {player?.alive ? '✓ Sopravvissuto/a' : '💀 Eliminato/a'}
              </span>
            </div>
          </div>

          {/* ── Tutti i ruoli rivelati ── */}
          <div className="rounded-2xl p-4 mb-4"
               style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)'}}>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Tutti i ruoli rivelati</p>
            <div className="flex flex-col gap-2">
              {Object.entries(gameData.players||{}).map(([pid, p])=>{
                const r = ROLES[p.role];
                const isMe = pid === playerId;
                return (
                  <div key={pid} className="flex items-center gap-2.5 py-1"
                       style={{opacity: p.alive ? 1 : 0.55}}>
                    <span className="text-xl w-7 text-center shrink-0">{p.alive ? r?.icon : '💀'}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm font-bold">{p.name}</span>
                      {isMe && <span className="text-[10px] text-gray-500 ml-1">(tu)</span>}
                    </div>
                    <span className="text-xs shrink-0" style={{color:r?.color}}>{r?.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Cronaca turno per turno ── */}
          {gameData.gameRecap?.eventLog?.length > 0 && (() => {
            const recap    = gameData.gameRecap;
            const allPlayers = recap.players || gameData.players || {};
            const pName = id => allPlayers[id]?.name || '???';
            const pRole = id => { const r = ROLES[allPlayers[id]?.role]; return r ? `${r.icon} ${r.name}` : ''; };
            const wolvesNames = ids => (ids||[]).map(id=>`${pName(id)}`).join(' e ');

            return (
              <div className="rounded-2xl p-4 mb-4"
                   style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)'}}>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">📜 Cronaca della partita</p>
                <div className="flex flex-col gap-5">
                  {recap.eventLog.map((ev, i) => {
                    const ordinal = ['Prima','Seconda','Terza','Quarta','Quinta','Sesta','Settima','Ottava','Nona','Decima'][ev.turn-1] || `Turno ${ev.turn}`;

                    if (ev.type === 'night') {
                      const lines = [];

                      // Lupi e vittima
                      if (ev.wolvesIds?.length) {
                        const wolfStr = wolvesNames(ev.wolvesIds);
                        if (ev.wolfTarget) {
                          const targetStr = `${pName(ev.wolfTarget)} (${pRole(ev.wolfTarget)})`;
                          if (ev.guardiaSaved) {
                            lines.push(`🐺 I lupi ${wolfStr} hanno attaccato ${targetStr}, ma la Guardia del Corpo li ha respinti.`);
                          } else if (ev.stregaHealed) {
                            lines.push(`🐺 I lupi ${wolfStr} hanno attaccato ${targetStr}, ma la Strega ha usato la pozione di guarigione e lo ha salvato.`);
                          } else if (ev.figlioTransformed) {
                            lines.push(`🐺 I lupi ${wolfStr} hanno attaccato ${pName(ev.wolfTarget)}, ma era il Figlio dei Lupi: si è trasformato e si è unito al branco.`);
                          } else if (ev.dawnVictim) {
                            lines.push(`🐺 I lupi ${wolfStr} hanno ucciso ${targetStr}.`);
                          }
                        } else {
                          lines.push(`🐺 I lupi ${wolfStr} non hanno trovato accordo — nessuna vittima.`);
                        }
                      }

                      // Veleno strega
                      if (ev.stregaPoison) {
                        lines.push(`☠️ La Strega ha avvelenato ${pName(ev.stregaPoison)} (${pRole(ev.stregaPoison)}).`);
                      }

                      // Sciamano
                      if (ev.sciamanoRevived) {
                        lines.push(`🪬 Lo Sciamano ha riportato in vita ${pName(ev.sciamanoRevived)}.`);
                      }

                      // Prima notte: Cupido
                      if (ev.cupidoLovers?.length === 2) {
                        lines.push(`💘 Cupido ha legato ${pName(ev.cupidoLovers[0])} e ${pName(ev.cupidoLovers[1])}: innamorati per sempre.`);
                      }

                      // Prima notte: Mitomane
                      if (ev.mitomaneTarget) {
                        lines.push(`🎭 Il Mitomane ha scelto di imitare ${pName(ev.mitomaneTarget)} (${pRole(ev.mitomaneTarget)}).`);
                      }

                      if (!lines.length) lines.push('🌙 La notte è passata in silenzio.');

                      return (
                        <div key={i}>
                          <p className="font-cinzel text-moon text-xs font-bold mb-2 uppercase tracking-wider">
                            🌙 {ordinal} notte
                          </p>
                          {lines.map((l, li) => (
                            <p key={li} className="text-gray-300 text-sm leading-relaxed mb-1">{l}</p>
                          ))}
                        </div>
                      );
                    }

                    if (ev.type === 'day') {
                      return (
                        <div key={i}>
                          <p className="font-cinzel text-moon text-xs font-bold mb-2 uppercase tracking-wider">
                            ☀️ {ordinal} giorno
                          </p>
                          {ev.noMajority
                            ? <p className="text-gray-300 text-sm">Il villaggio non ha trovato accordo — nessun condannato.</p>
                            : <p className="text-gray-300 text-sm">⚖️ Il villaggio ha condannato {pName(ev.dayVictim)} ({pRole(ev.dayVictim)}).</p>
                          }
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })()}

          {/* CTA Fine Partita — scarica l'app (solo su browser) */}
          {!isNativePlatform && (
            <div className="rounded-2xl overflow-hidden anim-fade-up"
                 style={{background:'linear-gradient(135deg, rgba(226,201,126,0.09) 0%, rgba(185,28,28,0.11) 100%)',
                         border:'1px solid rgba(226,201,126,0.22)'}}>
              <div className="p-5 text-center">
                <div className="text-4xl mb-2">🐺</div>
                <p className="font-cinzel text-moon text-base font-bold mb-1">
                  Sei pronto a essere il Narratore?
                </p>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                  Organizza la prossima serata tu. Voce AI, ruoli premium e classifiche ti aspettano.
                </p>
                <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
                   className="block w-full py-3 rounded-xl font-cinzel font-bold text-sm mb-2 transition-all active:scale-95"
                   style={{background:'linear-gradient(135deg, #e2c97e, #c9a84c)', color:'#0b0a14'}}>
                  ⬇ Scarica Gratis su App Store
                </a>
                <p className="text-gray-600 text-[10px]">L'app è gratuita · Pacchetti aggiuntivi da €1,99</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modale ruoli in gioco */}
      {showRolesInGame && gameData?.players && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
             style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)'}}
             onClick={()=>setShowRolesInGame(false)}>
          <div className="w-full max-w-sm rounded-2xl p-5 anim-fade-up"
               style={{background:'#0d1117', border:'1px solid rgba(255,255,255,0.1)', maxHeight:'80vh', overflowY:'auto'}}
               onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-cinzel font-bold">📜 Ruoli in questa partita</span>
              <button onClick={()=>setShowRolesInGame(false)}
                      className="text-gray-500 hover:text-white text-xl leading-none px-1">✕</button>
            </div>
            {(()=>{
              const roleIds = [...new Set(Object.values(gameData.players).map(p=>p.role))];
              return roleIds.map(rid=>{
                const r = ROLES[rid];
                if(!r) return null;
                const teamColor = r.team==='lupi'?'#c0392b':'#27ae60';
                const isMyRole = rid === player?.role;
                return (
                  <div key={rid} className="flex gap-3 items-start px-3 py-2.5 rounded-xl mb-1"
                       style={{background: isMyRole ? r.color+'18' : 'rgba(255,255,255,0.03)',
                               border: isMyRole ? `1px solid ${r.color}44` : '1px solid rgba(255,255,255,0.05)'}}>
                    <span className="text-xl shrink-0 mt-0.5">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-sm font-bold">{r.name}</span>
                        {isMyRole && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                                          style={{background:r.color+'33',color:r.color}}>tu</span>}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                              style={{background:`${teamColor}18`,color:teamColor,border:`1px solid ${teamColor}33`}}>
                          {r.team==='lupi'?'Lupi':'Villaggio'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] leading-relaxed">{r.description}</p>
                    </div>
                  </div>
                );
              });
            })()}
            <button onClick={()=>setShowRolesInGame(false)}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-gray-400"
                    style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* Tutorial modal */}
      {showTutorial && <TutorialModal isOpen={true} onClose={()=>setShowTutorial(false)} />}

      {/* Barra fissa in fondo — info + ready button sempre accessibili */}
      {phase !== 'ended' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-3"
             style={{background:'linear-gradient(to top, rgba(11,10,20,1) 70%, transparent)'}}>

          {/* Bottoni info — sempre presenti */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={()=>setShowRolesInGame(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-400 transition-all active:scale-95"
              style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)'}}>
              📜 Ruoli in gioco
            </button>
            <button
              onClick={()=>setShowTutorial(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-400 transition-all active:scale-95"
              style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)'}}>
              📖 Come si gioca
            </button>
          </div>

          {/* Bottone "Sono pronto" — solo in fase role_reveal/waiting dopo aver visto la carta */}
          {(phase==='role_reveal' || phase==='waiting') && flipped && (
            !markedReady ? (
              <button onClick={markReady}
                      className="btn-gold w-full py-4 rounded-2xl text-base font-bold shadow-[0_0_20px_rgba(226,201,126,0.35)] transition-all active:scale-95">
                ✓ Sono pronto/a
              </button>
            ) : (
              <div className="text-center py-3 rounded-2xl"
                   style={{background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)'}}>
                <p className="text-green-400 font-bold text-sm">✓ Pronto/a!</p>
                <p className="text-gray-500 text-xs mt-0.5">In attesa degli altri giocatori…</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   HISTORY SCREEN
   ================================================================ */
function HistoryScreen({onBack}) {
  const [history, setHistory] = useState([]);

  useEffect(()=>{
    try {
      const h = JSON.parse(localStorage.getItem('lupus_history')||'[]');
      setHistory(h);
    } catch(e) {}
  },[]);

  const clear = ()=>{
    localStorage.removeItem('lupus_history');
    setHistory([]);
  };

  const stats = useMemo(()=>{
    const total = history.length;
    const lupiWins = history.filter(g=>g.winner==='lupi').length;
    return { total, lupiWins, villaggioWins: total-lupiWins };
  },[history]);

  return (
    <div className="min-h-screen layer pb-6">
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 pt-5 pb-3"
           style={{background:'rgba(13,17,23,0.95)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <button onClick={onBack} className="text-gray-500 hover:text-white text-2xl leading-none transition-colors">←</button>
        <h2 className="font-cinzel text-moon text-lg font-bold flex-1">Storico Partite</h2>
        {history.length>0 && (
          <button onClick={clear} className="text-red-500 text-xs hover:text-red-400 transition-colors">Cancella</button>
        )}
      </div>

      <div className="px-4 pt-4">
        {history.length>0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              {l:'Partite', v:stats.total, c:'#e2c97e'},
              {l:'🐺 Lupi', v:stats.lupiWins, c:'#c0392b'},
              {l:'🌾 Villaggio', v:stats.villaggioWins, c:'#27ae60'},
            ].map(s=>(
              <div key={s.l} className="glass rounded-xl p-3 text-center">
                <p className="font-cinzel font-bold text-xl" style={{color:s.c}}>{s.v}</p>
                <p className="text-gray-500 text-xs">{s.l}</p>
              </div>
            ))}
          </div>
        )}

        {history.length===0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📜</div>
            <p className="font-cinzel text-moon text-lg mb-2">Nessuna partita salvata</p>
            <p className="text-gray-600 text-sm">Le partite completate appariranno qui.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((game,i)=>(
              <div key={i} className="glass rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl leading-none">{game.winner==='lupi'?'🐺':'🌾'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel font-bold text-white">
                      {game.winner==='lupi'?'Vittoria dei Lupi':'Vittoria del Villaggio'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(game.date).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})}
                      {' · '}Partita #{game.gameId}
                    </p>
                  </div>
                  <span className="text-gray-600 text-sm shrink-0">{game.players?.length} gioc.</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {game.players?.map((p,j)=>{
                    const r=ROLES[p.role];
                    return (
                      <div key={j} className={`px-2 py-1 rounded-lg text-xs font-bold ${!p.alive?'opacity-40':''}`}
                           style={{background:r?.color+'33', border:`1px solid ${r?.color}44`, color:'rgba(255,255,255,0.9)'}}>
                        {r?.icon} {p.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ================================================================
   MAIN APP — ROUTER
   ================================================================ */
function App() {
  useEffect(() => { const status = document.getElementById('boot-status'); if (status) status.style.display = 'none'; }, []);

  const user = useAuth();
  const [privacyAccepted, setPrivacyAccepted] = useState(
    () => !!localStorage.getItem('lif_privacy_accepted')
  );
  const [screen, setScreen] = useState('home');
  const [gameId, setGameId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isPlayer, setIsPlayer] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

  // Helper: naviga al PlayerScreen dai parametri game+player
  const openPlayerScreen = useCallback((g, p) => {
    if (!g || !p) return;
    setGameId(g);
    setPlayerId(p);
    setIsPlayer(true);
    setScreen('player');
  }, []);

  useEffect(()=>{
    console.log("App Initialized. Bootstrapping completed.");
    console.log("React App Mounted.");

    // 1) Web: leggi parametri dall'URL (browser o webview)
    const params = new URLSearchParams(window.location.search);
    const g = params.get('game');
    const p = params.get('player');
    if(g && p){ openPlayerScreen(g, p); return; }

    // 2) Native app: gestisci deep link lupus://join?game=XXX&player=YYY
    const setupDeepLink = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        // App già aperta — gestisci il link in arrivo
        CapApp.addListener('appUrlOpen', (event) => {
          try {
            const url = new URL(event.url);
            const dg = url.searchParams.get('game');
            const dp = url.searchParams.get('player');
            openPlayerScreen(dg, dp);
          } catch(e) { console.warn('Deep link parse error:', e); }
        });
        // App appena aperta tramite deep link (cold start)
        const launchUrl = await CapApp.getLaunchUrl();
        if (launchUrl?.url) {
          try {
            const url = new URL(launchUrl.url);
            const dg = url.searchParams.get('game');
            const dp = url.searchParams.get('player');
            openPlayerScreen(dg, dp);
          } catch(e) {}
        }
      } catch(e) {
        // @capacitor/app non disponibile (web build) — nessun problema
      }
    };
    setupDeepLink();
  },[openPlayerScreen]);

  const handleCreateGame = (withRoles, gid) => {
    // Save to Firebase
    if(db){
      const fbPlayers = withRoles.reduce((acc,p)=>({...acc,[p.id]:{name:p.name,role:p.role,alive:true,ready:false}}),{});
      db.ref(`games/${gid}`).set({ id:gid, phase:'waiting', createdAt:Date.now(), players:fbPlayers });
    }
    setPlayers(withRoles);
    setGameId(gid);
    setScreen('master');
  };

  const handleEndGame = (result) => {
    try {
      const h = JSON.parse(localStorage.getItem('lupus_history')||'[]');
      h.unshift(result);
      localStorage.setItem('lupus_history', JSON.stringify(h.slice(0,30)));
    } catch(e){}
    // Write stats if user is logged in
    if (user?.uid) {
      writeGameStats(user.uid, result).catch(e => console.warn('Stats write error:', e));
    }
    // Richiesta recensione App Store — dopo la 2a e la 5a partita
    try {
      const gamesPlayed = parseInt(localStorage.getItem('lif_games_played') || '0', 10) + 1;
      localStorage.setItem('lif_games_played', String(gamesPlayed));
      if (gamesPlayed === 2 || gamesPlayed === 5) {
        const isNative = !!(window.Capacitor?.isNativePlatform?.());
        if (isNative && APP_STORE_URL && !APP_STORE_URL.includes('id000000000')) {
          const reviewUrl = APP_STORE_URL
            .replace('https://apps.apple.com', 'itms-apps://itunes.apple.com')
            + '?action=write-review';
          window.open(reviewUrl, '_system');
        }
      }
    } catch(e){}
    setScreen('home');
  };

  if(screen==='player') {
    return (
      <div style={{background:'#0d1117', minHeight:'100vh'}}>
        <StarField/>
        <PlayerScreen gameId={gameId} playerId={playerId}/>
      </div>
    );
  }

  const handlePrivacyAccept = () => {
    localStorage.setItem('lif_privacy_accepted', 'true');
    setPrivacyAccepted(true);
  };

  return (
    <div style={{background:'#0d1117', minHeight:'100vh'}}>
      <StarField/>

      {/* Gate privacy — blocca tutto finché l'utente non accetta */}
      {!privacyAccepted && <PrivacyConsentModal onAccept={handlePrivacyAccept} />}

      {screen==='home' && (
        <HomeScreen
          onCreateGame={()=>setScreen('create')}
          onViewHistory={()=>setScreen('history')}
          onSetup={()=>setShowSetup(true)}
          onProfile={()=>setScreen('profile')}
        />
      )}

      {screen==='profile' && (
        <ProfileScreen user={user} onBack={()=>setScreen('home')} />
      )}

      {screen==='create' && (
        <CreateGameScreen
          onStart={handleCreateGame}
          onBack={()=>setScreen('home')}
        />
      )}

      {screen==='master' && (
        <GameMasterScreen
          gameId={gameId}
          players={players}
          onEndGame={handleEndGame}
          onBack={()=>setScreen('home')}
        />
      )}

      {screen==='history' && (
        <HistoryScreen onBack={()=>setScreen('home')}/>
      )}

      {showSetup && <SetupModal onClose={()=>setShowSetup(false)}/>}
    </div>
  );
}
