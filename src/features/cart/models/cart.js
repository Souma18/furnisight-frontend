function buildCartLineId(raw = {}) {
  const productId = raw.productId ?? ''
  const variantId = raw.variantId ?? ''
  const lineId = `${productId}::${variantId}`
  return lineId === '::' ? null : lineId
}

function buildDimensionLabel(raw = {}) {
  const dims = [raw.length, raw.width, raw.height]
    .filter((value) => value != null && value !== '')

  if (dims.length !== 3) return ''

  return `${dims.join(' × ')} cm`
}

export class CartModel {
  constructor(raw = {}) {
    this.id = raw.id || null
    this.items = Array.isArray(raw.items)
      ? raw.items.map((item) => new CartItemModel(item))
      : []

    this.item = raw.item
      ? new CartItemModel(raw.item)
      : null

    this.total = raw.total ?? 0
    this.createdAt = raw.createdAt || null
    this.updatedAt = raw.updatedAt || null
  }
}

export class CartItemModel {
  constructor(raw = {}) {
    this.id = raw.id || buildCartLineId(raw)
    this.productKey = raw.productKey || this.id || ''
    this.productId = raw.productId ?? null
    this.variantId = raw.variantId || null
    this.detailId = raw.detailId || raw.slug || null
    this.room3dProductId = raw.room3dProductId ?? null

    this.name = raw.name || ''
    this.slug = raw.slug || ''
    this.categoryLabel = raw.categoryLabel || 'Sản phẩm'
    this.imageUrl = raw.imageUrl || ''
    this.imageFallback = raw.imageFallback || ''
    this.emoji = raw.emoji || ''

    this.price = raw.price ?? 0
    this.oldPrice = raw.oldPrice ?? null
    this.qty = raw.qty ?? raw.quantity ?? 1

    this.stockQuantity = raw.stockQuantity ?? null
    this.length = raw.length ?? null
    this.width = raw.width ?? null
    this.height = raw.height ?? null
    this.weight = raw.weight ?? null

    this.selectedColor = raw.selectedColor || raw.color || ''
    this.selectedSize = raw.selectedSize || buildDimensionLabel(raw)
    this.colors = Array.isArray(raw.colors)
      ? raw.colors
      : (this.selectedColor ? [this.selectedColor] : [])
    this.sizes = Array.isArray(raw.sizes)
      ? raw.sizes
      : (this.selectedSize ? [this.selectedSize] : [])

    this.outOfStock = raw.outOfStock != null
      ? Boolean(raw.outOfStock)
      : (this.stockQuantity != null ? this.stockQuantity <= 0 : false)
  }
}
