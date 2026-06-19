import { i18n } from '@shared/i18n'

function t(key, params = {}) {
  return i18n.global.t(key, params)
}

function currentLocale() {
  return i18n.global.locale.value || 'vi'
}

export function discountLabel(voucher) {
  if (isShippingVoucher(voucher)) return t('promotions.voucher.discountShipping', { amount: formatCurrency(voucher.discountValue) })
  if (voucher.discountType === 'PERCENT') {
    return voucher.maxDiscount
      ? t('promotions.voucher.discountPercentMax', { percent: voucher.discountValue, amount: formatCurrency(voucher.maxDiscount) })
      : t('promotions.voucher.discountPercent', { percent: voucher.discountValue })
  }
  return t('promotions.voucher.discountAmount', { amount: formatCurrency(voucher.discountValue) })
}

export function isShippingVoucher(voucher) {
  return String(voucher.discountType || '').toUpperCase() === 'SHIPPING_CAP'
}

export function matchesVoucherType(voucher, filter) {
  if (filter === 'all') return true
  if (filter === 'shop') return !isShippingVoucher(voucher)
  if (filter === 'ship') return isShippingVoucher(voucher)
  return String(voucher.voucherType || '').toUpperCase() === filter
}

export function matchesVoucherTime(voucher, filter) {
  if (filter === 'all') return true
  const now = Date.now()
  const start = toTime(voucher.startDate)
  const end = toTime(voucher.endDate)
  if (filter === 'upcoming') return Boolean(start && start > now)
  if (filter === 'expired') return Boolean(end && end < now)
  if (filter === 'expiring') {
    return isActiveByTime(start, end, now) && Boolean(end && end - now <= 7 * 24 * 60 * 60 * 1000)
  }
  return voucher.active !== false && isActiveByTime(start, end, now)
}

export function conditionText(voucher) {
  if (!voucher.minOrder) return t('promotions.voucher.noMinOrder')
  return t('promotions.voucher.minOrder', { amount: formatCurrency(voucher.minOrder) })
}

export function voucherStatusClass(voucher) {
  const now = Date.now()
  const start = toTime(voucher.startDate)
  const end = toTime(voucher.endDate)
  if (!voucher.active) return 'off'
  if (start && start > now) return 'upcoming'
  if (end && end < now) return 'expired'
  if (end && end - now <= 7 * 24 * 60 * 60 * 1000) return 'expiring'
  return 'active'
}

export function voucherStatusLabel(voucher) {
  const status = voucherStatusClass(voucher)
  return t(`promotions.voucher.status.${status}`)
}

export function formatDate(value) {
  if (!value) return t('promotions.voucher.unlimited')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return t('promotions.voucher.unlimited')
  return new Intl.DateTimeFormat(currentLocale() === 'en' ? 'en-US' : 'vi-VN').format(date)
}

export function isExpiring(value) {
  if (!value) return false
  const diff = new Date(value).getTime() - Date.now()
  return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

export function formatCurrency(value) {
  return new Intl.NumberFormat(currentLocale() === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function isActiveByTime(start, end, now = Date.now()) {
  return (!start || start <= now) && (!end || end >= now)
}

function toTime(value) {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}
