/**
 * usePurchases — RevenueCat IAP hook
 *
 * Su iOS nativo: usa @revenuecat/purchases-capacitor (SDK reale)
 * Su web/browser: usa localStorage come fallback (dev + Vercel)
 *
 * SETUP RICHIESTO (una tantum sul Mac):
 *   npm install @revenuecat/purchases-capacitor
 *   npx cap sync ios
 *
 * SETUP REVENUECAT DASHBOARD (app.revenuecat.com):
 *   1. Crea progetto → aggiungi app iOS (bundle: com.lupusinfabula.app)
 *   2. Crea entitlements: "ombre", "villaggio", "narratore"
 *   3. In App Store Connect crea i prodotti:
 *        com.lupusinfabula.pack_ombre       → €1,99
 *        com.lupusinfabula.pack_villaggio   → €1,99
 *        com.lupusinfabula.pack_narratore   → €1,99
 *        com.lupusinfabula.pack_combo       → €4,99
 *   4. Collega prodotti agli entitlement su RevenueCat
 *   5. Copia la Public API Key iOS → sostituisci REVENUECAT_API_KEY sotto
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

// ─── CONFIGURA QUI LA TUA CHIAVE REVENUECAT ─────────────────────────────────
const REVENUECAT_API_KEY = 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXX'; // TODO: sostituire
// ─────────────────────────────────────────────────────────────────────────────

const PACK_IDS = ['ombre', 'villaggio', 'narratore'];
const LS_KEY = 'lif_purchased_packs';

// Identifiers prodotti su App Store Connect (devono matchare RevenueCat)
const PRODUCT_IDS = {
  ombre:     'com.lupusinfabula.pack_ombre',
  villaggio: 'com.lupusinfabula.pack_villaggio',
  narratore: 'com.lupusinfabula.pack_narratore',
  combo:     'com.lupusinfabula.pack_combo',
};

// ─── Helpers localStorage (web fallback) ────────────────────────────────────
function lsGet()       { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } }
function lsSet(packs)  { try { localStorage.setItem(LS_KEY, JSON.stringify(packs)); } catch {} }

// Ricava pack IDs dall'oggetto customerInfo.entitlements.active di RevenueCat
function entitlementsToPackIds(customerInfo) {
  const active = customerInfo?.entitlements?.active ?? {};
  const packs = PACK_IDS.filter(id => !!active[id]);
  // Se ha ombre+villaggio+narratore attivi dal combo, aggiunge anche 'combo'
  const allThree = ['ombre', 'villaggio', 'narratore'].every(id => packs.includes(id));
  if (allThree && !packs.includes('combo')) packs.push('combo');
  return packs;
}

// ─── Hook principale ──────────────────────────────────────────────────────────
export function usePurchases() {
  const isNative = Capacitor.isNativePlatform();
  const PurchasesRef = useRef(null); // lazy import del modulo RevenueCat

  const [purchasedPacks, setPurchasedPacks] = useState(lsGet);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // ── Init RevenueCat (solo native) ──────────────────────────────────────────
  useEffect(() => {
    if (!isNative) return; // web: localStorage è già inizializzato

    let cancelled = false;
    (async () => {
      try {
        // Import "nascosto" a Vite/Rollup — non viene bundlato nel build web.
        // Su native Capacitor lo risolve a runtime; su web non viene mai chiamato.
        const mod = await new Function('return import("@revenuecat/purchases-capacitor")')();
        PurchasesRef.current = mod.Purchases;
        const RC = PurchasesRef.current;

        await RC.configure({ apiKey: REVENUECAT_API_KEY });

        const { customerInfo } = await RC.getCustomerInfo();
        if (!cancelled) {
          const packs = entitlementsToPackIds(customerInfo);
          setPurchasedPacks(packs);
          lsSet(packs); // sync localStorage come cache locale
          setInitialized(true);
        }
      } catch (e) {
        console.warn('[usePurchases] RC init error, fallback localStorage:', e);
        // Fallback silenzioso: usa localStorage
        if (!cancelled) setInitialized(true);
      }
    })();

    return () => { cancelled = true; };
  }, [isNative]);

  // ── Acquisto singolo pack ──────────────────────────────────────────────────
  const purchasePackage = useCallback(async (packId) => {
    setError(null);

    // Web: mock immediato (dev/Vercel)
    if (!isNative || !PurchasesRef.current) {
      const pack = { ombre: 1, villaggio: 1, narratore: 1, combo: 1 }[packId];
      if (!pack) return;
      // In modalità web simula acquisto riuscito
      const comboPacks = packId === 'combo' ? ['ombre', 'villaggio', 'narratore', 'combo'] : [packId];
      const next = [...new Set([...purchasedPacks, ...comboPacks])];
      setPurchasedPacks(next);
      lsSet(next);
      return { success: true };
    }

    // Native: RevenueCat reale
    setIsLoading(true);
    try {
      const RC = PurchasesRef.current;
      const { current } = await RC.getOfferings();

      // Cerca il package per identifier (product ID)
      const targetProductId = PRODUCT_IDS[packId];
      const pkg = current?.availablePackages?.find(
        p => p.product?.productIdentifier === targetProductId
      );

      if (!pkg) throw new Error(`Package non trovato: ${packId}`);

      const { customerInfo } = await RC.purchasePackage({ aPackage: pkg });
      const newPacks = entitlementsToPackIds(customerInfo);
      setPurchasedPacks(newPacks);
      lsSet(newPacks);
      return { success: true };
    } catch (e) {
      if (e?.code === 'PURCHASE_CANCELLED') {
        // Utente ha cancellato: non è un errore
        return { cancelled: true };
      }
      console.error('[usePurchases] purchasePackage error:', e);
      setError(e?.message || 'Errore durante l\'acquisto');
      return { error: e?.message };
    } finally {
      setIsLoading(false);
    }
  }, [isNative, purchasedPacks]);

  // ── Ripristina acquisti precedenti ─────────────────────────────────────────
  const restorePurchases = useCallback(async () => {
    setError(null);
    if (!isNative || !PurchasesRef.current) return { restored: 0 };

    setIsLoading(true);
    try {
      const RC = PurchasesRef.current;
      const { customerInfo } = await RC.restorePurchases();
      const newPacks = entitlementsToPackIds(customerInfo);
      setPurchasedPacks(newPacks);
      lsSet(newPacks);
      return { restored: newPacks.length };
    } catch (e) {
      console.error('[usePurchases] restorePurchases error:', e);
      setError(e?.message || 'Errore ripristino acquisti');
      return { error: e?.message };
    } finally {
      setIsLoading(false);
    }
  }, [isNative]);

  // ── Helper: pack sbloccato? ────────────────────────────────────────────────
  const isPackUnlocked = useCallback(
    (packId) => purchasedPacks.includes(packId),
    [purchasedPacks]
  );

  return {
    purchasedPacks,   // string[]  — es. ['ombre', 'villaggio']
    isLoading,        // boolean   — durante acquisto/restore
    error,            // string|null
    initialized,      // boolean   — RC configurato (solo native)
    purchasePackage,  // (packId: string) => Promise
    restorePurchases, // () => Promise
    isPackUnlocked,   // (packId: string) => boolean
  };
}
