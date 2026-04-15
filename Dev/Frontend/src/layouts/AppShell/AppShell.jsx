import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import NotificationBell from '../../features/notifications/components/NotificationBell'
import { PATHS } from '../../routes/paths'
import { useAuth } from '../../services/auth/AuthContext'

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16v1.9H4V7Zm0 7.6h16v1.9H4v-1.9Zm0-3.8h16v1.9H4v-1.9Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12.2a4.1 4.1 0 1 0-4.1-4.1 4.1 4.1 0 0 0 4.1 4.1Zm0 2c-4 0-7.3 2.1-8.5 5.2h1.9c1.1-2 3.7-3.3 6.6-3.3s5.5 1.3 6.6 3.3h1.9c-1.2-3.1-4.5-5.2-8.5-5.2Z" />
    </svg>
  )
}

function ChevronIcon({ open = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={open ? 'is-open' : ''}>
      <path d="m7.4 9.5 4.6 4.6 4.6-4.6 1.3 1.3-5.9 5.9-5.9-5.9 1.3-1.3Z" />
    </svg>
  )
}

function getInitials(user) {
  const nom = user?.nom?.[0] || ''
  const prenom = user?.prenom?.[0] || ''
  const initials = `${prenom}${nom}`.toUpperCase()
  return initials || 'TB'
}

function getUserDisplayName(user) {
  const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  return user?.email || 'Mon compte'
}

function pathMatches(current, target) {
  if (target === PATHS.OFFERS_HOME) {
    return current === PATHS.OFFERS_HOME || /^\/offres\/\d+$/.test(current)
  }
  if (target === PATHS.ENTREPRISE_OFFERS) {
    return current === PATHS.ENTREPRISE_OFFERS
  }
  if (target === PATHS.ENTREPRISE_OFFER_NEW) {
    return current === PATHS.ENTREPRISE_OFFER_NEW
  }
  return current === target || current.startsWith(`${target}?`)
}

function buildShellNotice({ mustVerifyEmail, needsStudentSetup, needsEnterpriseSetup }) {
  if (mustVerifyEmail) {
    return {
      title: 'Verification email requise',
      text: 'Confirmez votre adresse email pour debloquer l ensemble des fonctionnalites TalentBridge.',
      actionLabel: 'Verifier mon email',
      path: PATHS.EMAIL_VERIFICATION_PENDING,
    }
  }
  if (needsStudentSetup) {
    return {
      title: 'Profil etudiant a completer',
      text: 'Ajoutez vos informations, competences et experiences pour activer les candidatures et recommandations.',
      actionLabel: 'Completer mon profil',
      path: PATHS.STUDENT_SETUP,
    }
  }
  if (needsEnterpriseSetup) {
    return {
      title: 'Profil entreprise a configurer',
      text: 'Finalisez votre fiche entreprise pour publier des offres et centraliser vos candidatures.',
      actionLabel: 'Configurer mon entreprise',
      path: PATHS.ENTREPRISE_SETUP,
    }
  }
  return null
}

function OffresDropdown({ goTo, currentPath }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const timeoutRef = useRef(null)

  const isOffresActive =
    currentPath === PATHS.OFFERS_HOME ||
    currentPath === PATHS.OFFERS_STAGE ||
    currentPath === PATHS.OFFERS_EMPLOI ||
    /^\/offres\/\d+$/.test(currentPath)

  const handleEnter = () => {
    clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 180)
  }

  useEffect(() => {
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div
      className="tb-nav-dropdown-wrap"
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className={`tb-nav-pill${isOffresActive ? ' is-active' : ''}`}
        onClick={() => goTo(PATHS.OFFERS_HOME)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Offres
        <span className="tb-nav-chevron">
          <ChevronIcon open={open} />
        </span>
      </button>

      <div className={`tb-nav-dropdown${open ? ' is-open' : ''}`}>
        <button
          type="button"
          className="tb-nav-dropdown-item"
          onClick={() => { goTo(PATHS.OFFERS_STAGE); setOpen(false) }}
        >
          <span className="tb-nav-dropdown-icon tb-stage-dot" />
          Stages
        </button>
        <button
          type="button"
          className="tb-nav-dropdown-item"
          onClick={() => { goTo(PATHS.OFFERS_EMPLOI); setOpen(false) }}
        >
          <span className="tb-nav-dropdown-icon tb-emploi-dot" />
          Offres d&apos;emploi
        </button>
      </div>
    </div>
  )
}

export default function AppShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const {
    isAuthenticated,
    isAdmin,
    mustVerifyEmail,
    needsStudentSetup,
    needsEnterpriseSetup,
    user,
    logout,
  } = useAuth()

  const goTo = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
    await logout()
    navigate(PATHS.LOGIN, { replace: true })
  }

  const isSetupPhase = mustVerifyEmail || needsStudentSetup || needsEnterpriseSetup

  const centerLinks = useMemo(() => {
    if (isAuthenticated) {
      const links = [{ label: '__offres_dropdown__', path: PATHS.OFFERS_HOME }]
      if (!isSetupPhase) {
        if (user?.role === 'etudiant') {
          links.push(
            { label: 'Candidatures', path: PATHS.APPLICATIONS },
            { label: 'Recommandations', path: PATHS.RECOMMENDATIONS },
            { label: 'Outils IA', path: PATHS.AI_TOOLS },
          )
        }
        if (user?.role === 'entreprise') {
          links.push(
            { label: 'Mes annonces', path: PATHS.ENTREPRISE_OFFERS },
            { label: 'Publier', path: PATHS.ENTREPRISE_OFFER_NEW },
            { label: 'Outils IA', path: PATHS.AI_TOOLS },
          )
        }
        if (isAdmin) {
          links.push({ label: 'Utilisateurs', path: PATHS.ADMIN_USERS })
        }
      }
      return links
    }
    return [
      { label: 'Accueil', path: PATHS.HOME },
      { label: '__offres_dropdown__', path: PATHS.OFFERS_HOME },
      { label: 'Services', path: PATHS.SERVICES },
      { label: 'Contact', path: PATHS.CONTACT },
    ]
  }, [isAdmin, isAuthenticated, isSetupPhase, user?.role])

  const guestActions = [
    { label: 'Connexion', path: PATHS.LOGIN },
    { label: 'Inscription', path: PATHS.REGISTER, primary: true },
  ]

  const userMenuItems = [
    { label: 'Mon profil', path: PATHS.PROFILE },
    { label: 'Parametres', path: `${PATHS.PROFILE}?tab=settings` },
    { label: 'Changer mot de passe', path: `${PATHS.PROFILE}?tab=security` },
  ]

  const shellNotice = isAuthenticated
    ? buildShellNotice({ mustVerifyEmail, needsStudentSetup, needsEnterpriseSetup })
    : null

  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!userMenuOpen) return
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [userMenuOpen])

  return (
    <div className="tb-app-bg">
      <header className="tb-topbar">
        <div className="tb-topbar-row">
          <button
            type="button"
            className="tb-brand"
            onClick={() => navigate(isAuthenticated ? PATHS.OFFERS_HOME : PATHS.HOME)}
            aria-label="TalentBridge accueil"
          >
            <img src="/logo-talentbridge.png" alt="TalentBridge" className="tb-brand-logo" />
            <span className="tb-brand-text">
              <strong>TalentBridge</strong>
              <small>Plateforme carriere etudiants et recruteurs</small>
            </span>
          </button>

          <nav className="tb-nav tb-nav-center" aria-label="Navigation principale">
            {centerLinks.map((item) =>
              item.label === '__offres_dropdown__' ? (
                <OffresDropdown key="offres" goTo={goTo} currentPath={currentPath} />
              ) : (
                <button
                  key={item.path}
                  type="button"
                  className={`tb-nav-pill${pathMatches(currentPath, item.path) ? ' is-active' : ''}`}
                  onClick={() => goTo(item.path)}
                >
                  {item.label}
                </button>
              ),
            )}
          </nav>

          <div className="tb-topbar-actions">
            {!isAuthenticated ? (
              <div className="tb-auth-actions">
                {guestActions.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    className={`tb-btn ${item.primary ? 'tb-btn-solid' : 'tb-btn-ghost'}`}
                    onClick={() => goTo(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <NotificationBell />

                <div className="tb-user-menu" ref={userMenuRef}>
                  <button
                    type="button"
                    className={`tb-user-trigger${userMenuOpen ? ' is-open' : ''}`}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    onClick={() => setUserMenuOpen((o) => !o)}
                  >
                    <span className="tb-user-avatar" aria-hidden="true">
                      {getInitials(user)}
                    </span>
                    <span className="tb-user-copy">
                      <strong>{getUserDisplayName(user)}</strong>
                      <small>{user?.role || 'utilisateur'}</small>
                    </span>
                    <span className="tb-user-trigger-icon" aria-hidden="true">
                      <ChevronIcon open={userMenuOpen} />
                    </span>
                  </button>

                  {userMenuOpen ? (
                    <div className="tb-user-dropdown" role="menu">
                      <div className="tb-user-dropdown-head">
                        <span className="tb-user-dropdown-icon" aria-hidden="true">
                          <UserIcon />
                        </span>
                        <div>
                          <strong>{getUserDisplayName(user)}</strong>
                          <span>{user?.email || 'Session connectee'}</span>
                        </div>
                      </div>
                      <div className="tb-user-dropdown-list">
                        {userMenuItems.map((item) => (
                          <button key={item.path} type="button" className="tb-dropdown-item" onClick={() => goTo(item.path)}>
                            {item.label}
                          </button>
                        ))}
                        <button type="button" className="tb-dropdown-item is-danger" onClick={handleLogout}>
                          Deconnexion
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}

            <button
              type="button"
              className={`tb-menu-toggle${mobileMenuOpen ? ' is-open' : ''}`}
              aria-label="Afficher le menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        <div className={`tb-mobile-nav${mobileMenuOpen ? ' is-open' : ''}`}>
          <div className="tb-mobile-nav-card">
            {!isAuthenticated ? (
              <div className="tb-mobile-nav-section">
                <button type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(PATHS.HOME)}>Accueil</button>
                <button type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(PATHS.OFFERS_HOME)}>Toutes les offres</button>
                <button type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(PATHS.OFFERS_STAGE)}>Stages</button>
                <button type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(PATHS.OFFERS_EMPLOI)}>Offres d&apos;emploi</button>
                <button type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(PATHS.SERVICES)}>Services</button>
                <button type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(PATHS.CONTACT)}>Contact</button>
              </div>
            ) : (
              <div className="tb-mobile-nav-section">
                <button type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(PATHS.OFFERS_HOME)}>Toutes les offres</button>
                <button type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(PATHS.OFFERS_STAGE)}>Stages</button>
                <button type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(PATHS.OFFERS_EMPLOI)}>Offres d&apos;emploi</button>
                {centerLinks.filter((l) => l.label !== '__offres_dropdown__' && l.path !== PATHS.OFFERS_HOME).map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    className={`tb-nav-pill is-mobile${pathMatches(currentPath, item.path) ? ' is-active' : ''}`}
                    onClick={() => goTo(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {isAuthenticated ? (
              <div className="tb-mobile-nav-section">
                {userMenuItems.map((item) => (
                  <button key={item.path} type="button" className="tb-nav-pill is-mobile" onClick={() => goTo(item.path)}>
                    {item.label}
                  </button>
                ))}
                <button type="button" className="tb-btn tb-btn-danger tb-mobile-logout" onClick={handleLogout}>
                  Deconnexion
                </button>
              </div>
            ) : (
              <div className="tb-mobile-nav-section">
                {guestActions.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    className={`tb-btn ${item.primary ? 'tb-btn-solid' : 'tb-btn-ghost'}`}
                    onClick={() => goTo(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="tb-main">
        {shellNotice ? (
          <section className="tb-shell-alert">
            <div className="tb-shell-alert-copy">
              <span className="tb-eyebrow">Compte</span>
              <h2>{shellNotice.title}</h2>
              <p>{shellNotice.text}</p>
            </div>
            <button type="button" className="tb-btn tb-btn-solid" onClick={() => goTo(shellNotice.path)}>
              {shellNotice.actionLabel}
            </button>
          </section>
        ) : null}

        <section className="tb-main-card">{children}</section>
      </main>

      <footer className="tb-footer">
        <span>&copy; {new Date().getFullYear()} TalentBridge. Tous droits reserves.</span>
      </footer>
    </div>
  )
}
