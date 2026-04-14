import OffersHomePage from '../../offers/pages/OffersHomePage'

export default function OpportunityHubPage({ type = 'stage' }) {
  return <OffersHomePage mode={type} />
}
