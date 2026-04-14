import { useCallback, useEffect, useState } from 'react'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { listerMesNotifications, marquerNotificationLue, marquerToutesLues } from '../services/notifications.service'

const TYPE_LABELS = {
  candidature: 'Candidature',
  offre: 'Offre',
  statut: 'Statut',
  onboarding: 'Activation',
  system: 'Notification',
}

const TYPE_COLORS = {
  candidature: '#2563eb',
  offre: '#7c3aed',
  statut: '#059669',
  onboarding: '#d97706',
  system: '#6b7280',
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function NotificationsPage() {
  const { accessToken } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const unreadCount = items.filter((n) => !n.lu).length

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listerMesNotifications(accessToken)
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger les notifications pour le moment'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  const onRead = async (id) => {
    try {
      await marquerNotificationLue(accessToken, id)
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)))
    } catch { /* no-op */ }
  }

  const onReadAll = async () => {
    try {
      await marquerToutesLues(accessToken)
      setItems((prev) => prev.map((n) => ({ ...n, lu: true })))
    } catch { /* no-op */ }
  }

  if (loading) {
    return (
      <FormCard title="Notifications" subtitle="Centre de messages">
        <div className="tb-loading-wrap">
          <span className="tb-loading-spinner" aria-hidden="true" />
          <span>Chargement...</span>
        </div>
      </FormCard>
    )
  }

  return (
    <FormCard title="Notifications" subtitle="Messages li&eacute;s &agrave; votre activit&eacute; sur TalentBridge">
      <StatusMessage type="error">{error}</StatusMessage>

      {unreadCount > 0 ? (
        <div className="tb-notif-toolbar">
          <span>{unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</span>
          <button type="button" className="tb-btn tb-btn-ghost tb-btn-sm" onClick={onReadAll}>
            Tout marquer comme lu
          </button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="tb-empty-state">Aucune notification pour le moment.</p>
      ) : (
        <ul className="tb-notif-list">
          {items.map((n) => {
            const tLabel = TYPE_LABELS[n.type] || 'Notification'
            const tColor = TYPE_COLORS[n.type] || '#6b7280'
            return (
              <li key={n.id} className={`tb-notif-item${n.lu ? ' tb-notif-read' : ''}`}>
                <div className="tb-notif-item-top">
                  <span className="tb-notif-type-pill" style={{ backgroundColor: tColor }}>
                    {tLabel}
                  </span>
                  <span className="tb-muted-small">{formatDate(n.created_at)}</span>
                </div>
                <p className="tb-notif-msg">{n.message}</p>
                {!n.lu ? (
                  <button type="button" className="tb-btn tb-btn-ghost tb-btn-sm" onClick={() => onRead(n.id)}>
                    Marquer comme lu
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </FormCard>
  )
}
