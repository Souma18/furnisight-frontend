const PAYMENT_WINDOW_MS = 15 * 60 * 1000

export function parseOrderDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const rawValue = String(value).trim()
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(rawValue)
  const normalizedValue = hasTimezone ? rawValue : `${rawValue}Z`
  const date = new Date(normalizedValue)
  return Number.isNaN(date.getTime()) ? null : date
}

export function normalizeOrderStatus(status) {
  const normalized = String(status || '').trim().toUpperCase()
  const statusMap = {
    UNPAID: 'unpaid',
    PENDING: 'unpaid',
    PAYMENT_FAILED: 'payment_failed',
    PAID: 'paid',
    SHIPPING: 'delivering',
    DELIVERING: 'delivering',
    DELIVERED: 'done',
    DONE: 'done',
    CANCELLED: 'cancel',
    CANCELED: 'cancel',
    CANCEL: 'cancel',
    REFUND_PENDING: 'refund_pending',
    PENDING_REFUND: 'refund_pending',
  }

  return statusMap[normalized] || String(status || 'unpaid').toLowerCase()
}

function resolvePaymentExpiresAt(data = {}) {
  if (data.paymentExpiresAt) return data.paymentExpiresAt
  if (!data.createdAt) return null

  const createdAt = parseOrderDate(data.createdAt)
  if (!createdAt) return null

  return new Date(createdAt.getTime() + PAYMENT_WINDOW_MS).toISOString()
}

export function canRetryOrderPayment(order = {}) {
  const status = normalizeOrderStatus(order.status)
  if (!['unpaid', 'payment_failed'].includes(status)) return false

  const paymentMethod = String(order.paymentMethod || order.paymentDetail?.paymentMethod || 'vnpay').toLowerCase()
  if (paymentMethod !== 'vnpay') return false

  const expiresAt = parseOrderDate(order.paymentExpiresAt)
  const withinDeadline = expiresAt ? expiresAt.getTime() > Date.now() : true
  if (typeof order.canRetryPayment === 'boolean') {
    return order.canRetryPayment && withinDeadline
  }

  return withinDeadline
}

export function shouldShowRetryPayment(order = {}) {
  const status = normalizeOrderStatus(order.status)
  if (!['unpaid', 'payment_failed'].includes(status)) return false

  const paymentMethod = String(order.paymentMethod || order.paymentDetail?.paymentMethod || 'vnpay').toLowerCase()
  return paymentMethod === 'vnpay'
}

function resolveOrderItemImageUrl(data = {}) {
  const snapshot = data.productSnapshot || {}
  return data.imageUrl
    || snapshot.imageUrl
    || snapshot.productImageUrl
    || snapshot.image
    || snapshot.thumbnailUrl
    || snapshot.thumbnail
    || ''
}

export class OrderItemResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.productId = data.productId || data.productSnapshot?.productId || null
    this.productSnapshot = {
      ...(data.productSnapshot || {}),
      imageUrl: resolveOrderItemImageUrl(data),
    }
    this.imageUrl = this.productSnapshot.imageUrl
    this.price = data.price ?? 0
    this.quantity = data.quantity ?? 1
  }
}

export class OrderListResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.orderCode = data.orderCode || ''
    this.rawStatus = data.status || 'UNPAID'
    this.status = normalizeOrderStatus(data.status)
    this.totalAmount = data.totalAmount ?? 0
    this.createdAt = data.createdAt || null
    this.paymentExpiresAt = resolvePaymentExpiresAt(data)
    this.paymentMethod = data.paymentMethod || data.paymentDetail?.paymentMethod || 'vnpay'
    this.canRetryPayment = data.canRetryPayment ?? canRetryOrderPayment(this)
    this.firstProductImage = data.firstProductImage
      || data.firstProduct?.imageUrl
      || data.items?.[0]?.productSnapshot?.imageUrl
      || data.items?.[0]?.imageUrl
      || ''
  }
}

export class OrderDetailResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.orderCode = data.orderCode || ''
    this.rawStatus = data.status || 'UNPAID'
    this.status = normalizeOrderStatus(data.status)
    this.subTotal = data.subTotal ?? 0
    this.totalAmount = data.totalAmount ?? 0
    this.savedAmount = data.savedAmount ?? 0
    this.customerNote = data.customerNote || ''
    this.fee = data.fee || {}
    this.shippingDetail = data.shippingDetail || {}
    this.paymentDetail = data.paymentDetail || {}
    this.paymentTimeline = data.paymentTimeline || {}
    this.items = Array.isArray(data.items) 
      ? data.items.map(item => new OrderItemResponse(item)) 
      : []
    this.createdAt = data.createdAt || null
    this.paymentExpiresAt = resolvePaymentExpiresAt(data)
    this.paymentMethod = data.paymentMethod || data.paymentDetail?.paymentMethod || 'vnpay'
    this.canRetryPayment = data.canRetryPayment ?? canRetryOrderPayment(this)
  }
}
