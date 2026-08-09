const VND_FORMATTER = new Intl.NumberFormat('vi-VN')

export class PriceFormatter {
  static format(value) {
    if (value == null || value === '') return ''
    return `${VND_FORMATTER.format(Number(value) || 0)}đ`
  }

  static formatSigned(value) {
    const amount = Number(value) || 0
    if (amount === 0) return PriceFormatter.format(0)
    return `${amount > 0 ? '+' : '-'}${PriceFormatter.format(Math.abs(amount))}`
  }

  static formatShort(value, options = {}) {
    const amount = Number(value) || 0
    const suffix = options.plus ? '+' : ''
    if (Math.abs(amount) >= 1000000) {
      return `${VND_FORMATTER.format(Math.round(amount / 1000000))}tr${suffix}`
    }
    if (Math.abs(amount) >= 1000) {
      return `${VND_FORMATTER.format(Math.round(amount / 1000))}k${suffix}`
    }
    return `${VND_FORMATTER.format(amount)}đ${suffix}`
  }
}

export const formatPrice = PriceFormatter.format
export const formatSignedPrice = PriceFormatter.formatSigned
export const formatShortPrice = PriceFormatter.formatShort
