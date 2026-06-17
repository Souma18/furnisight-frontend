export function discountLabel(voucher) {
  if (isShippingVoucher(voucher)) return `Giảm ship ${formatCurrency(voucher.discountValue)}`
  if (voucher.discountType === 'PERCENT') {
    return `Giảm ${voucher.discountValue}%${voucher.maxDiscount ? ` tối đa ${formatCurrency(voucher.maxDiscount)}` : ''}`
  }
  return `Giảm ${formatCurrency(voucher.discountValue)}`
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
  if (!voucher.minOrder) return 'Không yêu cầu đơn tối thiểu'
  return `Đơn tối thiểu ${formatCurrency(voucher.minOrder)}`
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
  if (status === 'off') return 'Đang tắt'
  if (status === 'upcoming') return 'Sắp diễn ra'
  if (status === 'expired') return 'Đã hết hạn'
  if (status === 'expiring') return 'Sắp hết hạn'
  return 'Đang dùng được'
}

export function formatDate(value) {
  if (!value) return 'Không giới hạn'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không giới hạn'
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

export function isExpiring(value) {
  if (!value) return false
  const diff = new Date(value).getTime() - Date.now()
  return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
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
