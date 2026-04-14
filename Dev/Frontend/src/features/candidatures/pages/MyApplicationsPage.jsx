import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { getEntreprisePublicInfo } from '../../entreprise/services/entreprise.service'
import { listerMesCandidatures } from '../services/candidatures.service'

const STATUS_MAP = {
  en_attente: { label: 'En attente', color: '#e67e22' },
  accepte: { label: 'Accept\u00e9', color: '#27ae60' },
  refuse: { label: 'Refus\u00e9', color: '#e74c3c' },
}

function formatStatus(raw) {
  return STATUS_MAP[raw] || { label: raw, color: '#888' }
}

function formatDate(value) {
  if (!value) return ' \u2013 '
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function MyApplicationsPage() {
  const { accessToken } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listerMesCandidatures(accessToken)
        const list = Array.isArray(data) ? data : []

        const entrepriseIds = [...new Set(list.map((c) => c.entreprise_id).filter(Boolean))]
        const nameCache = {}
        await Promise.all(
          entrepriseIds.map(async (eid) => {
            try {
              const info = await getEntreprisePublicInfo(eid)
              if (info?.nomEntreprise) nameCache[eid] = info.nomEntreprise
            } catch { /* ignore */ }
          }),
        )

        const enriched = list.map((c) => ({
          ...c,
          entreprise_nom: nameCache[c.entreprise_id] || null,
        }))

        if (active) setRows(enriched)
      } catch (err) {
        if (active) setError(extractErrorMessage(err, 'Impossible de charger vos candidatures'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [accessToken])

  if (loading) {
    return (
      <FormCard title="Mes candidatures" subtitle="Suivi de vos envois">
        <div className="tb-loading-wrap">
          <span className="tb-loading-spinner" aria-hidden="true" />
          <span>Chargement...</span>
        </div>
      </FormCard>
    )
  }

  return (
    <FormCard title="Mes candidatures" subtitle="Retrouvez le statut de chaque candidature">
      <StatusMessage type="error">{error}</StatusMessage>

      {rows.length === 0 ? (
        <div className="tb-empty-state">
          Vous n&apos;avez pas encore postul&eacute;. Explorez le{' '}
          <Link to={PATHS.OFFERS_HOME}>catalogue des offres</Link>.
        </div>
      ) : (
        <div className="tb-cand-grid">
          {rows.map((c) => {
            const st = formatStatus(c.statut)
            return (
              <div key={c.id} className="tb-cand-card">
                <div className="tb-cand-card-header">
                  <h3 className="tb-cand-card-title">
                    {c.offre_titre || `Offre #${c.offre_id}`}
                  </h3>
                  <span
                    className="tb-status-pill"
                    style={{ backgroundColor: st.color }}
                  >
                    {st.label}
                  </span>
                </div>

                {c.entreprise_nom ? (
                  <p className="tb-cand-card-company">{c.entreprise_nom}</p>
                ) : null}

                <p className="tb-cand-card-date">
                  Envoy&eacute;e le {formatDate(c.dateCandidature)}
                </p>

                {c.message ? (
                  <p className="tb-cand-card-message">
                    {c.message.length > 120 ? `${c.message.slice(0, 120)}...` : c.message}
                  </p>
                ) : null}

                <div className="tb-cand-card-footer">
                  <Link className="tb-btn tb-btn-outline tb-btn-sm" to={`/offres/${c.offre_id}`}>
                    Voir l&apos;offre
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </FormCard>
  )
}
