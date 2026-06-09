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

  fetchProduct(id) {
    return apiClient.get(`/admin/products/${id}`)
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

  fetchOrders(params) {
    return apiClient.get('/admin/orders', { params })
  }

  updateOrder(id, payload) {
    return apiClient.put(`/admin/orders/${id}`, payload)
  }

  fetchInventory(params) {
    return apiClient.get('/admin/inventory', { params })
  }

  stockInVariant(payload) {
    return apiClient.post('/admin/inventory/stock-in', payload)
  }

  updateVariantLowStockThreshold(variantId, payload) {
    return apiClient.put(`/admin/inventory/variants/${variantId}/threshold`, payload)
  }

  fetchVouchers(params) {
    return apiClient.get('/admin/vouchers', { params })
  }

  createVoucher(payload) {
    return apiClient.post('/admin/vouchers', payload)
  }

  updateVoucher(id, payload) {
    return apiClient.put(`/admin/vouchers/${id}`, payload)
  }

  deleteVoucher(id) {
    return apiClient.delete(`/admin/vouchers/${id}`)
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

  createRole(payload) {
    return apiClient.post('/admin/roles', payload)
  }

  updateRole(id, payload) {
    return apiClient.put(`/admin/roles/${id}`, payload)
  }

  deleteRole(id) {
    return apiClient.delete(`/admin/roles/${id}`)
  }

  fetchAuditLogs(params) {
    return apiClient.get('/admin/audit-logs', { params })
  }

  fetchAdminProfile() {
    return apiClient.get('/users/profile')
  }

  updateAdminProfile(payload) {
    return apiClient.put('/users/profile', payload)
  }

  changeAdminPassword(payload) {
    return apiClient.post('/users/auth/password/change', payload)
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
