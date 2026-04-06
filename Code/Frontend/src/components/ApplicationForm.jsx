<<<<<<< HEAD
import React, { useState, useMemo } from "react";
import { submitApplication } from "../services/api";

const INITIAL_STATE = { fullName: "", email: "", phone: "", coverLetter: "", resumeUrl: "" };

export default function ApplicationForm({ jobId, onSubmitted }) {
  const [form, setForm] = useState(INITIAL_STATE);
=======
import React, { useMemo, useState } from "react";
import { submitApplication } from "../services/api";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  coverLetter: "",
  resumeUrl: "",
};

export default function ApplicationForm({ jobId, onSubmitted }) {
  const [form, setForm] = useState(initialForm);
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

<<<<<<< HEAD
  const isValid = useMemo(() => form.fullName.trim() && form.email.trim() && form.coverLetter.trim() && !loading, [form, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await submitApplication({ jobId: Number(jobId), ...form });
      setSuccess("Votre candidature a bien été envoyée avec succès !");
      setForm(INITIAL_STATE);
      onSubmitted?.(data);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'envoyer la candidature.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: "10px",
    border: "1px solid #cbd5e1", backgroundColor: "#f8fafc",
    fontSize: "0.95rem", color: "#0f172a", outline: "none",
    transition: "all 0.2s ease-in-out", boxSizing: "border-box"
  };

  const labelStyle = { display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "600", color: "#475569" };

  return (
    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: "1.5" }}>
        Remplissez le formulaire ci-dessous pour soumettre votre profil. Les champs marqués d'un astérisque (*) sont obligatoires.
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label htmlFor="fullName" style={labelStyle}>Nom complet *</label>
            <input id="fullName" type="text" name="fullName" value={form.fullName} onChange={handleChange}
              placeholder="Ex: Jean Dupont" required style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label htmlFor="email" style={labelStyle}>Email *</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="Ex: vous@exemple.com" required style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.boxShadow = "none"; }}
=======
  const canSubmit = useMemo(() => {
    return (
      form.fullName.trim() &&
      form.email.trim() &&
      form.coverLetter.trim() &&
      !loading
    );
  }, [form, loading]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await submitApplication(jobId, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        coverLetter: form.coverLetter.trim(),
        resumeUrl: form.resumeUrl.trim() || undefined,
      });
      setSuccess("Votre candidature a bien été envoyée. Vous pouvez la suivre dans « Mes candidatures ».");
      setForm(initialForm);
      onSubmitted?.(result);
    } catch (submitError) {
      setError(submitError.message || "Impossible d'envoyer la candidature.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="apply-panel">
      <h3 className="apply-panel-title">Postuler à cette offre</h3>
      <p className="apply-panel-hint">
        Les champs marqués d’un astérisque sont obligatoires. Vos informations sont transmises de façon sécurisée.
      </p>

      <form className="apply-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row two">
          <div className="form-field">
            <label htmlFor="fullName">Nom complet *</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={updateField}
              placeholder="Jean Dupont"
              autoComplete="name"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="vous@exemple.com"
              autoComplete="email"
              required
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
            />
          </div>
        </div>

<<<<<<< HEAD
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label htmlFor="phone" style={labelStyle}>Téléphone</label>
            <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="+33 6 00 00 00 00" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label htmlFor="resumeUrl" style={labelStyle}>Lien vers votre CV / Portfolio</label>
            <input id="resumeUrl" type="url" name="resumeUrl" value={form.resumeUrl} onChange={handleChange}
              placeholder="https://..." style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.boxShadow = "none"; }}
=======
        <div className="form-row two">
          <div className="form-field">
            <label htmlFor="phone">Téléphone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={updateField}
              placeholder="+33 6 12 34 56 78"
              autoComplete="tel"
            />
          </div>
          <div className="form-field">
            <label htmlFor="resumeUrl">Lien CV (PDF, portfolio…)</label>
            <input
              id="resumeUrl"
              type="url"
              name="resumeUrl"
              value={form.resumeUrl}
              onChange={updateField}
              placeholder="https://…"
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
            />
          </div>
        </div>

<<<<<<< HEAD
        <div>
          <label htmlFor="coverLetter" style={labelStyle}>Lettre de motivation *</label>
          <textarea id="coverLetter" name="coverLetter" value={form.coverLetter} onChange={handleChange}
            placeholder="Présentez brièvement votre parcours et vos motivations pour ce poste..."
            rows={6} required style={{ ...inputStyle, resize: "vertical" }}
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {error && <div style={{ padding: "1rem", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "8px", fontSize: "0.9rem", fontWeight: "500" }}>{error}</div>}
        {success && <div style={{ padding: "1rem", backgroundColor: "#d1fae5", color: "#059669", borderRadius: "8px", fontSize: "0.9rem", fontWeight: "500" }}>{success}</div>}

        <button type="submit" disabled={!isValid}
          style={{
            marginTop: "1rem", padding: "14px 24px", width: "100%", backgroundColor: isValid ? "#0f172a" : "#94a3b8",
            color: "white", fontSize: "1rem", fontWeight: "600", borderRadius: "10px", border: "none",
            cursor: isValid ? "pointer" : "not-allowed", transition: "all 0.2s"
          }}>
          {loading ? "Envoi sécurisé en cours..." : "🚀 Envoyer ma candidature"}
=======
        <div className="form-field">
          <label htmlFor="coverLetter">Lettre de motivation *</label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            value={form.coverLetter}
            onChange={updateField}
            placeholder="Expliquez en quelques lignes votre motivation et ce que vous apportez au poste."
            rows={6}
            required
          />
        </div>

        {error ? <p className="alert alert-error">{error}</p> : null}
        {success ? <p className="alert alert-success">{success}</p> : null}

        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          {loading ? "Envoi en cours…" : "Envoyer ma candidature"}
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
        </button>
      </form>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
