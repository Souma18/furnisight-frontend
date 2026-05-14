import { apiClient } from '@shared/lib/api'
// Real API only

const baseUrl = '/catalog'

export function fetchProducts(params) {
  return apiClient.get(`${baseUrl}/products`, { params })
}

export function fetchProductById(id) {
  return apiClient.get(`${baseUrl}/products/${id}`)
}

export function fetchCategories() {
  return apiClient.get(`${baseUrl}/categories`)
}

