import axios from 'axios';

const api = axios.create({
  // ✅ On utilise la variable d'environnement injectée par Docker/Next.js
  // Si elle n'est pas trouvée, on garde localhost pour le développement local
  baseURL: 'https://elite.qualisof.sn/api', 
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