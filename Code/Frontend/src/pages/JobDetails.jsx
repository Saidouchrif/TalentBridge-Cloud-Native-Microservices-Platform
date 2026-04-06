import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm";
<<<<<<< HEAD

export default function JobDetails() {
  const [submitted, setSubmitted] = useState(false);

  const handleApplicationSubmitted = () => {
    setSubmitted(true);
  };

  return (
    <div className="designer-job-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <div className="job-hero" style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: "2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "12px", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
              📝
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>Nouvelle Candidature</h1>
              <div className="job-meta" style={{ display: "flex", gap: "1rem", color: "#64748b", fontSize: "0.95rem", fontWeight: "500" }}>
                Saisissez les informations de l'entreprise et du poste (TCNMP-230)
              </div>
            </div>
          </div>
        </div>

        {!submitted ? (
          <>
            <ApplicationForm jobId={1} onSubmitted={handleApplicationSubmitted} />
          </>
        ) : (
          <div className="success-message" style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h3 style={{ color: "#10b981", fontSize: "1.4rem", marginBottom: "1rem" }}>Candidature envoyée avec succès !</h3>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>Notre équipe RH reviendra vers vous très prochainement.</p>
            <Link to="/candidatures" style={{ display: "inline-block", backgroundColor: "#3b82f6", color: "white", padding: "0.8rem 1.5rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", transition: "background 0.2s" }}>
              Suivre mes candidatures
            </Link>
          </div>
        )}
=======
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
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
    </div>
  );
}
