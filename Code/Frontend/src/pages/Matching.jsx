import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Matching() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de l'appel API vers le microservice de Matching
    // À remplacer par : const { data } = await api.get('/matching/candidate/me');
    setTimeout(() => {
      setMatches([
        { id: 1, title: "Développeur Fullstack Node/React", company: "TechCorp", score: 95, location: "Paris (Hybride)" },
        { id: 2, title: "Ingénieur DevOps Cloud Native", company: "CloudInnov", score: 88, location: "Lyon (Remote)" },
        { id: 3, title: "Développeur Frontend Confirmé", company: "WebStudio", score: 75, location: "Nantes" }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "2.5rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>🎯 Smart Matching</h2>
        <p style={{ color: "#64748b", fontSize: "1.1rem", margin: 0 }}>
          Découvrez les offres qui correspondent le mieux à vos compétences grâce à notre algorithme d'IA.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#64748b", fontSize: "1.1rem" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          Analyse de votre profil et calcul des correspondances...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
          {matches.map((match) => (
            <div key={match.id} style={{ backgroundColor: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", position: "relative" }}>
              <div style={{ position: "absolute", top: "-15px", right: "-15px", backgroundColor: "#10b981", color: "white", width: "55px", height: "55px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1.2rem", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)" }}>
                {match.score}%
              </div>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#0f172a", fontSize: "1.25rem", paddingRight: "2rem" }}>{match.title}</h3>
              <p style={{ color: "#64748b", margin: "0 0 1.5rem 0", fontSize: "0.95rem" }}>🏢 {match.company} • 📍 {match.location}</p>
              <Link to={`/offres/${match.id}`} style={{ display: "block", textAlign: "center", backgroundColor: "#f8fafc", color: "#3b82f6", padding: "0.8rem", borderRadius: "10px", textDecoration: "none", fontWeight: "600", border: "1px solid #cbd5e1", transition: "all 0.2s" }}>
                Consulter l'offre
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}