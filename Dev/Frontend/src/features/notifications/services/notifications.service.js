import axios from 'axios'

import { ENV } from '../../../config/env'

function buildErrorFromResponse(response) {
  const status = response?.status
  const payload = response?.data
  const detail = payload?.message || 'Notifications indisponibles'
  const err = new Error(detail)
  err.status = status
  err.payload = payload
  return err
}

const client = axios.create({
  baseURL: ENV.notifications,
  validateStatus: () => true,
})

export async function listerMesNotifications(accessToken) {
  const response = await client.get('/api/notifications/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status >= 200 && response.status < 300) {
    return Array.isArray(response.data) ? response.data : []
  }
  throw buildErrorFromResponse(response)
}

export async function marquerNotificationLue(accessToken, id) {
  const response = await client.patch(`/api/notifications/${id}/read`, null, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status >= 200 && response.status < 300) {
    return response.data
  }
  throw buildErrorFromResponse(response)
}

export async function marquerToutesLues(accessToken) {
  const response = await client.patch('/api/notifications/read-all', null, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status >= 200 && response.status < 300) {
    return response.data
  }
  throw buildErrorFromResponse(response)
}
