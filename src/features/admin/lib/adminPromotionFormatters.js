import { PriceFormatter, dateOnly, toDatetimeLocal, formatNumber as numberText } from '@shared/lib/formatters'

export function money(value) {
  return PriceFormatter.format(value)
}

export function isImageUrl(value) {
  return /^(https?:|data:|blob:|\/)/i.test(String(value || ''))
}

export { dateOnly, toDatetimeLocal, numberText }

export function discountLabel(row) {
  if (row.discountType === 'PERCENT') return `${Number(row.discountValue || 0)}%`
  if (row.discountType === 'SHIPPING_CAP') return `Ship ${money(row.discountValue)}`
  return money(row.discountValue)
}

export function statusLabel(status) {
  return {
    ACTIVE: 'Đang bật',
    RUNNING: 'Đang chạy',
    SCHEDULED: 'Đã hẹn lịch',
    DRAFT: 'Bản nháp',
    SENT: 'Đã gửi',
    PAUSED: 'Tạm dừng',
    EXPIRED: 'Hết hạn',
  }[status] || status || 'Đang bật'
}

export function statusTone(rowOrStatus) {
  const status = typeof rowOrStatus === 'string' ? rowOrStatus : rowOrStatus?.status
  if (rowOrStatus && typeof rowOrStatus === 'object' && rowOrStatus.active === false) return 'off'
  if (['DRAFT', 'PAUSED'].includes(status)) return 'off'
  if (['EXPIRED'].includes(status)) return 'expired'
  if (['SCHEDULED'].includes(status)) return 'scheduled'
  return 'on'
}

export function voucherStatusTone(row) {
  if (!row.active) return 'off'
  if (row.statusLabel === 'Hết hạn') return 'expired'
  if (row.statusLabel === 'Sắp diễn ra') return 'scheduled'
  return 'on'
}

export function channelText(channels) {
  return Array.isArray(channels) ? channels.join(' + ') : channels || ''
}

export function targetText(type, segmentKey, userIds) {
  if (type === 'ALL') return 'Toàn bộ người dùng'
  if (type === 'SEGMENT') return segmentLabel(segmentKey)
  return `${userIds?.length || 0} người dùng đã chọn`
}

export function segmentLabel(key) {
  return {
    NEW_USERS: 'Khách mới đăng ký',
    VIP: 'Khách VIP',
    INACTIVE_30D: 'Chưa mua hàng 30 ngày',
    ABANDONED_CART: 'Giỏ hàng chưa checkout',
    HIGH_SPEND: 'Chi tiêu > 5.000.000đ',
  }[key] || 'Theo điều kiện'
}

export function filterLocal(items, filter, fields) {
  const query = filter.query.trim().toLowerCase()
  const status = filter.status
  return items.filter((item) => {
    const matchesQuery = !query || fields.some((field) => String(item[field] || '').toLowerCase().includes(query))
    const matchesStatus = !status || item.status === status
    return matchesQuery && matchesStatus
  })
}

export function getListPayload(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function sortByCreatedAtDesc(items) {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(left?.createdAt || '') || 0
    const rightTime = Date.parse(right?.createdAt || '') || 0
    return rightTime - leftTime
  })
}
