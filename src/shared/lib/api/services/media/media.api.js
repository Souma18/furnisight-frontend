import { apiClient } from '../../client'

class MediaApi {
  /**
   * Uploads a file (remote storage / S3)
   * @param {File} file 
   * @returns {Promise<import('axios').AxiosResponse<import('./media.model').MediaResponse>>}
   */
  upload(file) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  /**
   * Uploads a file (local storage)
   * @param {File} file 
   * @returns {Promise<import('axios').AxiosResponse<import('./media.model').MediaResponse>>}
   */
  uploadLocal(file) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/media/local/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const mediaApi = new MediaApi()
