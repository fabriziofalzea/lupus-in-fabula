#!/bin/bash
# ────────────────────────────────────────────
#  Lupus in Fabula — Deploy su GitHub Pages
#  Esegui con:  bash deploy.sh
# ────────────────────────────────────────────

FOLDER="$(cd "$(dirname "$0")" && pwd)"
TOKEN="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"  # no expiration
REMOTE="https://${TOKEN}@github.com/fabriziofalzea/lupus-in-fabula.git"

cd "$FOLDER"

# Rimuovi lock file se presenti
rm -f .git/index.lock .git/COMMIT_EDITMSG.lock 2>/dev/null

# Inizializza git se non esiste già
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Configura identità
git config user.name "Fabrizio Falzea"
git config user.email "fabriziofalzea@gmail.com"

# Collega al remote (aggiorna se già esistente)
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE"

# Sincronizza www/ con la root (webDir per Capacitor iOS)
cp index.html www/index.html
cp narrator.png www/narrator.png 2>/dev/null
echo "✓ www/ sincronizzata"

# Aggiungi solo i file del web app (non node_modules, non ios)
git add index.html www/index.html narrator.png www/narrator.png README.md netlify/ netlify.toml .gitignore 2>/dev/null

# Commit con timestamp automatico
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
git commit -m "Deploy $TIMESTAMP" 2>/dev/null || echo "Nessuna modifica da committare."

# Push (force per evitare conflitti con la storia del repo web)
git push --force origin HEAD:main

echo ""
echo "✅ Deploy completato!"
echo "🌐 https://fabriziofalzea.github.io/lupus-in-fabula"
