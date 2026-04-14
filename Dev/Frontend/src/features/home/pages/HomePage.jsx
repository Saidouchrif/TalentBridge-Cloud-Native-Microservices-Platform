import { useNavigate } from 'react-router-dom'

import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6H5Z" />
      </svg>
    ),
    title: 'Gestion des profils',
    text: 'Creez et enrichissez votre profil etudiant ou entreprise pour maximiser votre visibilite sur la plateforme.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6H4v12h16V6Zm-2 2v3h-5V8h5ZM6 8h5v3H6V8Zm0 5h12v3H6v-3Z" />
      </svg>
    ),
    title: 'Offres et candidatures',
    text: 'Parcourez les stages et emplois, postulez en un clic et suivez le statut de chaque candidature en temps reel.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 4H3v16h18V4ZM7 8h4v2H7V8Zm0 4h10v2H7v-2Zm0 4h7v1H7v-1Zm12-8h-4v2h4V8Z" />
      </svg>
    ),
    title: 'Outils IA',
    text: 'Generez des CV, lettres de motivation et emails professionnels grace a l intelligence artificielle integree.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
      </svg>
    ),
    title: 'Matching intelligent',
    text: 'Notre algorithme analyse vos competences et experiences pour vous recommander les meilleures opportunites.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 1 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" />
      </svg>
    ),
    title: 'Notifications',
    text: 'Restez informe en temps reel des nouvelles offres, reponses et mises a jour importantes de votre activite.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="tb-home-page">
      <section className="tb-hero">
        <span className="tb-hero-pill">Plateforme SaaS</span>
        <h1 className="tb-hero-title">TalentBridge</h1>
        <p className="tb-hero-desc">
          Plateforme SaaS pour connecter etudiants et entreprises grace a l&apos;intelligence artificielle.
          Trouvez le stage ou l&apos;emploi ideal, ou recrutez les meilleurs talents.
        </p>
        <div className="tb-hero-actions">
          <button
            type="button"
            className="tb-btn tb-btn-solid tb-btn-lg"
            onClick={() => navigate(isAuthenticated ? PATHS.OFFERS_HOME : PATHS.REGISTER)}
          >
            Commencer
          </button>
          <button
            type="button"
            className="tb-btn tb-btn-ghost tb-btn-lg"
            onClick={() => navigate(PATHS.SERVICES)}
          >
            Decouvrir nos services
          </button>
        </div>
      </section>

      <section className="tb-features-section">
        <span className="tb-eyebrow">Fonctionnalites</span>
        <h2>Tout ce dont vous avez besoin</h2>
        <p className="tb-subtitle">
          Une suite complete d outils pour accelerer votre carriere ou vos recrutements.
        </p>
        <div className="tb-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="tb-feature-card">
              <div className="tb-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tb-cta-section">
        <h2>Pret a commencer ?</h2>
        <p>Rejoignez des milliers d etudiants et entreprises qui utilisent deja TalentBridge.</p>
        <button
          type="button"
          className="tb-btn tb-btn-solid tb-btn-lg"
          onClick={() => navigate(PATHS.REGISTER)}
        >
          S&apos;inscrire maintenant
        </button>
      </section>
    </div>
  )
}
