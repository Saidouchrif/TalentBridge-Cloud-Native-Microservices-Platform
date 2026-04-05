import React, { useState } from "react";

/**
 * Bouton "Améliorer avec l'IA" — simule l'amélioration d'un texte (lettre de motivation, CV).
 * En production, ce composant appellerait le ai-document-service.
 */

const IMPROVE_EXAMPLES = {
  coverLetter: [
    "Passionné(e) par les défis technologiques et l'innovation, je souhaite rejoindre votre équipe afin de mettre à profit mes compétences en développement Full Stack. Mon expérience en Node.js, React et PostgreSQL, combinée à ma maîtrise des architectures microservices, me permettrait de contribuer efficacement à vos projets cloud-native.",
    "Fort(e) d'une solide expérience en développement logiciel, je nourris un intérêt particulier pour les environnements agiles et les technologies modernes. Je suis convaincu(e) que ma capacité à apprendre rapidement et à collaborer en équipe constitue un atout majeur pour relever les défis de votre organisation.",
    "Ingénieur(e) curieux(se) et orienté(e) résultats, je place la qualité du code et l'expérience utilisateur au cœur de chaque projet. Mon parcours m'a permis de développer une approche rigoureuse et créative face aux problèmes complexes.",
  ],
  generic: [
    "Texte optimisé par l'IA pour maximiser l'impact auprès des recruteurs. Structure claire, vocabulaire professionnel et mise en valeur des compétences clés.",
  ],
};

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
      // Simulation d'un appel IA (délai réaliste)
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const examples = IMPROVE_EXAMPLES[type] || IMPROVE_EXAMPLES.generic;
      const improved = examples[Math.floor(Math.random() * examples.length)];

      onResult?.(improved);
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
