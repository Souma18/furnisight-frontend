import { apiClient } from '../../client'

class AdminApi {
  fetchDashboard(params) {
    return apiClient.get('/admin/dashboard', { params })
  }

  fetchAdminUsers(params) {
    return apiClient.get('/admin/users', { params })
  }

  createAdminUser(payload) {
    return apiClient.post('/admin/users', payload)
  }

  updateAdminUser(id, payload) {
    return apiClient.put(`/admin/users/${id}`, payload)
  }

  deleteAdminUser(id) {
    return apiClient.delete(`/admin/users/${id}`)
  }

  fetchCategories(params) {
    return apiClient.get('/admin/categories', { params })
  }

  createCategory(payload) {
    return apiClient.post('/admin/categories', payload)
  }

  updateCategory(id, payload) {
    return apiClient.put(`/admin/categories/${id}`, payload)
  }

  deleteCategory(id) {
    return apiClient.delete(`/admin/categories/${id}`)
  }

  fetchCategoryIconOptions() {
    return apiClient.get('/admin/categories/icon-options')
  }

  fetchProducts(params) {
    return apiClient.get('/admin/products', { params })
  }

  createProduct(payload) {
    return apiClient.post('/admin/products', payload)
  }

  updateProduct(id, payload) {
    return apiClient.put(`/admin/products/${id}`, payload)
  }

  deleteProduct(id) {
    return apiClient.delete(`/admin/products/${id}`)
  }

  uploadProductModel(fileOrFormData) {
    const formData = fileOrFormData instanceof FormData ? fileOrFormData : new FormData()
    if (!(fileOrFormData instanceof FormData)) {
      formData.append('file', fileOrFormData)
    }

    return apiClient.post('/admin/products/model-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  fetchOrders(params) {
    return apiClient.get('/admin/orders', { params })
  }

  updateOrder(id, payload) {
    return apiClient.put(`/admin/orders/${id}`, payload)
  }

  fetchInventory(params) {
    return apiClient.get('/admin/inventory', { params })
  }

  fetchRevenue(params) {
    return apiClient.get('/admin/revenue', { params })
  }

  fetchStats(params) {
    return apiClient.get('/admin/stats', { params })
  }

  fetchRoles() {
    return apiClient.get('/admin/roles')
  }

  fetchAuditLogs(params) {
    return apiClient.get('/admin/audit-logs', { params })
  }

  fetchAdminProfile() {
    return apiClient.get('/admin/account/profile')
  }

  updateAdminProfile(payload) {
    return apiClient.put('/admin/account/profile', payload)
  }

  changeAdminPassword(payload) {
    return apiClient.post('/admin/account/password', payload)
  }

  fetchMessageTemplates(params) {
    return apiClient.get('/message-templates', { params })
  }

  createMessageTemplate(payload) {
    return apiClient.post('/message-templates', payload)
  }

  updateMessageTemplate(id, payload) {
    return apiClient.patch(`/message-templates/${id}`, payload)
  }

  deleteMessageTemplate(id) {
    return apiClient.delete(`/message-templates/${id}`)
  }
}

export const adminApi = new AdminApi()
