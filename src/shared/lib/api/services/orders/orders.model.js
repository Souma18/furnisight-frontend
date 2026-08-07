import {
  getOrderStatusLabel,
  normalizeOrderStatus,
  normalizeOrderUiStatus,
} from '@shared/lib/orders/orderStatusMapper'

export function parseOrderDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const rawValue = String(value).trim()
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(rawValue)
  const normalizedValue = hasTimezone ? rawValue : `${rawValue}Z`
  const date = new Date(normalizedValue)
  return Number.isNaN(date.getTime()) ? null : date
}

export function canRetryOrderPayment(order = {}) {
  const status = normalizeOrderStatus(order.status)
  if (!['unpaid', 'payment_failed'].includes(status)) return false

  if (paymentMethodOf(order) !== 'vnpay') return false

  if (isOrderPaymentExpired(order)) return false

  return true
}

export function isOrderPaymentExpired(order = {}) {
  const expiresAt = parseOrderDate(paymentExpiresAtOf(order))
  if (!expiresAt) return false
  return expiresAt.getTime() <= Date.now()
}

export function shouldShowRetryPayment(order = {}) {
  const status = normalizeOrderStatus(order.status)
  if (!['unpaid', 'payment_failed'].includes(status)) return false

  return paymentMethodOf(order) === 'vnpay'
}

function resolveOrderItemImageUrl(data = {}) {
  const snapshot = data.productSnapshot || {}
  return data.imageUrl
    || snapshot.imageUrl
    || ''
}

export class OrderItemResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    Object.assign(this, data)
    this.id = data.id ?? null
    this.productId = data.productId ?? data.productSnapshot?.productId ?? null
    this.productSnapshot = data.productSnapshot ?? null
    this.imageUrl = resolveOrderItemImageUrl(data) || null
    this.price = data.price
    this.quantity = data.quantity
    this.variantLabel = resolveOrderItemVariant(data)
  }
}

export function resolveOrderItemVariant(item = {}) {
  const snapshot = item.productSnapshot || {}
  const color = snapshot.color || item.color || item.selectedColor || ''
  let size = snapshot.size || snapshot.dimensionText || item.size || item.selectedSize || ''
  
  if (!size && snapshot.dimensions) {
    const { length, width, height } = snapshot.dimensions
    if (length && width && height) {
      size = `${length} × ${width} × ${height} cm`
    }
  }
  
  const material = snapshot.material || item.material || ''
  
  return [color, size, material].filter(Boolean).join(' - ')
}

export class OrderListResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    Object.assign(this, data)
    this.id = data.id ?? null
    this.orderCode = data.orderCode ?? ''
    this.rawStatus = data.status ?? null
    this.paymentMethod = data.paymentMethod ?? data.paymentDetail?.paymentMethod ?? null
    this.status = normalizeOrderUiStatus(this)
    this.statusLabel = getOrderStatusLabel(this)
    this.totalAmount = data.totalAmount
    this.createdAt = data.createdAt ?? null
    this.paymentExpiresAt = data.paymentExpiresAt ?? data.paymentTimeline?.paymentExpiresAt ?? null
    this.canRetryPayment = data.canRetryPayment
    this.items = Array.isArray(data.items)
      ? data.items.map(item => new OrderItemResponse(item))
      : []
    this.firstProductImage = data.firstProductImage ?? null
  }
}

export class OrderDetailResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    Object.assign(this, data)
    this.id = data.id ?? null
    this.orderCode = data.orderCode ?? ''
    this.rawStatus = data.status ?? null
    this.paymentMethod = data.paymentMethod ?? data.paymentDetail?.paymentMethod ?? null
    this.status = normalizeOrderUiStatus(this)
    this.statusLabel = getOrderStatusLabel(this)
    this.subTotal = data.subTotal
    this.totalAmount = data.totalAmount
    this.savedAmount = data.savedAmount
    this.customerNote = data.customerNote ?? null
    this.note = data.note ?? null
    this.fee = data.fee ?? null
    this.shippingDetail = data.shippingDetail ?? null
    this.paymentDetail = data.paymentDetail ?? null
    this.paymentTimeline = data.paymentTimeline ?? null
    this.items = Array.isArray(data.items) 
      ? data.items.map(item => new OrderItemResponse(item)) 
      : []
    this.createdAt = data.createdAt ?? null
    this.paymentExpiresAt = data.paymentExpiresAt ?? data.paymentTimeline?.paymentExpiresAt ?? null
    this.canRetryPayment = data.canRetryPayment
  }
}

export { normalizeOrderStatus }

function paymentMethodOf(order = {}) {
  return String(
    order.paymentMethod
      ?? order.paymentType
      ?? order.paymentDetail?.paymentMethod
      ?? order.paymentDetail?.paymentType
      ?? '',
  ).trim().toLowerCase()
}

function paymentExpiresAtOf(order = {}) {
  return order.paymentExpiresAt ?? order.paymentTimeline?.paymentExpiresAt ?? null
}
