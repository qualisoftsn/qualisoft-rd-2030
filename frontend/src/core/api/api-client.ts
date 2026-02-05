import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const apiClient = axios.create({
  // ON FORCE L'URL ICI POUR LE TEST FINAL
  baseURL: 'https://api.qualisoft.sn/api', 
});

apiClient.interceptors.request.use((config) => {
  const { token, tenantId } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }
  return config;
});

export default apiClient;