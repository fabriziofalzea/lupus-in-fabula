# 🎙 Guida Registrazione Narratore — Lupus in Fabula

Questa guida ti permette di registrare **una sola volta** tutte le frasi standard del narratore
usando ElevenLabs Playground. I file vengono poi salvati nell'app e riprodotti offline —
senza mai chiamare l'API durante la partita.

**Risparmio stimato: ~94% delle chiamate API per partita.**

---

## Come registrare

1. Vai su **ElevenLabs → Speech Synthesis** (playground): https://elevenlabs.io/app/speech-synthesis
2. Seleziona la **stessa voce** configurata nell'app (default: Daniel `onwK4e9ZLuTAKqWW03F9`)
3. Imposta **Speed: 1.4**, **Stability: 70%**, **Similarity: 85%**, **Style: 35%**
4. Incolla il testo, genera, scarica come **MP3**
5. Rinomina il file con il nome indicato e salvalo in: `public/narrator/`

---

## Frasi da registrare — 30 file totali

### 🌙 Apertura Notte
| File | Testo da incidere |
|------|-------------------|
| `night_open.mp3` | La notte cala sul villaggio. Il silenzio inghiotte ogni suono, ogni movimento. |

### 🎭 Ruoli Notturni (apertura + chiusura per ogni ruolo)
| File | Testo da incidere |
|------|-------------------|
| `cupido_open.mp3` | Cupido, apra gli occhi. Scegli i due cuori che batteranno all'unisono — la tua freccia deciderà il loro destino per sempre. |
| `cupido_close.mp3` | Cupido, chiuda gli occhi. |
| `mitomane_open.mp3` | Il Mitomane, apra gli occhi. Scegli la maschera che indosserai per tutta la partita. |
| `mitomane_close.mp3` | Il Mitomane, chiuda gli occhi. |
| `veggente_open.mp3` | Il Veggente, apra gli occhi. Scegli chi vuoi osservare questa notte. |
| `veggente_close.mp3` | Il Veggente, chiuda gli occhi. |
| `guardia_open.mp3` | La Guardia del Corpo, apra gli occhi. Chi proteggerai stanotte con la tua vita? |
| `guardia_close.mp3` | La Guardia del Corpo, chiuda gli occhi. |
| `figlio_dei_lupi_open.mp3` | Il Figlio dei Lupi, apra gli occhi. Il sangue chiama, ma ancora non risponde. Osserva in silenzio. |
| `figlio_dei_lupi_close.mp3` | Il Figlio dei Lupi, chiuda gli occhi. |
| `lupi_open.mp3` | I Lupi, aprano gli occhi. Riconoscetevi nell'oscurità. Il branco decide — chi cade stanotte? |
| `lupi_close.mp3` | I Lupi, chiudano gli occhi. |
| `strega_open.mp3` | La Strega, apra gli occhi. I lupi hanno già deciso chi uccidere. Salvi, avveleni, oppure passi? |
| `strega_close.mp3` | La Strega, chiuda gli occhi. |
| `medium_open.mp3` | Il Medium, apra gli occhi. I morti parlano, se sai ascoltare. Indica uno spirito — scoprirai il suo segreto. |
| `medium_close.mp3` | Il Medium, chiuda gli occhi. |
| `sciamano_open.mp3` | Lo Sciamano, apra gli occhi. Puoi richiamare un'anima perduta — scegli chi riportare tra i vivi. |
| `sciamano_close.mp3` | Lo Sciamano, chiuda gli occhi. |

### ⚔️ Apertura Partita
| File | Testo da incidere |
|------|-------------------|
| `role_reveal.mp3` | Ogni mascella nasconde la verità. Scopri chi sei davvero. |

### 🌅 Alba — Notti senza vittime
| File | Testo da incidere |
|------|-------------------|
| `dawn_no_victim.mp3` | L'alba arriva silenziosamente. Le ombre si ritirano. La notte è passata senza sangue. Il villaggio si ritrova intatto al nuovo giorno. |
| `dawn_strega_heal.mp3` | L'alba arriva silenziosamente. Le ombre si ritirano. Una pozione misteriosa ha respinto la morte. Stanotte non ci sono vittime. |
| `dawn_figlio_transformed.mp3` | L'alba arriva silenziosamente. Le ombre si ritirano. Nel bosco, una creatura si è svegliata. Il villaggio rimane intatto — per ora. |

### ☀️ Giorno — Votazione
| File | Testo da incidere |
|------|-------------------|
| `day_victim_reveal.mp3` | Colui che è stato nominato apparirà adesso sui vostri schermi. |
| `day_no_majority.mp3` | Nessuno raggiunge la maggioranza. Il villaggio rimane spaccato. La notte sta arrivando… |

### 🏁 Fine Partita
| File | Testo da incidere |
|------|-------------------|
| `end_lupi_win.mp3` | Il villaggio è caduto. I lupi escono dall'ombra, il loro ululato riecheggia nella notte. Il branco ha trionfato. |
| `end_villaggio_win.mp3` | Ultimo lupo svelato. Il villaggio esulta — la pace torna tra le case, le porte si riaprono, le candele si riaccendono. |
| `end_lupi_win_short.mp3` | Il branco ha trionfato. Il villaggio è caduto. |
| `end_villaggio_win_short.mp3` | Il villaggio ha vinto. La pace è tornata. |

### 🔊 Test Voce (pannello impostazioni)
| File | Testo da incidere |
|------|-------------------|
| `test_voice.mp3` | La notte. I segreti del villaggio si risvegliano. |

---

## Testi che restano dinamici (API — ~1-2 chiamate per turno)

Questi testi contengono nomi dei giocatori e vengono ancora generati via API:

- **Alba con vittima**: *"L'alba arriva silenziosamente… [Nome] è stato trovato senza vita. I lupi hanno colpito nella notte."*
- ~~Eliminazione di giorno~~ → ora **statica** (`day_victim_reveal.mp3`), il nome appare sui telefoni via Firebase.
- **Veleno strega**: *"…Ma il veleno della strega ha colpito: [Nome] è stato trovato senza vita!"*
- **Veggente + Criceto**: *"…Ma un'aura oscura si è abbattuta su [Nome] nella notte…"*

Sono al massimo **2 API calls per turno** invece delle ~15 precedenti.

---

## Struttura finale dopo la registrazione

```
public/
  narrator/
    night_open.mp3
    cupido_open.mp3
    cupido_close.mp3
    ... (30 file totali)
    test_voice.mp3
```

I file vengono inclusi automaticamente nel build Vite e nell'app iOS/Android tramite Capacitor.

---

## Debug in console

Quando la voce AI è attiva, la console mostra:
- `[Narrator] 🎵 Statico: /narrator/night_open.mp3` → riproduce file locale
- `[Narrator] 🤖 API ElevenLabs (testo dinamico): L'alba arriva…` → chiama API

Se un file statico manca, il narratore va in silenzio senza errori bloccanti (il testo rimane visibile a schermo).
