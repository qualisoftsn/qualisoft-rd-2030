import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { useAuthStore } from '../../store/authStore';

const isServer = typeof window === 'undefined';

const apiClient: AxiosInstance = axios.create({
  // PRIORITÉ : Variable d'environnement de production
  baseURL: isServer 
    ? 'http://qualisoft-backend:9000/api' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://api.qualisoft.sn/api'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const { token, tenantId } = useAuthStore.getState();
    const masterToken = !isServer ? localStorage.getItem('master_token') : null;
    const finalToken = masterToken || token;

    if (finalToken && config.headers) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    if (tenantId && config.headers) {
      config.headers['x-tenant-id'] = tenantId;
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Session expirée ou accès régalien révoqué.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;