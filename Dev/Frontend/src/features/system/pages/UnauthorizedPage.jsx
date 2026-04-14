import { useNavigate } from 'react-router-dom'

import { FormCard } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <FormCard title="Acces refuse" subtitle="Vous n'avez pas les droits pour consulter cette page." withBranding>
      <button type="button" className="tb-btn tb-btn-solid" onClick={() => navigate(PATHS.OFFERS_HOME)}>
        Retour accueil
      </button>
    </FormCard>
  )
}
