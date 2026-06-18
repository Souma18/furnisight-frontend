export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = parseDateStr(dateStr)
  return date ? new Intl.DateTimeFormat('vi-VN').format(date) : ''
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const date = parseDateStr(dateStr)
  return date
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    : ''
}

export function dateOnly(value) {
  if (!value) return 'Chưa đặt'
  return formatDate(value) || 'Chưa đặt'
}

export function toDatetimeLocal(value) {
  if (!value) return ''
  return String(value).slice(0, 16)
}

function parseDateStr(dateStr) {
  if (!dateStr) return null
  const rawValue = String(dateStr).trim()
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(rawValue)
  const normalizedValue = hasTimezone ? rawValue : `${rawValue}Z`
  const parsed = Date.parse(normalizedValue)
  return isNaN(parsed) ? null : new Date(parsed)
}
