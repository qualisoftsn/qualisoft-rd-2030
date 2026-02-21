import axios from 'axios';

/**
 * 📡 PROTOCOLE RÉSEAU : AXIOS INTERCEPTOR (MATRICE MULTI-TENANT)
 * -------------------------------------------------------------------------
 * FONCTION : Client HTTP centralisé avec injection dynamique du SDE.
 * RÔLE : Garantir que chaque requête vers le Kernel soit scellée avec
 * l'identifiant du Tenant actif, extrait du sous-domaine.
 * SÉCURITÉ : Protection contre les fuites de données inter-organisations.
 */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.qualisoft.sn/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 🛡️ INTERCEPTEUR DE REQUÊTES (SCELLAGE SDE)
api.interceptors.request.use(
  (config) => {
    // 1. Détection des routes agnostiques (Ex: Login global, Ping)
    const publicPaths = ['/auth/public', '/auth/login', '/tenants/config'];
    const isPublic = publicPaths.some(path => config.url?.includes(path));

    if (!isPublic) {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');

        // 2. Extraction du sous-domaine (Isolation physique)
        // Exemple: 'senelec.qualisoft.sn' -> 'senelec'
        const subdomain = parts.length > 2 ? parts[0] : null;

        // Exclusion des domaines de développement et d'administration
        if (subdomain && !['localhost', 'www', 'elite', 'app'].includes(subdomain)) {
          config.headers['x-tenant-id'] = subdomain;
        } else {
          // Fallback : Accès au Registre Central (Master Console)
          config.headers['x-tenant-id'] = 'elite_master';
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 INTERCEPTEUR DE RÉPONSES (MONITORING SÉCURITÉ)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔒 QUALISOFT KERNEL : Rejet d\'accréditation (Token expiré ou non valide).');
      // Redirection optionnelle gérée côté composant/provider
    }
    if (error.response?.status === 403) {
      console.error('🚫 QUALISOFT KERNEL : Violation de périmètre (Accès refusé au SDE).');
    }
    return Promise.reject(error);
  }
);

export default api;