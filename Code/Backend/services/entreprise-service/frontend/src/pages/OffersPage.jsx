// Page affichant les offres d'une entreprise + gestion des candidatures (mode test sans JWT)
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { authHeader } from "../api/client.js";

export default function OffersPage() {
  const { enterpriseId } = useParams();

  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [enterprise, setEnterprise] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    location: "",
    status: "published"
  });

  async function refreshEnterprise() {
    try {
      const res = await api.get(`/api/entreprises/${enterpriseId}`);
      setEnterprise(res.data.enterprise);
    } catch (err) {
      console.error("Erreur chargement entreprise:", err);
    }
  }

  async function refreshOffers() {
    setError("");
    setLoading(true);
    try {
      const res = await api.get(`/api/entreprises/${enterpriseId}/offers`);
      setOffers(res.data.offers || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors du chargement des offres");
    } finally {
      setLoading(false);
    }
  }

  async function refreshApplications() {
    try {
      const res = await api.get(`/api/entreprises/${enterpriseId}/applications`);
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error("Erreur chargement candidatures:", err);
    }
  }

  useEffect(() => {
    refreshEnterprise();
    refreshOffers();
    refreshApplications();
  }, [enterpriseId]);

  async function createOffer(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const requiredSkills = offerForm.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await api.post(`/api/entreprises/${enterpriseId}/offers`, {
        title: offerForm.title,
        description: offerForm.description,
        requiredSkills: requiredSkills.length ? requiredSkills : null,
        location: offerForm.location,
        status: offerForm.status
      });

      setSuccess("Offre créée avec succès!");
      setOfferForm({
        title: "",
        description: "",
        requiredSkills: "",
        location: "",
        status: "published"
      });
      await refreshOffers();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la création de l'offre");
    } finally {
      setLoading(false);
    }
  }

  async function applyToOffer(offerId) {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post(`/api/offers/${offerId}/applications`, {});
      setSuccess("Candidature envoyée avec succès!");
      await refreshApplications();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la candidature");
    } finally {
      setLoading(false);
    }
  }

  async function updateApplicationStatus(applicationId, status) {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.patch(`/api/entreprises/${enterpriseId}/applications/${applicationId}`, { status });
      setSuccess(`Candidature ${status === "accepted" ? "acceptée" : "rejetée"} avec succès!`);
      await refreshApplications();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  async function deleteOffer(offerId) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre?")) return;
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.delete(`/api/entreprises/${enterpriseId}/offers/${offerId}`);
      setSuccess("Offre supprimée avec succès!");
      await refreshOffers();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Link to="/" style={{ color: "#007bff", textDecoration: "none", marginRight: 16 }}>
            ← Retour aux entreprises
          </Link>
          <h2 style={{ display: "inline", margin: 0 }}>
            {enterprise ? `Offres de ${enterprise.name}` : `Offres de l'entreprise #${enterpriseId}`}
          </h2>
          <span style={{ marginLeft: 10, color: "#666" }}>({offers.length} offres)</span>
        </div>
        <button 
          onClick={() => { refreshOffers(); refreshApplications(); }}
          disabled={loading}
          style={{ padding: "8px 16px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Chargement..." : "Actualiser"}
        </button>
      </div>

      {error && <div style={{ color: "crimson", padding: 10, backgroundColor: "#ffe6e6", borderRadius: 4, marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: "green", padding: 10, backgroundColor: "#e6ffe6", borderRadius: 4, marginBottom: 10 }}>{success}</div>}

      {/* Formulaire de création d'offre */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 30,
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>➕ Créer une offre</h3>
        <form onSubmit={createOffer} style={{ display: "grid", gap: 12, maxWidth: 600 }}>
          <input
            placeholder="Titre de l'offre *"
            value={offerForm.title}
            onChange={(e) => setOfferForm((p) => ({ ...p, title: e.target.value }))}
            required
            style={{ padding: 8 }}
          />
          
          <textarea
            placeholder="Description détaillée de l'offre"
            value={offerForm.description}
            onChange={(e) => setOfferForm((p) => ({ ...p, description: e.target.value }))}
            rows={4}
            required
            style={{ padding: 8, resize: "vertical" }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              placeholder="Compétences requises (séparées par des virgules)"
              value={offerForm.requiredSkills}
              onChange={(e) => setOfferForm((p) => ({ ...p, requiredSkills: e.target.value }))}
              style={{ padding: 8 }}
            />
            <input
              placeholder="Localisation"
              value={offerForm.location}
              onChange={(e) => setOfferForm((p) => ({ ...p, location: e.target.value }))}
              style={{ padding: 8 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 14, color: "#666", marginBottom: 4, display: "block" }}>Statut de l'offre</label>
            <select
              value={offerForm.status}
              onChange={(e) => setOfferForm((p) => ({ ...p, status: e.target.value }))}
              style={{ padding: 8, width: 200 }}
            >
              <option value="published">📢 Publiée</option>
              <option value="closed">🔒 Fermée</option>
              <option value="draft">📝 Brouillon</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: 12, 
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: loading ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontSize: 16
            }}
          >
            {loading ? "Création en cours..." : "Publier l'offre"}
          </button>
        </form>
      </div>

      {/* Liste des offres */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 16 }}>💼 Liste des offres</h3>
        {offers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666", backgroundColor: "#f8f9fa", borderRadius: 8 }}>
            Aucune offre trouvée. Créez votre première offre ci-dessus !
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {offers.map((offer) => (
              <div 
                key={offer.id} 
                style={{ 
                  border: "1px solid #dee2e6", 
                  borderRadius: 8, 
                  padding: 16,
                  backgroundColor: "white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#28a745" }}>{offer.title}</h4>
                    
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ 
                        backgroundColor: offer.status === "published" ? "#d4edda" : 
                                       offer.status === "closed" ? "#f8d7da" : "#fff3cd",
                        color: offer.status === "published" ? "#155724" : 
                               offer.status === "closed" ? "#721c24" : "#856404",
                        padding: "4px 8px", 
                        borderRadius: 12, 
                        fontSize: 12,
                        fontWeight: "bold"
                      }}>
                        {offer.status === "published" ? "📢 PUBLIÉE" : 
                         offer.status === "closed" ? "🔒 FERMÉE" : "📝 BROUILLON"}
                      </span>
                    </div>

                    {offer.location && (
                      <div style={{ color: "#666", marginBottom: 8 }}>📍 {offer.location}</div>
                    )}
                    
                    {offer.description && (
                      <p style={{ margin: "8px 0", color: "#666", lineHeight: 1.4 }}>
                        {offer.description}
                      </p>
                    )}
                    
                    {offer.requiredSkills && Array.isArray(offer.requiredSkills) && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Compétences requises:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {offer.requiredSkills.map((skill, index) => (
                            <span 
                              key={index}
                              style={{ 
                                backgroundColor: "#e9ecef", 
                                padding: "2px 6px", 
                                borderRadius: 8, 
                                fontSize: 11,
                                color: "#495057"
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 16 }}>
                    <button
                      onClick={() => applyToOffer(offer.id)}
                      disabled={loading}
                      style={{ 
                        padding: "8px 12px", 
                        backgroundColor: "#007bff", 
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: 14
                      }}
                    >
                      🎓 Candidater
                    </button>
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      disabled={loading}
                      style={{ 
                        padding: "8px 12px", 
                        backgroundColor: "#dc3545", 
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: 14
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidatures */}
      <div>
        <h3 style={{ marginBottom: 16 }}>📋 Candidatures ({applications.length})</h3>
        {applications.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666", backgroundColor: "#f8f9fa", borderRadius: 8 }}>
            Aucune candidature pour le moment.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {applications.map((app) => (
              <div 
                key={app.id} 
                style={{ 
                  border: "1px solid #dee2e6", 
                  borderRadius: 8, 
                  padding: 16,
                  backgroundColor: "white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: "0 0 8px 0", color: "#6f42c1" }}>
                      Candidature #{app.id}
                    </h4>
                    <div style={{ fontSize: 14, color: "#666" }}>
                      <div>👤 Étudiant ID: {app.studentUserId}</div>
                      <div>💼 Offre: #{app.offerId}</div>
                      <div>📅 Date: {new Date(app.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ 
                      backgroundColor: app.status === "pending" ? "#fff3cd" : 
                                     app.status === "accepted" ? "#d4edda" : "#f8d7da",
                      color: app.status === "pending" ? "#856404" : 
                             app.status === "accepted" ? "#155724" : "#721c24",
                      padding: "6px 12px", 
                      borderRadius: 16, 
                      fontSize: 12,
                      fontWeight: "bold"
                    }}>
                      {app.status === "pending" ? "⏳ EN ATTENTE" : 
                       app.status === "accepted" ? "✅ ACCEPTÉE" : "❌ REJETÉE"}
                    </span>
                    
                    {app.status === "pending" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => updateApplicationStatus(app.id, "accepted")}
                          disabled={loading}
                          style={{ 
                            padding: "8px 12px", 
                            backgroundColor: "#28a745", 
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: 14
                          }}
                        >
                          ✅ Accepter
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app.id, "rejected")}
                          disabled={loading}
                          style={{ 
                            padding: "8px 12px", 
                            backgroundColor: "#dc3545", 
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: 14
                          }}
                        >
                          ❌ Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

