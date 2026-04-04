// Page affichant la liste des offres avec filtres et formulaire de création
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { authHeader } from "../api/client.js";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Filtres
  const [filters, setFilters] = useState({
    status: "",
    location: "",
    skills: ""
  });

  // Formulaire de création
  const [form, setForm] = useState({
    enterpriseId: "",
    title: "",
    description: "",
    requiredSkills: "",
    location: "",
    status: "published"
  });

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.location) params.append('location', filters.location);
      if (filters.skills) params.append('skills', filters.skills);

      const res = await api.get(`/api/offers?${params}`);
      setOffers(res.data.offers || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [filters]);

  async function createOffer(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const offerData = {
        ...form,
        requiredSkills: form.requiredSkills ? form.requiredSkills.split(',').map(s => s.trim()) : []
      };

      const res = await api.post("/api/offers", offerData);
      setSuccess(`Offre "${res.data.offer.title}" créée avec succès!`);
      setForm({ 
        enterpriseId: "", title: "", description: "", requiredSkills: "", 
        location: "", status: "published" 
      });
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  async function deleteOffer(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre?")) return;
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.delete(`/api/offers/${id}`);
      setSuccess("Offre supprimée avec succès!");
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  }

  async function applyToOffer(offerId) {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post(`/api/offers/${offerId}/applications`, {
        coverLetter: "Je suis très intéressé par cette offre..."
      });
      setSuccess("Candidature envoyée avec succès!");
      await refresh();
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
      await api.patch(`/api/offers/applications/${applicationId}`, { status });
      setSuccess(`Candidature ${status} avec succès!`);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#28a745';
      case 'closed': return '#dc3545';
      case 'draft': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'closed': return 'Fermé';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>Offres ({offers.length})</h2>
        <button 
          onClick={refresh} 
          disabled={loading}
          style={{ padding: "8px 16px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Chargement..." : "Actualiser"}
        </button>
      </div>

      {error && <div style={{ color: "crimson", padding: 10, backgroundColor: "#ffe6e6", borderRadius: 4, marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: "green", padding: 10, backgroundColor: "#e6ffe6", borderRadius: 4, marginBottom: 10 }}>{success}</div>}

      {/* Filtres */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 20,
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>🔍 Filtres</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
            style={{ padding: 8 }}
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="closed">Fermé</option>
            <option value="draft">Brouillon</option>
          </select>
          <input
            placeholder="Filtrer par localisation"
            value={filters.location}
            onChange={(e) => setFilters(p => ({ ...p, location: e.target.value }))}
            style={{ padding: 8 }}
          />
          <input
            placeholder="Filtrer par compétences"
            value={filters.skills}
            onChange={(e) => setFilters(p => ({ ...p, skills: e.target.value }))}
            style={{ padding: 8 }}
          />
        </div>
      </div>

      {/* Formulaire de création */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 30,
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>➕ Créer une offre</h3>
        <form onSubmit={createOffer} style={{ display: "grid", gap: 12, maxWidth: 600 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              placeholder="ID Entreprise *"
              type="number"
              value={form.enterpriseId}
              onChange={(e) => setForm((p) => ({ ...p, enterpriseId: e.target.value }))}
              required
              style={{ padding: 8 }}
            />
            <input
              placeholder="Titre de l'offre *"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              style={{ padding: 8 }}
            />
          </div>
          
          <textarea
            placeholder="Description détaillée de l'offre"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            style={{ padding: 8, resize: "vertical" }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              placeholder="Compétences requises (séparées par des virgules)"
              value={form.requiredSkills}
              onChange={(e) => setForm((p) => ({ ...p, requiredSkills: e.target.value }))}
              style={{ padding: 8 }}
            />
            <input
              placeholder="Localisation"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              style={{ padding: 8 }}
            />
          </div>

          <select
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            style={{ padding: 8 }}
          >
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
            <option value="closed">Fermé</option>
          </select>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: 12, 
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontSize: 16
            }}
          >
            {loading ? "Création en cours..." : "Créer l'offre"}
          </button>
        </form>
      </div>

      {/* Liste des offres */}
      <div>
        <h3 style={{ marginBottom: 16 }}>📋 Liste des offres</h3>
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
                    <h4 style={{ margin: "0 0 8px 0", color: "#007bff" }}>{offer.title}</h4>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ 
                        backgroundColor: getStatusColor(offer.status), 
                        color: "white", 
                        padding: "4px 8px", 
                        borderRadius: 12, 
                        fontSize: 12,
                        fontWeight: "bold"
                      }}>
                        {getStatusText(offer.status)}
                      </span>
                      <span style={{ marginLeft: 8, color: "#666", fontSize: 12 }}>
                        Entreprise ID: {offer.enterpriseId}
                      </span>
                    </div>
                    {offer.description && (
                      <p style={{ margin: "8px 0", color: "#555", fontSize: 14 }}>
                        {offer.description}
                      </p>
                    )}
                    {offer.requiredSkills && offer.requiredSkills.length > 0 && (
                      <div style={{ margin: "8px 0" }}>
                        {offer.requiredSkills.map((skill, index) => (
                          <span 
                            key={index}
                            style={{ 
                              backgroundColor: "#e9ecef", 
                              padding: "2px 6px", 
                              borderRadius: 4, 
                              fontSize: 11,
                              marginRight: 4,
                              display: "inline-block"
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {offer.location && (
                      <div style={{ color: "#666", fontSize: 12, margin: "4px 0" }}>
                        📍 {offer.location}
                      </div>
                    )}
                    {offer.applications && offer.applications.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                        📊 {offer.applications.length} candidature(s)
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                    <button 
                      onClick={() => applyToOffer(offer.id)}
                      disabled={loading}
                      style={{ 
                        padding: "6px 12px", 
                        fontSize: 12,
                        cursor: loading ? "not-allowed" : "pointer",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 4
                      }}
                    >
                      🎓 Candidater
                    </button>
                    <button 
                      onClick={() => deleteOffer(offer.id)}
                      disabled={loading}
                      style={{ 
                        padding: "6px 12px", 
                        fontSize: 12,
                        cursor: loading ? "not-allowed" : "pointer",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: 4
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
    </div>
  );
}
