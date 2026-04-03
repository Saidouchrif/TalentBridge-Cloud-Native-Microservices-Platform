export function getCurrentPath() {
  const pathname = window.location.pathname || '/'
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function navigateTo(path, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState({}, '', path)
  } else {
    window.history.pushState({}, '', path)
  }
  window.dispatchEvent(new Event('popstate'))
}

export function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search)
  return params.get(key)
}
