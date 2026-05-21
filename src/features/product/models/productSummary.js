export class ProductSummaryModel {
  constructor(raw = {}) {
    this.id = raw.id || null

    this.slug = raw.slug || ''

    this.name = raw.name || ''

    this.categoryName = raw.categoryName || ''

    this.price = raw.price ?? 0

    this.oldPrice = raw.oldPrice ?? null

    this.image = raw.image || ''

    this.rating = raw.rating ?? 0

    this.ratingCount = raw.ratingCount ?? 0

    this.tags = Array.isArray(raw.tags)
      ? raw.tags
      : []
  }

  get hasDiscount() {
    return this.oldPrice != null && this.oldPrice > this.price
  }

  get discountPercent() {
    if (!this.hasDiscount) return 0

    return Math.round(
      ((this.oldPrice - this.price) / this.oldPrice) * 100
    )
  }

  get formattedPrice() {
    return formatVnd(this.price)
  }

  get formattedOldPrice() {
    if (!this.oldPrice) return ''

    return formatVnd(this.oldPrice)
  }
}

export function formatVnd(value) {
  if (value == null) return ''

  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}