import React, { useState } from "react";
import { submitApplication } from "../services/api";

export default function ApplicationForm({ jobId, onSubmitted }) {
  const [formData, setFormData] = useState({
    company_name: "",
    job_title: "Développeur Full Stack",
    cv_content: "",
    letter_content: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitApplication(formData);
      setSuccess(true);
      onSubmitted && onSubmitted();
    } catch (err) {
      console.error('Submit error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="application-form">
      <h3>Postuler</h3>
      <input
        placeholder="CV content (AI generated)"
        value={formData.cv_content}
        onChange={(e) => setFormData({...formData, cv_content: e.target.value})}
      />
      <textarea
        placeholder="Lettre de motivation (AI generated)"
        value={formData.letter_content}
        onChange={(e) => setFormData({...formData, letter_content: e.target.value})}
      />
      <button type="submit" disabled={loading || success}>
        {success ? 'Envoyé!' : 'Envoyer candidature'}
      </button>
    </form>
  );
}
