/**
 * 🔐 MODULE : AuthManager (Sovereign Security)
 * -------------------------------------------------------------------------
 * RÔLE : Gestionnaire d'état de session hors-sol (Memory-Only).
 * RÉVISION : 03 Mars 2026 | 01:10 GMT
 */

class AuthManager {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<void> | null = null;
  private onTokenChangeCallbacks: Array<(token: string | null) => void> = [];
  private isAuthenticated = false;
  private isMasterSession = false;

  /**
   * 🛰️ RÉSOLUTION DU NŒUD (TENANT)
   * Extraction dynamique du slug pour le routage Matrix.
   */
  getCurrentTenantSlug(): string {
    if (typeof window === 'undefined') return 'matrix';
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Logique : client.qualisoft.sn ou matrix.qualisoft.sn
    if (parts[0] === 'matrix' || parts[0] === 'app' || parts[0] === 'admin') return 'matrix';
    if (parts.length >= 3) return parts[0].toLowerCase();
    
    return 'matrix';
  }

  /**
   * 🛡️ SCELLAGE DU TOKEN
   * Stockage en mémoire vive pour interdire le vol de session via XSS.
   */
  setToken(token: string, expiresIn: number, isMaster: boolean = false) {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + expiresIn * 1000;
    this.isAuthenticated = true;
    this.isMasterSession = isMaster;
    this.notifyTokenChange(token);
  }

  getToken(): string | null {
    if (!this.accessToken || !this.tokenExpiry) return null;

    // 🔄 REFRESH SILENCIEUX (60s avant l'expiration)
    if (Date.now() >= this.tokenExpiry - 60000 && !this.refreshPromise) {
      this.silentRefresh();
    }

    return this.accessToken;
  }

  private silentRefresh(): void {
    if (this.refreshPromise) return;

    this.refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Refresh Kernel Refusé');
        const data = await res.json();
        this.setToken(data.accessToken, data.expiresIn, data.isMaster);
      })
      .catch((err) => {
        console.warn('Matrix Refresh Failed:', err);
        this.clear();
      })
      .finally(() => { this.refreshPromise = null; });
  }

  clear() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.isAuthenticated = false;
    this.isMasterSession = false;
    this.notifyTokenChange(null);
  }

  async signOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      this.clear();
      const slug = this.getCurrentTenantSlug();
      // Redirection isolée par domaine
      const target = slug === 'matrix' ? 'matrix.qualisoft.sn' : `${slug}.qualisoft.sn`;
      window.location.href = `https://${target}/auth/login?session=logout`;
    }
  }

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
  getIsMasterSession(): boolean { return this.isMasterSession; }
}

export const authManager = new AuthManager();