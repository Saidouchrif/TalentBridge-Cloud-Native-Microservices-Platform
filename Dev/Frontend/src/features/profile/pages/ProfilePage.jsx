import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import EnterpriseWorkspace from '../../entreprise/components/EnterpriseWorkspace'
import StudentWorkspace from '../../student/components/StudentWorkspace'

function ChangePasswordForm() {
  const { changePassword } = useAuth()
  const [ancienMotDePasse, setAncienMotDePasse] = useState('')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (nouveauMotDePasse.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caracteres.')
      return
    }

    if (nouveauMotDePasse !== confirmation) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.')
      return
    }

    if (ancienMotDePasse === nouveauMotDePasse) {
      setError('Le nouveau mot de passe doit etre different de l ancien.')
      return
    }

    setLoading(true)
    try {
      const result = await changePassword(ancienMotDePasse, nouveauMotDePasse)
      setSuccess(result.message || 'Mot de passe modifie avec succes.')
      setAncienMotDePasse('')
      setNouveauMotDePasse('')
      setConfirmation('')
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de modifier le mot de passe.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Changer le mot de passe" subtitle="Saisissez votre ancien mot de passe puis le nouveau">
      <form className="tb-form" onSubmit={onSubmit}>
        <label htmlFor="cp-ancien">Ancien mot de passe</label>
        <input
          id="cp-ancien"
          type="password"
          value={ancienMotDePasse}
          onChange={(e) => setAncienMotDePasse(e.target.value)}
          required
          autoComplete="current-password"
        />

        <label htmlFor="cp-nouveau">Nouveau mot de passe</label>
        <input
          id="cp-nouveau"
          type="password"
          value={nouveauMotDePasse}
          onChange={(e) => setNouveauMotDePasse(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
        />

        <label htmlFor="cp-confirmation">Confirmer le nouveau mot de passe</label>
        <input
          id="cp-confirmation"
          type="password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
        />

        <button type="submit" className="tb-btn tb-btn-solid" disabled={loading}>
          {loading ? 'Modification...' : 'Modifier le mot de passe'}
        </button>
      </form>

      <StatusMessage type="success">{success}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>
    </FormCard>
  )
}

export default function ProfilePage() {
  const { user, updateMyProfile, loadProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    setNom(user.nom || '')
    setPrenom(user.prenom || '')
    setEmail(user.email || '')
  }, [user])

  if (activeTab === 'security') {
    return <ChangePasswordForm />
  }

  if (user?.role === 'etudiant') {
    return <StudentWorkspace mode="profile" />
  }

  if (user?.role === 'entreprise') {
    return <EnterpriseWorkspace />
  }

  const onReloadProfile = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await loadProfile()
      setSuccess('Profil actualise')
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible d actualiser le profil'))
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateMyProfile({ nom, prenom, email })
      setSuccess('Profil mis a jour avec succes')
    } catch (err) {
      setError(extractErrorMessage(err, 'Mise a jour impossible'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Mon profil" subtitle="Mettez a jour vos informations personnelles">
      <form className="tb-form" onSubmit={onSubmit}>
        <label htmlFor="profile-nom">Nom</label>
        <input id="profile-nom" value={nom} onChange={(e) => setNom(e.target.value)} required />

        <label htmlFor="profile-prenom">Prenom</label>
        <input id="profile-prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />

        <label htmlFor="profile-email">Email</label>
        <input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <div className="tb-actions">
          <button type="submit" className="tb-btn tb-btn-solid" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" className="tb-btn tb-btn-ghost" onClick={onReloadProfile} disabled={loading}>
            Recharger
          </button>
        </div>
      </form>

      <StatusMessage type="success">{success}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>
    </FormCard>
  )
}
