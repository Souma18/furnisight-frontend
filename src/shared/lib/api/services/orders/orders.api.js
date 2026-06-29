import { apiClient } from '../../client'
import { withApiLocale } from '../locale'

class OrdersApi {
  /**
   * Retrieves user's orders or all orders (if admin)
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./orders.model').OrderResponse[], totalElements: number}>>}
   */
  getOrders(params) {
    // Gateway: /orders/user -> OrderService: /api/v1/user
    return apiClient.get('/orders/user', { params: withApiLocale(params) })
  }

  /**
   * Retrieves a specific order by order code
   * @param {string} orderCode 
   * @returns {Promise<import('axios').AxiosResponse<import('./orders.model').OrderResponse>>}
   */
  getOrderDetail(orderCode) {
    return apiClient.get(`/orders/${orderCode}`, { params: withApiLocale() })
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
    return apiClient.post('/orders/initiate', payload, {
      params: withApiLocale(),
    })
  }

  getCheckoutSession(params) {
    return apiClient.get('/orders/checkout/session', { params: withApiLocale(params) })
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

  confirmOrderReceived(orderCode) {
    return apiClient.post(`/orders/${orderCode}/confirm-receive`)
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
    return apiClient.get('/promotions/vouchers/user', { params: withApiLocale(params) })
  }

  applyVoucher(code, orderAmount) {
    return apiClient.post('/promotions/vouchers/validate', {
      code,
      type: 'shop',
      subtotal: orderAmount,
      shippingFee: 0,
    }, {
      params: withApiLocale(),
    })
  }

  validateCheckoutVoucher(payload) {
    return apiClient.post('/promotions/vouchers/validate', payload, {
      params: withApiLocale(),
    })
  }

  getActiveCombos(params) {
    return apiClient.get('/promotions/combos', {
      params: withApiLocale({ availableOnly: true, size: 24, sort: 'save-desc', ...params }),
      skipAuth: true,
    })
  }

  validateCheckoutCombo(payload) {
    return apiClient.post('/promotions/combos/validate', payload, {
      params: withApiLocale(),
    })
  }
}

export const ordersApi = new OrdersApi()
