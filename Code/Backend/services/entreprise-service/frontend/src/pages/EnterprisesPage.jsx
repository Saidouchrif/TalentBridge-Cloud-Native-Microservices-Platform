// Page affichant la liste des entreprises + formulaire de création (mode test sans JWT)
import React, { useEffect, useState } from "react";
import api, { authHeader } from "../api/client.js";
import { Link } from "react-router-dom";

export default function EnterprisesPage() {
  const [enterprises, setEnterprises] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sector: "",
    description: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    country: "France",
    phone: "",
    website: ""
  });

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/api/entreprises");
      setEnterprises(res.data.enterprises || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createEnterprise(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/api/entreprises", form);
      setSuccess(`Entreprise "${res.data.enterprise.name}" créée avec succès!`);
      setForm({ 
        name: "", sector: "", description: "", addressLine1: "", 
        city: "", postalCode: "", country: "France", phone: "", website: "" 
      });
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  async function deleteEnterprise(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise?")) return;
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.delete(`/api/entreprises/${id}`);
      setSuccess("Entreprise supprimée avec succès!");
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>Entreprises ({enterprises.length})</h2>
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

      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 30,
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>➕ Créer une entreprise</h3>
        <form onSubmit={createEnterprise} style={{ display: "grid", gap: 12, maxWidth: 600 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              placeholder="Nom de l'entreprise *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              style={{ padding: 8 }}
            />
            <input
              placeholder="Secteur d'activité"
              value={form.sector}
              onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))}
              style={{ padding: 8 }}
            />
          </div>
          
          <textarea
            placeholder="Description de l'entreprise"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            style={{ padding: 8, resize: "vertical" }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              placeholder="Adresse"
              value={form.addressLine1}
              onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))}
              style={{ padding: 8 }}
            />
            <input
              placeholder="Ville"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              style={{ padding: 8 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <input
              placeholder="Code postal"
              value={form.postalCode}
              onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
              style={{ padding: 8 }}
            />
            <input
              placeholder="Pays"
              value={form.country}
              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
              style={{ padding: 8 }}
            />
            <input
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              style={{ padding: 8 }}
            />
          </div>

          <input
            placeholder="Site web"
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
            style={{ padding: 8 }}
          />

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
            {loading ? "Création en cours..." : "Créer l'entreprise"}
          </button>
        </form>
      </div>

      <div>
        <h3 style={{ marginBottom: 16 }}>📋 Liste des entreprises</h3>
        {enterprises.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666", backgroundColor: "#f8f9fa", borderRadius: 8 }}>
            Aucune entreprise trouvée. Créez votre première entreprise ci-dessus !
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {enterprises.map((ent) => (
              <div 
                key={ent.id} 
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
                    <h4 style={{ margin: "0 0 8px 0", color: "#007bff" }}>{ent.name}</h4>
                    {ent.sector && (
                      <span style={{ 
                        backgroundColor: "#e9ecef", 
                        padding: "4px 8px", 
                        borderRadius: 12, 
                        fontSize: 12,
                        color: "#495057"
                      }}>
                        {ent.sector}
                      </span>
                    )}
                    {ent.description && (
                      <p style={{ margin: "8px 0", color: "#666", lineHeight: 1.4 }}>
                        {ent.description}
                      </p>
                    )}
                    <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
                      {ent.addressLine1 && <div>📍 {ent.addressLine1}</div>}
                      {ent.city && ent.postalCode && <div>📍 {ent.postalCode} {ent.city}</div>}
                      {ent.phone && <div>📞 {ent.phone}</div>}
                      {ent.website && <div>🌐 <a href={ent.website} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff" }}>{ent.website}</a></div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                    <Link 
                      to={`/entreprises/${ent.id}/offers`}
                      style={{ 
                        padding: "8px 12px", 
                        backgroundColor: "#28a745", 
                        color: "white", 
                        textDecoration: "none",
                        borderRadius: 4,
                        fontSize: 14
                      }}
                    >
                      Voir les offres
                    </Link>
                    <button
                      onClick={() => deleteEnterprise(ent.id)}
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
    </div>
  );
}

