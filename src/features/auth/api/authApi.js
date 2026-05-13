import { apiClient } from '@shared/lib/api'

const baseUrl = '/users/auth'
const beURL = import.meta.env.VITE_API_BASE_URL
export function loginRequest(payload) {
  return apiClient.post(`${baseUrl}/login`, payload, { skipAuth: true })
}

export async function loginGoogleRequest() {
  const response = await apiClient.get(`${baseUrl}/login/google`, { skipAuth: true })
  const redirectUrl = response.data?.data?.redirectUrl || response.data?.redirectUrl
  if (redirectUrl) {
    window.location.href = beURL+"/users"+redirectUrl
  }
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

export function verifyEmailRequest(otpCode) {
  return apiClient.get(`${baseUrl}/verify`, { params: { otpCode }, skipAuth: true })
}
