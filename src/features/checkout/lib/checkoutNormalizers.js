import { formatDate } from '@shared/lib/formatters/DateFormatter'

function formatVoucherExpire(dateValue) {
  if (!dateValue) return ''
  const dateStr = formatDate(dateValue)
  return dateStr ? `HSD: ${dateStr}` : ''
}

function normalizeDiscountType(type) {
  const normalized = String(type || '').trim().toUpperCase()
  const map = {
    PERCENT: 'percent',
    FIXED: 'fixed',
    SHIPPING_CAP: 'shipping_cap',
  }

  return map[normalized] || String(type || '').toLowerCase()
}

export function normalizeCheckoutVoucher(raw = {}) {
  const discountType = normalizeDiscountType(raw.discountType)
  const iconMap = {
    percent: 'badgePercent',
    ticket: 'badgePercent',
    truck: 'truck',
    star: 'star',
    gift: 'gift',
  }

  return {
    ...raw,
    id: raw.id || raw.code,
    code: raw.code || '',
    name: raw.name || raw.code || 'Voucher',
    desc: raw.desc || raw.description || '',
    expire: raw.expire || formatVoucherExpire(raw.endDate),
    discountType,
    discountValue: Number(raw.discountValue) || 0,
    maxDiscount: raw.maxDiscount ?? null,
    minOrder: raw.minOrder ?? null,
    appliedDiscount: raw.appliedDiscount ?? null,
    icon: iconMap[raw.icon] || (discountType === 'shipping_cap' ? 'truck' : 'badgePercent'),
  }
}

export function normalizeCheckoutCombo(raw = {}) {
  return {
    ...raw,
    id: raw.id || raw.comboId || '',
    name: raw.name || raw.comboName || 'Combo khuyến mãi',
    items: Array.isArray(raw.items) ? raw.items : [],
    appliedDiscount: Number(raw.appliedDiscount ?? raw.comboDiscount ?? raw.savedAmount) || 0,
  }
}
