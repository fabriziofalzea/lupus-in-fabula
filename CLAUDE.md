# LUPUS IN FABULA — Claude Code Instructions

> Agente specializzato di Jarvis per lo sviluppo e la gestione dell'app Lupus In Fabula.
> Versione: 1.0 | Aggiornato: Maggio 2026

---

## Ruolo

Sei il dev assistant dedicato per Lupus In Fabula. Hai piena conoscenza dell'architettura, dello stato di sviluppo, delle decisioni prese e dei fix critici. Non proponi modifiche architetturali senza aver letto `AI_SYNC.md` — è la fonte di verità del progetto.

Regole comportamentali: vedi `../Jarvis/CLAUDE.md` (profilo utente, stile, proattività).

---

## App

| Info | Valore |
|---|---|
| **Nome** | Lupus In Fabula |
| **Bundle ID** | `com.lupusinfabula.app` |
| **App Store ID** | `id6764061104` |
| **App Store URL** | `https://apps.apple.com/app/lupus-in-fabula/id6764061104` |
| **Web (Vercel)** | `https://lupus-in-fabula-eight.vercel.app` |
| **Stato** | In revisione Apple — Build 2 inviata il 3 maggio 2026 |

---

## Stack

| Layer | Tecnologia |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Mobile | Capacitor (iOS + Android) |
| Backend API | Vercel Serverless Functions (`api/speak.js`, `api/voices.js`) |
| Database/Auth | Firebase Realtime Database + Google Auth / Email Auth |
| Voce AI | ElevenLabs — voce Daniel (`onwK4e9ZLuTAKqWW03F9`) |
| Monetizzazione | RevenueCat + App Store Connect IAP |
| Deep linking | Schema `lupus://` |

---

## Modello di business

Freemium con pack IAP:

| Pack | Prezzo | Contenuto |
|---|---|---|
| Pack Ombre | €2,99 | strega, figlio_dei_lupi, cacciatore, medium |
| Pack Villaggio | €2,99 | cupido, sindaco, sciamano, mitomane |
| Pack Narratore | €1,99 | Voce AI narratore |
| Combo | €5,99 | Tutti e tre |

Prodotti App Store Connect: `pack_ombre`, `pack_villaggio`, `pack_narratore`, `pack_combo`.

---

## File di riferimento

| File | Contenuto |
|---|---|
| `AI_SYNC.md` | **Fonte di verità** — architettura, fix critici, to-do |
| `NARRATOR_RECORDING_GUIDE.md` | Guida registrazione 30 MP3 statici narratore |
| `src/App.jsx` | Entry point principale — contiene `APP_STORE_URL`, `FIREBASE_CONFIG`, `PACKS` |
| `api/speak.js` | Proxy ElevenLabs TTS |
| `api/voices.js` | Lista voci ElevenLabs |
| `vercel.json` | Config deploy Vercel |
| `public/narrator/` | 31 MP3 statici narratore (risparmio ~94% API) |

---

## Note critiche

- **Leggere sempre `AI_SYNC.md` prima di proporre modifiche** — contiene fix non ovvi e decisioni architetturali motivate
- Modalità narratore default: **Script** (solo testo). Voce AI va attivata nelle impostazioni
- Su iOS nativo: chiamate TTS usano dominio hardcoded `lupus-in-fabula-eight.vercel.app`
- Su web: chiamate TTS usano `window.location.origin`
- `APP_STORE_URL` in cima a `src/App.jsx` — punto unico di modifica
- Il push git **NON** triggera deploy automatico — usare sempre `npx vercel --prod`
- Stats tracciate solo per utenti registrati (leva conversione registrazione)

---

## Deploy

```bash
# Web — Vercel produzione
cd "/Users/fabriziofalzea/Documents/Claude/Projects/Lupus In Fabula"
npx vercel --prod

# Build iOS
npm install && npm run ios
```

---

## To-do post-approvazione Apple

| Priorità | Azione |
|---|---|
| 🔴 | Rilascio manuale su App Store Connect quando Apple approva |
| 🟡 | Verificare restrizione geografica (Afghanistan, Marocco — 13+) |
| 🟡 | Sign in with Apple v1.1 — Xcode entitlement + Firebase provider Apple |
| 🟡 | UX: feedback post-acquisto pack narratore |
| 🟢 | Universal Links (`apple-app-site-association` su Vercel) |
| 🟢 | Traduzioni EN — mercato internazionale |

---

## Aggiornamento automatico

Dopo ogni sessione di sviluppo con fix, nuove feature o decisioni architetturali, aggiorna `AI_SYNC.md` e questo `CLAUDE.md`. Incrementa la versione.

---

*Lupus In Fabula v1.0 — Agente Jarvis*
