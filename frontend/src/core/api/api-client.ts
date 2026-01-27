import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const apiClient = axios.create({
  // Si ton .env ne contient pas la bonne URL, on force le port 9000
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api',
});

apiClient.interceptors.request.use((config) => {
  const { token, tenantId } = useAuthStore.getState();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ On envoie le tenantId avec la clé attendue par le backend
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }

  return config;
});

export default apiClient;