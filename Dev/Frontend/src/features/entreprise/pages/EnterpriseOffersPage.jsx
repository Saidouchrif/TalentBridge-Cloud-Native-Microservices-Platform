import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { entrepriseOfferApplicationsPath, PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import {
  collectOffersForEntrepriseUser,
  createOffer,
  updateOffer,
} from '../../offers/services/offers.service'

const emptyOffer = () => ({
  titre: '',
  description: '',
  competencesRequises: '',
  localisation: '',
  type: 'stage',
  salaire: '',
  dateExpiration: '',
})

export default function EnterpriseOffersPage() {
  const { accessToken, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyOffer)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadList = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const list = await collectOffersForEntrepriseUser(user.id)
      setOffers(list)
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger vos offres'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const editingOffer = useMemo(() => {
    if (!editId) return null
    const n = Number(editId)
    return offers.find((o) => Number(o.id) === n) || null
  }, [editId, offers])

  useEffect(() => {
    if (editingOffer) {
      setEditingId(editingOffer.id)
      setForm({
        titre: editingOffer.titre || '',
        description: editingOffer.description || '',
        competencesRequises: editingOffer.competencesRequises || '',
        localisation: editingOffer.localisation || '',
        type: editingOffer.type || 'stage',
        salaire: editingOffer.salaire || '',
        dateExpiration: editingOffer.dateExpiration
          ? String(editingOffer.dateExpiration).slice(0, 10)
          : '',
      })
    } else if (!editId) {
      setEditingId(null)
      setForm(emptyOffer())
    }
  }, [editingOffer, editId])

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const clearEditParam = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('edit')
    setSearchParams(next, { replace: true })
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const body = {
        titre: form.titre.trim(),
        description: form.description.trim(),
        competencesRequises: form.competencesRequises.trim(),
        localisation: form.localisation.trim(),
        type: form.type,
        salaire: form.salaire.trim() || null,
        dateExpiration: form.dateExpiration || null,
      }
      if (editingId) {
        await updateOffer(accessToken, editingId, body)
        toast.success('Offre mise a jour')
      } else {
        await createOffer(accessToken, body)
        toast.success('Offre publiee')
      }
      clearEditParam()
      setEditingId(null)
      setForm(emptyOffer())
      await loadList()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Enregistrement impossible'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormCard title="Mes offres" subtitle="Publiez et gerez vos annonces. Les candidatures sont consultables par offre.">
      <StatusMessage type="error">{error}</StatusMessage>

      <section className="tb-panel">
        <h3>{editingId ? 'Modifier une offre' : 'Nouvelle offre'}</h3>
        <form className="tb-form" onSubmit={onSubmit}>
          <label htmlFor="of-titre">Titre</label>
          <input id="of-titre" value={form.titre} onChange={onChange('titre')} required />

          <label htmlFor="of-type">Type</label>
          <select id="of-type" value={form.type} onChange={onChange('type')}>
            <option value="stage">Stage</option>
            <option value="emploi">Emploi</option>
          </select>

          <label htmlFor="of-loc">Localisation</label>
          <input id="of-loc" value={form.localisation} onChange={onChange('localisation')} required />

          <label htmlFor="of-comp">Competences requises</label>
          <textarea id="of-comp" rows={3} value={form.competencesRequises} onChange={onChange('competencesRequises')} required />

          <label htmlFor="of-desc">Description</label>
          <textarea id="of-desc" rows={5} value={form.description} onChange={onChange('description')} required />

          <label htmlFor="of-sal">Salaire / gratification (optionnel)</label>
          <input id="of-sal" value={form.salaire} onChange={onChange('salaire')} />

          <label htmlFor="of-exp">Date d expiration (optionnel)</label>
          <input id="of-exp" type="date" value={form.dateExpiration} onChange={onChange('dateExpiration')} />

          <div className="tb-actions">
            <button type="submit" className="tb-btn tb-btn-solid" disabled={saving}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Publier'}
            </button>
            {editingId ? (
              <button
                type="button"
                className="tb-btn tb-btn-ghost"
                onClick={() => {
                  clearEditParam()
                  setEditingId(null)
                  setForm(emptyOffer())
                }}
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="tb-panel tb-mt">
        <h3>Vos annonces</h3>
        {loading ? (
          <div className="tb-loading-wrap">
            <span className="tb-loading-spinner" aria-hidden="true" />
            <span>Chargement...</span>
          </div>
        ) : offers.length === 0 ? (
          <p className="tb-empty-state">Vous n avez pas encore d offre publiee.</p>
        ) : (
          <ul className="tb-list-plain">
            {offers.map((o) => (
              <li key={o.id} className="tb-list-item-row">
                <div>
                  <strong>{o.titre}</strong>
                  <div className="tb-muted-small">
                    {o.type} - {o.localisation} - {o.statut}
                  </div>
                </div>
                <div className="tb-actions-inline">
                  <Link className="tb-btn tb-btn-ghost tb-btn-sm" to={entrepriseOfferApplicationsPath(o.id)}>
                    Candidatures
                  </Link>
                  <Link className="tb-btn tb-btn-ghost tb-btn-sm" to={`${PATHS.ENTREPRISE_OFFERS}?edit=${o.id}`}>
                    Modifier
                  </Link>
                  <Link className="tb-btn tb-btn-ghost tb-btn-sm" to={`/offres/${o.id}`}>
                    Voir
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </FormCard>
  )
}
