import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { entrepriseOfferApplicationsPath, PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { collectOffersForEntrepriseUser } from '../../offers/services/offers.service'

export default function EnterpriseOffersPage() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!user?.id) return
      setLoading(true)
      setError('')
      try {
        const list = await collectOffersForEntrepriseUser(user.id)
        if (!active) return
        setOffers(Array.isArray(list) ? list : [])
      } catch (err) {
        if (!active) return
        setError(extractErrorMessage(err, 'Impossible de charger vos offres'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user?.id])

  return (
    <FormCard title="Mes annonces" subtitle="Liste de toutes vos offres publiees.">
      <StatusMessage type="error">{error}</StatusMessage>

      <div className="tb-actions tb-mb">
        <Link className="tb-btn tb-btn-solid" to={PATHS.ENTREPRISE_OFFER_NEW}>
          Publier une offre
        </Link>
      </div>

      <section className="tb-panel">
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
            {offers.map((offer) => (
              <li key={offer.id} className="tb-list-item-row">
                <div>
                  <strong>{offer.titre}</strong>
                  <div className="tb-muted-small">
                    {offer.type} - {offer.localisation} - {offer.statut}
                  </div>
                </div>
                <div className="tb-actions-inline">
                  <Link className="tb-btn tb-btn-ghost tb-btn-sm" to={entrepriseOfferApplicationsPath(offer.id)}>
                    Candidatures
                  </Link>
                  <Link className="tb-btn tb-btn-ghost tb-btn-sm" to={`${PATHS.ENTREPRISE_OFFER_NEW}?edit=${offer.id}`}>
                    Modifier
                  </Link>
                  <Link className="tb-btn tb-btn-ghost tb-btn-sm" to={`/offres/${offer.id}`}>
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
