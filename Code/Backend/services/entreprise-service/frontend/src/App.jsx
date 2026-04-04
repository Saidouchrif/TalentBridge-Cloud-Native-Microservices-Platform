// Composant principal React : route vers les pages entreprises/offres
import React from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";

import EnterprisesPage from "./pages/EnterprisesPage.jsx";
import OffersPage from "./pages/OffersPage.jsx";

export default function App() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", fontFamily: "system-ui" }}>
      <header style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: "#007bff" }}>TalentBridge - Entreprises</h1>
          <p style={{ marginTop: 6, marginBottom: 0, color: "#555" }}>
            Plateforme de gestion d'entreprises et d'offres de stage
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
          🏢 Entreprises
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
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<EnterprisesPage />} />
          <Route path="/entreprises/:enterpriseId/offers" element={<OffersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

