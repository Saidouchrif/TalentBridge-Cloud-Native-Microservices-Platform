import { FormCard } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { navigateTo } from '../../../routes/router'

export default function NotFoundPage() {
  return (
    <FormCard title="Page introuvable" subtitle="La route demandee n'existe pas." withBranding>
      <button type="button" className="tb-btn tb-btn-solid" onClick={() => navigateTo(PATHS.LOGIN)}>
        Retour accueil
      </button>
    </FormCard>
  )
}
