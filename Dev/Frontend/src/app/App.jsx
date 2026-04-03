import { useEffect, useState } from 'react'

import { AuthProvider, useAuth } from '../services/auth/AuthContext'
import { AdminCreateUserPage, AdminUsersPage } from '../features/admin/pages'
import { EmailVerificationPendingPage, ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage, VerifyEmailPage } from '../features/auth/pages'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import ProfilePage from '../features/profile/pages/ProfilePage'
import { BootingPage, NotFoundPage, UnauthorizedPage } from '../features/system/pages'
import AppShell from '../layouts/AppShell/AppShell'
import { GUEST_ONLY_ROUTES, PATHS, PRIVATE_ROUTES } from '../routes/paths'
import { getCurrentPath, navigateTo } from '../routes/router'

function resolvePage(path, isAuthenticated, isAdmin) {
  switch (path) {
    case PATHS.ROOT:
      return isAuthenticated ? <DashboardPage /> : <LoginPage />
    case PATHS.LOGIN:
      return <LoginPage />
    case PATHS.REGISTER:
      return <RegisterPage />
    case PATHS.FORGOT_PASSWORD:
      return <ForgotPasswordPage />
    case PATHS.RESET_PASSWORD:
      return <ResetPasswordPage />
    case PATHS.EMAIL_VERIFICATION_PENDING:
      return <EmailVerificationPendingPage />
    case PATHS.VERIFY_EMAIL:
      return <VerifyEmailPage />
    case PATHS.DASHBOARD:
      return isAuthenticated ? <DashboardPage /> : <LoginPage />
    case PATHS.PROFILE:
      return isAuthenticated ? <ProfilePage /> : <LoginPage />
    case PATHS.ADMIN_USERS:
      if (!isAuthenticated) return <LoginPage />
      return isAdmin ? <AdminUsersPage /> : <UnauthorizedPage />
    case PATHS.ADMIN_CREATE_USER:
      if (!isAuthenticated) return <LoginPage />
      return isAdmin ? <AdminCreateUserPage /> : <UnauthorizedPage />
    default:
      return <NotFoundPage />
  }
}

function AppRouter() {
  const { isAuthenticated, isAdmin, booting } = useAuth()
  const [path, setPath] = useState(getCurrentPath())

  useEffect(() => {
    const handleRoute = () => setPath(getCurrentPath())
    window.addEventListener('popstate', handleRoute)
    return () => window.removeEventListener('popstate', handleRoute)
  }, [])

  useEffect(() => {
    if (booting) return

    if (!isAuthenticated && PRIVATE_ROUTES.has(path)) {
      navigateTo(PATHS.LOGIN, { replace: true })
      return
    }

    if (isAuthenticated && GUEST_ONLY_ROUTES.has(path)) {
      navigateTo(PATHS.DASHBOARD, { replace: true })
    }
  }, [booting, isAuthenticated, path])

  if (booting) {
    return (
      <AppShell currentPath={path}>
        <BootingPage />
      </AppShell>
    )
  }

  const page = resolvePage(path, isAuthenticated, isAdmin)

  return <AppShell currentPath={path}>{page}</AppShell>
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
