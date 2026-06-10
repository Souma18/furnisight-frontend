import { apiClient } from '../../client'

class NotificationsApi {
  static templateBaseUrl = '/notifications/notification-templates'

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
    return apiClient.get(NotificationsApi.templateBaseUrl, { params })
  }

  createTemplate(payload) {
    return apiClient.post(NotificationsApi.templateBaseUrl, payload)
  }

  updateTemplate(id, payload) {
    return apiClient.put(`${NotificationsApi.templateBaseUrl}/${id}`, payload)
  }

  deleteTemplate(id) {
    return apiClient.delete(`${NotificationsApi.templateBaseUrl}/${id}`)
  }
}

export const notificationsApi = new NotificationsApi()
