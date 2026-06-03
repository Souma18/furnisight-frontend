import { apiClient } from '../../client'

class NotificationsApi {
  // ─── INBOX MESSAGES ────────────────────────────────────────────────────────

  /**
   * Retrieves user's notifications
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./notifications.model').InboxMessageResponse[], totalElements: number}>>}
   */
  getInboxMessages(params) {
    return apiClient.get('/notifications/inbox-messages', { params })
  }

  markAsRead(id) {
    return apiClient.put(`/notifications/inbox-messages/${id}/read`)
  }

  markAllAsRead() {
    return apiClient.put('/notifications/inbox-messages/read-all')
  }

  // ─── TEMPLATES (ADMIN) ────────────────────────────────────────────────────────

  /**
   * @param {Object} [params] 
   * @returns {Promise<import('axios').AxiosResponse<{content: import('./notifications.model').NotificationTemplateResponse[], totalElements: number}>>}
   */
  getTemplates(params) {
    return apiClient.get('/notifications/templates', { params })
  }

  createTemplate(payload) {
    return apiClient.post('/notifications/templates', payload)
  }

  updateTemplate(id, payload) {
    return apiClient.put(`/notifications/templates/${id}`, payload)
  }

  deleteTemplate(id) {
    return apiClient.delete(`/notifications/templates/${id}`)
  }
}

export const notificationsApi = new NotificationsApi()
