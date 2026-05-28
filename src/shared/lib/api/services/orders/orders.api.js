import { apiClient } from '../../client'

class OrdersApi {
  /**
   * Retrieves user's orders or all orders (if admin)
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./orders.model').OrderResponse[], totalElements: number}>>}
   */
  getOrders(params) {
    return apiClient.get('/orders', { params })
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
    return apiClient.post('/orders', payload)
  }

  getCheckoutSession(params) {
    return apiClient.get('/checkout/session', { params })
  }

  /**
   * Cancels an order
   * @param {string} orderCode 
   * @returns {Promise<import('axios').AxiosResponse<import('./orders.model').OrderResponse>>}
   */
  cancelOrder(orderCode) {
    return apiClient.put(`/orders/${orderCode}/cancel`)
  }

  // ─── PAYMENTS ────────────────────────────────────────────────────────
  
  /**
   * Initiates payment process for an order
   * @param {string} orderCode 
   * @param {Object} payload 
   * @returns {Promise<import('axios').AxiosResponse<{paymentUrl: string}>>}
   */
  processPayment(orderCode, payload) {
    return apiClient.post(`/payments/${orderCode}`, payload)
  }

  createVnpayPayment(payload) {
    const { orderCode } = payload
    return apiClient.post(`/orders/payment/vnpay/create?orderCode=${orderCode}`, payload)
  }

  getPaymentCallback(params) {
    return apiClient.get('/payments/callback', { params })
  }

  // ─── VOUCHERS ────────────────────────────────────────────────────────

  getVouchers(params) {
    return apiClient.get('/vouchers', { params })
  }

  applyVoucher(code, orderAmount) {
    return apiClient.post('/vouchers/apply', { code, orderAmount })
  }

  validateCheckoutVoucher(payload) {
    return apiClient.post('/orders/vouchers/validate', payload)
  }
}

export const ordersApi = new OrdersApi()
