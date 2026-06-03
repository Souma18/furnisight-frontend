import { apiClient } from '../../client'

class UsersApi {
  // ─── PROFILE ────────────────────────────────────────────────────────

  /**
   * Retrieves the current user profile
   * @returns {Promise<import('axios').AxiosResponse<import('./users.model').ProfileResponse>>}
   */
  getProfile() {
    return apiClient.get('/users/profile')
  }

  /**
   * Updates the current user profile
   * @param {Object} payload 
   * @returns {Promise<import('axios').AxiosResponse<import('./users.model').ProfileResponse>>}
   */
  updateProfile(payload) {
    return apiClient.put('/users/profile', payload)
  }

  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/account/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  getAccountOverview() {
    return apiClient.get('/account/overview')
  }

  getAddresses() {
    return apiClient.get('/users/profile/addresses')
  }

  saveAddress(payload) {
    return apiClient.post('/users/profile/addresses', payload)
  }

  setDefaultAddress(addressId) {
    return apiClient.post(`/users/profile/addresses/${addressId}/default`)
  }

  deleteAddress(addressId) {
    return apiClient.delete(`/users/profile/addresses/${addressId}`)
  }

  getSavedProjects() {
    return apiClient.get('/account/projects')
  }

  // ─── FAVORITES (WISHLIST) ────────────────────────────────────────────────────────

  /**
   * Retrieves current user's favorite products
   * @returns {Promise<import('axios').AxiosResponse<import('./users.model').FavoriteResponse[]>>}
   */
  getFavorites() {
    return apiClient.get('/users/favorites/products')
  }

  /**
   * Adds a product to user's favorites
   * @param {string} productId 
   * @returns {Promise<import('axios').AxiosResponse<import('./users.model').FavoriteResponse>>}
   */
  addFavorite(productId) {
    return apiClient.post(`/users/favorites/products/${productId}`)
  }

  /**
   * Removes a product from user's favorites
   * @param {string} productId 
   * @returns {Promise<import('axios').AxiosResponse<void>>}
   */
  removeFavorite(productId) {
    return apiClient.delete(`/users/favorites/products/${productId}`)
  }

  // ─── ADMIN: ACCOUNT & ROLES ────────────────────────────────────────────────────────

  /**
   * Retrieves paginated list of users (Admin only)
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./users.model').UserResponse[], totalElements: number}>>}
   */
  getUsers(params) {
    return apiClient.get('/admin/users', { params })
  }
  
  /**
   * Retrieves user details (Admin only)
   * @param {string} userId 
   * @returns {Promise<import('axios').AxiosResponse<import('./users.model').UserResponse>>}
   */
  getUserDetail(userId) {
    return apiClient.get(`/admin/users/${userId}`)
  }
  
  /**
   * Updates a user's role (Admin only)
   * @param {string} userId 
   * @param {string} role 
   * @returns {Promise<import('axios').AxiosResponse<import('./users.model').UserResponse>>}
   */
  updateUserRole(userId, role) {
    return apiClient.put(`/admin/users/${userId}/role`, { role })
  }
  
  /**
   * Retrieves all available roles (Admin only)
   * @returns {Promise<import('axios').AxiosResponse<import('./users.model').RoleResponse[]>>}
   */
  getRoles() {
    return apiClient.get('/admin/roles')
  }
}

export const usersApi = new UsersApi()
