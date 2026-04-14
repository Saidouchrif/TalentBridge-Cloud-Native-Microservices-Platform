import { ENV } from '../../../config/env'

async function parseResponse(response) {
  const ct = response.headers.get('content-type') || ''
  if (ct.includes('application/json')) return response.json()
  return []
}

function buildError(status, payload) {
  const err = new Error(payload?.message || 'Matching indisponible')
  err.status = status
  return err
}

export async function recommandationsOffres(accessToken) {
  const res = await fetch(`${ENV.matching}/api/matching/offres`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseResponse(res)
  if (!res.ok) throw buildError(res.status, data)
  return Array.isArray(data) ? data : []
}

export async function recommandationsCandidats(accessToken, offreId) {
  const res = await fetch(`${ENV.matching}/api/matching/candidats/${offreId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseResponse(res)
  if (!res.ok) throw buildError(res.status, data)
  return Array.isArray(data) ? data : []
}
