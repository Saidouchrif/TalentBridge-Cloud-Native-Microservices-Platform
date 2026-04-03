export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  EMAIL_VERIFICATION_PENDING: '/email-verification',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ADMIN_USERS: '/admin/users',
  ADMIN_CREATE_USER: '/admin/create-user',
}

export const GUEST_ONLY_ROUTES = new Set([
  PATHS.LOGIN,
  PATHS.REGISTER,
  PATHS.FORGOT_PASSWORD,
  PATHS.RESET_PASSWORD,
  PATHS.EMAIL_VERIFICATION_PENDING,
  PATHS.VERIFY_EMAIL,
])

export const PRIVATE_ROUTES = new Set([PATHS.DASHBOARD, PATHS.PROFILE, PATHS.ADMIN_USERS, PATHS.ADMIN_CREATE_USER])

export const ADMIN_ONLY_ROUTES = new Set([PATHS.ADMIN_USERS, PATHS.ADMIN_CREATE_USER])
