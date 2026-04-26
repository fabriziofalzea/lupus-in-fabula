# 🐺 Lupus in Fabula — Guida Setup

## Come funziona l'app?

Hai **un solo file**: `index.html`.
Aprilo nel browser e funziona subito per testarlo sul tuo computer.

Per giocare con più dispositivi (QR code su ogni telefono), hai bisogno di:
1. **Un database online gratuito** (Firebase) → per sincronizzare le partite in tempo reale
2. **Un link pubblico** (Netlify) → per aprire l'app da tutti i telefoni

---

## STEP 1 — Crea un database Firebase (gratis, 5 minuti)

1. Vai su **[firebase.google.com](https://firebase.google.com)** e clicca **"Inizia"**
2. Accedi con il tuo account Google
3. Clicca **"Crea un progetto"** → scegli un nome (es. `lupus-in-fabula`) → continua
4. Disabilita Google Analytics se vuoi → **Crea progetto**
5. Nella barra sinistra, clicca **"Realtime Database"** → **"Crea database"**
6. Scegli **Europa** come posizione → clicca **"Avanti"**
7. Seleziona **"Inizia in modalità test"** → **"Abilita"**

✅ Database pronto!

---

## STEP 2 — Recupera le credenziali

1. Clicca l'icona ⚙️ in alto a sinistra → **"Impostazioni progetto"**
2. Scorri fino a **"Le tue app"**
3. Clicca l'icona **`</>`** (web)
4. Scrivi un nome (es. `lupus-web`) → clicca **"Registra app"**
5. Vedrai un blocco di codice simile a questo — **COPIALO**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "lupus-in-fabula.firebaseapp.com",
  databaseURL: "https://lupus-in-fabula-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lupus-in-fabula",
  storageBucket: "lupus-in-fabula.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## STEP 3 — Inserisci le credenziali nell'app

1. Apri il file `index.html` con il **Blocco Note** (Windows) o **TextEdit** (Mac)
2. Cerca la sezione (usa Ctrl+F / Cmd+F e cerca `FIREBASE_CONFIG`):

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "INSERISCI_API_KEY",
  authDomain:        "INSERISCI_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://INSERISCI_PROJECT_ID-default-rtdb...",
  ...
};
```

3. **Sostituisci ogni valore** con quelli del tuo progetto Firebase
4. **Salva il file**

---

## STEP 4 — Pubblica online (gratis, 1 minuto)

### Opzione A — Netlify Drop (la più semplice!)

1. Vai su **[app.netlify.com/drop](https://app.netlify.com/drop)**
2. **Trascina il file `index.html`** nella zona centrale
3. Netlify ti dà un link pubblico tipo `https://nome-casuale.netlify.app`
4. Condividi questo link con i giocatori — o meglio, mostragli il QR code!

### Opzione B — GitHub Pages

1. Crea un account su [github.com](https://github.com)
2. Crea un nuovo repository pubblico
3. Carica `index.html`
4. Vai in Impostazioni → Pages → seleziona il branch `main`
5. Il tuo sito sarà su `https://tuonome.github.io/nome-repo`

---

## Come si gioca? 🎮

### Il Narratore (chi gestisce la partita)
1. Apri l'app → **"Crea Nuova Partita"**
2. Inserisci i nomi di tutti i giocatori
3. Scegli i ruoli (il numero deve corrispondere ai giocatori)
4. Clicca **"Inizia la Partita"**
5. Mostra il QR code a ogni giocatore (ognuno scansiona il SUO)
6. Clicca **"Rivela i Ruoli"** quando tutti sono pronti
7. Gestisci Notte → Giorno → Votazione con i pulsanti

### I Giocatori
1. Scansiona il QR code che ti mostra il narratore
2. Tocca la carta per scoprire il tuo ruolo segreto
3. Tieni il telefono privato!
4. Clicca "Sono pronto" quando hai visto il ruolo

---

## Ruoli inclusi 🃏

| Ruolo | Team | Abilità |
|-------|------|---------|
| 🐺 Lupo | Lupi | Elimina una vittima ogni notte |
| 🐺 Lupo Alfa | Lupi | Come il lupo + una marcatura speciale |
| 👨‍🌾 Villico | Villaggio | Vota per smascherare i lupi |
| 🔮 Veggente | Villaggio | Scopre se un giocatore è lupo (1/notte) |
| 🛡️ Guardia del Corpo | Villaggio | Protegge un giocatore (1/notte) |
| 🧙‍♀️ Strega | Villaggio | 1 pozione di guarigione + 1 di veleno |
| 🏹 Cacciatore | Villaggio | Porta qualcuno con sé quando viene eliminato |
| 💘 Cupido | Villaggio | Crea due innamorati la prima notte |
| 🏛️ Sindaco | Villaggio | Il suo voto vale doppio |
| 👁️ Medium | Villaggio | Scopre il ruolo di un eliminato (1 volta) |

---

## Consigli per partite bilanciate 🎯

| Giocatori | Lupi consigliati | Composizione suggerita |
|-----------|-----------------|------------------------|
| 6 | 2 | 2 Lupi, 1 Veggente, 3 Villici |
| 8 | 2-3 | 2-3 Lupi, 1 Veggente, 1 Guardia, resto Villici |
| 10 | 3 | 3 Lupi, 1 Veggente, 1 Guardia, 1 Strega, resto Villici |
| 12+ | 3-4 | 3-4 Lupi + mix di ruoli speciali |

---

## Problemi frequenti

**I QR code non funzionano?**
→ Assicurati di aver completato il STEP 3 (credenziali Firebase nel file)

**"Partita non trovata" quando scansiono?**
→ Assicurati che tutti i dispositivi siano connessi alla stessa rete internet

**L'app è lenta a caricarsi?**
→ La prima volta carica React e Firebase dai CDN — normale attendere 3-5 secondi

**Posso giocare senza internet?**
→ Sì, ma solo in modalità "un solo dispositivo" — senza Firebase i QR code non sincronizzano i ruoli automaticamente

---

*Buona partita! 🌙*
