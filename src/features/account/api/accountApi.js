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
  return apiClient.get('/users/favorites/products')
}

export function favoriteProduct(productId) {
  return apiClient.post(`/users/favorites/products/${productId}`)
}

export function unfavoriteProduct(productId) {
  return apiClient.delete(`/users/favorites/products/${productId}`)
}

export function getSavedProjects() {
  return apiClient.get('/account/projects')
}

export function getNotifications(params) {
  return apiClient.get('/notifications/inbox-messages', { params })
}

export function markNotificationRead(notificationId) {
  return apiClient.put(`/notifications/inbox-messages/${notificationId}/read`)
}

export function markAllNotificationsRead() {
  return apiClient.put('/notifications/inbox-messages/read-all')
}

// ─── Account Security & Management ──────────────────────────────────────────

const authBaseUrl = '/auth/api/v1'

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
