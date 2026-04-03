export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="tb-confirm-overlay" role="presentation">
      <div className="tb-confirm-card" role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="tb-confirm-actions">
          <button type="button" className="tb-btn tb-btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`tb-btn ${danger ? 'tb-btn-danger' : 'tb-btn-solid'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Traitement...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
