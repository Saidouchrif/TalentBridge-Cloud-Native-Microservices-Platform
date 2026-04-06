import React from "react";
import { NavLink, Navigate, Route, Routes, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobDetails from "./pages/JobDetails";
import MyApplications from "./pages/MyApplications";
import AiGeneratorPage from "./pages/AiGeneratorPage";

// FIX AUTOMATIQUE : مسح التوكين الخاسر باش الصفحة ما تبقاش بيضا
try {
  const t = localStorage.getItem('token');
  if (t && !t.includes('.')) { 
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
} catch(e) {}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  const { logout, user } = useAuth();

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-logo" aria-hidden>TB</span>
          <div>
            <h1 className="app-title">TalentBridge</h1>
            <p className="app-subtitle">Candidatures · Postuler et suivre vos dossiers</p>
          </div>
        </div>
        <nav className="app-nav">
          <NavLink to="/postuler" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Nouvelle Candidature
          </NavLink>
          <NavLink to="/candidatures" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Mes candidatures
          </NavLink>
          <NavLink to="/gestion-candidatures" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Gestion (RH)
          </NavLink>
          <NavLink to="/ia" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Outils IA
          </NavLink>
          <button onClick={logout} className="logout-btn">Déconnexion</button>
        </nav>
      </header>
      <section className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Navigate to="/candidatures" replace /></ProtectedRoute>} />
          <Route path="/postuler" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
          <Route path="/candidatures" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="/gestion-candidatures" element={<ProtectedRoute><MyApplications canManageStatus /></ProtectedRoute>} />
          <Route path="/ia" element={<ProtectedRoute><AiGeneratorPage /></ProtectedRoute>} />
        </Routes>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
