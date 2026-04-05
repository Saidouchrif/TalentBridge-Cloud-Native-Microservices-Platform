import React from "react";
import { NavLink, Navigate, Route, Routes, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import JobDetails from "./pages/JobDetails";
import MyApplications from "./pages/MyApplications";

function JobDetailsRoute() {
  const { id } = useParams();
  return <JobDetails jobId={id} />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
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
          <NavLink to="/offres/1" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Postuler
          </NavLink>
          <NavLink to="/candidatures" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Mes candidatures
          </NavLink>
          <NavLink to="/gestion-candidatures" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Gestion (RH)
          </NavLink>
          <button onClick={logout} className="logout-btn">Déconnexion</button>
        </nav>
      </header>
      <section className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Navigate to="/offres/1" replace /></ProtectedRoute>} />
          <Route path="/offres/:id" element={<ProtectedRoute><JobDetailsRoute /></ProtectedRoute>} />
          <Route path="/candidatures" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="/gestion-candidatures" element={<ProtectedRoute><MyApplications canManageStatus /></ProtectedRoute>} />
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
