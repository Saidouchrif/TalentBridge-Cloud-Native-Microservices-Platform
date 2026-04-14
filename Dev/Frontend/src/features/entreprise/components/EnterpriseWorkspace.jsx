import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { getMyEntrepriseProfile, updateEntrepriseProfile } from '../services/entreprise.service'

export default function EnterpriseWorkspace() {
  const { accessToken, refreshEnterpriseAccess } = useAuth()
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getMyEntrepriseProfile(accessToken)
        if (!active) return
        setForm({
          nomEntreprise: data.nomEntreprise || '',
          secteur: data.secteur || '',
          description: data.description || '',
          adresse: data.adresse || '',
          ville: data.ville || '',
          pays: data.pays || '',
          siteWeb: data.siteWeb || '',
          logo: data.logo || '',
          telephone: data.telephone || '',
        })
      } catch (err) {
        if (!active) return
        setError(extractErrorMessage(err, 'Impossible de charger le profil entreprise'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [accessToken])

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateEntrepriseProfile(
        {
          nomEntreprise: form.nomEntreprise.trim(),
          secteur: form.secteur.trim(),
          description: form.description.trim(),
          adresse: form.adresse.trim(),
          ville: form.ville.trim(),
          pays: form.pays.trim(),
          siteWeb: form.siteWeb.trim() || null,
          logo: form.logo.trim() || null,
          telephone: form.telephone.trim() || null,
        },
        accessToken,
      )
      await refreshEnterpriseAccess()
      setSuccess('Profil entreprise mis a jour')
      toast.success('Profil entreprise enregistre')
    } catch (err) {
      setError(extractErrorMessage(err, 'Mise a jour impossible'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <FormCard title="Profil entreprise" subtitle="Chargement...">
        <div className="tb-loading-wrap">
          <span className="tb-loading-spinner" aria-hidden="true" />
          <span>Chargement du profil...</span>
        </div>
      </FormCard>
    )
  }

  return (
    <FormCard title="Profil entreprise" subtitle="Informations visibles dans vos offres et echanges">
      <form className="tb-form" onSubmit={onSubmit}>
        <label htmlFor="ew-nom">Nom de l entreprise</label>
        <input id="ew-nom" value={form.nomEntreprise} onChange={onChange('nomEntreprise')} required />

        <label htmlFor="ew-secteur">Secteur</label>
        <input id="ew-secteur" value={form.secteur} onChange={onChange('secteur')} required />

        <label htmlFor="ew-desc">Description</label>
        <textarea id="ew-desc" rows={4} value={form.description} onChange={onChange('description')} required />

        <label htmlFor="ew-adr">Adresse</label>
        <input id="ew-adr" value={form.adresse} onChange={onChange('adresse')} required />

        <div className="tb-form-row">
          <div>
            <label htmlFor="ew-ville">Ville</label>
            <input id="ew-ville" value={form.ville} onChange={onChange('ville')} required />
          </div>
          <div>
            <label htmlFor="ew-pays">Pays</label>
            <input id="ew-pays" value={form.pays} onChange={onChange('pays')} required />
          </div>
        </div>

        <label htmlFor="ew-site">Site web</label>
        <input id="ew-site" type="url" value={form.siteWeb} onChange={onChange('siteWeb')} />

        <label htmlFor="ew-logo">Logo (URL)</label>
        <input id="ew-logo" type="url" value={form.logo} onChange={onChange('logo')} />

        <label htmlFor="ew-tel">Telephone</label>
        <input id="ew-tel" value={form.telephone} onChange={onChange('telephone')} />

        <button type="submit" className="tb-btn tb-btn-solid" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      <StatusMessage type="success">{success}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>
    </FormCard>
  )
}
