/**
 * CHEMIN ABSOLU : /frontend/src/core/api/api-client.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Client Axios Elite (Gestion Docker-Switch, Multi-Tenant & Impersonation)
 */

import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { useAuthStore } from '../../store/authStore';

/**
 * 🛰️ DÉTECTION DE L'ENVIRONNEMENT D'EXÉCUTION
 * Indispensable pour l'aiguillage entre le réseau Docker Interne et le Web.
 */
const isServer = typeof window === 'undefined';

const apiClient: AxiosInstance = axios.create({
  // Switch intelligent : Réseau interne Docker (Server-side) vs URL publique (Client-side)
  baseURL: isServer 
    ? 'http://qualisoft-backend:9000/api' 
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 🛡️ INTERCEPTEUR DE REQUÊTE : SCELLAGE DES HEADERS
 * Injecte l'identité de session et l'identité de l'instance (Tenant).
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const { token, tenantId } = useAuthStore.getState();

    // 1. GESTION DU JETON (Priorité au Jeton d'Impersonation Master)
    // Si un master_token est présent en localStorage, il prend le dessus pour le mode souverain.
    const masterToken = !isServer ? localStorage.getItem('master_token') : null;
    const finalToken = masterToken || token;

    if (finalToken && config.headers) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    // 2. INJECTION MULTI-TENANT (Radicale X-Tenant-ID)
    if (tenantId && config.headers) {
      // Compatibilité totale avec les deux variantes de casse
      config.headers['x-tenant-id'] = tenantId;
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (exception: unknown) => {
    return Promise.reject(exception);
  }
);

/**
 * 🛡️ INTERCEPTEUR DE RÉPONSE : GESTIONNAIRE D'AUDIT
 * Capture les ruptures de session et les erreurs système.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (exception: AxiosError) => {
    // Capture des 401 : Déclenchement automatique de la purge de session si configuré
    if (exception.response?.status === 401) {
      // Pour éviter de polluer le store pendant le développement, 
      // l'appel au logout est prêt mais commenté selon tes instructions.
      // useAuthStore.getState().logout();
      
      console.warn('⚠️ Session expirée ou accès régalien révoqué.');
    }

    return Promise.reject(exception);
  }
);

export default apiClient;