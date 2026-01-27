import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { useAuthStore } from '../store/authStore';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes pour gérer les gros imports
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================================================
// INTERCEPTOR REQUÊTE
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Récupération synchrone de l'état Zustand (évite les re-renders)
    const { token, tenantId } = useAuthStore.getState();

    // 1. Authentification Bearer
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Multi-tenancy (votre backend attend ce header)
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    // 3. Correlation ID pour le tracing (debugging multi-services)
    config.headers['x-request-id'] = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    config.headers['x-client-version'] = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

    // 4. Gestion automatique du FormData (upload fichiers)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Le browser définit le boundary automatiquement
    }

    // 5. Logging développement
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚀 API ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Tenant:', tenantId || 'none');
      console.log('Auth:', token ? '✅' : '❌');
      console.log('Request ID:', config.headers['x-request-id']);
      console.groupEnd();
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// INTERCEPTOR RÉPONSE & GESTION ERREURS
// ============================================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log succès en dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Erreur réseau (serveur down, CORS, etc.)
    if (!error.response) {
      console.error('[API Network Error]', error.message);
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Erreur réseau. Vérifiez votre connexion ou que le serveur backend est accessible.',
      });
    }

    const { status, data } = error.response;
    const errorMessage = (data as any)?.message || (data as any)?.error;

    switch (status) {
      case 401:
        // Token expiré ou invalide
        if (!originalRequest._retry && typeof window !== 'undefined') {
          console.warn('🔒 Session expirée (401), déconnexion...');
          
          // Déconnexion propre via Zustand
          const { logout } = useAuthStore.getState();
          if (logout) {
            logout();
            // Redirection douce vers login avec return URL
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/auth/')) {
              window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
            }
          }
        }
        return Promise.reject({
          status: 401,
          message: errorMessage || 'Session expirée. Veuillez vous reconnecter.',
          isAuthError: true,
        });

      case 403:
        // Permissions insuffisantes ou subscription inactive
        return Promise.reject({
          status: 403,
          message: errorMessage || 'Accès refusé. Vérifiez vos permissions ou votre abonnement.',
          isForbidden: true,
        });

      case 404:
        return Promise.reject({
          status: 404,
          message: errorMessage || 'Ressource introuvable.',
        });

      case 409:
        // Conflit (doublon, etc.)
        return Promise.reject({
          status: 409,
          message: errorMessage || 'Conflit détecté. Cette ressource existe peut-être déjà.',
        });

      case 422:
        // Erreurs de validation
        return Promise.reject({
          status: 422,
          message: errorMessage || 'Données invalides.',
          validationErrors: (data as any)?.errors || [],
        });

      case 429:
        // Rate limiting
        return Promise.reject({
          status: 429,
          message: 'Trop de requêtes. Veuillez patienter quelques instants.',
        });

      case 500:
      case 502:
      case 503:
        return Promise.reject({
          status,
          message: 'Erreur serveur. Notre équipe technique a été notifiée automatiquement.',
          isServerError: true,
        });

      default:
        return Promise.reject({
          status,
          message: errorMessage || `Erreur ${status}`,
        });
    }
  }
);

// ============================================================================
// UTILITAIRES EXPORTÉS (Valeur Ajoutée)
// ============================================================================

/**
 * Crée un token d'annulation pour les requêtes (utile dans useEffect/unmount)
 * Usage: const source = createCancelToken(); apiClient.get('/url', { cancelToken: source.token });
 */
export const createCancelToken = () => axios.CancelToken.source();

/**
 * Helper pour les uploads avec barre de progression
 * @param url - Endpoint d'upload
 * @param formData - Instance FormData
 * @param onProgress - Callback (0-100)
 */
export const uploadWithProgress = (
  url: string, 
  formData: FormData, 
  onProgress?: (percentage: number) => void
) => {
  return apiClient.post(url, formData, {
    headers: { 
      // Important : ne pas définir Content-Type, Axios le fera avec le boundary correct
      'Content-Type': 'multipart/form-data' 
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(percent);
      }
    },
  });
};

/**
 * Helper pour les téléchargements de fichiers (PDF, Excel...)
 * @param url - Endpoint
 * @param filename - Nom suggéré du fichier
 */
export const downloadFile = async (url: string, filename: string) => {
  const response = await apiClient.get(url, {
    responseType: 'blob',
  });
  
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
  
  return response;
};

export default apiClient;