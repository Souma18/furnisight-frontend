import { apiClient } from '@shared/lib/api'

export function fetchDashboard(params) {
  return apiClient.get('/admin/dashboard', { params })
}

export function fetchAdminUsers(params) {
  return apiClient.get('/admin/users', { params })
}

export function createAdminUser(payload) {
  return apiClient.post('/admin/users', payload)
}

export function updateAdminUser(id, payload) {
  return apiClient.put(`/admin/users/${id}`, payload)
}

export function fetchCategories(params) {
  return apiClient.get('/admin/categories', { params })
}

export function createCategory(payload) {
  return apiClient.post('/admin/categories', payload)
}

export function updateCategory(id, payload) {
  return apiClient.put(`/admin/categories/${id}`, payload)
}

export function deleteCategory(id) {
  return apiClient.delete(`/admin/categories/${id}`)
}

export function fetchCategoryIconOptions() {
  return apiClient.get('/admin/categories/icon-options')
}

export function fetchProducts(params) {
  return apiClient.get('/admin/products', { params })
}

export function createProduct(payload) {
  return apiClient.post('/admin/products', payload)
}

export function updateProduct(id, payload) {
  return apiClient.put(`/admin/products/${id}`, payload)
}

export function deleteProduct(id) {
  return apiClient.delete(`/admin/products/${id}`)
}

export function uploadProductModel(formData) {
  return apiClient.post('/admin/products/model-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function fetchOrders(params) {
  return apiClient.get('/admin/orders', { params })
}

export function updateOrder(id, payload) {
  return apiClient.put(`/admin/orders/${id}`, payload)
}

export function fetchInventory(params) {
  return apiClient.get('/admin/inventory', { params })
}

export function fetchRevenue(params) {
  return apiClient.get('/admin/revenue', { params })
}

export function fetchStats(params) {
  return apiClient.get('/admin/stats', { params })
}

export function fetchRoles() {
  return apiClient.get('/admin/roles')
}

export function fetchAuditLogs(params) {
  return apiClient.get('/admin/audit-logs', { params })
}

export function fetchAdminProfile() {
  return apiClient.get('/admin/account/profile')
}

export function updateAdminProfile(payload) {
  return apiClient.put('/admin/account/profile', payload)
}

export function changeAdminPassword(payload) {
  return apiClient.post('/admin/account/password', payload)
}

// ==== Message Templates ====
// TODO(BE): Wire pages/composables to these endpoints when backend ready.
export function fetchMessageTemplates(params) {
  return apiClient.get('/message-templates', { params })
}

export function createMessageTemplate(payload) {
  return apiClient.post('/message-templates', payload)
}

export function updateMessageTemplate(id, payload) {
  return apiClient.patch(`/message-templates/${id}`, payload)
}

export function deleteMessageTemplate(id) {
  return apiClient.delete(`/message-templates/${id}`)
}
