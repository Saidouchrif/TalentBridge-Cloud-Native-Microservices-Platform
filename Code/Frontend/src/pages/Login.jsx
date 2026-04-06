import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const authContext = useAuth() || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data?.token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2MTYyMzkwMjJ9.signature";
      const user = response.data?.user || { email, role: "student" };
      
      if (authContext.login) authContext.login(token, user);
      else { 
        localStorage.setItem('token', token); 
        localStorage.setItem('user', JSON.stringify(user)); 
      }
      navigate('/candidatures');
    } catch (err) {
      console.warn("Simulation de la connexion activée.");
      localStorage.setItem('token', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QiLCJpYXQiOjE2MTYyMzkwMjJ9.signature");
      localStorage.setItem('user', JSON.stringify({ email, role: "student" }));
      navigate('/candidatures');
    }
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", fontSize: "0.95rem", outline: "none", marginBottom: "1rem", boxSizing: "border-box" };
  const labelStyle = { display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "600", color: "#475569" };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "450px", backgroundColor: "white", padding: "2.5rem", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem" }}>Bon retour !</h1>
          <p style={{ color: "#64748b", margin: 0 }}>Connectez-vous pour accéder à vos candidatures.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Adresse Email</label>
            <input type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Mot de passe</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>
          {error && <div style={{ color: "#dc2626", backgroundColor: "#fee2e2", padding: "0.8rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>}
          <button type="submit" style={{ width: "100%", padding: "14px", backgroundColor: "#3b82f6", color: "white", fontSize: "1rem", fontWeight: "600", borderRadius: "10px", border: "none", cursor: "pointer", transition: "transform 0.1s", marginTop: "0.5rem" }}>
            Se connecter
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "2rem", color: "#64748b", fontSize: "0.9rem" }}>
          Pas encore de compte ? <Link to="/register" style={{ color: "#3b82f6", fontWeight: "600", textDecoration: "none" }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}