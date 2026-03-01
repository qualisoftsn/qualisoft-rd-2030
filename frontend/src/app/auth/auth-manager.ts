/**
 * 🛰️ MODULE : SOUVERAIN DE SESSION (AUTH MANAGER)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de la logique de domaine et cycle de vie des jetons.
 * SÉCURITÉ : Zéro persistance locale (In-Memory Only) / Anti-XSS.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 15:10 GMT
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
    
    // Cas local ou matrix.qualisoft.sn
    if (parts[0] === 'matrix' || parts[0] === 'localhost') return 'matrix';
    
    // Cas sous-domaine client : [tenant].qualisoft.sn
    if (parts.length >= 3 && parts[1] === 'qualisoft') {
      return parts[0];
    }
    
    return 'matrix';
  }

  /**
   * 🔑 SCÉLLAGE DU TOKEN EN MÉMOIRE
   * @param token JWT
   * @param expiresIn Durée de validité en secondes
   * @param isMaster Indique si c'est une session d'Architecte
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
   * Évite la déconnexion brutale de l'utilisateur.
   */
  silentRefresh(): void {
    if (this.refreshPromise) return;

    this.refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Important pour envoyer le Refresh Cookie
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Refresh Interrompu');
        const data = await res.json();
        this.setToken(data.accessToken, data.expiresIn, data.isMaster);
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

      if (!res.ok) throw new Error('Autorité Matrix Refusée');

      const data = await res.json();
      this.setToken(data.accessToken, data.expiresIn, true);
      
      // Redirection vers la console souveraine
      window.location.href = 'https://matrix.qualisoft.sn/admin/matrix';
    } catch (err) {
      console.error('Master Access Error:', err);
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
      // Redirection propre selon le domaine
      const baseUrl = slug === 'matrix' ? '' : `https://${slug}.qualisoft.sn`;
      window.location.href = `${baseUrl}/auth/login?session=logout`;
    }
  }

  /**
   * 📡 SYSTÈME D'ÉCOUTE
   * Permet aux autres modules (comme apiClient) de réagir au changement de token.
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
 * 🧹 MIGRATION & SÉCURITÉ : NETTOYAGE DES VESTIGES
 * Supprime les anciens tokens stockés par erreur dans le localStorage.
 */
if (typeof window !== 'undefined') {
  const securityCheck = () => {
    const keys = ['qualisoft-auth-token', 'qualisoft-auth-storage', 'token'];
    keys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.warn(`🛡️ Sécurité Matrix : Purge de ${key} détecté dans le stockage non-sécurisé.`);
      }
    });
  };
  securityCheck();
}