import { apiClient } from '@shared/lib/api'

export function getCart(params) {
  return apiClient.get('/cart', { params })
}

export function addCartItem(payload) {
  return apiClient.post('/cart/items', payload)
}

export function updateCartItem(cartItemId, payload) {
  return apiClient.put(`/cart/items/${cartItemId}`, payload)
}

export function removeCartItem(cartItemId) {
  return apiClient.delete(`/cart/items/${cartItemId}`)
}

export function clearCart() {
  return apiClient.delete('/cart/items')
}
