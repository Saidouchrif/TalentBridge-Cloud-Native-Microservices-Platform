import React, { useState } from "react";
import AiImproveButton from "../components/ia/AiImproveButton";
import DocumentPreview from "../components/ia/DocumentPreview";

const DOCUMENT_TYPES = [
  { value: "coverLetter", label: "Lettre de motivation" },
  { value: "summary", label: "Résumé professionnel" },
  { value: "skills", label: "Présentation des compétences" },
];

const TEMPLATES = {
  coverLetter: `Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste de [POSTE] au sein de votre entreprise.

[Décrivez votre expérience et votre motivation ici]

Dans l'attente de vous rencontrer, je reste à votre disposition pour tout entretien.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Votre Nom]`,

  summary: `Développeur(se) passionné(e) avec [X] ans d'expérience en [domaine].
Spécialisé(e) dans [technologies/domaines clés].
Réalisations notables : [listez vos succès]`,

  skills: `Compétences techniques :
• [Technologie 1] — [niveau]
• [Technologie 2] — [niveau]
• [Technologie 3] — [niveau]

Compétences transversales :
• Communication et travail en équipe
• Résolution de problèmes complexes
• Gestion de projet Agile / Scrum`,
};

export default function AiGeneratorPage() {
  const [docType, setDocType] = useState("coverLetter");
  const [inputText, setInputText] = useState(TEMPLATES.coverLetter);
  const [improvedText, setImprovedText] = useState("");
  const [copied, setCopied] = useState(false);

  function handleTypeChange(e) {
    const newType = e.target.value;
    setDocType(newType);
    setInputText(TEMPLATES[newType] || "");
    setImprovedText("");
    setCopied(false);
  }

  function handleImproved(result) {
    setImprovedText(result);
    setCopied(false);
  }

  function handleCopy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleUseImproved() {
    setInputText(improvedText);
    setImprovedText("");
  }

  return (
    <section>
      {/* En-tête */}
      <header className="cand-page-header">
        <h2>✨ Générateur de documents IA</h2>
        <p>
          Rédigez ou collez votre texte, puis laissez l&apos;IA l&apos;optimiser pour maximiser vos
          chances auprès des recruteurs.
        </p>
      </header>

      {/* Sélecteur de type */}
      <div className="ai-type-selector">
        {DOCUMENT_TYPES.map((dt) => (
          <button
            key={dt.value}
            type="button"
            className={`btn-type ${docType === dt.value ? "btn-type--active" : ""}`}
            onClick={() => handleTypeChange({ target: { value: dt.value } })}
          >
            {dt.label}
          </button>
        ))}
      </div>

      {/* Layout deux colonnes */}
      <div className="ai-layout">
        {/* Colonne gauche — Éditeur */}
        <div className="ai-editor-col">
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-card-icon">📝</span>
              <h3 className="ai-card-title">Votre texte</h3>
            </div>
            <div className="form-field">
              <textarea
                id="ai-input"
                className="ai-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Saisissez ou collez votre texte ici…"
                rows={14}
              />
            </div>
            <div className="ai-actions">
              <AiImproveButton
                text={inputText}
                type={docType}
                onResult={handleImproved}
              />
              {improvedText && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleUseImproved}
                  title="Remplacer votre texte par la version améliorée"
                >
                  ↩ Utiliser cette version
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite — Résultat IA */}
        <div className="ai-result-col">
          {improvedText ? (
            <div className="ai-card ai-card--result">
              <div className="ai-card-header">
                <span className="ai-card-icon">🤖</span>
                <h3 className="ai-card-title">Version améliorée par l&apos;IA</h3>
                {copied && (
                  <span className="ai-copied-badge">✅ Copié !</span>
                )}
              </div>
              <DocumentPreview
                content={improvedText}
                onCopy={handleCopy}
              />
            </div>
          ) : (
            <div className="ai-empty-result">
              <div className="ai-empty-icon">🤖</div>
              <h3>Résultat IA</h3>
              <p>
                Saisissez votre texte à gauche, puis cliquez sur{" "}
                <strong>✨ Améliorer avec l&apos;IA</strong> pour obtenir une version optimisée.
              </p>
              <ul className="ai-tip-list">
                <li>📌 Plus votre texte est détaillé, meilleur sera le résultat</li>
                <li>🔄 Vous pouvez améliorer plusieurs fois</li>
                <li>📋 Copiez le résultat en un clic</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
