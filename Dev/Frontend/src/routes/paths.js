export const PATHS = {
  ROOT: '/',
  HOME: '/home',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  EMAIL_VERIFICATION_PENDING: '/email-verification',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  OFFERS_HOME: '/offres',
  OFFER_DETAIL: '/offres/:offreId',
  OFFERS_STAGE: '/offres/stage',
  OFFERS_EMPLOI: '/offres/emploi',
  SERVICES: '/services',
  CONTACT: '/contact',
  PROFILE: '/profile',
  STUDENT_SETUP: '/student/setup',
  ENTREPRISE_SETUP: '/entreprise/setup',
  ENTREPRISE_OFFERS: '/entreprise/offres',
  ENTREPRISE_OFFER_NEW: '/entreprise/offres/nouvelle',
  ENTREPRISE_OFFER_APPLICATIONS: '/entreprise/offres/:offreId/candidatures',
  APPLICATIONS: '/candidatures',
  NOTIFICATIONS: '/notifications',
  AI_TOOLS: '/outils-ia',
  RECOMMENDATIONS: '/recommandations',
  ADMIN_USERS: '/admin/users',
  ADMIN_CREATE_USER: '/admin/create-user',
}

export function offerDetailPath(offreId) {
  return `/offres/${offreId}`
}

export function entrepriseOfferApplicationsPath(offreId) {
  return `/entreprise/offres/${offreId}/candidatures`
}

export const GUEST_ONLY_ROUTES = new Set([
  PATHS.LOGIN,
  PATHS.REGISTER,
  PATHS.FORGOT_PASSWORD,
  PATHS.RESET_PASSWORD,
  PATHS.EMAIL_VERIFICATION_PENDING,
  PATHS.VERIFY_EMAIL,
])

export const PRIVATE_ROUTES = new Set([
  PATHS.DASHBOARD,
  PATHS.PROFILE,
  PATHS.STUDENT_SETUP,
  PATHS.ENTREPRISE_SETUP,
  PATHS.ENTREPRISE_OFFERS,
  PATHS.ENTREPRISE_OFFER_NEW,
  PATHS.APPLICATIONS,
  PATHS.NOTIFICATIONS,
  PATHS.AI_TOOLS,
  PATHS.RECOMMENDATIONS,
  PATHS.ADMIN_USERS,
  PATHS.ADMIN_CREATE_USER,
])

export const ADMIN_ONLY_ROUTES = new Set([PATHS.ADMIN_USERS, PATHS.ADMIN_CREATE_USER])
