import { PATHS } from '../../../routes/paths'
import { navigateTo } from '../../../routes/router'
import { useAuth } from '../../../services/auth/AuthContext'

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()

  return (
    <section className="tb-grid">
      <article className="tb-panel">
        <h2>Bienvenue {user?.prenom}</h2>
        <p>
          Votre role: <strong>{user?.role}</strong>
        </p>
        <p>
          Verification email: <strong>{user?.email_verifie ? 'Oui' : 'Non'}</strong>
        </p>
      </article>

      <article className="tb-panel">
        <h2>Actions rapides</h2>
        <div className="tb-actions">
          <button type="button" className="tb-btn tb-btn-solid" onClick={() => navigateTo(PATHS.PROFILE)}>
            Modifier mon profil
          </button>
          {!user?.email_verifie ? (
            <button type="button" className="tb-btn tb-btn-ghost" onClick={() => navigateTo(PATHS.EMAIL_VERIFICATION_PENDING)}>
              Verifier mon email
            </button>
          ) : null}
          {isAdmin ? (
            <button type="button" className="tb-btn tb-btn-ghost" onClick={() => navigateTo(PATHS.ADMIN_USERS)}>
              Gerer utilisateurs
            </button>
          ) : null}
        </div>
      </article>
    </section>
  )
}
