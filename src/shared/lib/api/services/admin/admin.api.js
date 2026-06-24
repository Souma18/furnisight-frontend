import { apiClient } from '../../client'

// Chat templates are now handled directly by message-service
const CHAT_TEMPLATE_BASE_URL = '/messages/message-templates'

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

  updateAdminUserStatus(id, status) {
    return apiClient.patch(`/admin/users/${id}/status`, { status })
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

  fetchVoucherStats() {
    return apiClient.get('/admin/vouchers/stats')
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

  publishVoucher(id, payload) {
    return apiClient.post(`/admin/vouchers/${id}/publish`, payload)
  }

  fetchMarketingCampaigns(params) {
    return apiClient.get('/admin/marketing/campaigns', { params })
  }

  createMarketingCampaign(payload) {
    return apiClient.post('/admin/marketing/campaigns', payload)
  }

  updateMarketingCampaign(id, payload) {
    return apiClient.put(`/admin/marketing/campaigns/${id}`, payload)
  }

  deleteMarketingCampaign(id) {
    return apiClient.delete(`/admin/marketing/campaigns/${id}`)
  }

  fetchMarketingCombos(params) {
    return apiClient.get('/admin/marketing/combos', { params })
  }

  createMarketingCombo(payload) {
    return apiClient.post('/admin/marketing/combos', payload)
  }

  updateMarketingCombo(id, payload) {
    return apiClient.put(`/admin/marketing/combos/${id}`, payload)
  }

  deleteMarketingCombo(id) {
    return apiClient.delete(`/admin/marketing/combos/${id}`)
  }

  fetchMarketingNotifications(params) {
    return apiClient.get('/admin/marketing/notifications', { params })
  }

  createMarketingNotification(payload) {
    return apiClient.post('/admin/marketing/notifications', payload)
  }

  updateMarketingNotification(id, payload) {
    return apiClient.put(`/admin/marketing/notifications/${id}`, payload)
  }

  deleteMarketingNotification(id) {
    return apiClient.delete(`/admin/marketing/notifications/${id}`)
  }

  fetchNotificationTemplates(params) {
    return apiClient.get('/notifications/notification-templates', { params })
  }

  createNotificationTemplate(payload) {
    return apiClient.post('/notifications/notification-templates', payload)
  }

  updateNotificationTemplate(id, payload) {
    return apiClient.put(`/notifications/notification-templates/${id}`, payload)
  }

  deleteNotificationTemplate(id) {
    return apiClient.delete(`/notifications/notification-templates/${id}`)
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
    return apiClient.get(CHAT_TEMPLATE_BASE_URL, { params }).then(res => {
      const payload = res.data;
      if (payload && payload.data) {
        return { ...res, data: payload.data };
      }
      return res;
    });
  }

  createMessageTemplate(payload) {
    return apiClient.post(CHAT_TEMPLATE_BASE_URL, payload).then(res => {
      const payloadObj = res.data;
      if (payloadObj && payloadObj.data) {
        return { ...res, data: payloadObj.data };
      }
      return res;
    });
  }

  updateMessageTemplate(id, payload) {
    return apiClient.put(`${CHAT_TEMPLATE_BASE_URL}/${id}`, payload).then(res => {
      const payloadObj = res.data;
      if (payloadObj && payloadObj.data) {
        return { ...res, data: payloadObj.data };
      }
      return res;
    });
  }

  deleteMessageTemplate(id) {
    return apiClient.delete(`${CHAT_TEMPLATE_BASE_URL}/${id}`)
  }
}

export const adminApi = new AdminApi()
