import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { useAuthStore } from '../store/authStore';

// ============================================================================
// CONFIGURATION & SANITIZATION
// ============================================================================

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api').replace(/\/+$/, '');

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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
    const state = useAuthStore.getState();
    const token = state?.token;
    const tenantId = state?.tenantId;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    config.headers['x-request-id'] = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    config.headers['x-client-version'] = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ============================================================================
// INTERCEPTOR RÉPONSE & GESTION DES ERREURS
// ============================================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (!error.response) {
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Serveur backend injoignable.',
      });
    }

    const { status, data } = error.response;
    const errorMessage = (data as any)?.message || (data as any)?.error;

    switch (status) {
      case 401:
        if (!originalRequest._retry && typeof window !== 'undefined') {
          // 🟢 CORRECTION LIGNE 104 : Vérification sécurisée de la fonction logout
          const state = useAuthStore.getState();
          
          if (state && typeof (state as any).logout === 'function') {
            (state as any).logout();
            
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/auth/')) {
              window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
            }
          } else {
            console.error("[API] La fonction logout n'est pas définie dans le store.");
          }
        }
        return Promise.reject({
          status: 401,
          message: errorMessage || 'Session expirée.',
          isAuthError: true,
        });

      case 403:
        return Promise.reject({ status: 403, message: 'Accès refusé.', isForbidden: true });

      case 404:
        return Promise.reject({ status: 404, message: 'Ressource introuvable.' });

      case 422:
        return Promise.reject({
          status: 422,
          message: 'Données invalides.',
          validationErrors: (data as any)?.errors || [],
        });

      default:
        return Promise.reject({ status, message: errorMessage || `Erreur ${status}` });
    }
  }
);

// ============================================================================
// UTILITAIRES
// ============================================================================

export const createCancelToken = () => axios.CancelToken.source();

export const uploadWithProgress = (
  url: string, 
  formData: FormData, 
  onProgress?: (percentage: number) => void
) => {
  return apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(percent);
      }
    },
  });
};

export const downloadFile = async (url: string, filename: string) => {
  const response = await apiClient.get(url, { responseType: 'blob' });
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