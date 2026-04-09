import { apiClient } from '@shared/lib/api'

export function uploadRoomImage(formData) {
  return apiClient.post('/rooms/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function fetchRoomScene(roomId) {
  return apiClient.get(`/rooms/${roomId}`)
}
