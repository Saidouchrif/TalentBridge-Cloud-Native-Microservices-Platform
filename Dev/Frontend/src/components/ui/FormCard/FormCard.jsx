export function FormCard({ title, subtitle, children, withBranding = false }) {
  return (
    <article className="tb-form-card tb-surface-card">
      {withBranding ? (
        <div className="tb-card-branding">
          <img src="/logo-talentbridge.png" alt="TalentBridge" />
          <span>Plateforme SaaS securisee</span>
        </div>
      ) : null}

      <div className="tb-form-card-head">
        <h1>{title}</h1>
        {subtitle ? <p className="tb-subtitle">{subtitle}</p> : null}
      </div>
      {children}
    </article>
  )
}

export function StatusMessage({ type = 'info', children }) {
  if (!children) return null
  return (
    <div className={`tb-message tb-message-${type}`} role="status">
      {children}
    </div>
  )
}
