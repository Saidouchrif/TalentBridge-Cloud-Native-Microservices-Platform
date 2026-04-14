import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { AdminCreateUserPage, AdminUsersPage } from '../features/admin/pages'
import { EmailVerificationPendingPage, ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage, VerifyEmailPage } from '../features/auth/pages'
import AiToolsPage from '../features/ai/pages/AiToolsPage'
import ContactPage from '../features/contact/pages/ContactPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import EnterpriseOfferCandidaturesPage from '../features/entreprise/pages/EnterpriseOfferCandidaturesPage'
import EnterpriseOffersPage from '../features/entreprise/pages/EnterpriseOffersPage'
import EnterpriseSetup from '../features/entreprise/pages/EnterpriseSetup'
import HomePage from '../features/home/pages/HomePage'
import MyApplicationsPage from '../features/candidatures/pages/MyApplicationsPage'
import RecommendationsPage from '../features/matching/pages/RecommendationsPage'
import NotificationsPage from '../features/notifications/pages/NotificationsPage'
import ProfilePage from '../features/profile/pages/ProfilePage'
import ServicesPage from '../features/services/pages/ServicesPage'
import {
  GuestOnly,
  RedirectIfEntrepriseProfileComplete,
  RedirectIfStudentProfileComplete,
  RequireAuth,
  RequireEntrepriseRole,
  RequireEtudiantComplet,
  RequireEtudiantRole,
  RequireProfileComplete,
  RequireVerifiedEmail,
} from '../features/student/components/StudentAccessGuards'
import OpportunityHubPage from '../features/student/pages/OpportunityHubPage'
import StudentSetup from '../features/student/pages/StudentSetup'
import { BootingPage, NotFoundPage, UnauthorizedPage } from '../features/system/pages'
import OfferDetailPage from '../features/offers/pages/OfferDetailPage'
import AppShell from '../layouts/AppShell/AppShell'
import { PATHS } from '../routes/paths'
import { AuthProvider, useAuth } from '../services/auth/AuthContext'

const TITLE_MAP = {
  [PATHS.HOME]: 'Accueil',
  [PATHS.LOGIN]: 'Connexion',
  [PATHS.REGISTER]: 'Inscription',
  [PATHS.FORGOT_PASSWORD]: 'Mot de passe oublie',
  [PATHS.RESET_PASSWORD]: 'Reinitialiser le mot de passe',
  [PATHS.OFFERS_HOME]: 'Offres',
  [PATHS.OFFERS_STAGE]: 'Stages',
  [PATHS.OFFERS_EMPLOI]: 'Offres d emploi',
  [PATHS.SERVICES]: 'Services',
  [PATHS.CONTACT]: 'Contact',
  [PATHS.PROFILE]: 'Profil',
  [PATHS.DASHBOARD]: 'Tableau de bord',
  [PATHS.APPLICATIONS]: 'Candidatures',
  [PATHS.NOTIFICATIONS]: 'Notifications',
  [PATHS.AI_TOOLS]: 'Outils IA',
  [PATHS.RECOMMENDATIONS]: 'Recommandations',
  [PATHS.ENTREPRISE_OFFERS]: 'Mes offres',
  [PATHS.STUDENT_SETUP]: 'Configuration etudiant',
  [PATHS.ENTREPRISE_SETUP]: 'Configuration entreprise',
  [PATHS.ADMIN_USERS]: 'Utilisateurs',
  [PATHS.ADMIN_CREATE_USER]: 'Creer un utilisateur',
}

function DynamicTitle() {
  const location = useLocation()
  useEffect(() => {
    const path = location.pathname
    let label = TITLE_MAP[path]
    if (!label && /^\/offres\/\d+$/.test(path)) label = 'Detail de l offre'
    if (!label && path.startsWith('/entreprise/offres/') && path.endsWith('/candidatures')) label = 'Candidatures'
    document.title = label ? `TalentBridge - ${label}` : 'TalentBridge'
  }, [location.pathname])
  return null
}

function AppShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function PrivateShell({ children }) {
  return (
    <RequireAuth>
      <RequireVerifiedEmail>
        <RequireProfileComplete>{children}</RequireProfileComplete>
      </RequireVerifiedEmail>
    </RequireAuth>
  )
}

function RootRedirect() {
  const {
    isAuthenticated,
    booting,
    profileGateLoading,
    mustVerifyEmail,
    needsStudentSetup,
    needsEnterpriseSetup,
    user,
  } = useAuth()

  if (booting || (isAuthenticated && profileGateLoading)) {
    return <BootingPage />
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.HOME} replace />
  }

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

function AdminUsersRoute() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminUsersPage /> : <UnauthorizedPage />
}

function AdminCreateUserRoute() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminCreateUserPage /> : <UnauthorizedPage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route path={PATHS.ROOT} element={<RootRedirect />} />
        <Route path={PATHS.HOME} element={<HomePage />} />
        <Route path={PATHS.SERVICES} element={<ServicesPage />} />
        <Route path={PATHS.CONTACT} element={<ContactPage />} />

        <Route
          path={PATHS.LOGIN}
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path={PATHS.REGISTER}
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />
        <Route
          path={PATHS.FORGOT_PASSWORD}
          element={
            <GuestOnly>
              <ForgotPasswordPage />
            </GuestOnly>
          }
        />
        <Route
          path={PATHS.RESET_PASSWORD}
          element={
            <GuestOnly>
              <ResetPasswordPage />
            </GuestOnly>
          }
        />
        <Route path={PATHS.EMAIL_VERIFICATION_PENDING} element={<EmailVerificationPendingPage />} />
        <Route path={PATHS.VERIFY_EMAIL} element={<VerifyEmailPage />} />

        <Route
          path={PATHS.STUDENT_SETUP}
          element={
            <RequireAuth>
              <RequireVerifiedEmail>
                <RequireEtudiantRole>
                  <RedirectIfStudentProfileComplete>
                    <StudentSetup />
                  </RedirectIfStudentProfileComplete>
                </RequireEtudiantRole>
              </RequireVerifiedEmail>
            </RequireAuth>
          }
        />

        <Route
          path={PATHS.ENTREPRISE_SETUP}
          element={
            <RequireAuth>
              <RequireVerifiedEmail>
                <RequireEntrepriseRole>
                  <RedirectIfEntrepriseProfileComplete>
                    <EnterpriseSetup />
                  </RedirectIfEntrepriseProfileComplete>
                </RequireEntrepriseRole>
              </RequireVerifiedEmail>
            </RequireAuth>
          }
        />

        <Route
          path={PATHS.DASHBOARD}
          element={
            <PrivateShell>
              <DashboardPage />
            </PrivateShell>
          }
        />

        <Route path={PATHS.OFFERS_HOME} element={<OpportunityHubPage type="all" />} />
        <Route path={PATHS.OFFERS_STAGE} element={<OpportunityHubPage type="stage" />} />
        <Route path={PATHS.OFFERS_EMPLOI} element={<OpportunityHubPage type="emploi" />} />
        <Route path={PATHS.OFFER_DETAIL} element={<OfferDetailPage />} />

        <Route
          path={PATHS.PROFILE}
          element={
            <PrivateShell>
              <ProfilePage />
            </PrivateShell>
          }
        />

        <Route
          path={PATHS.APPLICATIONS}
          element={
            <PrivateShell>
              <RequireEtudiantComplet>
                <MyApplicationsPage />
              </RequireEtudiantComplet>
            </PrivateShell>
          }
        />

        <Route
          path={PATHS.NOTIFICATIONS}
          element={
            <PrivateShell>
              <NotificationsPage />
            </PrivateShell>
          }
        />

        <Route
          path={PATHS.AI_TOOLS}
          element={
            <PrivateShell>
              <AiToolsPage />
            </PrivateShell>
          }
        />

        <Route
          path={PATHS.RECOMMENDATIONS}
          element={
            <PrivateShell>
              <RequireEtudiantComplet>
                <RecommendationsPage />
              </RequireEtudiantComplet>
            </PrivateShell>
          }
        />

        <Route
          path={PATHS.ENTREPRISE_OFFERS}
          element={
            <PrivateShell>
              <RequireEntrepriseRole>
                <EnterpriseOffersPage />
              </RequireEntrepriseRole>
            </PrivateShell>
          }
        />
        <Route
          path={PATHS.ENTREPRISE_OFFER_APPLICATIONS}
          element={
            <PrivateShell>
              <RequireEntrepriseRole>
                <EnterpriseOfferCandidaturesPage />
              </RequireEntrepriseRole>
            </PrivateShell>
          }
        />

        <Route
          path={PATHS.ADMIN_USERS}
          element={
            <RequireAuth>
              <RequireVerifiedEmail>
                <AdminUsersRoute />
              </RequireVerifiedEmail>
            </RequireAuth>
          }
        />
        <Route
          path={PATHS.ADMIN_CREATE_USER}
          element={
            <RequireAuth>
              <RequireVerifiedEmail>
                <AdminCreateUserRoute />
              </RequireVerifiedEmail>
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DynamicTitle />
      <AppRoutes />
    </AuthProvider>
  )
}
