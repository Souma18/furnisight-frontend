import { apiClient } from './client'
import { attachNormalizedApiError } from './errors'
import { pinia } from '../../../app/plugins/pinia'

let isRefreshing = false
let failedQueue = []
const LOCALE_STORAGE_KEY = 'furnisight:locale'
const SUPPORTED_REQUEST_LOCALES = ['vi', 'en']

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const removeAuthHeader = (headers = {}) => {
  if (typeof headers.delete === 'function') {
    headers.delete('Authorization')
    headers.delete('authorization')
    return headers
  }

  delete headers.Authorization
  delete headers.authorization

  if (headers.common) {
    delete headers.common.Authorization
    delete headers.common.authorization
  }

  return headers
}

const createIdempotencyKey = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const hasHeader = (headers = {}, name) => {
  if (typeof headers.has === 'function') {
    return headers.has(name)
  }

  const normalizedName = name.toLowerCase()
  return Object.keys(headers).some((key) => key.toLowerCase() === normalizedName)
}

const setHeader = (headers = {}, name, value) => {
  if (typeof headers.set === 'function') {
    headers.set(name, value)
    return headers
  }

  headers[name] = value
  return headers
}

const getRequestLocale = () => {
  if (typeof window === 'undefined') return 'vi'

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return SUPPORTED_REQUEST_LOCALES.includes(storedLocale) ? storedLocale : 'vi'
}

export function registerApiInterceptors() {
  apiClient.interceptors.request.use(
    (config) => {
      config.headers = config.headers || {}

      if (config.useIdempotencyKey && !hasHeader(config.headers, 'Idempotency-Key')) {
        config.headers = setHeader(config.headers, 'Idempotency-Key', createIdempotencyKey())
      }

      if (!hasHeader(config.headers, 'Accept-Language')) {
        config.headers = setHeader(config.headers, 'Accept-Language', getRequestLocale())
      }

      if (config.skipAuth) {
        config.headers = removeAuthHeader(config.headers)
        return config
      }

      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers = setHeader(config.headers, 'Authorization', `Bearer ${token}`)
      }
      return config
    },
    (error) => Promise.reject(attachNormalizedApiError(error)),
  )

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (!originalRequest || originalRequest.skipAuth) {
        return Promise.reject(attachNormalizedApiError(error))
      }

      // Chỉ xử lý lỗi 401 và không retry lại request nếu đã retry rồi
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Tránh gọi refresh liên tục
        if (originalRequest.url?.includes('/refresh-token')) {
          return Promise.reject(attachNormalizedApiError(error))
        }
        // Lưu lại các request bị lỗi khi đang refresh token
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return apiClient(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(attachNormalizedApiError(err))
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          isRefreshing = false
          import('../../../features/auth/composables/useAuth').then(({ useAuth }) => {
            const { logout } = useAuth(pinia)
            logout(originalRequest.skipAuthRedirect ? null : { name: 'home' }, { clearRemoteCart: false })
          }).catch(e => console.error("Could not load authStore", e))
          return Promise.reject(attachNormalizedApiError(error))
        }

        try {
          // Import useAuth để tránh lỗi circular dependency với Pinia
          const { useAuth } = await import('../../../features/auth/composables/useAuth')
          const { renewToken } = useAuth(pinia)
          // Tạo token mới
          const data = await renewToken()
          const accessToken = data.accessToken
          
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          originalRequest.headers.Authorization = `Bearer ${accessToken}`

          processQueue(null, accessToken)
          return apiClient(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          // Thoát phiên đăng nhập nếu refresh hết hạn
          import('../../../features/auth/composables/useAuth').then(({ useAuth }) => {
            const { logout } = useAuth(pinia)
            logout(originalRequest.skipAuthRedirect ? null : { name: 'home' }, { clearRemoteCart: false })
          }).catch(e => console.error("Could not load authStore", e))
          
          return Promise.reject(attachNormalizedApiError(refreshError))
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(attachNormalizedApiError(error))
    },
  )
}
