import React, { useState } from "react";
import { api } from "../../services/api";

/**
 * Bouton "Améliorer avec l'IA" connecté au microservice ai-document-service.
 */

export default function AiImproveButton({ text, type = "coverLetter", onResult, disabled }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleImprove() {
    if (!text || !text.trim()) {
      setError("Veuillez saisir un texte à améliorer.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Appel au microservice IA via l'API (qui passe par la Gateway)
      const response = await api.post('/ai/improve', { text, type });
      onResult?.(response.data.improvedText);
    } catch {
      setError("Erreur lors de l'amélioration. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <button
        type="button"
        className="btn-ai"
        onClick={handleImprove}
        disabled={disabled || loading || !text?.trim()}
        aria-label="Améliorer ce texte avec l'IA"
      >
        {loading ? (
          <>
            <span className="tb-spinner tb-spinner--sm" aria-hidden />
            Amélioration en cours…
          </>
        ) : (
          <>
            <span aria-hidden>✨</span>
            Améliorer avec l&apos;IA
          </>
        )}
      </button>
      {error ? <p className="alert alert-error" style={{ margin: 0, fontSize: "0.8rem" }}>{error}</p> : null}
    </div>
  );
}
