import { useMemo, useState } from 'react'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { getQueryParam, navigateTo } from '../../../routes/router'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth()
  const token = useMemo(() => getQueryParam('token') || '', [])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

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
    } catch (err) {
      setError(extractErrorMessage(err, 'Verification impossible'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Verification de votre email" subtitle="Confirmez votre adresse pour activer votre compte" withBranding>
      <button type="button" className="tb-btn tb-btn-solid" disabled={loading} onClick={onVerify}>
        {loading ? 'Verification...' : 'Verifier mon email'}
      </button>

      <StatusMessage type="success">{success}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>

      <div className="tb-inline-links">
        <button type="button" className="tb-link" onClick={() => navigateTo(PATHS.LOGIN)}>
          Aller a la connexion
        </button>
      </div>
    </FormCard>
  )
}
