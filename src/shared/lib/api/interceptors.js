import { apiClient } from './client'

export function registerApiInterceptors() {
  apiClient.interceptors.request.use(
    (config) => {
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
    (error) => {
      // Central error handling (toast, logout on 401, etc.) can plug in here.
      return Promise.reject(error)
    },
  )
}
