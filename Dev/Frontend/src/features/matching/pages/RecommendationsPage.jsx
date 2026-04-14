import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { getOfferById } from '../../offers/services/offers.service'
import { recommandationsOffres } from '../services/matching.service'

export default function RecommendationsPage() {
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
        const reco = await recommandationsOffres(accessToken)
        if (!active) return
        const list = Array.isArray(reco) ? reco : []
        const hydrated = await Promise.all(
          list.map(async (item) => {
            try {
              const offre = await getOfferById(item.offre_id)
              return { ...item, offre }
            } catch {
              return { ...item, offre: null }
            }
          }),
        )
        if (active) setRows(hydrated)
      } catch (err) {
        if (active) setError(extractErrorMessage(err, 'Recommandations indisponibles pour le moment'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [accessToken])

  if (loading) {
    return (
      <FormCard title="Recommandations" subtitle="Offres alignees sur votre profil">
        <div className="tb-loading-wrap">
          <span className="tb-loading-spinner" aria-hidden="true" />
          <span>Analyse en cours...</span>
        </div>
      </FormCard>
    )
  }

  return (
    <FormCard title="Recommandations" subtitle="Scores calcules par le service Matching">
      <StatusMessage type="error">{error}</StatusMessage>

      {rows.length === 0 ? (
        <div className="tb-empty-state">
          Aucune recommandation pour le moment. Verifiez votre{' '}
          <Link to={PATHS.PROFILE}>profil etudiant</Link> ou explorez le <Link to={PATHS.OFFERS_HOME}>catalogue</Link>.
        </div>
      ) : (
        <ul className="tb-list-plain">
          {rows.map((r) => (
            <li key={r.offre_id} className="tb-list-item-row">
              <div>
                <strong>{r.offre?.titre || `Offre #${r.offre_id}`}</strong>
                <div className="tb-muted-small">
                  Score : {r.score != null ? `${Math.round(r.score * 100) / 100}` : ' - '}
                  {r.offre?.localisation ? `  -  ${r.offre.localisation}` : ''}
                </div>
              </div>
              <Link className="tb-btn tb-btn-ghost tb-btn-sm" to={`/offres/${r.offre_id}`}>
                Consulter
              </Link>
            </li>
          ))}
        </ul>
      )}
    </FormCard>
  )
}
