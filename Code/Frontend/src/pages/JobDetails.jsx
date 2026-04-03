import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm";
import { getJobDetails } from "../services/api";

export default function JobDetails({ jobId }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadJob() {
      if (!jobId) {
        setError("Aucune offre sélectionnée.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await getJobDetails(jobId);
        if (active) setJob(data);
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Impossible de charger l'offre.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadJob();
    return () => {
      active = false;
    };
  }, [jobId, refreshKey]);

  if (loading) {
    return (
      <div className="tb-loading" role="status" aria-live="polite">
        <span className="tb-spinner" aria-hidden />
        Chargement de l’offre…
      </div>
    );
  }

  if (error) {
    return <p className="tb-page-error">{error}</p>;
  }

  if (!job) {
    return <p className="tb-page-error">Offre introuvable.</p>;
  }

  return (
    <div className="job-layout">
      <article className="job-card">
        <div className="job-card-header">
          <h2>{job.title || "Offre"}</h2>
          <div className="job-meta">
            <span>{job.company || "Entreprise"}</span>
            <span className="job-meta-sep" aria-hidden>
              ·
            </span>
            <span>{job.location || "Localisation non précisée"}</span>
          </div>
        </div>
        <div className="job-card-body">
          <p className="job-description">
            {job.description || "Description non disponible."}
          </p>
          <p style={{ margin: "1rem 0 0", fontSize: "0.85rem", color: "var(--tb-muted)" }}>
            <Link to="/candidatures" style={{ color: "var(--tb-accent)", fontWeight: 600 }}>
              Voir mes candidatures
            </Link>
          </p>
        </div>
      </article>

      <ApplicationForm jobId={jobId} onSubmitted={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
