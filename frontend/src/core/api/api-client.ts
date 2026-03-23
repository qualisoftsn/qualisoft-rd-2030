/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

// ============================================================================
// CONFIGURATION AXIOS
// ============================================================================

const apiClient = axios.create({
  // ✅ CORRECTION CRITIQUE : Suppression des espaces dans l'URL
  baseURL: 'https://api.qualisoft.sn/api',
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json', 
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json'
  },
  timeout: 30000,
  // ✅ CORS : Gestion des credentials cross-origin
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// ============================================================================
// INTERCEPTEUR DE REQUÊTE
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ ACCÈS SÉCURISÉ AU STORE HORS COMPOSANT
    const authState = useAuthStore.getState();
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const slug = hostname.split('.')[0]?.toLowerCase() || 'app';
    
    // Injection du token Bearer si présent
    if (authState?.token) {
      config.headers.Authorization = `Bearer ${authState.token}`;
    }
    
    // Injection du Tenant ID depuis le sous-domaine
    const MASTER_NODES = ['www', 'app', 'elite', 'localhost', 'matrix', 'admin', 'qs'];
    const tenantId = MASTER_NODES.includes(slug) ? 'elite' : slug;
    config.headers['X-Tenant-Id'] = tenantId;
    
    // User-Agent pour le logging backend (optionnel)
    if (typeof navigator !== 'undefined' && !config.headers['X-User-Agent']) {
      config.headers['X-User-Agent'] = navigator.userAgent;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Erreur interception requête:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// INTERCEPTEUR DE RÉPONSE
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    // ✅ Succès : retour direct des données (axios unwrap data automatiquement)
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // ✅ GESTION 401 : Déconnexion auto + redirection
    if (status === 401 && !config?.headers?.['X-Skip-Interceptor']) {
      console.warn('⚠️ Session expirée ou token invalide - Déconnexion forcée');
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        // Logout via le store Zustand
        useAuthStore.getState().logout();
        
        // Redirection avec paramètre de contexte
        const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth/login?session=expired&redirect=${currentPath}`;
      }
    }
    
    // ✅ GESTION 403 : Permissions insuffisantes (logging uniquement)
    if (status === 403) {
      console.warn('⚠️ Accès refusé : permissions insuffisantes pour', config?.url);
      // Optionnel : toast.error("Accès refusé. Contactez votre administrateur.");
    }
    
    // ✅ GESTION 404 : Endpoint non trouvé
    if (status === 404) {
      console.error('❌ Endpoint non trouvé:', config?.url);
    }
    
    // ✅ GESTION 500/502/503 : Erreurs serveur
    if (status && status >= 500) {
      console.error('❌ Erreur serveur:', status, error.response?.data);
      // Optionnel : toast.error("Erreur serveur. Réessayez ultérieurement.");
    }
    
    // ✅ REJET STANDARD : Propagation de l'erreur pour gestion locale
    return Promise.reject(error);
  }
);

// ============================================================================
// EXPORT
// ============================================================================

export default apiClient;

// ============================================================================
// TYPES UTILITAIRES (pour tes pages)
// ============================================================================

export type ApiResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: InternalAxiosRequestConfig;
};

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
  timestamp?: string;
};