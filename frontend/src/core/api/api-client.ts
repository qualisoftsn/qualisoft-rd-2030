import axios from 'axios';

const apiClient = axios.create({
  // ✅ Vérifie que cette variable n'est pas "undefined"
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:9000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter le Token de Pierre Ndiaye
apiClient.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default apiClient;