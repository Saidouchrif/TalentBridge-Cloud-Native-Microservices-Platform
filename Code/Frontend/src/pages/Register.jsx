import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', { email, password, role });
      login(response.data.token, response.data.user);
      navigate('/offres/1');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-page">
      <div className="login-card">
        <h1>Inscription TalentBridge</h1>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Étudiant</option>
            <option value="company">Entreprise</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">S'inscrire</button>
          {error && <p className="error">{error}</p>}
        </form>
        <p>Déjà inscrit? <a href="/login">Se connecter</a></p>
      </div>
    </div>
  );
}
