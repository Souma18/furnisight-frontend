export class MediaResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.url = data.url || ''
    this.format = data.format || ''
    this.size = data.size ?? 0
    this.originalName = data.originalName || ''
  }
}
