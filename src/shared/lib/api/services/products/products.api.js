import { apiClient } from '../../client'

const catalogBaseUrl = '/catalog'
const LOCALE_STORAGE_KEY = 'furnisight:locale'
const SUPPORTED_LOCALES = ['vi', 'en']

function getCatalogLocale() {
  if (typeof window === 'undefined') return 'vi'

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return SUPPORTED_LOCALES.includes(storedLocale) ? storedLocale : 'vi'
}

function withCatalogLocale(params = {}) {
  return {
    ...params,
    lang: getCatalogLocale(),
  }
}

class ProductsApi {
  // ─── PRODUCTS ────────────────────────────────────────────────────────

  /**
   * Retrieves paginated list of products
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./products.model').ProductResponse[], totalElements: number}>>}
   */
  getProducts(params) {
    return apiClient.get(`${catalogBaseUrl}/products`, { params: withCatalogLocale(params) })
  }

  /**
   * Retrieves product details by slug or ID
   * @param {string} slugOrId 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').ProductResponse>>}
   */
  getProductDetail(slugOrId) {
    return apiClient.get(`${catalogBaseUrl}/products/${slugOrId}`, {
      params: withCatalogLocale(),
    })
  }

  // ─── CATEGORIES ────────────────────────────────────────────────────────

  /**
   * Retrieves all categories
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').CategoryResponse[]>>}
   */
  getCategories(params) {
    return apiClient.get(`${catalogBaseUrl}/categories`, { params: withCatalogLocale(params) })
  }

  getRootCategories() {
    return apiClient.get(`${catalogBaseUrl}/categories/roots`, {
      params: withCatalogLocale(),
    })
  }

  getSubcategories(slugOrId) {
    return apiClient.get(`${catalogBaseUrl}/categories/${slugOrId}/subcategories`, {
      params: withCatalogLocale(),
    })
  }

  /**
   * Retrieves category details by slug or ID
   * @param {string} slugOrId 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').CategoryResponse>>}
   */
  getCategoryDetail(slugOrId) {
    return apiClient.get(`${catalogBaseUrl}/categories/${slugOrId}`, {
      params: withCatalogLocale(),
    })
  }

  // ─── REVIEWS ────────────────────────────────────────────────────────

  /**
   * Retrieves paginated reviews for a product
   * @param {string} productId 
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./products.model').ReviewResponse[], totalElements: number}>>}
   */
  getReviews(productId, params) {
    return apiClient.get(`${catalogBaseUrl}/reviews/product/${productId}`, { params })
  }

  /**
   * Submits a review for a product
   * @param {string} productId 
   * @param {Object} payload 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').ReviewResponse>>}
   */
  submitReview(productId, payload) {
    return apiClient.post(`${catalogBaseUrl}/reviews`, {
      ...payload,
      productId,
    })
  }

  /**
   * Retrieves top random reviews across all products
   * @param {number} limit 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').ReviewResponse[]>>}
   */
  getTopRandomReviews(limit = 3) {
    return apiClient.get(`${catalogBaseUrl}/reviews/top-random`, { params: { limit } })
  }
}

export const productsApi = new ProductsApi()
