import { PATHS } from '../../routes/paths'

/**
 * Prochaine etape apres authentification reussie (email, profils metier).
 */
export function resolvePostLoginPath(profile, { needsStudentSetup, needsEnterpriseSetup, email } = {}) {
  if (profile?.email_verifie !== true) {
    const query = email ? `?email=${encodeURIComponent(email)}` : profile?.email ? `?email=${encodeURIComponent(profile.email)}` : ''
    return `${PATHS.EMAIL_VERIFICATION_PENDING}${query}`
  }
  if (profile?.role === 'etudiant' && needsStudentSetup) {
    return PATHS.STUDENT_SETUP
  }
  if (profile?.role === 'entreprise' && needsEnterpriseSetup) {
    return PATHS.ENTREPRISE_SETUP
  }
  return PATHS.OFFERS_HOME
}

/** Apres verification email (profil auth deja a jour). */
export function destinationAfterEmailVerified(profile, studentGate = { needsSetup: false }, enterpriseGate = { needsSetup: false }) {
  if (profile?.role === 'etudiant' && studentGate?.needsSetup) {
    return PATHS.STUDENT_SETUP
  }
  if (profile?.role === 'entreprise' && enterpriseGate?.needsSetup) {
    return PATHS.ENTREPRISE_SETUP
  }
  return PATHS.OFFERS_HOME
}
