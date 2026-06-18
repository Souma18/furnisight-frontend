import { productsApi, ProductResponse } from '@shared/lib/api/services'
import { resolveStockLimit } from '@features/cart/lib/stockGuards'

const productDetailCache = new Map()

function resolveItemStock(item = {}) {
  return resolveStockLimit(item)
}

function findVariantStock(product, item = {}) {
  const variantId = String(item.variantId || '')
  if (!variantId) return product.stock

  const variant = product.variants.find((candidate) => String(candidate.id || '') === variantId)
  return variant?.stockQuantity ?? product.stock
}

async function loadProduct(productId) {
  const key = String(productId || '')
  if (!key) return null
  if (!productDetailCache.has(key)) {
    productDetailCache.set(
      key,
      productsApi.getProductDetail(key)
        .then((response) => new ProductResponse(response.data || {}))
        .catch(() => null),
    )
  }
  return productDetailCache.get(key)
}

export async function enrichComboItemStock(item = {}) {
  const directStock = resolveItemStock(item)
  if (directStock != null) {
    return {
      ...item,
      stockQuantity: directStock,
      outOfStock: directStock < Math.max(1, Number(item.quantity) || 1),
    }
  }

  const product = await loadProduct(item.productId)
  const stockQuantity = product ? findVariantStock(product, item) : null
  const requiredQuantity = Math.max(1, Number(item.quantity) || 1)

  return {
    ...item,
    stockQuantity,
    outOfStock: stockQuantity != null ? stockQuantity < requiredQuantity : Boolean(item.outOfStock),
  }
}

export function comboStockIssue(combo = {}) {
  const items = Array.isArray(combo.items) ? combo.items : []
  if (!items.length) return null

  const unavailable = items.find((item) => {
    const stockQuantity = resolveItemStock(item)
    const requiredQuantity = Math.max(1, Number(item.quantity) || 1)
    return item.outOfStock || (stockQuantity != null && stockQuantity < requiredQuantity)
  })

  if (!unavailable) return null

  return {
    item: unavailable,
    message: `${unavailable.productName || 'Một sản phẩm trong combo'} hiện đã hết hàng.`,
  }
}

export function isComboPurchasable(combo = {}) {
  return !comboStockIssue(combo)
}
