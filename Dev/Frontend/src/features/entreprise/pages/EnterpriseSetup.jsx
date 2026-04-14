import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { createEntrepriseProfile } from '../services/entreprise.service'

const emptyForm = () => ({
  nomEntreprise: '',
  secteur: '',
  description: '',
  adresse: '',
  ville: '',
  pays: '',
  siteWeb: '',
  logo: '',
  telephone: '',
})

export default function EnterpriseSetup() {
  const navigate = useNavigate()
  const { accessToken, refreshEnterpriseAccess } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        nomEntreprise: form.nomEntreprise.trim(),
        secteur: form.secteur.trim(),
        description: form.description.trim(),
        adresse: form.adresse.trim(),
        ville: form.ville.trim(),
        pays: form.pays.trim(),
        siteWeb: form.siteWeb.trim() || null,
        logo: form.logo.trim() || null,
        telephone: form.telephone.trim() || null,
      }
      await createEntrepriseProfile(payload, accessToken)
      await refreshEnterpriseAccess()
      toast.success('Profil entreprise enregistre')
      navigate(PATHS.OFFERS_HOME, { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible d enregistrer le profil entreprise'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Configurer votre entreprise" subtitle="Quelques informations pour publier des offres et recevoir des candidatures">
      <form className="tb-form" onSubmit={onSubmit}>
        <label htmlFor="ent-nom">Nom de l entreprise</label>
        <input id="ent-nom" value={form.nomEntreprise} onChange={onChange('nomEntreprise')} required />

        <label htmlFor="ent-secteur">Secteur</label>
        <input id="ent-secteur" value={form.secteur} onChange={onChange('secteur')} required />

        <label htmlFor="ent-desc">Description</label>
        <textarea id="ent-desc" rows={4} value={form.description} onChange={onChange('description')} required />

        <label htmlFor="ent-adr">Adresse</label>
        <input id="ent-adr" value={form.adresse} onChange={onChange('adresse')} required />

        <div className="tb-form-row">
          <div>
            <label htmlFor="ent-ville">Ville</label>
            <input id="ent-ville" value={form.ville} onChange={onChange('ville')} required />
          </div>
          <div>
            <label htmlFor="ent-pays">Pays</label>
            <input id="ent-pays" value={form.pays} onChange={onChange('pays')} required />
          </div>
        </div>

        <label htmlFor="ent-site">Site web (https://...)</label>
        <input id="ent-site" type="url" placeholder="https://..." value={form.siteWeb} onChange={onChange('siteWeb')} />

        <label htmlFor="ent-logo">Logo (URL optionnelle)</label>
        <input id="ent-logo" type="url" placeholder="https://..." value={form.logo} onChange={onChange('logo')} />

        <label htmlFor="ent-tel">Telephone</label>
        <input id="ent-tel" value={form.telephone} onChange={onChange('telephone')} />

        <button type="submit" className="tb-btn tb-btn-solid" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Valider mon profil entreprise'}
        </button>
      </form>

      <StatusMessage type="error">{error}</StatusMessage>
    </FormCard>
  )
}
