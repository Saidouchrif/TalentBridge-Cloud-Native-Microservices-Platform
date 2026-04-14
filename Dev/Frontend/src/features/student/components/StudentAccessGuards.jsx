import { Navigate, useLocation } from 'react-router-dom'

import BootingPage from '../../system/pages/BootingPage'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'

/** Route privee : session requise. */
export function RequireAuth({ children }) {
  const { isAuthenticated, booting, profileGateLoading } = useAuth()
  const location = useLocation()

  if (booting || profileGateLoading) {
    return <BootingPage />
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: location.pathname }} />
  }

  return children
}

/**
 * Pages invite uniquement : si deja connecte, renvoie vers la bonne etape.
 */
export function GuestOnly({ children }) {
  const {
    isAuthenticated,
    booting,
    profileGateLoading,
    needsStudentSetup,
    needsEnterpriseSetup,
    mustVerifyEmail,
    user,
  } = useAuth()

  if (booting || (isAuthenticated && profileGateLoading)) {
    return <BootingPage />
  }

  if (isAuthenticated) {
    if (mustVerifyEmail) {
      const query = user?.email ? `?email=${encodeURIComponent(user.email)}` : ''
      return <Navigate to={`${PATHS.EMAIL_VERIFICATION_PENDING}${query}`} replace />
    }
    if (user?.role === 'etudiant' && needsStudentSetup) {
      return <Navigate to={PATHS.STUDENT_SETUP} replace />
    }
    if (user?.role === 'entreprise' && needsEnterpriseSetup) {
      return <Navigate to={PATHS.ENTREPRISE_SETUP} replace />
    }
    return <Navigate to={PATHS.OFFERS_HOME} replace />
  }

  return children
}

/** Email non verifie : tous les roles concernes. */
export function RequireVerifiedEmail({ children }) {
  const { isAuthenticated, booting, profileGateLoading, user, mustVerifyEmail } = useAuth()

  if (booting || !isAuthenticated || profileGateLoading) {
    return <BootingPage />
  }

  if (mustVerifyEmail) {
    const query = user?.email ? `?email=${encodeURIComponent(user.email)}` : ''
    return <Navigate to={`${PATHS.EMAIL_VERIFICATION_PENDING}${query}`} replace />
  }

  return children
}

/** @deprecated — alias de RequireVerifiedEmail */
export const RequireVerifiedStudentEmail = RequireVerifiedEmail

/**
 * Etudiants sans profil metier : redirection setup.
 * Les autres roles passent.
 */
export function RequireStudentProfileIfEtudiant({ children }) {
  const { isAuthenticated, booting, profileGateLoading, needsStudentSetup, user } = useAuth()

  if (booting || !isAuthenticated || profileGateLoading) {
    return <BootingPage />
  }

  if (user?.role === 'etudiant' && needsStudentSetup) {
    return <Navigate to={PATHS.STUDENT_SETUP} replace />
  }

  return children
}

export function RequireEnterpriseProfileIfEntreprise({ children }) {
  const { isAuthenticated, booting, profileGateLoading, needsEnterpriseSetup, user } = useAuth()

  if (booting || !isAuthenticated || profileGateLoading) {
    return <BootingPage />
  }

  if (user?.role === 'entreprise' && needsEnterpriseSetup) {
    return <Navigate to={PATHS.ENTREPRISE_SETUP} replace />
  }

  return children
}

/** Etudiant ou entreprise : profil metier requis selon le role. Admin : direct. */
export function RequireProfileComplete({ children }) {
  const {
    isAuthenticated,
    booting,
    profileGateLoading,
    needsStudentSetup,
    needsEnterpriseSetup,
    user,
  } = useAuth()

  if (booting || !isAuthenticated || profileGateLoading) {
    return <BootingPage />
  }

  if (user?.role === 'etudiant' && needsStudentSetup) {
    return <Navigate to={PATHS.STUDENT_SETUP} replace />
  }
  if (user?.role === 'entreprise' && needsEnterpriseSetup) {
    return <Navigate to={PATHS.ENTREPRISE_SETUP} replace />
  }

  return children
}

/** Page setup etudiant : role etudiant uniquement. */
export function RequireEtudiantRole({ children }) {
  const { user, isAuthenticated, booting, profileGateLoading } = useAuth()

  if (booting || !isAuthenticated || profileGateLoading) {
    return <BootingPage />
  }

  if (user?.role !== 'etudiant') {
    return <Navigate to={PATHS.OFFERS_HOME} replace />
  }

  return children
}

export function RequireEntrepriseRole({ children }) {
  const { user, isAuthenticated, booting, profileGateLoading } = useAuth()

  if (booting || !isAuthenticated || profileGateLoading) {
    return <BootingPage />
  }

  if (user?.role !== 'entreprise') {
    return <Navigate to={PATHS.OFFERS_HOME} replace />
  }

  return children
}

/** Si profil etudiant deja cree, quitter le setup. */
export function RedirectIfStudentProfileComplete({ children }) {
  const { user, isAuthenticated, booting, profileGateLoading, needsStudentSetup } = useAuth()

  if (booting || !isAuthenticated || profileGateLoading) {
    return <BootingPage />
  }

  if (user?.role === 'etudiant' && !needsStudentSetup) {
    return <Navigate to={PATHS.OFFERS_HOME} replace />
  }

  return children
}

export function RedirectIfEntrepriseProfileComplete({ children }) {
  const { user, isAuthenticated, booting, profileGateLoading, needsEnterpriseSetup } = useAuth()

  if (booting || !isAuthenticated || profileGateLoading) {
    return <BootingPage />
  }

  if (user?.role === 'entreprise' && !needsEnterpriseSetup) {
    return <Navigate to={PATHS.OFFERS_HOME} replace />
  }

  return children
}

/** Routes reservees aux etudiants avec profil complet. */
export function RequireEtudiantComplet({ children }) {
  return (
    <RequireProfileComplete>
      <RequireEtudiantRole>{children}</RequireEtudiantRole>
    </RequireProfileComplete>
  )
}
