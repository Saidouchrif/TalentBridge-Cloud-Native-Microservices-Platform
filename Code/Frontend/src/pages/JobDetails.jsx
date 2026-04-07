import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm";

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
    </div>
  );
}
