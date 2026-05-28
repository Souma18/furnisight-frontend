export class OrderItemResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.productSnapshot = data.productSnapshot || {}
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
    this.status = data.status || 'PENDING'
    this.totalAmount = data.totalAmount ?? 0
    this.createdAt = data.createdAt || null
    this.firstProductImage = data.firstProductImage || ''
  }
}

export class OrderDetailResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.orderCode = data.orderCode || ''
    this.status = data.status || 'PENDING'
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
  }
}
