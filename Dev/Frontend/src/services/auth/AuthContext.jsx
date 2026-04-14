/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { getMyEntrepriseProfile } from '../../features/entreprise/services/entreprise.service'
import { getMyStudentProfile } from '../../features/student/services/student.service'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ACCESS_KEY = 'tb_access_token'
const REFRESH_KEY = 'tb_refresh_token'

const AuthContext = createContext(null)

function getStoredValue(kind, key) {
  if (typeof window === 'undefined') return ''
  const storage = kind === 'local' ? window.localStorage : window.sessionStorage
  return storage.getItem(key) || ''
}

function setStoredValue(kind, key, value) {
  if (typeof window === 'undefined') return
  const storage = kind === 'local' ? window.localStorage : window.sessionStorage
  if (value) {
    storage.setItem(key, value)
  } else {
    storage.removeItem(key)
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return { detail: text || 'Erreur inconnue' }
}

function buildError(status, payload) {
  const detail = payload?.detail || payload?.message || 'Requete echouee'
  const error = new Error(detail)
  error.status = status
  error.payload = payload
  return error
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => getStoredValue('session', ACCESS_KEY))
  const [refreshToken, setRefreshToken] = useState(() => getStoredValue('local', REFRESH_KEY))
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(() => Boolean(getStoredValue('session', ACCESS_KEY) || getStoredValue('local', REFRESH_KEY)))
  const [studentGate, setStudentGate] = useState({ resolved: true, needsSetup: false })
  const [enterpriseGate, setEnterpriseGate] = useState({ resolved: true, needsSetup: false })

  const accessTokenRef = useRef(accessToken)
  const refreshTokenRef = useRef(refreshToken)
  const refreshPromiseRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    userRef.current = user
  }, [user])

  const setSession = (nextAccessToken, nextRefreshToken) => {
    const safeAccessToken = nextAccessToken || ''
    const safeRefreshToken = nextRefreshToken || ''

    accessTokenRef.current = safeAccessToken
    refreshTokenRef.current = safeRefreshToken
    setAccessToken(safeAccessToken)
    setRefreshToken(safeRefreshToken)

    setStoredValue('session', ACCESS_KEY, safeAccessToken)
    setStoredValue('local', REFRESH_KEY, safeRefreshToken)
  }

  const clearSession = () => {
    setSession('', '')
    setUser(null)
    setStudentGate({ resolved: true, needsSetup: false })
    setEnterpriseGate({ resolved: true, needsSetup: false })
  }

  const applyStudentGateAfterProfile = async (profile) => {
    if (!profile || profile.role !== 'etudiant') {
      const next = { resolved: true, needsSetup: false }
      setStudentGate(next)
      return next
    }

    setStudentGate({ resolved: false, needsSetup: false })
    try {
      await getMyStudentProfile(accessTokenRef.current)
      const next = { resolved: true, needsSetup: false }
      setStudentGate(next)
      return next
    } catch (error) {
      const sansProfil = error.status === 404 || error.status === 403
      const next = sansProfil ? { resolved: true, needsSetup: true } : { resolved: true, needsSetup: false }
      setStudentGate(next)
      return next
    }
  }

  const refreshStudentAccess = async () => {
    const profile = userRef.current
    if (!profile || !accessTokenRef.current) {
      return null
    }
    return applyStudentGateAfterProfile(profile)
  }

  const applyEnterpriseGateAfterProfile = async (profile) => {
    if (!profile || profile.role !== 'entreprise') {
      const next = { resolved: true, needsSetup: false }
      setEnterpriseGate(next)
      return next
    }

    setEnterpriseGate({ resolved: false, needsSetup: false })
    try {
      await getMyEntrepriseProfile(accessTokenRef.current)
      const next = { resolved: true, needsSetup: false }
      setEnterpriseGate(next)
      return next
    } catch (error) {
      const sansProfil = error.status === 404 || error.status === 403
      const next = sansProfil ? { resolved: true, needsSetup: true } : { resolved: true, needsSetup: false }
      setEnterpriseGate(next)
      return next
    }
  }

  const refreshEnterpriseAccess = async () => {
    const profile = userRef.current
    if (!profile || !accessTokenRef.current) return null
    return applyEnterpriseGateAfterProfile(profile)
  }

  const refreshAccessToken = async () => {
    const currentRefreshToken = refreshTokenRef.current
    if (!currentRefreshToken) {
      throw new Error('Refresh token manquant')
    }

    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = (async () => {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: currentRefreshToken }),
        })

        const payload = await parseResponse(response)
        if (!response.ok) {
          throw buildError(response.status, payload)
        }

        const nextAccessToken = payload.access_token
        if (!nextAccessToken) {
          throw new Error('Access token manquant dans la reponse refresh')
        }

        setSession(nextAccessToken, currentRefreshToken)
        return nextAccessToken
      })().finally(() => {
        refreshPromiseRef.current = null
      })
    }

    return refreshPromiseRef.current
  }

  const request = async (path, options = {}) => {
    const { method = 'GET', body, auth = true, retry = true } = options
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    const bearerToken = accessTokenRef.current
    if (auth && bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (response.ok) {
      return parseResponse(response)
    }

    if (response.status === 401 && auth && retry && refreshTokenRef.current && path !== '/api/auth/refresh') {
      try {
        await refreshAccessToken()
      } catch {
        clearSession()
        throw buildError(401, { detail: 'Session expiree, reconnectez-vous.' })
      }
      return request(path, { ...options, retry: false })
    }

    const payload = await parseResponse(response)
    throw buildError(response.status, payload)
  }

  const loadProfile = async () => {
    const profile = await request('/api/utilisateurs/profile')
    setUser(profile)
    return profile
  }

  const login = async (credentials) => {
    const payload = await request('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: credentials,
    })

    setSession(payload.access_token, payload.refresh_token)
    const profile = await loadProfile()
    const gate = await applyStudentGateAfterProfile(profile)
    const entGate = await applyEnterpriseGateAfterProfile(profile)
    return {
      profile,
      needsStudentSetup: gate.needsSetup,
      needsEnterpriseSetup: entGate.needsSetup,
      needsEmailVerification: profile?.email_verifie !== true,
    }
  }

  const register = async (data) => {
    return request('/api/auth/register', {
      method: 'POST',
      auth: false,
      body: data,
    })
  }

  const logout = async () => {
    try {
      if (accessTokenRef.current) {
        await request('/api/auth/logout', {
          method: 'POST',
          body: refreshTokenRef.current ? { refresh_token: refreshTokenRef.current } : {},
        })
      }
    } catch {
      // no-op
    } finally {
      clearSession()
    }
  }

  const forgotPassword = async (email) => {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      auth: false,
      body: { email },
    })
  }

  const resetPasswordWithToken = async (token, nouveauMotDePasse) => {
    return request('/api/auth/reset-password-with-token', {
      method: 'POST',
      auth: false,
      body: { token, nouveauMotDePasse },
    })
  }

  const changePassword = async (ancienMotDePasse, nouveauMotDePasse) => {
    return request('/api/auth/change-password', {
      method: 'PUT',
      body: { ancienMotDePasse, nouveauMotDePasse },
    })
  }

  const resendVerificationEmail = async (email) => {
    return request('/api/auth/resend-verification-email', {
      method: 'POST',
      auth: false,
      body: { email },
    })
  }

  const verifyEmail = async (token) => {
    return request('/api/auth/verify-email', {
      method: 'POST',
      auth: false,
      body: { token },
    })
  }

  const updateMyProfile = async (data) => {
    const profile = await request('/api/utilisateurs/profile', {
      method: 'PUT',
      body: data,
    })
    setUser(profile)
    return profile
  }

  const createUserByAdmin = async (data) => {
    return request('/api/auth/create-user', {
      method: 'POST',
      body: data,
    })
  }

  const listUsers = async () => request('/api/utilisateurs/')
  const listDeletedUsers = async () => request('/api/utilisateurs/supprimes')

  const updateUserByAdmin = async (userId, data) => {
    return request(`/api/utilisateurs/${userId}`, {
      method: 'PUT',
      body: data,
    })
  }

  const deleteUserByAdmin = async (userId) => {
    return request(`/api/utilisateurs/${userId}`, { method: 'DELETE' })
  }

  const restoreUserByAdmin = async (userId) => {
    return request(`/api/utilisateurs/${userId}/restore`, {
      method: 'PATCH',
      body: {},
    })
  }

  useEffect(() => {
    const bootstrap = async () => {
      if (!accessTokenRef.current && !refreshTokenRef.current) {
        setStudentGate({ resolved: true, needsSetup: false })
        setBooting(false)
        return
      }

      try {
        if (!accessTokenRef.current && refreshTokenRef.current) {
          await refreshAccessToken()
        }
        const profile = await loadProfile()
        await applyStudentGateAfterProfile(profile)
        await applyEnterpriseGateAfterProfile(profile)
      } catch {
        clearSession()
      } finally {
        setBooting(false)
      }
    }

    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isAuthenticated = Boolean(accessToken && user)
  const studentAccessLoading = Boolean(
    accessToken && user?.role === 'etudiant' && !studentGate.resolved,
  )
  const enterpriseAccessLoading = Boolean(
    accessToken && user?.role === 'entreprise' && !enterpriseGate.resolved,
  )
  const profileGateLoading = Boolean(studentAccessLoading || enterpriseAccessLoading)
  const mustVerifyEmail = Boolean(isAuthenticated && user && user.email_verifie !== true)
  /** @deprecated utiliser mustVerifyEmail */
  const mustVerifyStudentEmail = mustVerifyEmail
  const needsStudentSetup = Boolean(
    isAuthenticated && user?.role === 'etudiant' && studentGate.resolved && studentGate.needsSetup,
  )
  const needsEnterpriseSetup = Boolean(
    isAuthenticated &&
      user?.role === 'entreprise' &&
      enterpriseGate.resolved &&
      enterpriseGate.needsSetup,
  )

  const value = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    booting,
    studentAccessLoading,
    enterpriseAccessLoading,
    profileGateLoading,
    mustVerifyEmail,
    mustVerifyStudentEmail,
    needsStudentSetup,
    needsEnterpriseSetup,
    refreshStudentAccess,
    refreshEnterpriseAccess,
    apiBaseUrl: API_BASE_URL,
    login,
    register,
    logout,
    loadProfile,
    changePassword,
    forgotPassword,
    resetPasswordWithToken,
    resendVerificationEmail,
    verifyEmail,
    updateMyProfile,
    createUserByAdmin,
    listUsers,
    listDeletedUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
    restoreUserByAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit etre utilise dans AuthProvider')
  }
  return context
}
