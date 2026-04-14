import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { getEntreprisePublicInfo } from '../../entreprise/services/entreprise.service'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { listOffers } from '../services/offers.service'

function formatDate(value) {
  if (!value) return 'Date non precisee'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const AVATAR_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#059669',
  '#d97706', '#dc2626', '#0891b2', '#4f46e5',
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function CompanyAvatar({ name }) {
  const letter = (name || '?')[0].toUpperCase()
  const bg = getAvatarColor(name || '')
  return (
    <span className="tb-company-avatar" style={{ background: bg }} aria-hidden="true">
      {letter}
    </span>
  )
}

function OfferCard({ offer, companyName }) {
  return (
    <article className="tb-offer-card">
      <div className="tb-offer-card-header">
        <CompanyAvatar name={companyName || ''} />
        <div className="tb-offer-card-header-text">
          <span className="tb-offer-company-name">{companyName || 'Entreprise'}</span>
          <span className="tb-offer-loc-sm">{offer.localisation || ''}</span>
        </div>
        <span className={`tb-offer-type tb-offer-type-${offer.type}`}>
          {offer.type === 'stage' ? 'Stage' : 'Emploi'}
        </span>
      </div>
      <h3 className="tb-offer-card-title">{offer.titre}</h3>
      <p className="tb-offer-card-desc">{offer.description}</p>
      <div className="tb-offer-footer">
        <span>{formatDate(offer.datePublication)}</span>
        <span>{offer.salaire || 'Salaire non precise'}</span>
      </div>
      <Link className="tb-btn tb-btn-solid tb-btn-sm" to={`/offres/${offer.id}`}>
        Voir le detail
      </Link>
    </article>
  )
}

const PAGE_CONFIG = {
  all: {
    title: 'Catalogue des offres',
    subtitle: 'Toutes les offres disponibles sur la plateforme',
    heading: 'Toutes les offres',
    filter: '',
  },
  stage: {
    title: 'Offres de stage',
    subtitle: 'Opportunites de stage pour etudiants',
    heading: 'Stages',
    filter: 'stage',
  },
  emploi: {
    title: 'Offres d emploi',
    subtitle: 'Opportunites professionnelles',
    heading: 'Emplois',
    filter: 'emploi',
  },
}

export default function OffersHomePage({ mode = 'all' }) {
  const config = PAGE_CONFIG[mode] || PAGE_CONFIG.all
  const [offers, setOffers] = useState([])
  const [companyMap, setCompanyMap] = useState({})
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qInput, setQInput] = useState('')
  const [locInput, setLocInput] = useState('')
  const [compInput, setCompInput] = useState('')
  const [filters, setFilters] = useState({ q: '', localisation: '', competencesRequises: '' })
  const [page, setPage] = useState(1)
  const companyCache = useRef({})

  useEffect(() => {
    setPage(1)
  }, [config.filter])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const payload = await listOffers({
          type: config.filter,
          limit: 12,
          page,
          q: filters.q,
          localisation: filters.localisation,
          competencesRequises: filters.competencesRequises,
        })
        if (!active) return
        const rows = payload?.data || []
        setOffers(rows)
        if (payload?.pagination) setPagination(payload.pagination)

        const ids = [...new Set(rows.map((o) => o.entreprise_id).filter(Boolean))]
        const uncached = ids.filter((id) => !companyCache.current[id])
        if (uncached.length > 0) {
          const results = await Promise.allSettled(
            uncached.map((id) => getEntreprisePublicInfo(id).then((info) => ({ id, info }))),
          )
          for (const r of results) {
            if (r.status === 'fulfilled' && r.value?.info) {
              companyCache.current[r.value.id] = r.value.info.nomEntreprise || ''
            }
          }
        }
        if (active) {
          const map = {}
          for (const id of ids) {
            if (companyCache.current[id]) map[id] = companyCache.current[id]
          }
          setCompanyMap(map)
        }
      } catch (err) {
        if (!active) return
        setError(extractErrorMessage(err, 'Impossible de charger les offres pour le moment.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [config.filter, page, filters])

  const onSearchSubmit = (event) => {
    event.preventDefault()
    setFilters({ q: qInput, localisation: locInput, competencesRequises: compInput })
    setPage(1)
  }

  return (
    <div className="tb-offers-page">
      <div className="tb-offers-page-header">
        <div>
          <span className="tb-eyebrow">TalentBridge</span>
          <h1>{config.heading}</h1>
          <p className="tb-subtitle">{config.subtitle}</p>
        </div>
      </div>

      <form className="tb-filters-bar" onSubmit={onSearchSubmit}>
        <div className="tb-filter-inputs">
          <input
            type="search"
            placeholder="Mots-cles (titre, description...)"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            aria-label="Recherche"
          />
          <input
            type="text"
            placeholder="Localisation"
            value={locInput}
            onChange={(e) => setLocInput(e.target.value)}
            aria-label="Localisation"
          />
          <input
            type="text"
            placeholder="Competences"
            value={compInput}
            onChange={(e) => setCompInput(e.target.value)}
            aria-label="Competences"
          />
        </div>
        <button type="submit" className="tb-btn tb-btn-solid tb-filter-btn">
          Rechercher
        </button>
      </form>

      <StatusMessage type="error">{error}</StatusMessage>

      {loading ? (
        <div className="tb-loading-wrap">
          <span className="tb-loading-spinner" aria-hidden="true" />
          <span>Chargement des offres...</span>
        </div>
      ) : offers.length === 0 ? (
        <div className="tb-empty-state tb-empty-state-lg">
          <h3>Aucune offre trouvee</h3>
          <p>Aucune offre ne correspond a votre recherche pour le moment.</p>
        </div>
      ) : (
        <>
          <section className="tb-offers-grid">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                companyName={companyMap[offer.entreprise_id] || ''}
              />
            ))}
          </section>

          <nav className="tb-pagination" aria-label="Pagination">
            <button
              type="button"
              className="tb-btn tb-btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              &larr; Precedent
            </button>
            <span className="tb-pagination-info">
              Page {pagination.page || page}
              {pagination.totalPages ? ` / ${pagination.totalPages}` : ''}
              {pagination.total != null ? ` \u00b7 ${pagination.total} offres` : ''}
            </span>
            <button
              type="button"
              className="tb-btn tb-btn-ghost"
              disabled={pagination.totalPages != null && page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant &rarr;
            </button>
          </nav>
        </>
      )}
    </div>
  )
}
