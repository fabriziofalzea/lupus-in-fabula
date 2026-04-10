# 🐺 Lupus in Fabula

App per giocare a Lupus in Fabula (Werewolf) con narratore vocale, ruoli automatici e multiplayer in tempo reale.

**🌐 Gioca ora:** [fabriziofalzea.github.io/lupus-in-fabula](https://fabriziofalzea.github.io/lupus-in-fabula/)

---

## Funzionalità

- 13 ruoli con logiche specifiche (Lupo, Veggente, Guardia, Strega, Cupido, Cacciatore, Sindaco, Medium, Mitomane, Criceto, Figlio dei Lupi, Lupo Alfa, Villico)
- Narratore vocale con ElevenLabs TTS (Daniel, Adam, Arnold, Antoni)
- Multiplayer in tempo reale via Firebase — i giocatori si connettono col telefono
- Join partita tramite QR code
- Storico partite sincronizzato sul cloud
- Profilo utente con statistiche (login Google)

## Tecnologie

- React 18 (CDN, single-file)
- Firebase Realtime Database + Auth
- ElevenLabs TTS via Netlify proxy
- Capacitor 6 per iOS/Android (build nativo)

## Sviluppo

Apri `index.html` nel browser. Nessun build richiesto.

Per il narratore vocale, configura la chiave ElevenLabs nelle impostazioni dell'app (icona ⚙️, 5 tap sulla versione).
