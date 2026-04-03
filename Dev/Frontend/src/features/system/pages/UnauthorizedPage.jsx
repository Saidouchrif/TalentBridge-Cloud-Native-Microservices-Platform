import { FormCard } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { navigateTo } from '../../../routes/router'

export default function UnauthorizedPage() {
  return (
    <FormCard title="Acces refuse" subtitle="Vous n'avez pas les droits pour consulter cette page." withBranding>
      <button type="button" className="tb-btn tb-btn-solid" onClick={() => navigateTo(PATHS.DASHBOARD)}>
        Retour dashboard
      </button>
    </FormCard>
  )
}
