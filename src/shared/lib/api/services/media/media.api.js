import { apiClient } from '../../client'
import { attachNormalizedApiError } from '../../errors'
import axios from 'axios'

function unwrapData(response) {
  return response?.data?.data ?? response?.data ?? response
}

function pickUploadUrl(payload = {}) {
  return payload.uploadUrl
    || payload.url
    || payload.cloudinaryUrl
    || payload.signedUrl
    || payload.endpoint
    || ''
}

function pickMediaId(payload = {}) {
  return payload.mediaId || payload.id || payload.media?.id || ''
}

function pickUploadFields(payload = {}) {
  return payload.fields
    || payload.formFields
    || payload.params
    || payload.uploadParams
    || {}
}

function appendUploadFields(formData, fields = {}) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === '') continue
    formData.append(key, value)
  }
}

class MediaApi {
  /**
   * Creates a direct Cloudinary upload session.
   * @param {File} file
   * @param {Object} [options]
   */
  initUpload(file, options = {}) {
    return apiClient.post('/media/init-upload', {
      fileName: file.name,
      contentType: file.type || options.contentType || 'application/octet-stream',
      sizeBytes: file.size,
      ownerType: options.ownerType,
      ownerId: options.ownerId,
      resourceType: options.resourceType,
    }, {
      headers: options.idempotencyKey
        ? { 'Idempotency-Key': options.idempotencyKey }
        : undefined,
      useIdempotencyKey: true,
      signal: options.signal,
    })
  }

  /**
   * Uploads a file directly to Cloudinary using the URL and signed fields from BE.
   * @param {File} file
   * @param {Object} uploadSession
   */
  uploadToCloudinary(file, uploadSession, options = {}) {
    const uploadUrl = pickUploadUrl(uploadSession)
    if (!uploadUrl) {
      throw new Error('Missing Cloudinary upload URL from media init-upload response.')
    }

    const formData = new FormData()
    appendUploadFields(formData, pickUploadFields(uploadSession))
    formData.append('file', file)

    return axios.post(uploadUrl, formData, {
      onUploadProgress: options.onUploadProgress,
      signal: options.signal,
    }).catch((error) => {
      throw attachNormalizedApiError(error, 'Không thể tải tệp lên. Vui lòng thử lại.')
    })
  }

  /**
   * Completes a direct upload and lets BE persist/verify Cloudinary metadata.
   * @param {string} mediaId
   * @param {Object} payload
   */
  completeUpload(mediaId, payload) {
    return apiClient.put(`/media/${mediaId}/complete-upload`, payload)
  }

  cancelUpload(mediaId) {
    return apiClient.post(`/media/${mediaId}/cancel-upload`)
  }

  async uploadStaged(file, options = {}) {
    let mediaId = ''
    try {
      const initResponse = await this.initUpload(file, options)
      const uploadSession = unwrapData(initResponse)
      mediaId = pickMediaId(uploadSession)
      const cloudinaryResponse = await this.uploadToCloudinary(file, uploadSession, options)
      const cloudinaryData = unwrapData(cloudinaryResponse)

      return {
        ...cloudinaryData,
        mediaId,
        uploadSession,
        cloudinaryData,
        completed: false,
        persisted: false,
        url: cloudinaryData.secure_url || cloudinaryData.url || pickUploadUrl(uploadSession),
      }
    } catch (error) {
      if (mediaId) {
        await this.cancelUpload(mediaId).catch(() => {})
      }
      throw error
    }
  }

  async completeStagedUpload(upload) {
    if (!upload?.mediaId || upload.completed) return upload
    const completeResponse = await this.completeUpload(upload.mediaId, upload.cloudinaryData ?? upload)
    return {
      ...upload,
      ...unwrapData(completeResponse),
      completed: true,
    }
  }

  /**
   * Full direct-upload flow: init with BE, upload file to Cloudinary, complete with BE.
   * @param {File} file
   * @param {Object} [options]
   */
  async uploadDirect(file, options = {}) {
    const initResponse = await this.initUpload(file, options)
    const uploadSession = unwrapData(initResponse)
    const mediaId = pickMediaId(uploadSession)

    const cloudinaryResponse = await this.uploadToCloudinary(file, uploadSession, options)
    const cloudinaryData = unwrapData(cloudinaryResponse)

    if (!mediaId) {
      return {
        ...cloudinaryData,
        url: cloudinaryData.secure_url || cloudinaryData.url,
      }
    }

    const completeResponse = await this.completeUpload(mediaId, cloudinaryData)

    return {
      ...cloudinaryData,
      ...unwrapData(completeResponse),
      mediaId,
      url: cloudinaryData.secure_url || cloudinaryData.url || pickUploadUrl(uploadSession),
    }
  }

}

export const mediaApi = new MediaApi()
