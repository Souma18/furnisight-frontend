import { apiClient } from '@shared/lib/api'
import { ProductSummaryModel } from '../models/productSummary'
import { ProductDetailModel } from '../models/productDetail'

const baseUrl = '/catalog'

export async function fetchProducts(params) {
  const response = await apiClient.get(`${baseUrl}/products`, { params })
  if (response.data && Array.isArray(response.data.content)) {
    response.data.content = response.data.content.map(item => new ProductSummaryModel(item))
  }
  return response
}

export async function fetchProductById(id) {
  const response = await apiClient.get(`${baseUrl}/products/${id}`)
  if (response.data) {
    response.data = new ProductDetailModel(response.data)
  }
  return response
}

export function fetchCategories() {
  return apiClient.get(`${baseUrl}/categories`)
}

export function fetchRootCategories() {
  return apiClient.get(`${baseUrl}/categories/roots`)
}

export function fetchSubcategories(slug) {
  return apiClient.get(`${baseUrl}/categories/${slug}/subcategories`)
}
