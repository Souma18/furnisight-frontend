export class InboxMessageResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.title = data.title || ''
    this.content = data.content || ''
    this.isRead = data.isRead || false
    this.createdAt = data.createdAt || null
  }
}

export class NotificationTemplateResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.subject = data.subject || ''
    this.body = data.body || ''
    this.type = data.type || ''
  }
}
