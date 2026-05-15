import { apiClient } from '@shared/lib/api'

export function getAccountOverview() {
  return apiClient.get('/account/overview')
}

export function updateProfile(payload) {
  return apiClient.put('/account/profile', payload)
}

export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  // TODO(BE): replace endpoint if backend uses different upload route
  return apiClient.post('/account/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function getAddresses() {
  return apiClient.get('/account/addresses')
}

export function saveAddress(payload) {
  return apiClient.post('/account/addresses', payload)
}

export function setDefaultAddress(addressId) {
  return apiClient.post(`/account/addresses/${addressId}/default`)
}

export function getOrders() {
  return apiClient.get('/account/orders')
}

export function getWishlist() {
  return apiClient.get('/account/wishlist')
}

export function getSavedProjects() {
  return apiClient.get('/account/projects')
}

export function getNotifications(params) {
  return apiClient.get('/account/notifications', { params })
}

export function markNotificationRead(notificationId) {
  return apiClient.post(`/account/notifications/${notificationId}/read`)
}

export function markAllNotificationsRead() {
  return apiClient.post('/account/notifications/read-all')
}

// ─── Account Security & Management ──────────────────────────────────────────

const authBaseUrl = '/users/auth'

export function verifyRequest(payload) {
  return apiClient.post(`${authBaseUrl}/verify`, payload)
}

export function requestVerification(payload) {
  return apiClient.post(`${authBaseUrl}/verify/request`, payload)
}

export function changePasswordRequest(payload) {
  return apiClient.post(`${authBaseUrl}/password/change`, payload)
}

export function forgotPasswordRequest(payload) {
  return apiClient.post(`${authBaseUrl}/password/forgot`, payload, { skipAuth: true })
}

export function resetPasswordRequest(payload) {
  return apiClient.post(`${authBaseUrl}/password/reset`, payload, { skipAuth: true })
}

export function verifyResetPasswordCode(payload) {
  return apiClient.post(`${authBaseUrl}/password/verify`, payload, { skipAuth: true })
}

export function deleteOwnAccountRequest() {
  return apiClient.delete(`${authBaseUrl}`)
}
