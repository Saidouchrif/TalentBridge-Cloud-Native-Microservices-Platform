import React from "react";

/**
 * DocumentPreview — Aperçu formaté d'un document généré par l'IA.
 * Affiche le contenu dans une carte stylisée avec option de copie.
 */
export default function DocumentPreview({ title, content, onCopy }) {
  if (!content) return null;

  return (
    <div className="doc-preview">
      {title && <h4 className="doc-preview-title">{title}</h4>}
      <div className="doc-preview-body">
        <pre className="doc-preview-content">{content}</pre>
      </div>
      <div className="doc-preview-actions">
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            navigator.clipboard?.writeText(content).catch(() => {});
            onCopy?.();
          }}
          aria-label="Copier le contenu"
        >
          📋 Copier
        </button>
      </div>
    </div>
  );
}
