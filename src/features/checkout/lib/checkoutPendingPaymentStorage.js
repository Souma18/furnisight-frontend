const PENDING_PAYMENT_KEY = 'furnisight-pending-payment'

export function readPendingPayment() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(PENDING_PAYMENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writePendingPayment(payload) {
  if (typeof window === 'undefined') return

  if (!payload) {
    window.sessionStorage.removeItem(PENDING_PAYMENT_KEY)
    return
  }

  window.sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payload))
}
