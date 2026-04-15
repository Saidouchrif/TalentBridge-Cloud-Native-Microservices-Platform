const NOTIFICATIONS_REFRESH_EVENT = 'tb:notifications:refresh'

export function triggerNotificationsRefresh() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT))
}

export function subscribeNotificationsRefresh(handler) {
  if (typeof window === 'undefined' || typeof handler !== 'function') {
    return () => {}
  }
  window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handler)
  return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handler)
}

