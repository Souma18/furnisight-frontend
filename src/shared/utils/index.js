export function formatCurrency(value, locale = 'vi-VN', currency = 'VND') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    Number(value) || 0,
  )
}
