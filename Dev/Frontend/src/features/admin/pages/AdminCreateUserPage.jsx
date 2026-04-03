import { useState } from 'react'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

function StudentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4 2.5 8.8 12 13.5l7.4-3.8V15h2.1V8.8L12 4Zm-5 9.4V16c0 1.7 2.3 3 5 3s5-1.3 5-3v-2.6L12 16.1 7 13.4Z" />
    </svg>
  )
}

function CompanyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 20h18v-2.1h-1.8V4.5H9.8v13.4H8.2V9H3v11Zm2.1-2.1v-6.8h1v6.8h-1Zm6.8 0v-2h1v2h-1Zm0-4v-2h1v2h-1Zm0-4V8h1v2h-1Zm3.1 8v-2h1v2h-1Zm0-4v-2h1v2h-1Zm0-4V8h1v2h-1Z" />
    </svg>
  )
}

const ROLE_OPTIONS = [
  {
    value: 'etudiant',
    label: 'Etudiant',
    description: 'Compte oriente formation, candidatures et suivi parcours.',
  },
  {
    value: 'entreprise',
    label: 'Entreprise',
    description: 'Compte oriente recrutement, gestion offres et suivi talents.',
  },
]

export default function AdminCreateUserPage() {
  const { createUserByAdmin } = useAuth()

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'etudiant',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const onChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const selectRole = (role) => {
    setForm((prev) => ({ ...prev, role }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = await createUserByAdmin(form)
      setSuccess(`Utilisateur cree: ${payload.email}`)
      setForm({ nom: '', prenom: '', email: '', motDePasse: '', role: 'etudiant' })
    } catch (err) {
      setError(extractErrorMessage(err, 'Creation utilisateur impossible'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Admin - Creer utilisateur" subtitle="Creation manuelle d'un compte par l'administrateur">
      <form className="tb-form" onSubmit={onSubmit}>
        <label htmlFor="admin-create-nom">Nom</label>
        <input id="admin-create-nom" value={form.nom} onChange={onChange('nom')} required />

        <label htmlFor="admin-create-prenom">Prenom</label>
        <input id="admin-create-prenom" value={form.prenom} onChange={onChange('prenom')} required />

        <label htmlFor="admin-create-email">Email</label>
        <input id="admin-create-email" type="email" value={form.email} onChange={onChange('email')} required />

        <label htmlFor="admin-create-password">Mot de passe</label>
        <input
          id="admin-create-password"
          type="password"
          minLength={8}
          value={form.motDePasse}
          onChange={onChange('motDePasse')}
          required
        />

        <div className="tb-role-picker-label">Type de compte</div>
        <div className="tb-role-picker" role="radiogroup" aria-label="Selection role utilisateur">
          {ROLE_OPTIONS.map(({ value, label, description }) => {
            const selected = form.role === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`tb-role-card${selected ? ' is-active' : ''}`}
                onClick={() => selectRole(value)}
              >
                <span className="tb-role-icon">{value === 'etudiant' ? <StudentIcon /> : <CompanyIcon />}</span>
                <span className="tb-role-title">{label}</span>
                <span className="tb-role-description">{description}</span>
              </button>
            )
          })}
        </div>

        <button type="submit" className="tb-btn tb-btn-solid" disabled={loading}>
          {loading ? 'Creation...' : 'Creer utilisateur'}
        </button>
      </form>

      <StatusMessage type="success">{success}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>
    </FormCard>
  )
}
