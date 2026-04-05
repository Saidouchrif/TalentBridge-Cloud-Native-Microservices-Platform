import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
// Hna khtar l-functions li khdam bihom nit (ghaliban hado li l-teht)
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

  if (loading) {
    return (
      <div className="tb-loading">
        Chargement...
      </div>
    );
  }

  return (
    <section>
      <header className="cand-page-header">
        <h2>{canManageStatus ? "Gestion des candidatures" : "Mes candidatures"}</h2>
      </header>

      {error && <p className="error">{error}</p>}

      {isEmpty ? (
        <div className="empty-state">
          <h3>Aucune candidature</h3>
          <Link to="/offres/1">Postuler</Link>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map((app) => (
            <div key={app.id} className="app-card">
              <h4>{app.job_title}</h4>
              <p>{app.company_name}</p>
              <StatusBadge status={app.status} />
              {canManageStatus && (
                <select onChange={(e) => handleStatusChange(app.id, e.target.value)} value={app.status}>
                  {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}