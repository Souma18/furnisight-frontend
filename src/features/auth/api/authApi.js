import { apiClient } from '@shared/lib/api'

const baseUrl = '/auth/api/v1'

export function loginRequest(payload) {
  return apiClient.post(`${baseUrl}/login`, payload, { skipAuth: true })
}

export function registerRequest(payload) {
  return apiClient.post(`${baseUrl}/register`, payload, { skipAuth: true })
}

export function logoutRequest(payload) {
  return apiClient.post(`${baseUrl}/logout`, payload)
}

export function logoutAllRequest() {
  return apiClient.post(`${baseUrl}/logout-all`)
}

export function renewAccessTokenRequest(payload) {
  return apiClient.post(`${baseUrl}/refresh-token`, payload, { skipAuth: true })
}
