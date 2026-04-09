import { apiClient } from '@shared/lib/api'

export function fetchProducts(params) {
  return apiClient.get('/products', { params })
}

export function fetchProductById(id) {
  return apiClient.get(`/products/${id}`)
}
