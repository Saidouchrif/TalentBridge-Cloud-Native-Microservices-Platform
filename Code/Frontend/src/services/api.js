import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_GATEWAY = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_GATEWAY,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const generateAI = async (type, userData, jobDesc, company) => {
  const endpoint = `/ai/api/generate-${type === 'cv' ? 'cv' : 'letter'}`;
  const res = await api.post(endpoint, { userData, jobDesc, company });
  return res.data;
};

export const submitApplication = async (data) => {
  return await api.post('/candidatures/apply', data);
};

export const updateStatus = async (id, status) => {
  return await api.put(`/candidatures/status/${id}`, { status });
};

export const getApplications = async () => {
  return await api.get('/candidatures/history');
};
