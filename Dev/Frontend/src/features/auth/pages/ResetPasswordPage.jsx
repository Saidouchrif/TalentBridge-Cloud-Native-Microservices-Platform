import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPasswordWithToken } = useAuth()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Token manquant dans l URL.')
      return
    }

    if (password !== confirmPassword) {
      setError('La confirmation du mot de passe est differente.')
      return
    }

    setLoading(true)
    try {
      const payload = await resetPasswordWithToken(token, password)
      setSuccess(payload.message || 'Mot de passe modifie avec succes')
    } catch (err) {
      setError(extractErrorMessage(err, 'Reinitialisation impossible'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Nouveau mot de passe" subtitle="Saisissez un mot de passe fort" withBranding>
      <form className="tb-form" onSubmit={onSubmit}>
        <label htmlFor="reset-password">Mot de passe</label>
        <input
          id="reset-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <label htmlFor="reset-password-confirm">Confirmer le mot de passe</label>
        <input
          id="reset-password-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit" className="tb-btn tb-btn-solid" disabled={loading}>
          {loading ? 'Validation...' : 'Valider'}
        </button>
      </form>

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
