export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = parseDateStr(dateStr)
  return date ? new Intl.DateTimeFormat('vi-VN').format(date) : dateStr
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const date = parseDateStr(dateStr)
  return date
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    : dateStr
}

export function dateOnly(value) {
  if (!value) return 'Chưa đặt'
  return String(value).slice(0, 10)
}

export function toDatetimeLocal(value) {
  if (!value) return ''
  return String(value).slice(0, 16)
}

function parseDateStr(dateStr) {
  if (!dateStr) return null
  const parsed = Date.parse(dateStr)
  return isNaN(parsed) ? null : new Date(parsed)
}
