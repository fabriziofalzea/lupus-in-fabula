/**
 * LUPUS IN FABULA — Screenshot Automatici per App Store
 * ======================================================
 * ISTRUZIONI:
 * 1. Apri Chrome e vai su: https://lupus-in-fabula-eight.vercel.app
 * 2. Apri DevTools: Cmd+Option+I
 * 3. Vai nel pannello "Console"
 * 4. Incolla tutto questo codice e premi Invio
 * 5. Aspetta ~30 secondi — scaricherà 4 file PNG pronti per App Store
 *
 * Dimensioni output: 1320x2868 px (6.9" iPhone — richiesto da Apple)
 */

(async function() {
  // ── Carica html2canvas ──────────────────────────────────────────
  if (typeof html2canvas === 'undefined') {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    console.log('✅ html2canvas caricato');
  }

  // ── Skip privacy & tutorial ─────────────────────────────────────
  localStorage.setItem('lif_privacy_accepted', 'true');
  localStorage.setItem('lif_tutorial_done', 'true');

  // ── Imposta viewport a 440x956 (= 1320x2868 @ devicePixelRatio=3) ──
  // Nota: questo funziona meglio se Chrome DevTools è in modalità
  // "Responsive" (icona telefono in alto a sinistra dei DevTools)

  const TARGET_W = 1320;
  const TARGET_H = 2868;

  // ── Helper: cattura e scarica ───────────────────────────────────
  async function captureAndDownload(filename) {
    console.log(`📸 Catturando ${filename}...`);
    const canvas = await html2canvas(document.body, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0a0a1a',
      logging: false,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Ridimensiona a 1320x2868
    const out = document.createElement('canvas');
    out.width = TARGET_W;
    out.height = TARGET_H;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvas, 0, 0, TARGET_W, TARGET_H);

    // Scarica
    const link = document.createElement('a');
    link.download = filename;
    link.href = out.toDataURL('image/png');
    link.click();
    console.log(`✅ Scaricato: ${filename}`);
    await new Promise(r => setTimeout(r, 1500));
  }

  // ── Helper: aspetta animazione ──────────────────────────────────
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 1: Home Screen
  // ══════════════════════════════════════════════════════════════════
  window.location.reload();
  await wait(3000);
  // Accetta privacy se visibile
  const acceptBtn = document.querySelector('button[class*="btn-gold"]') ||
                    [...document.querySelectorAll('button')].find(b => b.textContent.includes('Accetto'));
  if (acceptBtn) { acceptBtn.click(); await wait(1000); }
  await captureAndDownload('screen1_home.png');

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 2: Setup partita (Step 1 — numero giocatori)
  // ══════════════════════════════════════════════════════════════════
  const creaBtn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Crea Nuova'));
  if (creaBtn) { creaBtn.click(); await wait(1200); }
  await captureAndDownload('screen2_setup.png');

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 3: Selezione Ruoli (Step 2)
  // ══════════════════════════════════════════════════════════════════
  // Trova e clicca "Avanti" per andare allo step 2
  const avantiBtn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Avanti'));
  if (avantiBtn) { avantiBtn.click(); await wait(1200); }
  await captureAndDownload('screen3_ruoli.png');

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 4: Pack Store (torna alla home e vai ai pack)
  // ══════════════════════════════════════════════════════════════════
  // Torna indietro fino alla home
  history.go(-2);
  await wait(1500);
  // Clicca di nuovo su "Crea Nuova Partita" e vai allo step 2
  const creaBtn2 = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Crea Nuova'));
  if (creaBtn2) { creaBtn2.click(); await wait(1000); }
  const avantiBtn2 = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Avanti'));
  if (avantiBtn2) { avantiBtn2.click(); await wait(1200); }
  // Scorri fino ai pack e apri il primo
  document.querySelector('[data-pack-id], .pack-row, [class*="pack"]')?.scrollIntoView();
  // Cerca un pulsante con prezzo €
  const priceBtn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('€'));
  if (priceBtn) { priceBtn.click(); await wait(800); }
  await captureAndDownload('screen4_packs.png');

  console.log('🎉 FATTO! Controlla la cartella Downloads — hai 4 screenshot pronti.');
  console.log('📁 Spostali in: Lupus In Fabula/iap_screenshots/app_screenshots/');
})();
