import { apiClient } from '@shared/lib/api'
const baseUrl = 'users/auth'

export function loginRequest(payload) {
  return apiClient.post(`${baseUrl}/login`, payload, { skipAuth: true })
}

export function fetchSession() {
  return apiClient.get(`${baseUrl}/me`)
}

export function registerRequest(payload) {
  return apiClient.post(`${baseUrl}/register`, payload, { skipAuth: true })
}

export function verifyRequest(payload) {
  return apiClient.post(`${baseUrl}/verify`, payload)
}

export function requestVerification(payload) {
  return apiClient.post(`${baseUrl}/verify/request`, payload)
}


export function logoutRequest(payload) {
  return apiClient.post(`${baseUrl}/logout`, payload)
}

export function logoutAllRequest() {
  return apiClient.post(`${baseUrl}/logout-all`)
}

export function changePasswordRequest(payload) {
  return apiClient.post(`${baseUrl}/password/change`, payload)
}

export function forgotPasswordRequest(payload) {
  return apiClient.post(`${baseUrl}/password/forgot`, payload, { skipAuth: true })
}

export function resetPasswordRequest(payload) {
  return apiClient.post(`${baseUrl}/password/reset`, payload, { skipAuth: true })
}

export function verifyResetPasswordCode(payload) {
  return apiClient.post(`${baseUrl}/password/verify`, payload, { skipAuth: true })
}

export function renewAccessTokenRequest(payload) {
  return apiClient.post(`${baseUrl}/refresh-token`, payload, { skipAuth: true })
}

export function deleteOwnAccountRequest() {
  return apiClient.delete(`${baseUrl}`)
}
