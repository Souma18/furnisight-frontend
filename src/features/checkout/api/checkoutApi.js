import { apiClient } from '@shared/lib/api'

export function getCheckoutSession(params) {
  return apiClient.get('/checkout/session', { params })
}

export function validateCheckoutVoucher(payload) {
  return apiClient.post('/checkout/vouchers/validate', payload)
}

export function placeCheckoutOrder(payload) {
  return apiClient.post('/checkout/orders', payload)
}

export function createVnpayPayment(payload) {
  return apiClient.post('/checkout/payments/vnpay', payload)
}
