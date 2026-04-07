import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApplications, updateStatus } from "../services/api";

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "reviewing", label: "En cours" },
  { value: "accepted", label: "Acceptée" },
  { value: "rejected", label: "Refusée" },
];

function formatAppliedAt(value) {
  if (!value) return null;
  try {
    const d = new Date(value);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

// Nouveau composant Badge Design intégré
function DesignerBadge({ status }) {
  const statusStyles = {
    pending: { bg: "#fef3c7", color: "#d97706", label: "En attente", icon: "⏳" },
    reviewing: { bg: "#e0e7ff", color: "#2563eb", label: "En cours", icon: "👀" },
    accepted: { bg: "#d1fae5", color: "#059669", label: "Acceptée", icon: "🎉" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "Refusée", icon: "❌" },
  };
  const style = statusStyles[status?.toLowerCase()] || statusStyles.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: style.bg, color: style.color, padding: "0.4rem 0.8rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.5px" }}>
      {style.icon} {style.label}
    </span>
  );
}

export default function MyApplications({ canManageStatus = false }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function fetchApplications() {
    setLoading(true);
    setError("");
    try {
      const { data } = await getApplications(); // Khdam b getApplications
      setApplications(data || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Impossible de charger les candidatures.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  const isEmpty = useMemo(() => !loading && applications.length === 0, [loading, applications]);

  async function handleStatusChange(applicationId, status) {
    setUpdatingId(applicationId);
    setError("");
    try {
      await updateStatus(applicationId, status); // Khdam b updateStatus
      fetchApplications(); 
    } catch (updateError) {
      setError(updateError.response?.data?.message || "Impossible de mettre à jour.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Statistiques pour le Dashboard
  const stats = useMemo(() => {
    return { total: applications.length, accepted: applications.filter(a => a.status?.toLowerCase() === 'accepted').length, pending: applications.filter(a => a.status?.toLowerCase() === 'pending').length };
  }, [applications]);

  if (loading) {
    return (
      <div className="tb-loading" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", fontSize: "1.2rem", color: "#64748b" }}>
        <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #3b82f6", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", marginRight: "1rem" }} />
        Chargement de votre espace...
      </div>
    );
  }

  return (
    <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      {/* HEADER DASHBOARD */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "2px solid #f1f5f9" }}>
        <div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>
            {canManageStatus ? "Talent CRM (RH)" : "Mon Espace Candidat"}
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.1rem", margin: 0 }}>
            {canManageStatus ? "Gérez le vivier de talents de l'entreprise." : "Suivez l'évolution de vos opportunités de carrière."}
          </p>
        </div>
      </header>

      {/* CARTES DE STATISTIQUES */}
      {!isEmpty && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", borderLeft: "4px solid #3b82f6" }}>
            <p style={{ margin: 0, color: "#64748b", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase" }}>Total Dossiers</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: "800", color: "#0f172a" }}>{stats.total}</p>
          </div>
          <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", borderLeft: "4px solid #10b981" }}>
            <p style={{ margin: 0, color: "#64748b", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase" }}>Offres Acceptées</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: "800", color: "#0f172a" }}>{stats.accepted}</p>
          </div>
          <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", borderLeft: "4px solid #f59e0b" }}>
            <p style={{ margin: 0, color: "#64748b", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase" }}>En Attente</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "2rem", fontWeight: "800", color: "#0f172a" }}>{stats.pending}</p>
          </div>
        </div>
      )}

      {error && <div style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "1rem", borderRadius: "8px", marginBottom: "2rem", fontWeight: "500" }}>{error}</div>}

      {isEmpty ? (
        <div className="empty-state" style={{ textAlign: "center", padding: "5rem 2rem", backgroundColor: "#f8fafc", borderRadius: "24px", border: "2px dashed #cbd5e1" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🚀</div>
          <h3 style={{ fontSize: "1.5rem", color: "#0f172a", marginBottom: "1rem" }}>Votre aventure commence ici</h3>
          <p style={{ color: "#64748b", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem" }}>Vous n'avez pas encore envoyé de candidatures. Découvrez nos offres et propulsez votre carrière.</p>
          <Link to="/offres/1" style={{ display: "inline-block", backgroundColor: "#0f172a", color: "white", padding: "1rem 2rem", borderRadius: "12px", textDecoration: "none", fontWeight: "600", transition: "transform 0.2s" }}>Explorer les offres</Link>
        </div>
      ) : (
        <div className="applications-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
          {applications.map((app) => (
            <div key={app.id} className="app-card" style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s", position: "relative", overflow: "hidden" }}>
              {/* Ligne décorative en haut de la carte */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "#0f172a", fontWeight: "700" }}>{app.job_title}</h4>
                  <p style={{ margin: 0, color: "#64748b", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    🏢 {app.company_name}
                  </p>
                </div>
              </div>
              
              <div style={{ marginBottom: "2rem" }}>
                <DesignerBadge status={app.status} />
                <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                  Postulé le {formatAppliedAt(app.created_at || new Date())}
                </div>
              </div>

              {canManageStatus && (
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#64748b", marginBottom: "0.5rem" }}>Modifier le statut :</label>
                  <select 
                    onChange={(e) => handleStatusChange(app.id, e.target.value)} 
                    value={app.status?.toLowerCase() || 'pending'}
                    style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#0f172a", fontWeight: "600", cursor: "pointer", outline: "none" }}
                  >
                  {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
