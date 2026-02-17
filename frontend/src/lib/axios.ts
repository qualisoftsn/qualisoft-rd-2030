import axios from 'axios';

/**
 * CONFIGURATION AXIOS - QUALISOFT RD 2030
 * Instance centralisée avec gestion dynamique du Multi-Tenancy.
 */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.qualisoft.sn/api',
  withCredentials: true,
});

// Intercepteur pour injecter automatiquement le contexte du Tenant
api.interceptors.request.use(
  (config) => {
    // 1. Détection des routes publiques (Liste des tenants, Login, etc.)
    // On ne doit PAS injecter de header spécifique ici pour ne pas bloquer la sélection
    const publicPaths = ['/auth/public', '/auth/login', '/tenants/config'];
    const isPublic = publicPaths.some(path => config.url?.includes(path));

    if (!isPublic) {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');

        // Extraction du sous-domaine (ex: 'pad' depuis 'pad.qualisoft.sn')
        const subdomain = parts.length > 2 ? parts[0] : null;

        if (subdomain && subdomain !== 'localhost' && subdomain !== 'www' && subdomain !== 'elite') {
          config.headers['x-tenant-id'] = subdomain;
        } else {
          // Par défaut pour l'administration centrale
          config.headers['x-tenant-id'] = 'elite';
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour la gestion globale des erreurs (401, 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔐 Session expirée ou accès non autorisé.');
      // Optionnel : Redirection vers le login du tenant actuel
    }
    return Promise.reject(error);
  }
);

export default api;