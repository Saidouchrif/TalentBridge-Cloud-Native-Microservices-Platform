import { ENV } from '../../../config/env'

async function parseResponse(response) {
  const ct = response.headers.get('content-type') || ''
  if (ct.includes('application/json')) return response.json()
  const text = await response.text()
  return { message: text }
}

function buildError(status, payload) {
  const err = new Error(payload?.message || 'Service IA indisponible')
  err.status = status
  return err
}

async function aiPost(path, accessToken, body) {
  const res = await fetch(`${ENV.ai}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  const data = await parseResponse(res)
  if (!res.ok) throw buildError(res.status, data)
  return data
}

export const genererCv = (accessToken, body) =>
  aiPost('/api/ai/generate-cv', accessToken, body)

export const genererLettre = (accessToken, body) =>
  aiPost('/api/ai/generate-lettre', accessToken, body)

export const genererEmail = (accessToken, body) =>
  aiPost('/api/ai/generate-email', accessToken, body)

export const adapterOffre = (accessToken, body) =>
  aiPost('/api/ai/adapt-offre', accessToken, body)

export async function listerMesDocuments(accessToken) {
  const res = await fetch(`${ENV.ai}/api/documents/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseResponse(res)
  if (!res.ok) throw buildError(res.status, data)
  return Array.isArray(data) ? data : []
}

export async function supprimerDocument(accessToken, id) {
  const res = await fetch(`${ENV.ai}/api/documents/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const data = await parseResponse(res)
    throw buildError(res.status, data)
  }
}
