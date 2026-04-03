import React from "react";
import { NavLink, Navigate, Route, Routes, useParams } from "react-router-dom";
import JobDetails from "./pages/JobDetails";
import MyApplications from "./pages/MyApplications";

function JobDetailsRoute() {
  const { id } = useParams();
  return <JobDetails jobId={id} />;
}

export default function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-logo" aria-hidden>
            TB
          </span>
          <div>
            <h1 className="app-title">TalentBridge</h1>
            <p className="app-subtitle">Candidatures · Postuler et suivre vos dossiers</p>
          </div>
        </div>
        <nav className="app-nav" aria-label="Navigation principale">
          <NavLink to="/offres/1" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Postuler
          </NavLink>
          <NavLink
            to="/candidatures"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Mes candidatures
          </NavLink>
          <NavLink
            to="/gestion-candidatures"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Gestion (RH)
          </NavLink>
        </nav>
      </header>

      <section className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/offres/1" replace />} />
          <Route path="/offres/:id" element={<JobDetailsRoute />} />
          <Route path="/candidatures" element={<MyApplications />} />
          <Route path="/gestion-candidatures" element={<MyApplications canManageStatus />} />
        </Routes>
      </section>
    </main>
  );
}
