// core/auth/migration.ts
export function migrateFromLocalStorage() {
  // ✅ NETTOYAGE SÉCURISÉ DES TOKENS EXISTANTS
  const oldToken = localStorage.getItem('qualisoft-auth-token');
  const oldStorage = localStorage.getItem('qualisoft-auth-storage');

  if (oldToken || oldStorage) {
    console.warn('🧹 Migration sécurisée : nettoyage des tokens obsolètes de localStorage');
    
    // 🔒 Suppression immédiate
    localStorage.removeItem('qualisoft-auth-token');
    localStorage.removeItem('qualisoft-auth-storage');
    
    // 📢 Notification utilisateur discrète
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('auth-migrated', 'true');
    }
  }
}

// Appel au démarrage de l'application
if (typeof window !== 'undefined') {
  migrateFromLocalStorage();
}