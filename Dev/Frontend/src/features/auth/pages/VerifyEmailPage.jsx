import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { destinationAfterEmailVerified } from '../../shared/postLoginRedirect'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    isAuthenticated,
    loadProfile,
    refreshStudentAccess,
    refreshEnterpriseAccess,
    verifyEmail,
  } = useAuth()
  const token = searchParams.get('token') || ''
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const startedRef = useRef(false)

  const onVerify = async () => {
    setError('')
    setSuccess('')

    if (!token) {
      setError('Token de verification manquant dans l URL.')
      return
    }

    setLoading(true)
    try {
      const payload = await verifyEmail(token)
      setSuccess(payload.message || 'Email verifie avec succes')

      if (isAuthenticated) {
        const profile = await loadProfile()
        const st = await refreshStudentAccess()
        const en = await refreshEnterpriseAccess()
        const destination = destinationAfterEmailVerified(profile, st, en)
        window.setTimeout(() => {
          navigate(destination, { replace: true })
        }, 1000)
      } else {
        window.setTimeout(() => {
          navigate(PATHS.LOGIN, { replace: true })
        }, 1000)
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Verification impossible'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token || startedRef.current) return
    startedRef.current = true
    onVerify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <FormCard title="Verification de votre email" subtitle="Confirmez votre adresse pour activer votre compte" withBranding>
      <button type="button" className="tb-btn tb-btn-solid" disabled={loading} onClick={onVerify}>
        {loading ? 'Verification...' : 'Verifier mon email'}
      </button>

      <StatusMessage type="success">{success}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>

      <div className="tb-inline-links">
        <button type="button" className="tb-link" onClick={() => navigate(PATHS.LOGIN)}>
          Aller a la connexion
        </button>
      </div>
    </FormCard>
  )
}
