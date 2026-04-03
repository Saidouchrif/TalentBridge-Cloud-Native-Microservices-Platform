import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { getMyApplications, updateApplicationStatus } from "../services/api";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "REVIEWING", label: "En cours d’examen" },
  { value: "ACCEPTED", label: "Acceptée" },
  { value: "REJECTED", label: "Refusée" },
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

export default function MyApplications({ candidateId, canManageStatus = false }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function fetchApplications() {
    setLoading(true);
    setError("");
    try {
      const data = await getMyApplications(candidateId);
      setApplications(Array.isArray(data) ? data : data?.items || []);
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger les candidatures.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, [candidateId]);

  const isEmpty = useMemo(() => !loading && applications.length === 0, [loading, applications]);

  async function handleStatusChange(applicationId, status) {
    setUpdatingId(applicationId);
    setError("");
    try {
      const updated = await updateApplicationStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((item) =>
          String(item.id) === String(applicationId)
            ? { ...item, ...updated, status }
            : item
        )
      );
    } catch (updateError) {
      setError(updateError.message || "Impossible de mettre à jour le statut.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="tb-loading" role="status" aria-live="polite">
        <span className="tb-spinner" aria-hidden />
        Chargement de vos candidatures…
      </div>
    );
  }

  return (
    <section>
      <header className="cand-page-header">
        <h2>{canManageStatus ? "Gestion des candidatures" : "Mes candidatures"}</h2>
        <p>
          {canManageStatus
            ? "Mettez à jour le statut des candidatures reçues."
            : "Suivez l’état de vos candidatures en un coup d’œil."}
        </p>
      </header>

      {error ? <p className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</p> : null}

      {isEmpty ? (
        <div className="tb-empty">
          <h3>Aucune candidature pour le moment</h3>
          <p>
            Parcourez les offres et postulez en quelques minutes.{" "}
            <Link to="/offres/1" style={{ color: "var(--tb-accent)", fontWeight: 600 }}>
              Voir une offre
            </Link>
          </p>
        </div>
      ) : null}

      <div className="cand-grid">
        {applications.map((application) => {
          const applied = formatAppliedAt(application.createdAt || application.created_at);
          return (
            <article key={application.id} className="cand-card">
              <div className="cand-card-top">
                <div>
                  <h3 className="cand-card-title">{application.jobTitle || "Offre"}</h3>
                  <p className="cand-card-sub">
                    {application.company || "Entreprise"} · {application.location || "—"}
                  </p>
                  {applied ? (
                    <p className="cand-card-date">Candidature envoyée le {applied}</p>
                  ) : null}
                </div>
                <StatusBadge status={application.status} />
              </div>

              {canManageStatus ? (
                <div className="cand-status-row">
                  <span className="cand-status-label">Statut</span>
                  <select
                    className="cand-select"
                    value={(application.status || "PENDING").toUpperCase()}
                    disabled={updatingId === application.id}
                    onChange={(event) =>
                      handleStatusChange(application.id, event.target.value)
                    }
                    aria-label="Changer le statut de la candidature"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
