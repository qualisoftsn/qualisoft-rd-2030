import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

/**
 * 🛰️ API CLIENT ELITE
 * Gère la bascule automatique entre le réseau Docker (Server-side) 
 * et le réseau Localhost (Client-side).
 */

const isServer = typeof window === 'undefined';

const apiClient = axios.create({
  // Si on est sur le serveur (NextAuth/SSR), on utilise le nom du service Docker
  // Sinon, on utilise l'URL publique accessible par le navigateur
  baseURL: isServer 
    ? 'http://qualisoft-backend:9000/api' 
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api'),
  withCredentials: true,
});

// Intercepteur pour injecter les headers de sécurité Multi-Tenant
apiClient.interceptors.request.use((config) => {
  const { token, tenantId } = useAuthStore.getState();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    // On injecte les deux variantes pour une compatibilité totale
    config.headers['x-tenant-id'] = tenantId;
    config.headers['X-Tenant-ID'] = tenantId;
  }

  return config;
});

/**
 * Gestionnaire d'erreurs global (Optionnel mais recommandé)
 * Permet de capturer les 401 pour déclencher un logout propre
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optionnel : déconnexion automatique si le token expire
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;