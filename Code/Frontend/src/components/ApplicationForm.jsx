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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
            />
          </div>
        </div>

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
            />
          </div>
        </div>

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
        </button>
      </form>
    </div>
  );
}
