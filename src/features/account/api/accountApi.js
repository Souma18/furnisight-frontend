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

export function getOrders() {
  return apiClient.get('/account/orders')
}

export function getWishlist() {
  return apiClient.get('/account/wishlist')
}

export function getSavedProjects() {
  return apiClient.get('/account/projects')
}
