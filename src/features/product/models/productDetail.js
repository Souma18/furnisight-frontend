export class ProductDetailModel {
  constructor(raw = {}) {
    this.id = raw.id || null
    this.shopId = raw.shopId || null

    this.name = raw.name || ''
    this.description = raw.description || ''
    this.status = raw.status || ''

    this.price = raw.price ?? 0
    this.oldPrice = raw.oldPrice ?? null

    this.slug = raw.slug || ''

    this.rating = raw.rating ?? 0
    this.ratingCount = raw.ratingCount ?? 0

    this.tags = Array.isArray(raw.tags) ? raw.tags : []

    this.supports3d = Boolean(raw.supports3d)

    this.collection = raw.collection || ''

    this.gallery = Array.isArray(raw.gallery) ? raw.gallery : []
    this.features = Array.isArray(raw.features) ? raw.features : []

    this.modelUrl = raw.modelUrl || ''
    this.roomTypeHint = raw.roomTypeHint || ''

    this.category = raw.category
      ? new CategoryInfo(raw.category)
      : null

    this.reviews = Array.isArray(raw.reviews)
      ? raw.reviews.map(r => new ReviewModel(r))
      : []

    this.qa = Array.isArray(raw.qa)
      ? raw.qa.map(q => new QAModel(q))
      : []

    this.variants = Array.isArray(raw.variants)
      ? raw.variants.map(v => new VariantModel(v))
      : []
  }

  get colors() {
    return [...new Set(this.variants.map(v => v.color).filter(Boolean))]
  }

  get materials() {
    return [...new Set(this.variants.map(v => v.material).filter(Boolean))]
  }

  get sizes() {
    return [...new Set(this.variants.map(v => v.dimensionText).filter(Boolean))]
  }

  get stock() {
    return this.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0)
  }

  get hasDiscount() {
    return this.oldPrice != null && this.oldPrice > this.price
  }

  get formattedPrice() {
    return new Intl.NumberFormat('vi-VN').format(this.price)
  }

  get formattedOldPrice() {
    return this.oldPrice ? new Intl.NumberFormat('vi-VN').format(this.oldPrice) : ''
  }

  get formattedSave() {
    if (!this.hasDiscount) return ''
    return `Tiết kiệm ${new Intl.NumberFormat('vi-VN').format(this.oldPrice - this.price)}đ`
  }
}

export class CategoryInfo {
  constructor(raw = {}) {
    this.id = raw.id || ''
    this.label = raw.label || ''
  }
}

export class ReviewModel {
  constructor(raw = {}) {
    this.id = raw.id || ''

    this.user = raw.user || ''
    this.avatar = raw.avatar || ''

    this.rating = raw.rating ?? 0

    this.createdAt = raw.createdAt || ''

    this.comment = raw.comment || ''
  }
}

export class QAModel {
  constructor(raw = {}) {
    this.id = raw.id || ''

    this.question = raw.question || ''
    this.answer = raw.answer || ''

    this.asker = raw.asker || ''

    this.date = raw.date || ''
  }
}

export class VariantModel {
  constructor(raw = {}) {
    this.id = raw.id || null

    this.price = raw.price ?? 0

    this.stockQuantity = raw.stockQuantity ?? 0

    this.length = raw.length ?? null
    this.width = raw.width ?? null
    this.height = raw.height ?? null
    this.weight = raw.weight ?? null

    this.material = raw.material || ''
    this.color = raw.color || ''

    this.warranty = raw.warranty || ''
  }

  get dimensionText() {
    if (!this.length || !this.width || !this.height) {
      return ''
    }

    return `${this.length} × ${this.width} × ${this.height} cm`
  }
}