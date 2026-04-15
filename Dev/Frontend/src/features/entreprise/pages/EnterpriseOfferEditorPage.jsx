import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
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

export default function EnterpriseOfferEditorPage() {
  const { accessToken, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(false)
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
      setOffers(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger vos offres pour edition'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!editId) {
      setEditingId(null)
      setForm(emptyOffer())
      return
    }
    loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, user?.id])

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

  const onChange = (key) => (event) => {
    setForm((previous) => ({ ...previous, [key]: event.target.value }))
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
      navigate(PATHS.ENTREPRISE_OFFERS, { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Enregistrement impossible'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormCard title={editingId ? 'Modifier une offre' : 'Publier une offre'} subtitle="Creez ou mettez a jour une annonce.">
      <StatusMessage type="error">{error}</StatusMessage>
      {editId && !loading && !editingOffer ? (
        <StatusMessage type="error">Offre introuvable ou non accessible pour edition.</StatusMessage>
      ) : null}

      <div className="tb-actions tb-mb">
        <Link className="tb-btn tb-btn-ghost" to={PATHS.ENTREPRISE_OFFERS}>
          Voir mes annonces
        </Link>
      </div>

      <section className="tb-panel">
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
            <button
              type="button"
              className="tb-btn tb-btn-ghost"
              onClick={() => {
                clearEditParam()
                setEditingId(null)
                setForm(emptyOffer())
              }}
            >
              Reinitialiser
            </button>
          </div>
        </form>
      </section>
    </FormCard>
  )
}
