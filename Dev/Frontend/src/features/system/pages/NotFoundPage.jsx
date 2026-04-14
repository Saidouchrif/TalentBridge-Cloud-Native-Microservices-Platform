import { useNavigate } from 'react-router-dom'

import { FormCard } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <FormCard title="Page introuvable" subtitle="La route demandee n'existe pas." withBranding>
      <button type="button" className="tb-btn tb-btn-solid" onClick={() => navigate(PATHS.LOGIN)}>
        Retour accueil
      </button>
    </FormCard>
  )
}
