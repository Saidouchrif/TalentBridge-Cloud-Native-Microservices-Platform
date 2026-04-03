import { FormCard } from '../../../components/ui/FormCard/FormCard'

export default function BootingPage() {
  return (
    <FormCard title="Initialisation" subtitle="Verification de la session en cours..." withBranding>
      <div className="tb-loading-wrap" aria-live="polite">
        <div className="tb-loading-spinner" />
        <span>Chargement de la plateforme...</span>
      </div>
    </FormCard>
  )
}
