// Composant principal React : route vers les pages offres
import React from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";

import OffersPage from "./pages/OffersPage.jsx";

export default function App() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", fontFamily: "system-ui" }}>
      <header style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: "#007bff" }}>TalentBridge - Offres</h1>
          <p style={{ marginTop: 6, marginBottom: 0, color: "#555" }}>
            Plateforme de gestion des offres d'emploi et candidatures
          </p>
        </div>
      </header>

      <nav style={{ marginBottom: 24 }}>
        <Link 
          to="/" 
          style={{ 
            color: "#007bff", 
            textDecoration: "none", 
            marginRight: 16,
            fontWeight: "bold"
          }}
        >
          💼 Offres
        </Link>
        <button 
          type="button" 
          onClick={() => navigate("/")} 
          style={{ 
            cursor: "pointer",
            padding: "8px 16px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: 4
          }}
        >
          🏠 Accueil
        </button>
        <Link 
          to="/entreprises" 
          target="_blank"
          style={{ 
            marginLeft: 16,
            color: "#6c757d", 
            textDecoration: "none"
          }}
        >
          🏢 Voir les entreprises (service séparé)
        </Link>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<OffersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
