import { apiClient } from '@shared/lib/api'

export function fetchCart() {
  return apiClient.get('/cart')
}

export function updateCartItem(id, payload) {
  return apiClient.patch(`/cart/items/${id}`, payload)
}
