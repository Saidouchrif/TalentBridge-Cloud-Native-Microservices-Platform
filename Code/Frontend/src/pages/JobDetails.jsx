import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm";
import { submitApplication } from "../services/api";

const mockJob = {
  id: 1,
  title: "Développeur Full Stack React/Node.js",
  company: "TalentBridge Inc",
  location: "Paris, France",
  salary: "45k - 60k €",
  contractType: "CDI",
  description: "Rejoignez notre équipe pour développer la prochaine génération de plateforme RH avec microservices cloud native."
};

export default function JobDetails({ jobId }) {
  const [job, setJob] = useState(mockJob);
  const [submitted, setSubmitted] = useState(false);

  const handleApplicationSubmitted = () => {
    setSubmitted(true);
  };

  return (
    <div className="designer-job-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", alignItems: "start" }}>
      
      {/* SECTION GAUCHE : Détails de l'offre */}
      <div className="job-main-content" style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "2.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <div className="job-hero" style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: "2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "12px", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", color: "#64748b" }}>
              {job.company.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>{job.title}</h1>
              <div className="job-meta" style={{ display: "flex", gap: "1rem", color: "#64748b", fontSize: "0.95rem", fontWeight: "500" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>🏢 {job.company}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>📍 {job.location}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#10b981" }}>💰 {job.salary}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "20px", color: "#334155" }}>{job.contractType}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="job-description-body" style={{ color: "#334155", lineHeight: "1.8", fontSize: "1.1rem" }}>
          <h3 style={{ color: "#0f172a", fontSize: "1.3rem", marginBottom: "1rem" }}>À propos du poste</h3>
          <p>{job.description}</p>
        </div>
      </div>

      {/* SECTION DROITE : Panneau de candidature flottant */}
      <div className="job-sidebar-sticky" style={{ position: "sticky", top: "2rem", backgroundColor: "#ffffff", borderRadius: "16px", padding: "2rem", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", borderTop: "4px solid #3b82f6" }}>
        {!submitted ? (
          <>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a", marginBottom: "1.5rem" }}>Postuler maintenant</h3>
            <ApplicationForm jobId={jobId} onSubmitted={handleApplicationSubmitted} />
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
    </div>
  );
}
