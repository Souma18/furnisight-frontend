import { apiClient } from '@shared/lib/api'

/** Lấy lịch sử chat (REST fallback khi chưa dùng WebSocket). */
export function fetchChatHistory(params) {
  return apiClient.get('/chat/messages', { params })
}

/** Gửi tin nhắn qua REST (dùng khi WebSocket chưa sẵn sàng). */
export function sendChatMessage(payload) {
  return apiClient.post('/chat/messages', payload)
}
