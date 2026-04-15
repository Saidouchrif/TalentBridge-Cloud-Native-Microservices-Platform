import { Link } from 'react-router-dom'

import { FormCard } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const role = user?.role

  return (
    <FormCard title="Tableau de bord" subtitle="Acces rapide aux espaces TalentBridge">
      <p className="tb-subtitle">
        Bonjour {user?.prenom} {user?.nom}, voici les raccourcis utiles selon votre profil.
      </p>

      <div className="tb-dash-grid">
        <Link className="tb-dash-tile" to={PATHS.OFFERS_HOME}>
          <strong>Catalogue des offres</strong>
          <span>Parcourir toutes les opportunites</span>
        </Link>

        {role === 'etudiant' ? (
          <>
            <Link className="tb-dash-tile" to={PATHS.APPLICATIONS}>
              <strong>Mes candidatures</strong>
              <span>Suivre vos envois</span>
            </Link>
            <Link className="tb-dash-tile" to={PATHS.RECOMMENDATIONS}>
              <strong>Recommandations</strong>
              <span>Offres alignees sur votre profil</span>
            </Link>
            <Link className="tb-dash-tile" to={PATHS.AI_TOOLS}>
              <strong>Outils IA</strong>
              <span>CV, lettre, email</span>
            </Link>
          </>
        ) : null}

        {role === 'entreprise' ? (
          <>
            <Link className="tb-dash-tile" to={PATHS.ENTREPRISE_OFFERS}>
              <strong>Mes annonces</strong>
              <span>Voir toutes vos offres publiees</span>
            </Link>
            <Link className="tb-dash-tile" to={PATHS.ENTREPRISE_OFFER_NEW}>
              <strong>Publier une offre</strong>
              <span>Creer une nouvelle annonce</span>
            </Link>
            <Link className="tb-dash-tile" to={PATHS.AI_TOOLS}>
              <strong>Outils IA</strong>
              <span>Adapter vos textes d offre</span>
            </Link>
          </>
        ) : null}

        {role === 'admin' ? (
          <>
            <Link className="tb-dash-tile" to={PATHS.ADMIN_USERS}>
              <strong>Utilisateurs</strong>
              <span>Administration</span>
            </Link>
            <Link className="tb-dash-tile" to={PATHS.ADMIN_CREATE_USER}>
              <strong>Creer un utilisateur</strong>
            </Link>
          </>
        ) : null}

        <Link className="tb-dash-tile" to={PATHS.PROFILE}>
          <strong>Mon profil</strong>
          <span>Compte et fiche metier</span>
        </Link>
        <Link className="tb-dash-tile" to={PATHS.NOTIFICATIONS}>
          <strong>Notifications</strong>
          <span>Centre de messages</span>
        </Link>
      </div>
    </FormCard>
  )
}
