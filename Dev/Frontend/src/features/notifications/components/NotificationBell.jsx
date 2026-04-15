import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { listerMesNotifications, marquerNotificationLue, marquerToutesLues } from '../services/notifications.service'
import { subscribeNotificationsRefresh } from '../services/notificationBus'

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.6a4.9 4.9 0 0 0-4.9 4.9v2.1c0 .9-.3 1.8-.8 2.6l-1.2 1.8c-.3.4-.3.9-.1 1.3.2.4.7.7 1.2.7h11.6c.5 0 1-.3 1.2-.7.2-.4.2-.9-.1-1.3l-1.2-1.8a4.6 4.6 0 0 1-.8-2.6V8.5A4.9 4.9 0 0 0 12 3.6Zm0 17.1c1.2 0 2.2-.8 2.5-1.9H9.5c.3 1.1 1.3 1.9 2.5 1.9Z" />
    </svg>
  )
}

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

function typeLabel(type) {
  return TYPE_LABELS[type] || 'Notification'
}

function typeColor(type) {
  return TYPE_COLORS[type] || '#6b7280'
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "A l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

export default function NotificationBell() {
  const {
    accessToken,
    isAuthenticated,
    profileGateLoading,
    mustVerifyEmail,
    needsStudentSetup,
    needsEnterpriseSetup,
    user,
  } = useAuth()

  const hints = useMemo(() => {
    const list = []

    if (mustVerifyEmail) {
      list.push({
        id: 'hint-email',
        synthetic: true,
        lu: false,
        message: 'V\u00e9rifiez votre adresse email pour activer le compte.',
        type: 'onboarding',
      })
    }

    if (user?.role === 'etudiant' && needsStudentSetup) {
      list.push({
        id: 'hint-student',
        synthetic: true,
        lu: false,
        message: 'Compl\u00e9tez votre profil \u00e9tudiant pour postuler et recevoir des recommandations.',
        type: 'onboarding',
      })
    }

    if (user?.role === 'entreprise' && needsEnterpriseSetup) {
      list.push({
        id: 'hint-ent',
        synthetic: true,
        lu: false,
        message: 'Compl\u00e9tez la fiche entreprise pour publier des offres.',
        type: 'onboarding',
      })
    }

    return list
  }, [mustVerifyEmail, needsEnterpriseSetup, needsStudentSetup, user?.role])

  const [open, setOpen] = useState(false)
  const [remote, setRemote] = useState([])
  const [unreadRemote, setUnreadRemote] = useState(0)
  const panelRef = useRef(null)
  const loadRef = useRef(async () => {})

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setRemote([])
      setUnreadRemote(0)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const data = await listerMesNotifications(accessToken)
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        setRemote(list)
        setUnreadRemote(list.filter((n) => !n.lu).length)
      } catch {
        // Keep previous notifications when request fails (token refresh / network transient).
      }
    }

    loadRef.current = load
    load()
    const timer = window.setInterval(load, 8000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [accessToken, isAuthenticated, profileGateLoading])

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return () => {}

    const onRefreshRequested = () => {
      loadRef.current?.()
    }
    const onFocus = () => {
      loadRef.current?.()
    }

    const unsubscribe = subscribeNotificationsRefresh(onRefreshRequested)
    window.addEventListener('focus', onFocus)

    return () => {
      unsubscribe()
      window.removeEventListener('focus', onFocus)
    }
  }, [accessToken, isAuthenticated])

  useEffect(() => {
    const onDocPointerDown = (event) => {
      if (!open) return
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocPointerDown)
    return () => document.removeEventListener('mousedown', onDocPointerDown)
  }, [open])

  const combined = [...hints, ...remote.slice(0, 10)]
  const unreadCount = hints.filter((h) => !h.lu).length + unreadRemote

  const onMarkRead = async (n) => {
    if (n.synthetic) return
    try {
      await marquerNotificationLue(accessToken, n.id)
      setRemote((prev) => prev.map((item) => (item.id === n.id ? { ...item, lu: true } : item)))
      setUnreadRemote((c) => Math.max(0, c - 1))
    } catch { /* no-op */ }
  }

  const onMarkAllRead = async () => {
    try {
      await marquerToutesLues(accessToken)
      setRemote((prev) => prev.map((item) => ({ ...item, lu: true })))
      setUnreadRemote(0)
    } catch { /* no-op */ }
  }

  if (!isAuthenticated) return null

  return (
    <div className="tb-bell-wrap" ref={panelRef}>
      <button
        type="button"
        className={`tb-icon-button${open ? ' is-open' : ''}`}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v)
          loadRef.current?.()
        }}
      >
        <span className="tb-icon-button-glyph" aria-hidden="true">
          <BellIcon />
        </span>
        {unreadCount > 0 ? <span className="tb-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="tb-bell-panel">
          <div className="tb-bell-panel-head">
            <div>
              <strong>Notifications</strong>
              <span>{unreadCount > 0 ? `${unreadCount} non lue(s)` : '\u00c0 jour'}</span>
            </div>
            <div className="tb-bell-panel-actions">
              {unreadRemote > 0 ? (
                <button type="button" className="tb-link-quiet" onClick={onMarkAllRead}>
                  Tout marquer lu
                </button>
              ) : null}
              <Link to={PATHS.NOTIFICATIONS} className="tb-link-quiet" onClick={() => setOpen(false)}>
                Tout voir
              </Link>
            </div>
          </div>

          {combined.length === 0 ? (
            <p className="tb-bell-empty">Aucune notification pour le moment.</p>
          ) : (
            <ul className="tb-bell-list">
              {combined.map((n) => (
                <li
                  key={n.id}
                  className={`tb-bell-li${n.lu ? ' read' : ''}`}
                  onClick={() => !n.lu && !n.synthetic && onMarkRead(n)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="tb-bell-li-head">
                    <span className="tb-bell-pill" style={{ backgroundColor: typeColor(n.type) }}>
                      {typeLabel(n.type)}
                    </span>
                    <span className="tb-bell-time">{timeAgo(n.created_at)}</span>
                  </div>
                  <p>{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
