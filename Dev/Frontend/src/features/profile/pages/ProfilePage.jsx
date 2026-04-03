import { useEffect, useState } from 'react'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export default function ProfilePage() {
  const { user, updateMyProfile, loadProfile } = useAuth()

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
