import { apiClient } from '../../client'

class OrdersApi {
  /**
   * Retrieves user's orders or all orders (if admin)
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./orders.model').OrderResponse[], totalElements: number}>>}
   */
  getOrders(params) {
    // Gateway: /orders/user -> OrderService: /api/v1/user
    return apiClient.get('/orders/user', { params })
  }

  /**
   * Retrieves a specific order by order code
   * @param {string} orderCode 
   * @returns {Promise<import('axios').AxiosResponse<import('./orders.model').OrderResponse>>}
   */
  getOrderDetail(orderCode) {
    return apiClient.get(`/orders/${orderCode}`)
  }

  checkProductPurchased(productId) {
    return apiClient.get(`/orders/user/products/${productId}/purchased`)
  }

  /**
   * Creates a new order
   * @param {Object} payload 
   * @returns {Promise<import('axios').AxiosResponse<import('./orders.model').OrderResponse>>}
   */
  createOrder(payload) {
    return apiClient.post('/orders/initiate', payload)
  }

  getCheckoutSession(params) {
    return apiClient.get('/orders/checkout/session', { params })
  }

  /**
   * Cancels an order
   * @param {string} orderCode 
   * @returns {Promise<import('axios').AxiosResponse<import('./orders.model').OrderResponse>>}
   */
  cancelOrder(orderCode) {
    // Backend uses @PostMapping for cancel
    return apiClient.post(`/orders/${orderCode}/cancel`)
  }

  // ─── PAYMENTS ────────────────────────────────────────────────────────
  
  /**
   * Initiates payment process for an order
   * @param {string} orderCode 
   * @param {Object} payload 
   * @returns {Promise<import('axios').AxiosResponse<{paymentUrl: string}>>}
   */
  processPayment(orderCode, payload) {
    return apiClient.post(`/orders/payment/${orderCode}`, payload)
  }

  createVnpayPayment(payload) {
    const { orderCode } = payload
    return apiClient.post('/orders/payment/vnpay/create', null, {
      params: { orderCode },
    })
  }

  getPaymentCallback(paymentMethod, params) {
    return apiClient.get(`/orders/payment/${paymentMethod}/callback`, {
      params,
      skipAuth: true,
      headers: { Accept: 'application/json' },
    })
  }

  // ─── VOUCHERS ────────────────────────────────────────────────────────

  getVouchers(params) {
    return apiClient.get('/promotions/vouchers/user', { params })
  }

  applyVoucher(code, orderAmount) {
    return apiClient.post('/promotions/vouchers/validate', {
      code,
      type: 'shop',
      subtotal: orderAmount,
      shippingFee: 0,
    })
  }

  validateCheckoutVoucher(payload) {
    return apiClient.post('/promotions/vouchers/validate', payload)
  }

  getActiveCombos(params) {
    return apiClient.get('/promotions/combos/active', {
      params,
      skipAuth: true,
    })
  }

  validateCheckoutCombo(payload) {
    return apiClient.post('/promotions/combos/validate', payload)
  }
}

export const ordersApi = new OrdersApi()
