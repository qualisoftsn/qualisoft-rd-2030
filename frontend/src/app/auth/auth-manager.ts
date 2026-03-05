/**
 * 🛰️ MODULE : SOUVERAIN DE SESSION (AUTH MANAGER) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de la logique de domaine et cycle de vie des jetons.
 * SÉCURITÉ : Zéro persistance locale (In-Memory Only) / Anti-XSS.
 * FIX : Câblage strict sur les endpoints /api/auth API SDE.
 * -------------------------------------------------------------------------
 * DATE : 04 Mars 2026 | 23:45 GMT
 */

class AuthManager {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<void> | null = null;
  private onTokenChangeCallbacks: Array<(token: string | null) => void> = [];
  private isAuthenticated = false;
  private isMasterSession = false;

  /**
   * 🌐 DÉTECTION DU NŒUD (TENANT) COURANT
   * Analyse l'URL pour déterminer si nous sommes sur le Matrix ou un Tenant.
   */
  getCurrentTenantSlug(): string {
    if (typeof window === 'undefined') return 'matrix';
    
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts[0] === 'matrix' || parts[0] === 'localhost') return 'matrix';
    
    if (parts.length >= 3 && parts[1] === 'qualisoft') {
      return parts[0];
    }
    
    return 'matrix';
  }

  /**
   * 🔑 SCÉLLAGE DU TOKEN EN MÉMOIRE
   */
  setToken(token: string, expiresIn: number, isMaster: boolean = false) {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);
    this.isAuthenticated = true;
    this.isMasterSession = isMaster;
    this.notifyTokenChange(token);
  }

  /**
   * 📡 RÉCUPÉRATION SÉCURISÉE
   * Gère le rafraîchissement automatique avant expiration.
   */
  getToken(): string | null {
    if (!this.accessToken || !this.tokenExpiry) return null;

    // Déclenche un refresh silencieux 2 minutes avant l'expiration
    if (Date.now() >= this.tokenExpiry - 120000 && !this.refreshPromise) {
      this.silentRefresh();
    }

    return this.accessToken;
  }

  /**
   * 🔄 REFRESH SILENCIEUX (PROTOCOLE ARRIÈRE-PLAN)
   */
  silentRefresh(): void {
    if (this.refreshPromise) return;

    this.refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Indispensable pour que Next.js reçoive le HttpOnly refresh_token
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Refresh Interrompu');
        const data = await res.json();
        if (data.success && data.accessToken) {
            this.setToken(data.accessToken, data.expiresIn, this.isMasterSession);
        } else {
            throw new Error('Payload invalide');
        }
      })
      .catch((error) => {
        console.warn('⚠️ Session Matrix expirée :', error);
        this.clear();
      })
      .finally(() => {
        this.refreshPromise = null;
      });
  }

  /**
   * 🧹 PURGE DE SESSION
   */
  clear() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.refreshPromise = null;
    this.isAuthenticated = false;
    this.isMasterSession = false;
    this.notifyTokenChange(null);
  }

  /**
   * 👑 CONNEXION MASTER (ARCHITECTE)
   */
  async signInMaster(password: string): Promise<void> {
    try {
      const res = await fetch('/api/auth/login-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Autorité Matrix Refusée');

      this.setToken(data.accessToken, data.expiresIn, true);
      
      // Redirection vers le cockpit souverain (mis à jour selon nos précédentes refactorisations)
      window.location.href = '/admin/super-dashboard';
    } catch (err) {
      console.error('[MASTER_ACCESS_ERROR]:', err);
      throw err;
    }
  }

  /**
   * 🚪 DÉCONNEXION GLOBALE
   */
  async signOut() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      this.clear();
      const slug = this.getCurrentTenantSlug();
      const baseUrl = slug === 'matrix' ? '' : `https://${slug}.qualisoft.sn`;
      window.location.href = `${baseUrl}/auth/login?session=logout`;
    }
  }

  /**
   * 📡 SYSTÈME D'ÉCOUTE
   */
  onTokenChange(callback: (token: string | null) => void) {
    this.onTokenChangeCallbacks.push(callback);
    return () => {
      this.onTokenChangeCallbacks = this.onTokenChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyTokenChange(token: string | null) {
    this.onTokenChangeCallbacks.forEach((cb) => cb(token));
  }

  getIsAuthenticated(): boolean { return this.isAuthenticated; }
}

export const authManager = new AuthManager();

/**
 * 🧹 SÉCURITÉ : PURGE DES VESTIGES LOCAUX
 * Assure qu'aucun ancien token n'est resté bloqué en clair dans le navigateur.
 */
if (typeof window !== 'undefined') {
  const securityCheck = () => {
    const keys = ['qualisoft-auth-token', 'qualisoft-auth-storage', 'token'];
    keys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.warn(`🛡️ Sécurité Matrix : Purge de ${key} détectée dans le stockage local.`);
      }
    });
  };
  securityCheck();
}