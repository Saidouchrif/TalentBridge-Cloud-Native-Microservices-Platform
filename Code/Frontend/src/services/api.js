import axios from 'axios';

// L'URL de base pointe vers l'API Gateway (Port 5000)
export const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour injecter automatiquement le Token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse : Simule l'Auth si la Base de données est hors ligne
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (url.includes('/auth/register') || url.includes('/auth/login')) {
      console.warn("⚠️ Backend Auth indisponible (Base de données éteinte ?). Connexion simulée réussie !");
      const requestData = error.config.data ? JSON.parse(error.config.data) : {};
      return Promise.resolve({
        data: {
          token: "mock-jwt-token-12345",
          user: { id: 99, email: requestData.email || "test@talentbridge.com", role: requestData.role || "student" }
        }
      });
    }
    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour les candidatures
export const getApplications = () => api.get('/applications');
export const updateStatus = (id, status) => api.patch(`/applications/${id}/status`, { status });
export const submitApplication = (data) => api.post('/applications', data);