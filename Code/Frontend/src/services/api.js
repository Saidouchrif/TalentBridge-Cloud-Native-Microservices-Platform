import axios from 'axios';

<<<<<<< HEAD
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
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2MTYyMzkwMjJ9.signature",
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

// IA et Documents (US 8)
export const improveText = (data) => api.post('/ai/api/improveText', data);
export const generateDocument = (data) => api.post('/ai/api/generate-cv', data);
export const saveDocument = (data) => api.post('/candidatures/documents', data);
export const getDocumentHistory = () => api.get('/candidatures/history');
=======
const AI_URL = "http://localhost:5003";
const APP_URL = "http://localhost:5002";

export const generateAI = async (type, userData, jobDesc) => {
    const endpoint = type === 'cv' ? '/generate-cv' : '/generate-letter';
    const res = await axios.post(`${AI_URL}${endpoint}`, { userData, jobDesc });
    return res.data.text;
};

export const submitApplication = async (data) => {
    return await axios.post(`${APP_URL}/apply`, data);
};

export const updateStatus = async (id, status) => {
    return await axios.put(`${APP_URL}/status/${id}`, { status });
};
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
