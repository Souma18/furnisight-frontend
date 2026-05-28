import { formatVnd } from '@features/product/models/productSummary'

export class FavoriteProductModel {
  constructor(raw = {}) {
    const product = raw.product ?? {}

    this.favoriteId = raw.id || null
    this.productId = raw.productId || product.id || null
    this.id = this.productId || this.favoriteId
    this.createdAt = raw.createdAt || null

    this.detailId = product.slug || this.productId
    this.slug = product.slug || ''
    this.name = product.name || ''
    this.category = product.categoryName || 'Sản phẩm'
    this.categoryName = this.category
    this.image = product.image || '/home/products/placeholder.jpg'
    this.placeholder = product.placeholder || ''

    this.priceValue = product.price ?? 0
    this.oldPriceValue = product.oldPrice ?? null
    this.price = formatVnd(this.priceValue)
    this.oldPrice = this.oldPriceValue != null ? formatVnd(this.oldPriceValue) : ''

    this.soldCount = product.soldCount ?? 0
    this.tag = product.tag || ''
    this.tagType = product.tagType || 'new'
    this.isFavorite = true
  }
}
