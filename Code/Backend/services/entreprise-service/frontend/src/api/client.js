// Client HTTP (Axios) pour appeler l'API REST du microservice.
import axios from "axios";

// Base URL: pointe vers le backend entreprise-service sur le port 5002
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002"
});

export function authHeader(token) {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export default api;

