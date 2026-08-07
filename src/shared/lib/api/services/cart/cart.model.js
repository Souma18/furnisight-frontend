function buildCartLineId(raw = {}) {
  const productId = raw.productId ?? ''
  const variantId = raw.variantId ?? ''
  const lineId = `${productId}::${variantId}`
  return lineId === '::' ? null : lineId
}

function buildDimensionLabel(raw = {}) {
  const dims = [raw.length, raw.width, raw.height].filter((value) => value != null && value !== '' && Number(value) !== 0)
  return dims.length === 3 ? `${dims.join(' × ')} cm` : ''
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))]
}

export function resolveCartImageUrl(raw = {}) {
  const imageCandidates = [
    raw.imageUrl,
    raw.image,
  ]

  if (Array.isArray(raw.gallery)) {
    imageCandidates.push(...raw.gallery)
  }

  if (Array.isArray(raw.images)) {
    imageCandidates.push(...raw.images.map((item) => {
      if (typeof item === 'string') return item
      return item?.url || item?.imageUrl || item?.src || ''
    }))
  }

  return imageCandidates.find(Boolean) || ''
}

function normalizeVariant(raw = {}, parent = {}) {
  const length = raw.length || parent.length || null
  const width = raw.width || parent.width || null
  const height = raw.height || parent.height || null

  return {
    id: raw.id || null,
    color: raw.color || '',
    size: buildDimensionLabel({ length, width, height }),
    price: raw.price ?? parent.price ?? null,
    stockQuantity: raw.stockQuantity ?? parent.stockQuantity ?? null,
    length,
    width,
    height,
    weight: raw.weight || parent.weight || null,
    material: raw.material || parent.material || '',
    warranty: raw.warranty || parent.warranty || '',
  }
}

function resolveActiveVariant(raw = {}, variants = []) {
  if (!variants.length) return null

  const currentVariantId = raw.variantId || raw.selectedVariantId || null
  if (currentVariantId != null && currentVariantId !== '') {
    const matched = variants.find((variant) => variant.id === currentVariantId)
    if (matched) return matched
  }

  const currentColor = raw.selectedColor || raw.color || ''
  const currentSize = raw.selectedSize || buildDimensionLabel(raw)
  return variants.find((variant) =>
    (!currentColor || variant.color === currentColor) &&
    (!currentSize || variant.size === currentSize),
  ) || variants[0]
}

function normalizeTopLevel(raw = {}, activeVariant = null) {
  return {
    price: raw.price ?? activeVariant?.price ?? 0,
    stockQuantity: raw.stockQuantity ?? activeVariant?.stockQuantity ?? null,
    length: raw.length || activeVariant?.length || null,
    width: raw.width || activeVariant?.width || null,
    height: raw.height || activeVariant?.height || null,
    weight: raw.weight || activeVariant?.weight || null,
    color: raw.color || activeVariant?.color || '',
    material: raw.material || activeVariant?.material || '',
    warranty: raw.warranty || activeVariant?.warranty || '',
  }
}

export class CartResponse {
  constructor(raw = {}) {
    this.id = raw.id || null
    this.items = Array.isArray(raw.items)
      ? raw.items.map((item) => new CartItemResponse(item))
      : []
    this.item = raw.item ? new CartItemResponse(raw.item) : null
    this.total = raw.total ?? 0
    this.createdAt = raw.createdAt || null
    this.updatedAt = raw.updatedAt || null
  }
}

export class CartItemResponse {
  constructor(raw = {}) {
    this.variants = Array.isArray(raw.variants)
      ? raw.variants.map((variant) => normalizeVariant(variant, raw))
      : []

    const activeVariant = resolveActiveVariant(raw, this.variants)
    const normalized = normalizeTopLevel(raw, activeVariant)

    this.id = raw.id || buildCartLineId(raw)
    this.productKey = raw.productKey || this.id || ''
    this.productId = raw.productId ?? null
    this.variantId = raw.variantId || null
    this.room3dProductId = raw.room3dProductId ?? null
    this.name = raw.name || raw.productName || ''
    this.slug = raw.slug || ''
    this.categoryLabel = raw.categoryLabel || ''
    this.imageUrl = resolveCartImageUrl(raw)
    this.imageFallback = raw.imageFallback || ''
    this.emoji = raw.emoji || ''
    this.price = normalized.price
    this.quantity = raw.quantity ?? raw.qty ?? 1
    this.qty = this.quantity
    this.stockQuantity = normalized.stockQuantity
    this.length = normalized.length
    this.width = normalized.width
    this.height = normalized.height
    this.weight = normalized.weight
    this.color = normalized.color
    this.material = normalized.material
    this.warranty = normalized.warranty
    this.selectedColor = raw.selectedColor || normalized.color || ''
    this.selectedSize = raw.selectedSize || buildDimensionLabel(normalized)
    this.colors = Array.isArray(raw.colors) && raw.colors.length
      ? unique(raw.colors)
      : unique([...this.variants.map((variant) => variant.color), this.selectedColor])
    this.sizes = Array.isArray(raw.sizes) && raw.sizes.length
      ? unique(raw.sizes)
      : unique([...this.variants.map((variant) => variant.size), this.selectedSize])
    this.outOfStock = raw.outOfStock != null
      ? Boolean(raw.outOfStock)
      : (this.stockQuantity != null ? this.stockQuantity <= 0 : false)
  }
}
