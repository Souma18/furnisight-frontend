import { i18n } from '@shared/i18n'

const t = (key, params) => i18n.global.t(key, params)

export function resolveStockLimit(item = {}) {
  const value = item?.stockQuantity ?? item?.stock ?? item?.availableStock
  if (value == null || value === '') return null
  const stock = Number(value)
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : null
}

export function clampPurchaseQuantity(quantity, item = {}) {
  const stockLimit = resolveStockLimit(item)
  const normalized = Math.max(1, Math.floor(Number(quantity) || 1))

  if (stockLimit == null) return normalized
  if (stockLimit <= 0) return 1

  return Math.min(normalized, stockLimit)
}

export function isOverStock(item = {}) {
  const stockLimit = resolveStockLimit(item)
  if (stockLimit == null) return false
  return Number(item?.qty ?? item?.quantity ?? 0) > stockLimit
}

export function isPurchasableLine(item = {}) {
  const stockLimit = resolveStockLimit(item)
  if (item?.outOfStock) return false
  if (stockLimit != null && stockLimit <= 0) return false
  if (isOverStock(item)) return false
  return true
}

export function stockLimitLabel(item = {}) {
  const stockLimit = resolveStockLimit(item)
  if (stockLimit == null) return ''
  if (stockLimit <= 0) return t('account.cart.outOfStock')
  return t('account.cart.maxStock', { count: stockLimit })
}
