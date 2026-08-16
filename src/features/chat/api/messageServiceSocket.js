import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const SEND_DESTINATION = '/app/chat.sendMessage'

function resolveWsUrl(explicitUrl) {
  if (explicitUrl) return explicitUrl
  const prefix = import.meta.env.VITE_MESSAGE_SERVICE_PREFIX || '/messages'
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080'
  
  if (apiBaseUrl.startsWith('http')) {
    try {
      const url = new URL(apiBaseUrl)
      return `${url.origin}${prefix}/ws`
    } catch {
      // fallback
    }
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}${prefix}/ws`
  }
  return `http://localhost:8080${prefix}/ws`
}

/**
 * STOMP client qua SockJS cho MessageService.
 * Sử dụng thư viện @stomp/stompjs kết hợp sockjs-client.
 * - WebSocket giúp tạo luồng Real-time 2 chiều (tránh việc phải gọi API liên tục / HTTP Polling).
 * - STOMP giúp định tuyến tin nhắn theo các kênh (Topic) giống Pub/Sub.
 */
export function createMessageServiceSocket({ url, onConnect, onDisconnect, onError } = {}) {
  let client = null
  const subscriptions = new Map()

  function connect() {
    const wsUrl = resolveWsUrl(url ?? import.meta.env.VITE_MESSAGE_WS_URL)

    client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        onConnect?.()
      },
      onDisconnect: () => {
        subscriptions.clear()
        onDisconnect?.()
      },
      onStompError: (frame) => {
        onError?.(new Error(frame.headers?.message || frame.body || 'STOMP error'))
      },
      onWebSocketError: (event) => {
        onError?.(event)
      },
    })

    client.activate()
  }

  function ensureConnected() {
    return client?.connected === true
  }

  function subscribe(topic, handler) {
    if (!client?.connected) return null
    unsubscribe(topic)
    const sub = client.subscribe(topic, (frame) => {
      let payload = frame.body
      try {
        payload = JSON.parse(frame.body)
      } catch {
        // giữ chuỗi thô
      }
      handler?.(payload)
    })
    subscriptions.set(topic, sub)
    return sub
  }

  function unsubscribe(topic) {
    const sub = subscriptions.get(topic)
    if (sub) {
      sub.unsubscribe()
      subscriptions.delete(topic)
    }
  }

  // Đăng ký lắng nghe kênh chat cụ thể (Dành cho Khách hàng & Admin đang trực tiếp nhắn tin trong phòng này)
  function subscribeConversation(conversationId, handler) {
    return subscribe(`/topic/conversation/${conversationId}`, handler)
  }

  function subscribeInternal(conversationId, handler) {
    return subscribe(`/topic/conversation/${conversationId}/internal`, handler)
  }

  // Đăng ký lắng nghe hộp thư đến chung (Dành riêng cho Admin - để nhận thông báo / ping ngay khi có bất kỳ khách hàng nào chat)
  function subscribeAdminInbox(handler) {
    return subscribe('/topic/admin/inbox', handler)
  }

  // Gửi tin nhắn lên Server
  function sendChatMessage(dto) {
    if (!ensureConnected()) {
      console.warn('[messageServiceSocket] STOMP not connected')
      return false
    }
    // Publish tin nhắn lên endpoint của Spring Boot (Backend)
    // Sau đó Spring Boot sẽ lưu DB và tự động Broadcast ngược lại vào các /topic/ ở trên
    client.publish({
      destination: SEND_DESTINATION,
      body: JSON.stringify(dto),
    })
    return true
  }

  function disconnect() {
    subscriptions.forEach((sub) => sub.unsubscribe())
    subscriptions.clear()
    client?.deactivate()
    client = null
  }

  function isConnected() {
    return ensureConnected()
  }

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    subscribeConversation,
    subscribeInternal,
    subscribeAdminInbox,
    sendChatMessage,
    isConnected,
  }
}
