import { apiClient } from '../../client'

const CHAT_TEMPLATE_BASE_URL = '/notifications/notification-templates'
const CHAT_TEMPLATE_CODE_PREFIX = 'CHAT_'
const DEFAULT_CHAT_TEMPLATE_CATEGORY = 'GREETING'

function normalizeTemplateCategory(value) {
  const normalized = String(value || DEFAULT_CHAT_TEMPLATE_CATEGORY).trim().toUpperCase()
  return normalized || DEFAULT_CHAT_TEMPLATE_CATEGORY
}

function extractChatTemplateCategory(template) {
  const nameMatch = String(template?.name || '').match(/^\[([A-Z_]+)]\s*(.*)$/)
  if (nameMatch?.[1]) return nameMatch[1]

  const codeMatch = String(template?.code || '').match(/^CHAT_([A-Z_]+)_/)
  if (codeMatch?.[1]) return codeMatch[1]

  return DEFAULT_CHAT_TEMPLATE_CATEGORY
}

function stripChatTemplateName(name) {
  return String(name || '').replace(/^\[[A-Z_]+]\s*/, '')
}

function isChatTemplate(template) {
  const code = String(template?.code || '').toUpperCase()
  const name = String(template?.name || '')
  return code.startsWith(CHAT_TEMPLATE_CODE_PREFIX) || /^\[[A-Z_]+]\s*/.test(name)
}

function mapChatTemplateFromApi(template) {
  const category = extractChatTemplateCategory(template)
  return {
    ...template,
    id: template.id,
    title: stripChatTemplateName(template.name || template.titleTemplate || ''),
    content: template.bodyTemplate || '',
    category,
    active: true,
  }
}

function mapChatTemplateResponse(response) {
  const rawList = response.data?.items ?? response.data?.content ?? response.data ?? []
  const list = Array.isArray(rawList) ? rawList : []
  return {
    ...response,
    data: list.filter(isChatTemplate).map(mapChatTemplateFromApi),
  }
}

function mapSingleChatTemplateResponse(response) {
  return {
    ...response,
    data: mapChatTemplateFromApi(response.data || {}),
  }
}

function buildChatTemplateCreatePayload(template) {
  const category = normalizeTemplateCategory(template.category)
  const title = String(template.title || '').trim()
  return {
    code: `${CHAT_TEMPLATE_CODE_PREFIX}${category}_${Date.now()}`,
    name: `[${category}] ${title}`,
    titleTemplate: title,
    bodyTemplate: String(template.content || '').trim(),
    type: 'SYSTEM',
    channel: 'IN_APP',
    defaultImage: '',
    defaultActionUrl: '',
  }
}

function buildChatTemplateUpdatePayload(template) {
  const category = normalizeTemplateCategory(template.category)
  const title = String(template.title || '').trim()
  return {
    name: `[${category}] ${title}`,
    titleTemplate: title,
    bodyTemplate: String(template.content || '').trim(),
  }
}

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
    return apiClient
      .get(CHAT_TEMPLATE_BASE_URL, { params })
      .then(mapChatTemplateResponse)
  }

  createMessageTemplate(payload) {
    return apiClient
      .post(CHAT_TEMPLATE_BASE_URL, buildChatTemplateCreatePayload(payload))
      .then(mapSingleChatTemplateResponse)
  }

  updateMessageTemplate(id, payload) {
    return apiClient
      .put(`${CHAT_TEMPLATE_BASE_URL}/${id}`, buildChatTemplateUpdatePayload(payload))
      .then(mapSingleChatTemplateResponse)
  }

  deleteMessageTemplate(id) {
    return apiClient.delete(`${CHAT_TEMPLATE_BASE_URL}/${id}`)
  }
}

export const adminApi = new AdminApi()
