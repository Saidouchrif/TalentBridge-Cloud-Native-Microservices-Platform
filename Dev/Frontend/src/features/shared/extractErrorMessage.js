export function extractErrorMessage(error, fallback = 'Operation echouee') {
  if (!error) return fallback
  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message
  }

  if (typeof error.payload?.detail === 'string' && error.payload.detail.trim().length > 0) {
    return error.payload.detail
  }

  if (typeof error.payload?.message === 'string' && error.payload.message.trim().length > 0) {
    return error.payload.message
  }

  return fallback
}
