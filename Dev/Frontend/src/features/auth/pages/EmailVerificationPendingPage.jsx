import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { destinationAfterEmailVerified } from '../../shared/postLoginRedirect'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export default function EmailVerificationPendingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    loadProfile,
    mustVerifyEmail,
    refreshStudentAccess,
    refreshEnterpriseAccess,
    resendVerificationEmail,
    user,
  } = useAuth()
  const initialEmail = searchParams.get('email') || user?.email || ''

  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const onResend = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const payload = await resendVerificationEmail(email)
      setSuccess(payload.message || 'Email renvoye')
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de renvoyer l email'))
    } finally {
      setLoading(false)
    }
  }

  const onRefreshStatus = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const profile = await loadProfile()
      const st = await refreshStudentAccess()
      const en = await refreshEnterpriseAccess()

      if (!profile?.email_verifie) {
        setSuccess('Le compte est toujours en attente de verification email.')
        return
      }

      navigate(destinationAfterEmailVerified(profile, st, en), { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de verifier le statut du compte'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Verification email" subtitle="Activez votre compte via le lien recu par email" withBranding>
      <p className="tb-subtitle">
        Vous pouvez demander un nouveau lien de verification si vous ne voyez pas l email dans votre boite de reception.
      </p>

      <form className="tb-form" onSubmit={onResend}>
        <label htmlFor="verify-pending-email">Email</label>
        <input
          id="verify-pending-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="tb-btn tb-btn-solid" disabled={loading}>
          {loading ? 'Envoi...' : 'Renvoyer le lien'}
        </button>
      </form>

      <StatusMessage type="success">{success}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>

      {mustVerifyEmail ? (
        <div className="tb-actions">
          <button type="button" className="tb-btn tb-btn-ghost" onClick={onRefreshStatus} disabled={loading}>
            {loading ? 'Verification...' : 'J ai valide mon email'}
          </button>
        </div>
      ) : null}

      <div className="tb-inline-links">
        <button type="button" className="tb-link" onClick={() => navigate(user ? PATHS.OFFERS_HOME : PATHS.LOGIN)}>
          {user ? 'Retour accueil offres' : 'Retour connexion'}
        </button>
      </div>
    </FormCard>
  )
}
