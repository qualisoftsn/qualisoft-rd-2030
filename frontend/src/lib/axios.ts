import axios from 'axios';

const api = axios.create({
  // ✅ On utilise la variable d'environnement injectée par Docker/Next.js
  // Si elle n'est pas trouvée, on garde localhost pour le développement local
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:9000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour le token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;