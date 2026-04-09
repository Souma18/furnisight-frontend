import { apiClient } from '@shared/lib/api'

export function loginRequest(payload) {
  return apiClient.post('/auth/login', payload)
}

export function fetchSession() {
  return apiClient.get('/auth/me')
}
