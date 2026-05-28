const PAYMENT_WINDOW_MS = 5 * 60 * 1000

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
  }

  return statusMap[normalized] || String(status || 'unpaid').toLowerCase()
}

function resolvePaymentExpiresAt(data = {}) {
  if (data.paymentExpiresAt) return data.paymentExpiresAt
  if (!data.createdAt) return null

  const createdAt = new Date(data.createdAt)
  if (Number.isNaN(createdAt.getTime())) return null

  return new Date(createdAt.getTime() + PAYMENT_WINDOW_MS).toISOString()
}

export function canRetryOrderPayment(order = {}) {
  const status = normalizeOrderStatus(order.status)
  if (!['unpaid', 'payment_failed'].includes(status)) return false

  const paymentMethod = String(order.paymentMethod || order.paymentDetail?.paymentMethod || 'vnpay').toLowerCase()
  if (paymentMethod !== 'vnpay') return false

  const expiresAt = order.paymentExpiresAt ? new Date(order.paymentExpiresAt) : null
  const withinDeadline = expiresAt ? expiresAt.getTime() > Date.now() : true
  if (typeof order.canRetryPayment === 'boolean') {
    return order.canRetryPayment && withinDeadline
  }

  return withinDeadline
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
    this.productSnapshot = {
      ...(data.productSnapshot || {}),
      imageUrl: resolveOrderItemImageUrl(data),
    }
    this.imageUrl = this.productSnapshot.imageUrl
    this.price = data.price ?? 0
    this.oldPrice = data.oldPrice ?? null
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
    this.items = Array.isArray(data.items) 
      ? data.items.map(item => new OrderItemResponse(item)) 
      : []
    this.createdAt = data.createdAt || null
    this.paymentExpiresAt = resolvePaymentExpiresAt(data)
    this.paymentMethod = data.paymentMethod || data.paymentDetail?.paymentMethod || 'vnpay'
    this.canRetryPayment = data.canRetryPayment ?? canRetryOrderPayment(this)
  }
}
