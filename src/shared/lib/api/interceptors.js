import { apiClient } from './client'
import { pinia } from '../../../app/plugins/pinia'


let isRefreshing = false
let failedQueue = []

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

export function registerApiInterceptors() {
  apiClient.interceptors.request.use(
    (config) => {
      if (config.skipAuth) {
        return config
      }

      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (!originalRequest || originalRequest.skipAuth) {
        return Promise.reject(error)
      }

      // Chỉ xử lý lỗi 401 và không retry lại request nếu đã retry rồi
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Tránh gọi refresh liên tục
        if (originalRequest.url?.includes('/refresh-token')) {
          return Promise.reject(error)
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
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          isRefreshing = false
          return Promise.reject(error)
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
            logout()
          }).catch(e => console.error("Could not load authStore", e))
          
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    },
  )
}
