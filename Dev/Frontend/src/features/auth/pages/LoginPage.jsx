import { useState } from 'react'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { useAuth } from '../../../services/auth/AuthContext'
import { PATHS } from '../../../routes/paths'
import { navigateTo } from '../../../routes/router'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ email, motDePasse })
      navigateTo(PATHS.DASHBOARD)
    } catch (err) {
      setError(extractErrorMessage(err, 'Connexion impossible'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Connexion" subtitle="Accedez a votre espace TalentBridge" withBranding>
      <form className="tb-form" onSubmit={onSubmit}>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="login-password">Mot de passe</label>
        <input
          id="login-password"
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
        />

        <button type="submit" className="tb-btn tb-btn-solid" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <StatusMessage type="error">{error}</StatusMessage>

      <div className="tb-inline-links">
        <button type="button" className="tb-link" onClick={() => navigateTo(PATHS.FORGOT_PASSWORD)}>
          Mot de passe oublie
        </button>
        <button type="button" className="tb-link" onClick={() => navigateTo(PATHS.REGISTER)}>
          Creer un compte
        </button>
      </div>
    </FormCard>
  )
}
