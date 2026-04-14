import { ENV } from '../../../config/env'

async function parseResponse(response) {
  if (response.status === 204) return null
  const ct = response.headers.get('content-type') || ''
  if (ct.includes('application/json')) return response.json()
  const text = await response.text()
  return { message: text || '' }
}

function buildError(status, payload) {
  const msg = payload?.message || payload?.detail || 'Requete entreprise echouee'
  const err = new Error(msg)
  err.status = status
  err.payload = payload
  return err
}

async function entrepriseRequest(path, accessToken, options = {}) {
  const res = await fetch(`${ENV.entreprise}${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const payload = await parseResponse(res)
  if (!res.ok) throw buildError(res.status, payload)
  return payload
}

export function createEntrepriseProfile(data, accessToken) {
  return entrepriseRequest('/api/entreprise/profile', accessToken, { method: 'POST', body: data })
}

export function getMyEntrepriseProfile(accessToken) {
  return entrepriseRequest('/api/entreprise/me', accessToken)
}

export function updateEntrepriseProfile(data, accessToken) {
  return entrepriseRequest('/api/entreprise/me', accessToken, { method: 'PUT', body: data })
}

export async function getEntreprisePublicInfo(userId) {
  const res = await fetch(`${ENV.entreprise}/api/entreprise/public/${userId}`)
  const payload = await parseResponse(res)
  if (!res.ok) return null
  return payload
}
