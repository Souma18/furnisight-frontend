import { PriceFormatter } from '@shared/lib/formatters'

export class ProductResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    const variants = normalizeVariants(data)
    const gallery = normalizeGallery(data)
    const primaryVariant = variants[0] ?? null

    this.id = data.id || null
    this.shopId = data.shopId || null
    this.slug = data.slug || ''
    this.name = data.name || ''
    this.description = data.description || ''
    this.status = data.status || ''
    this.price = resolvePrice(data, primaryVariant)
    this.categoryId = data.categoryId || data.category?.id || null
    this.categoryName = data.categoryName || data.category?.name || data.category?.label || ''
    this.category = data.category ? new CategoryResponse(data.category) : null
    this.images = Array.isArray(data.images) ? data.images : []
    this.gallery = gallery
    this.image = data.image || data.imageUrl || gallery[0] || ''
    this.stockQuantity = data.stockQuantity ?? data.stock ?? primaryVariant?.stockQuantity ?? 0
    this.attributes = Array.isArray(data.attributes) ? data.attributes : []
    this.tags = Array.isArray(data.tags) ? data.tags : []
    this.rating = data.rating ?? 0
    this.ratingCount = data.ratingCount ?? 0
    this.soldCount = data.soldCount ?? data.soldQuantity ?? data.sold ?? 0
    this.supports3d = Boolean(data.supports3d)
    this.features = Array.isArray(data.features) ? data.features : []
    this.modelUrl = data.modelUrl || ''
    this.roomTypeHint = data.roomTypeHint || ''
    this.reviews = Array.isArray(data.reviews)
      ? data.reviews.map((review) => new ReviewResponse(review))
      : []
    this.variants = variants
    this.fallbackColor = data.color || primaryVariant?.color || ''
    this.fallbackMaterial = data.material || primaryVariant?.material || ''
    this.fallbackWarranty = data.warranty || primaryVariant?.warranty || ''
    this.fallbackStock = data.stockQuantity ?? data.stock ?? primaryVariant?.stockQuantity ?? 0
  }

  get colors() {
    const colors = [...new Set(this.variants.map((variant) => variant.color).filter(Boolean))]
    if (colors.length) return colors
    return this.fallbackColor ? [this.fallbackColor] : []
  }

  get materials() {
    const materials = [...new Set(this.variants.map((variant) => variant.material).filter(Boolean))]
    if (materials.length) return materials
    return this.fallbackMaterial ? [this.fallbackMaterial] : []
  }

  get sizes() {
    return [...new Set(this.variants.map((variant) => variant.dimensionText).filter(Boolean))]
  }

  get stock() {
    const variantStock = this.variants.reduce((total, variant) => total + (variant.stockQuantity || 0), 0)
    return variantStock || this.fallbackStock || 0
  }

  get formattedPrice() {
    return formatVnd(this.price)
  }
}

export class CategoryResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.slug = data.slug || ''
    this.name = data.name || data.label || ''
    this.label = data.label || data.name || ''
    this.parentId = data.parentId || null
    this.productCount = data.productCount ?? 0
    this.imageUrl = data.imageUrl || data.image || ''
    this.iconUrl = data.iconUrl || ''
  }
}

export class ReviewResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.productId = data.productId || null
    this.userId = data.userId || null
    this.userName = data.userName || data.user || 'Khách hàng'
    this.user = data.user || data.userName || 'Khách hàng'
    this.userAvatar = data.userAvatarUrl || data.userAvatar || data.avatar || ''
    this.avatar = data.avatar || data.userAvatarUrl || data.userAvatar || ''
    this.rating = data.rating ?? 5
    this.title = data.title || ''
    this.content = data.content || data.comment || ''
    this.comment = data.comment || data.content || ''
    this.images = Array.isArray(data.images) ? data.images : []
    this.createdAt = data.createdAt || null
    this.createdAtFormatted = formatReviewDateTime(this.createdAt)
  }
}

export class ProductVariantResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.price = data.price ?? 0
    this.stockQuantity = data.stockQuantity ?? 0
    this.length = data.length ?? data.dimensions?.length ?? null
    this.width = data.width ?? data.dimensions?.width ?? null
    this.height = data.height ?? data.dimensions?.height ?? null
    this.weight = data.weight ?? data.dimensions?.weight ?? null
    this.material = data.material || ''
    this.color = data.color || ''
    this.warranty = data.warranty || ''
  }

  get dimensionText() {
    if (!this.length || !this.width || !this.height) return ''
    return `${this.length} × ${this.width} × ${this.height} cm`
  }
}

export function formatVnd(value) {
  return PriceFormatter.format(value)
}

export function formatReviewDateTime(value) {
  if (!value) return ''
  const normalized = String(value).trim()
  const date = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized) ? normalized : `${normalized}Z`)
  if (Number.isNaN(date.getTime())) return normalized

  const pad = (number) => String(number).padStart(2, '0')
  return [
    pad(date.getDate()),
    pad(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function normalizeVariants(data = {}) {
  if (Array.isArray(data.variants) && data.variants.length) {
    return data.variants.map((variant) => new ProductVariantResponse(variant))
  }

  const fallbackVariant = {
    id: data.variantId ?? data.defaultVariantId ?? null,
    price: data.price ?? 0,
    stockQuantity: data.stockQuantity ?? data.stock ?? 0,
    length: data.length ?? data.dimensions?.length ?? null,
    width: data.width ?? data.dimensions?.width ?? null,
    height: data.height ?? data.dimensions?.height ?? null,
    weight: data.weight ?? data.dimensions?.weight ?? null,
    material: data.material || '',
    color: data.color || '',
    warranty: data.warranty || '',
  }

  const hasFallbackVariant = Object.values(fallbackVariant).some((value) => {
    if (value == null) return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
  })

  return hasFallbackVariant ? [new ProductVariantResponse(fallbackVariant)] : []
}

function normalizeGallery(data = {}) {
  const imageCandidates = []

  if (Array.isArray(data.gallery)) {
    imageCandidates.push(...data.gallery)
  }

  if (Array.isArray(data.images)) {
    imageCandidates.push(...data.images.map((item) => {
      if (typeof item === 'string') return item
      return item?.url || item?.imageUrl || item?.src || ''
    }))
  }

  imageCandidates.push(
    data.image,
    data.imageUrl,
    data.thumbnail,
    data.thumbnailUrl,
    data.coverImage,
    data.coverImageUrl,
  )

  return [...new Set(imageCandidates.filter(Boolean))]
}

function resolvePrice(data = {}, primaryVariant = null) {
  if (typeof data.price === 'number' && data.price > 0) return data.price
  if (typeof primaryVariant?.price === 'number' && primaryVariant.price > 0) return primaryVariant.price
  return data.price ?? primaryVariant?.price ?? 0
}
