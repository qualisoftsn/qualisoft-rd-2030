/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// core/auth/auth-manager.ts
class AuthManager {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<void> | null = null; // ✅ CORRECTION 1 : Promise<void> au lieu de Promise<string>
  private onTokenChangeCallbacks: Array<(token: string | null) => void> = [];
  private isAuthenticated = false;
  private currentTenantSlug: string | null = null;
  private isMasterSession = false;

  // ✅ DÉTECTION DU TENANT COURANT VIA SOUS-DOMAINE
  getCurrentTenantSlug(): string {
    if (typeof window === 'undefined') return 'matrix';
    
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts[0] === 'matrix') return 'matrix';
    if (parts.length > 2 && parts[1] === 'qualisoft' && parts[2] === 'sn') {
      return parts[0];
    }
    
    return 'matrix';
  }

  // ✅ STOCKAGE EN MÉMOIRE UNIQUEMENT (ZÉRO localStorage)
  setToken(token: string, expiresIn: number, isMaster: boolean = false) {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + expiresIn * 1000;
    this.isAuthenticated = true;
    this.isMasterSession = isMaster;
    this.currentTenantSlug = this.getCurrentTenantSlug();
    this.notifyTokenChange(token);
  }

  getToken(): string | null {
    if (!this.accessToken || !this.tokenExpiry) return null;

    // ✅ REFRESH SILENCIEUX 60s AVANT EXPIRATION
    if (Date.now() >= this.tokenExpiry - 60000 && !this.refreshPromise) {
      this.silentRefresh(); // Appel fire-and-forget (pas d'await)
    }

    return this.accessToken;
  }

  // ✅ CORRECTION 2 : Fonction VOID non-asynchrone (fire-and-forget)
  silentRefresh(): void {
    if (this.refreshPromise) return; // Évite les appels multiples

    this.refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Refresh échoué');
        const data = await res.json();
        // ✅ PAS DE RETURN ICI — setToken gère la mise à jour interne
        this.setToken(data.accessToken, data.expiresIn, data.isMaster);
      })
      .catch((error) => {
        console.warn('Silent refresh failed:', error);
        this.clear();
      })
      .finally(() => {
        this.refreshPromise = null;
      });
  }

  clear() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.refreshPromise = null;
    this.isAuthenticated = false;
    this.isMasterSession = false;
    this.currentTenantSlug = null;
    this.notifyTokenChange(null);
  }

  async signInMaster(password: string): Promise<void> {
    const tid = 'master-login';
    
    try {
      const res = await fetch('/api/auth/login-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Accès Matrix refusé');
      }

      const data = await res.json();
      this.setToken(data.accessToken, data.expiresIn, true);
      
      window.location.href = 'https://matrix.qualisoft.sn/admin/matrix';
    } catch (err: any) {
      console.error('Master login failed:', err);
      throw err;
    }
  }

  async signOut() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout API failed (cookie already cleared)', e);
    } finally {
      this.clear();
      const currentSlug = this.getCurrentTenantSlug();
      
      if (currentSlug === 'matrix') {
        window.location.href = '/login?session=master-logout';
      } else {
        window.location.href = `https://${currentSlug}.qualisoft.sn/login?session=logout`;
      }
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

  getIsAuthenticated(): boolean {
    return this.isAuthenticated && this.accessToken !== null && this.tokenExpiry !== null;
  }

  getIsMasterSession(): boolean {
    return this.isMasterSession;
  }

  getCurrentTenantSlugPublic(): string {
    return this.currentTenantSlug || 'matrix';
  }
}

export const authManager = new AuthManager();

// ✅ NETTOYAGE SÉCURISÉ DES TOKENS EXISTANTS DANS localStorage (migration)
if (typeof window !== 'undefined') {
  const oldToken = localStorage.getItem('qualisoft-auth-token');
  const oldStorage = localStorage.getItem('qualisoft-auth-storage');
  
  if (oldToken || oldStorage) {
    console.warn('🧹 Migration sécurité OVH : nettoyage des tokens obsolètes de localStorage');
    localStorage.removeItem('qualisoft-auth-token');
    localStorage.removeItem('qualisoft-auth-storage');
    
    if (sessionStorage.getItem('auth-migration-shown') !== 'true') {
      sessionStorage.setItem('auth-migration-shown', 'true');
      console.info('✅ Session migrée vers une méthode sécurisée (HttpOnly cookies + sous-domaines)');
    }
  }
}