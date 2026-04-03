import { useAuth } from '../../services/auth/AuthContext'
import { PATHS } from '../../routes/paths'
import { navigateTo } from '../../routes/router'

function NavButton({ onClick, children, variant = 'ghost' }) {
  return (
    <button type="button" className={`tb-btn tb-btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}

export default function AppShell({ currentPath, children }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigateTo(PATHS.LOGIN, { replace: true })
  }

  return (
    <div className="tb-app-bg">
      <header className="tb-topbar">
        <button
          type="button"
          className="tb-brand"
          onClick={() => navigateTo(isAuthenticated ? PATHS.DASHBOARD : PATHS.LOGIN)}
          aria-label="TalentBridge accueil"
        >
          <img src="/logo-talentbridge.png" alt="TalentBridge" className="tb-brand-logo" />
          <span className="tb-brand-text">
            <strong>TalentBridge</strong>
            <small>Cloud-Native Microservices Platform</small>
          </span>
        </button>

        <nav className="tb-nav" aria-label="Navigation principale">
          {!isAuthenticated && (
            <>
              <NavButton onClick={() => navigateTo(PATHS.LOGIN)} variant={currentPath === PATHS.LOGIN ? 'solid' : 'ghost'}>
                Connexion
              </NavButton>
              <NavButton onClick={() => navigateTo(PATHS.REGISTER)} variant={currentPath === PATHS.REGISTER ? 'solid' : 'ghost'}>
                Inscription
              </NavButton>
            </>
          )}

          {isAuthenticated && (
            <>
              <NavButton onClick={() => navigateTo(PATHS.DASHBOARD)} variant={currentPath === PATHS.DASHBOARD ? 'solid' : 'ghost'}>
                Dashboard
              </NavButton>
              <NavButton onClick={() => navigateTo(PATHS.PROFILE)} variant={currentPath === PATHS.PROFILE ? 'solid' : 'ghost'}>
                Mon profil
              </NavButton>
              {isAdmin && (
                <>
                  <NavButton
                    onClick={() => navigateTo(PATHS.ADMIN_USERS)}
                    variant={currentPath === PATHS.ADMIN_USERS ? 'solid' : 'ghost'}
                  >
                    Utilisateurs
                  </NavButton>
                  <NavButton
                    onClick={() => navigateTo(PATHS.ADMIN_CREATE_USER)}
                    variant={currentPath === PATHS.ADMIN_CREATE_USER ? 'solid' : 'ghost'}
                  >
                    Creer user
                  </NavButton>
                </>
              )}
              <NavButton onClick={handleLogout} variant="danger">
                Logout
              </NavButton>
            </>
          )}
        </nav>
      </header>

      <main className="tb-main">
        <section className="tb-main-card">{children}</section>
      </main>

      <footer className="tb-footer">
        <span>TalentBridge SaaS Auth Platform</span>
        {isAuthenticated && user ? (
          <span>
            {user.prenom} {user.nom} ({user.role})
          </span>
        ) : (
          <span>Session anonyme</span>
        )}
      </footer>
    </div>
  )
}
