import axios from 'axios'

import { ENV } from '../../../config/env'

function buildErrorFromResponse(response, fallbackMessage) {
  const status = response?.status
  const payload = response?.data
  const detail = payload?.message || payload?.detail || fallbackMessage || 'Requete echouee'
  const err = new Error(detail)
  err.status = status
  err.payload = payload
  return err
}

const client = axios.create({
  baseURL: ENV.offres,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true,
})

async function unwrap(promise) {
  const response = await promise
  if (response.status >= 200 && response.status < 300) {
    return response.status === 204 ? null : response.data
  }
  throw buildErrorFromResponse(response)
}

export async function listOffers({ type = '', limit = 12, page = 1, q = '', localisation = '', competencesRequises = '' } = {}) {
  const params = {
    limit,
    page,
    sort: 'recent',
  }
  if (type) params.type = type
  if (q?.trim()) params.q = q.trim()
  if (localisation?.trim()) params.localisation = localisation.trim()
  if (competencesRequises?.trim()) params.competencesRequises = competencesRequises.trim()

  return unwrap(client.get('/api/offres', { params }))
}

export async function searchOffers({
  q = '',
  type = '',
  limit = 12,
  page = 1,
  localisation = '',
  competencesRequises = '',
} = {}) {
  const params = { limit, page }
  if (q?.trim()) params.q = q.trim()
  if (type) params.type = type
  if (localisation?.trim()) params.localisation = localisation.trim()
  if (competencesRequises?.trim()) params.competencesRequises = competencesRequises.trim()

  return unwrap(client.get('/api/offres/search', { params }))
}

export async function getOfferById(id) {
  return unwrap(client.get(`/api/offres/${id}`))
}

export async function createOffer(accessToken, body) {
  return unwrap(
    client.post('/api/offres', body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  )
}

export async function updateOffer(accessToken, id, body) {
  return unwrap(
    client.put(`/api/offres/${id}`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  )
}

export async function deleteOffer(accessToken, id) {
  return unwrap(
    client.delete(`/api/offres/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  )
}

/**
 * Pas d'endpoint dedie "mes offres" cote Offres-service : on parcourt le catalogue
 * (search) sur quelques pages et on filtre par entreprise_id (user_id JWT).
 */
export async function collectOffersForEntrepriseUser(entrepriseUserId, { pageSize = 80, maxPages = 8 } = {}) {
  const uid = Number(entrepriseUserId)
  const mine = []
  let page = 1

  while (page <= maxPages) {
    const payload = await searchOffers({ limit: pageSize, page, q: '' })
    const rows = payload?.data || []
    for (const row of rows) {
      if (Number(row.entreprise_id) === uid) {
        mine.push(row)
      }
    }
    const totalPages = payload?.pagination?.totalPages || 0
    if (page >= totalPages) break
    page += 1
  }

  mine.sort((a, b) => new Date(b.datePublication || 0) - new Date(a.datePublication || 0))
  return mine
}
