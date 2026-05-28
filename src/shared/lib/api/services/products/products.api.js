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

  // ─── COLLECTIONS ────────────────────────────────────────────────────────

  /**
   * Retrieves all collections
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./products.model').CollectionResponse[], totalElements: number}>>}
   */
  getCollections(params) {
    return apiClient.get('/collections', { params })
  }

  /**
   * Retrieves collection details by slug or ID
   * @param {string} slugOrId 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').CollectionResponse>>}
   */
  getCollectionDetail(slugOrId) {
    return apiClient.get(`/collections/${slugOrId}`)
  }

  // ─── REVIEWS ────────────────────────────────────────────────────────

  /**
   * Retrieves paginated reviews for a product
   * @param {string} productId 
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./products.model').ReviewResponse[], totalElements: number}>>}
   */
  getReviews(productId, params) {
    return apiClient.get(`/products/${productId}/reviews`, { params })
  }

  /**
   * Submits a review for a product
   * @param {string} productId 
   * @param {Object} payload 
   * @returns {Promise<import('axios').AxiosResponse<import('./products.model').ReviewResponse>>}
   */
  submitReview(productId, payload) {
    return apiClient.post(`/products/${productId}/reviews`, payload)
  }
}

export const productsApi = new ProductsApi()
