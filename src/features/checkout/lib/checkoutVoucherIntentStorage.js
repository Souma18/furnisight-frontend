const KEY = 'furnisight.checkout.voucher-intent'
const TTL_MS = 30 * 60 * 1000

export function writeVoucherIntent(code) {
  if (typeof window === 'undefined' || !code) return
  window.sessionStorage.setItem(KEY, JSON.stringify({ code, expiresAt: Date.now() + TTL_MS }))
}

export function consumeVoucherIntent() {
  if (typeof window === 'undefined') return ''
  const raw = window.sessionStorage.getItem(KEY)
  window.sessionStorage.removeItem(KEY)
  if (!raw) return ''
  try {
    const value = JSON.parse(raw)
    return Number(value.expiresAt) >= Date.now() ? String(value.code || '').trim() : ''
  } catch {
    return ''
  }
}
