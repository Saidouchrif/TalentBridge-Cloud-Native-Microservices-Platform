import { useState } from 'react'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { navigateTo } from '../../../routes/router'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = await forgotPassword(email)
      setSuccess(payload.message || 'Demande envoyee')
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible d envoyer le lien'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Mot de passe oublie" subtitle="Recevez un lien de reinitialisation par email" withBranding>
      <form className="tb-form" onSubmit={onSubmit}>
        <label htmlFor="forgot-email">Email</label>
        <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <button type="submit" className="tb-btn tb-btn-solid" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer le lien'}
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
