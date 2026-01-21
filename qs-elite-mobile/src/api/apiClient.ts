import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: 'https://elite.qualisoft.sn/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const state = useAuthStore.getState();
  const token = state?.token;
  const tenantId = state?.tenantId;

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId;

  return config;
}, (error) => Promise.reject(error));

export default apiClient;