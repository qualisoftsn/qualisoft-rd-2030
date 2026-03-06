/**
 * 🛰️ MODULE : SOUVERAIN DE SESSION (AUTH MANAGER) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de la logique de domaine et cycle de vie des jetons.
 * SÉCURITÉ : Zéro persistance locale (In-Memory Only) / Anti-XSS.
 * FIX : Câblage strict sur les endpoints /api/auth API SDE.
 * -------------------------------------------------------------------------
 * RÉVISION : 06 Mars 2026 | 03:15 GMT
 * -------------------------------------------------------------------------
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
   * Analyse l'URL pour identifier l'instance territoriale.
   */
  getCurrentTenantSlug(): string {
    if (typeof window === 'undefined') return 'matrix';
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Détection Matrix (Master)
    const masterNodes = ['app', 'matrix', 'admin', 'master', 'localhost'];
    if (masterNodes.includes(parts[0])) return 'matrix';
    
    // Détection Tenant (Subdomain)
    if (parts.length >= 3) return parts[0];
    
    return 'matrix';
  }

  /**
   * 🔑 SCELLAGE DU TOKEN EN MÉMOIRE
   */
  setToken(token: string, expiresIn: number, isMaster: boolean = false) {
    this.accessToken = token;
    // Calcul de l'expiration avec une marge de sécurité de 30s
    this.tokenExpiry = Date.now() + (expiresIn * 1000) - 30000;
    this.isAuthenticated = true;
    this.isMasterSession = isMaster;
    this.notifyTokenChange(token);
  }

  /**
   * 📡 RÉCUPÉRATION SÉCURISÉE
   */
  getToken(): string | null {
    if (!this.accessToken || !this.tokenExpiry) return null;

    // Refresh silencieux si on approche de l'expiration (2 min)
    if (Date.now() >= this.tokenExpiry - 120000 && !this.refreshPromise) {
      this.silentRefresh();
    }

    return this.accessToken;
  }

  /**
   * 🔄 REFRESH SILENCIEUX (PROTOCOLE KERNEL)
   */
  private async silentRefresh(): Promise<void> {
    if (this.refreshPromise) return;

    this.refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Nécessaire pour les cookies HttpOnly (Refresh Token)
    })
    .then(async (res) => {
      if (!res.ok) throw new Error('Refresh Rejeté');
      const data = await res.json();
      if (data.accessToken) {
        this.setToken(data.accessToken, data.expiresIn, this.isMasterSession);
      }
    })
    .catch(() => this.clear())
    .finally(() => { this.refreshPromise = null; });
  }

  /**
   * 🚪 DÉCONNEXION ATOMIQUE
   */
  async signOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      this.clear();
      const slug = this.getCurrentTenantSlug();
      const baseUrl = slug === 'matrix' ? '' : `https://${slug}.qualisoft.sn`;
      window.location.href = `${baseUrl}/auth/login?session=logout`;
    }
  }

  clear() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.isAuthenticated = false;
    this.isMasterSession = false;
    this.notifyTokenChange(null);
  }

  private notifyTokenChange(token: string | null) {
    this.onTokenChangeCallbacks.forEach((cb) => cb(token));
  }

  onTokenChange(callback: (token: string | null) => void) {
    this.onTokenChangeCallbacks.push(callback);
    return () => { this.onTokenChangeCallbacks = this.onTokenChangeCallbacks.filter(cb => cb !== callback); };
  }
}

export const authManager = new AuthManager();

// 🛡️ PURGE DES VESTIGES LOCAUX (Sécurité Anti-Forensic)
if (typeof window !== 'undefined') {
  ['token', 'qualisoft-auth', 'session'].forEach(k => localStorage.removeItem(k));
}