import axios from 'axios';

const api = axios.create({
  // Utilise bien des guillemets simples ou doubles ici
  baseURL: 'http://localhost:9000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour le token (Optionnel pour l'instant mais utile)
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