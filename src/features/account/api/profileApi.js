import { apiClient } from '@shared/lib/api'

const baseUrl = '/profile'

export function getProfile() {
  return apiClient.get(baseUrl)
}

export function updateProfile(payload) {
  return apiClient.put(baseUrl, payload)
}

export function requestContactChange(payload) {
  return apiClient.post(`${baseUrl}/contact/change/request`, payload)
}

export function verifyCurrentContact(payload) {
  return apiClient.post(`${baseUrl}/contact/change/verify-current`, payload)
}

export function requestNewContact(payload) {
  return apiClient.post(`${baseUrl}/contact/change/request-new`, payload)
}

export function confirmContactChange(payload) {
  return apiClient.post(`${baseUrl}/contact/change/confirm`, payload)
}

