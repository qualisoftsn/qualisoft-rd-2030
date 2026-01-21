import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * CONFIGURATION PRODUCTION ELITE - OVH
 * Point d'accès centralisé pour toutes les requêtes vers le conteneur qualisoft-backend
 */
const apiClient = axios.create({
  baseURL: 'https://elite.qualisoft.sn/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour l'injection automatique des credentials
apiClient.interceptors.request.use(
  async (config) => {
    const { token, tenantId } = useAuthStore.getState();

    // Authentification JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Isolation des données par organisation (Multi-tenant)
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;