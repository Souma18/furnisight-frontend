export class ProductDetailModel {
  constructor(raw = {}) {
    const variants = normalizeVariants(raw)
    const gallery = normalizeGallery(raw)
    const primaryVariant = variants[0] ?? null

    this.id = raw.id || null
    this.shopId = raw.shopId || null

    this.name = raw.name || ''
    this.description = raw.description || ''
    this.status = raw.status || ''

    this.price = resolvePrice(raw, primaryVariant)
    this.oldPrice = raw.oldPrice ?? null

    this.slug = raw.slug || ''

    this.rating = raw.rating ?? 0
    this.ratingCount = raw.ratingCount ?? 0
    this.soldCount = raw.soldCount ?? raw.soldQuantity ?? raw.sold ?? 0

    this.tags = Array.isArray(raw.tags) ? raw.tags : []

    this.supports3d = Boolean(raw.supports3d)

    this.collection = raw.collection || ''

    this.gallery = gallery
    this.image = gallery[0] || ''
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

    this.variants = variants
    this.fallbackColor = raw.color || primaryVariant?.color || ''
    this.fallbackMaterial = raw.material || primaryVariant?.material || ''
    this.fallbackWarranty = raw.warranty || primaryVariant?.warranty || ''
    this.fallbackStock = raw.stockQuantity ?? raw.stock ?? primaryVariant?.stockQuantity ?? 0
  }

  get colors() {
    const colors = [...new Set(this.variants.map(v => v.color).filter(Boolean))]
    if (colors.length) return colors
    return this.fallbackColor ? [this.fallbackColor] : []
  }

  get materials() {
    const materials = [...new Set(this.variants.map(v => v.material).filter(Boolean))]
    if (materials.length) return materials
    return this.fallbackMaterial ? [this.fallbackMaterial] : []
  }

  get sizes() {
    return [...new Set(this.variants.map(v => v.dimensionText).filter(Boolean))]
  }

  get stock() {
    const variantStock = this.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0)
    return variantStock || this.fallbackStock || 0
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

    this.length = raw.length ?? raw.dimensions?.length ?? null
    this.width = raw.width ?? raw.dimensions?.width ?? null
    this.height = raw.height ?? raw.dimensions?.height ?? null
    this.weight = raw.weight ?? raw.dimensions?.weight ?? null

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

function normalizeVariants(raw = {}) {
  if (Array.isArray(raw.variants) && raw.variants.length) {
    return raw.variants.map(v => new VariantModel(v))
  }

  const fallbackVariant = {
    id: raw.variantId ?? raw.defaultVariantId ?? null,
    price: raw.price ?? 0,
    stockQuantity: raw.stockQuantity ?? raw.stock ?? 0,
    length: raw.length ?? raw.dimensions?.length ?? null,
    width: raw.width ?? raw.dimensions?.width ?? null,
    height: raw.height ?? raw.dimensions?.height ?? null,
    weight: raw.weight ?? raw.dimensions?.weight ?? null,
    material: raw.material || '',
    color: raw.color || '',
    warranty: raw.warranty || '',
  }

  const hasFallbackVariant = Object.values(fallbackVariant).some(value => {
    if (value == null) return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
  })

  return hasFallbackVariant ? [new VariantModel(fallbackVariant)] : []
}

function normalizeGallery(raw = {}) {
  const imageCandidates = []

  if (Array.isArray(raw.gallery)) {
    imageCandidates.push(...raw.gallery)
  }

  if (Array.isArray(raw.images)) {
    imageCandidates.push(...raw.images.map(item => {
      if (typeof item === 'string') return item
      return item?.url || item?.imageUrl || item?.src || ''
    }))
  }

  imageCandidates.push(
    raw.image,
    raw.imageUrl,
    raw.thumbnail,
    raw.thumbnailUrl,
    raw.coverImage,
    raw.coverImageUrl,
  )

  return [...new Set(imageCandidates.filter(Boolean))]
}

function resolvePrice(raw = {}, primaryVariant = null) {
  if (typeof raw.price === 'number' && raw.price > 0) {
    return raw.price
  }

  if (typeof primaryVariant?.price === 'number' && primaryVariant.price > 0) {
    return primaryVariant.price
  }

  return raw.price ?? primaryVariant?.price ?? 0
}
