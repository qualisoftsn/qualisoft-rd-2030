import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../store/authStore';

const isServer = typeof window === 'undefined';

const apiClient: AxiosInstance = axios.create({
  baseURL: isServer 
    ? 'http://qualisoft-backend:9000/api' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://api.qualisoft.sn/api'),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const { token, tenantId } = useAuthStore.getState();
    const masterToken = !isServer ? localStorage.getItem('master_token') : null;
    const finalToken = masterToken || token;

    if (finalToken && config.headers) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    // 🛰️ DÉTECTION DYNAMIQUE DU SOUS-DOMAINE
    if (!isServer && config.headers) {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'elite') {
        config.headers['x-tenant-domain'] = parts[0]; // ex: "sde"
      }
    }

    if (tenantId && config.headers) {
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;