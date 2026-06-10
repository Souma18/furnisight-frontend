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
      headers: { Accept: 'application/json' },
    })
  }

  // ─── VOUCHERS ────────────────────────────────────────────────────────

  getVouchers(params) {
    // Backend uses @GetMapping("/user") on VoucherController
    return apiClient.get('/orders/vouchers/user', { params })
  }

  applyVoucher(code, orderAmount) {
    return apiClient.post('/orders/vouchers/apply', { code, orderAmount })
  }

  validateCheckoutVoucher(payload) {
    return apiClient.post('/orders/vouchers/validate', payload)
  }
}

export const ordersApi = new OrdersApi()
