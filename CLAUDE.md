# LUPUS IN FABULA — Claude Code Instructions

> Agente specializzato di Jarvis per lo sviluppo e la gestione dell'app Lupus In Fabula.
> Versione: 1.2 | Aggiornato: 2026-05-12

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
| **Stato** | v1.2 (build 3) in review Apple — inviata 2026-05-12 |
| **Live** | v1.1 (build 2) — approvata 2026-05-12 |

---

## Stack

| Layer | Tecnologia |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Mobile | Capacitor (iOS) |
| Backend API | Vercel Serverless Functions (`api/speak.js`, `api/voices.js`) |
| Database/Auth | Firebase Realtime Database + Email Auth (Google/Apple rimandati a v1.3+) |
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
| `src/App.jsx` | Entry point principale — `APP_STORE_URL`, `FIREBASE_CONFIG`, `PACKS`, `needsUpdate()` |
| `src/hooks/usePurchases.js` | Hook RevenueCat — accetta `userId` per RC.logIn |
| `api/speak.js` | Proxy ElevenLabs TTS |
| `api/voices.js` | Lista voci ElevenLabs |
| `vercel.json` | Config deploy Vercel |
| `public/narrator/` | 31 MP3 statici narratore (risparmio ~94% API) |

---

## Note critiche

- **Leggere sempre `AI_SYNC.md` prima di proporre modifiche**
- Modalità narratore default: **Script** (solo testo). Voce AI va attivata nelle impostazioni
- Su iOS nativo: chiamate TTS usano dominio hardcoded `lupus-in-fabula-eight.vercel.app`
- Su web: chiamate TTS usano `window.location.origin`
- `APP_STORE_URL` in cima a `src/App.jsx` — punto unico di modifica
- Il push git **NON** triggera deploy automatico — usare sempre `npx vercel --prod`
- Stats tracciate solo per utenti registrati (leva conversione registrazione)
- **Force update**: attivare con `config/minVersion` su Firebase Console — NON farlo prima che la versione target sia live su App Store
- **RC identificazione**: `usePurchases(userId)` — passare sempre `user?.uid` dalle schermate che usano l'hook

---

## Deploy (workflow completo)

```bash
# 1. Build web + deploy Vercel
cd "/Users/fabriziofalzea/Documents/Claude/Projects/Lupus In Fabula"
npx vercel --prod

# 2. Sync iOS
npx cap sync ios

# 3. Bump versione in project.pbxproj (MARKETING_VERSION + CURRENT_PROJECT_VERSION)

# 4. Archive
xcodebuild \
  -workspace "ios/App/App.xcworkspace" \
  -scheme App -configuration Release \
  -archivePath "/tmp/LupusInFabula.xcarchive" \
  -destination "generic/platform=iOS" \
  CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=38498XM6PJ \
  archive

# 5. Upload via Xcode Organizer
open -a Xcode "/tmp/LupusInFabula.xcarchive"
```

---

## Rilasci

| Versione | Build | Data | Stato |
|---|---|---|---|
| 1.0 | 1 | 2026-05-09 | ✅ Live |
| 1.1 | 2 | 2026-05-09 | ✅ Live (fix paywall Voce AI) |
| 1.2 | 3 | 2026-05-12 | ⏳ In review (RC login UID + force update) |

---

## To-do (v1.3+)

| Priorità | Azione |
|---|---|
| 🔴 | Attivare `config/minVersion: "1.2"` su Firebase quando v1.2 è approvata |
| 🟡 | Verificare restrizione geografica (Afghanistan, Marocco — 13+) |
| 🟡 | Sign in with Apple — Xcode entitlement + Firebase provider Apple |
| 🟡 | UX: feedback post-acquisto pack narratore |
| 🟢 | Universal Links (`apple-app-site-association` su Vercel) |
| 🟢 | Traduzioni EN — mercato internazionale |

---

*Lupus In Fabula v1.2 — Agente Jarvis*
