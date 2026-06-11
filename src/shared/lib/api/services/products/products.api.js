import { apiClient } from '../../client'

const catalogBaseUrl = '/catalog'

class ProductsApi {
  // ─── PRODUCTS ────────────────────────────────────────────────────────

  /**
   * Retrieves paginated list of products
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./products.model').ProductResponse[], totalElements: number}>>}
   */
  getProducts(params) {
    return apiClient.get(`${catalogBaseUrl}/products`, { params })
  }

  /**
   * Retrieves product details by slug or ID
   * @param {string} slugOrId 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').ProductResponse>>}
   */
  getProductDetail(slugOrId) {
    return apiClient.get(`${catalogBaseUrl}/products/${slugOrId}`)
  }

  // ─── CATEGORIES ────────────────────────────────────────────────────────

  /**
   * Retrieves all categories
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').CategoryResponse[]>>}
   */
  getCategories(params) {
    return apiClient.get(`${catalogBaseUrl}/categories`, { params })
  }

  getRootCategories() {
    return apiClient.get(`${catalogBaseUrl}/categories/roots`)
  }

  getSubcategories(slugOrId) {
    return apiClient.get(`${catalogBaseUrl}/categories/${slugOrId}/subcategories`)
  }

  /**
   * Retrieves category details by slug or ID
   * @param {string} slugOrId 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').CategoryResponse>>}
   */
  getCategoryDetail(slugOrId) {
    return apiClient.get(`${catalogBaseUrl}/categories/${slugOrId}`)
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
