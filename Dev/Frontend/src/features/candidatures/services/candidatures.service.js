import axios from 'axios'

import { ENV } from '../../../config/env'

function buildErrorFromResponse(response) {
  const status = response?.status
  const payload = response?.data
  const detail = payload?.message || payload?.detail || 'Erreur candidatures'
  const err = new Error(detail)
  err.status = status
  err.payload = payload
  return err
}

const client = axios.create({
  baseURL: ENV.candidatures,
  validateStatus: () => true,
})

async function authRequest(config, accessToken) {
  const response = await client.request({
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (response.status >= 200 && response.status < 300) {
    return response.status === 204 ? null : response.data
  }
  throw buildErrorFromResponse(response)
}

export function postuler(accessToken, { offre_id, message, cvFile, lettreFile, entreprise_nom }) {
  const formData = new FormData()
  formData.append('offre_id', String(offre_id))
  if (message) formData.append('message', message)
  if (entreprise_nom) formData.append('entreprise_nom', entreprise_nom)
  if (cvFile) formData.append('cv', cvFile)
  if (lettreFile) formData.append('lettre', lettreFile)

  return authRequest(
    {
      method: 'POST',
      url: '/api/candidatures',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    },
    accessToken,
  )
}

export function listerMesCandidatures(accessToken) {
  return authRequest({ method: 'GET', url: '/api/candidatures/me' }, accessToken)
}

export function verifierCandidature(accessToken, offreId) {
  return authRequest({ method: 'GET', url: `/api/candidatures/check/${offreId}` }, accessToken)
}

export function listerCandidaturesParOffre(accessToken, offreId) {
  return authRequest({ method: 'GET', url: `/api/candidatures/offre/${offreId}` }, accessToken)
}

export function mettreAJourStatutCandidature(accessToken, candidatureId, statut) {
  return authRequest(
    { method: 'PUT', url: `/api/candidatures/${candidatureId}/statut`, data: { statut } },
    accessToken,
  )
}
