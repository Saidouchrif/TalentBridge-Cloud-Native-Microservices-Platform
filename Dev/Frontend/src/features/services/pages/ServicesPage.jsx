import { useNavigate } from 'react-router-dom'

import { PATHS } from '../../../routes/paths'

const PLANS = [
  {
    name: 'Gratuit',
    accent: '#16a34a',
    price: '0 MAD',
    period: 'pour toujours',
    features: [
      'Voir les offres de stage et d emploi',
      'Postuler directement aux annonces',
      'Profil etudiant ou entreprise',
      'Suivi des candidatures',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'Abonnement IA',
    accent: '#2563eb',
    price: '49 MAD',
    period: '/ mois',
    features: [
      'Generation de CV professionnels',
      'Lettre de motivation personnalisee',
      'Email professionnel assiste par IA',
      'Adaptation du CV pour chaque offre',
    ],
    cta: 'S abonner',
    popular: true,
  },
  {
    name: 'Premium',
    accent: '#dc2626',
    price: '99 MAD',
    period: '/ mois',
    features: [
      'Toutes les fonctionnalites IA',
      'Matching intelligent',
      'Recommandations personnalisees',
      'Notifications selon vos competences',
      'Support prioritaire',
    ],
    cta: 'S abonner',
    popular: false,
  },
]

export default function ServicesPage() {
  const navigate = useNavigate()

  return (
    <div className="tb-services-page">
      <div className="tb-services-header">
        <span className="tb-eyebrow">Tarification</span>
        <h1>Nos services</h1>
        <p className="tb-subtitle">
          Choisissez le plan adapte a vos besoins. Commencez gratuitement et passez a la vitesse superieure avec nos outils IA.
        </p>
      </div>

      <div className="tb-plans-grid">
        {PLANS.map((plan) => (
          <div key={plan.name} className={`tb-plan-card${plan.popular ? ' is-popular' : ''}`}>
            {plan.popular ? <span className="tb-plan-badge">Populaire</span> : null}
            <div className="tb-plan-dot" style={{ background: plan.accent }} />
            <h3>{plan.name}</h3>
            <div className="tb-plan-price">
              <strong>{plan.price}</strong>
              <span>{plan.period}</span>
            </div>
            <ul className="tb-plan-features">
              {plan.features.map((f) => (
                <li key={f}>
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`tb-btn ${plan.popular ? 'tb-btn-solid' : 'tb-btn-ghost'} tb-btn-lg tb-plan-cta`}
              onClick={() => navigate(PATHS.REGISTER)}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
