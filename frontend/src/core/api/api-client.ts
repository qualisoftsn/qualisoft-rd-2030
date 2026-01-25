// src/core/api/api-client.ts
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api',
});

apiClient.interceptors.request.use((config) => {
  const { token, tenantId } = useAuthStore.getState();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // On envoie le tenantId uniquement s'il existe
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }

  return config;
});

export default apiClient;