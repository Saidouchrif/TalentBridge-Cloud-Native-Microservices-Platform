import { useMemo, useState } from 'react'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { getQueryParam, navigateTo } from '../../../routes/router'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export default function EmailVerificationPendingPage() {
  const { resendVerificationEmail } = useAuth()
  const initialEmail = useMemo(() => getQueryParam('email') || '', [])

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

      <div className="tb-inline-links">
        <button type="button" className="tb-link" onClick={() => navigateTo(PATHS.LOGIN)}>
          Retour connexion
        </button>
      </div>
    </FormCard>
  )
}
