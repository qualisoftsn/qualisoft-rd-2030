/**
 * 🧹 MODULE : migration.ts
 * -------------------------------------------------------------------------
 * RÔLE : Élimination des résidus de session (NextAuth & Legacy Storage).
 * RÉVISION : 03 Mars 2026 | 01:25 GMT
 */

export function migrateFromLocalStorage() {
  if (typeof window === 'undefined') return;

  // ✅ CIBLES : Anciens jetons et sessions corrompues
  const legacyKeys = [
    'qualisoft-auth-token', 
    'qualisoft-auth-storage', 
    'next-auth.session-token',
    'next-auth.callback-url',
    'user' // Ancien stockage brut
  ];

  const hasLegacyData = legacyKeys.some(key => localStorage.getItem(key));

  if (hasLegacyData) {
    console.warn('🧹 MATRIX MIGRATION : Purge des protocoles obsolètes.');
    
    // 🔒 NETTOYAGE TOTAL
    legacyKeys.forEach(key => localStorage.removeItem(key));
    
    // 📢 Marquage de la session migrée
    sessionStorage.setItem('auth-migrated', 'true');
    
    // Forcer un rechargement propre si nécessaire pour vider la mémoire
    console.info('✅ SYSTÈME SCELLÉ : Passage au protocole HttpOnly + Zustand.');
  }
}

// Auto-exécution au chargement du bundle
if (typeof window !== 'undefined') {
  migrateFromLocalStorage();
}