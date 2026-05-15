import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createChatSocket } from '../api/chatSocket'
import { fetchChatSessionMock, sendChatMessageMock } from '../api/chatMockApi'
import { CHAT_AGENT, CHAT_QUICK_CHIPS } from '../mock/chatMockData'

function createMessageId(prefix = 'msg') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function formatTimeLabel(iso) {
  const date = iso ? new Date(iso) : new Date()
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export const useChatStore = defineStore('chat', () => {
  const hydrated = ref(false)
  const isOpen = ref(false)
  const isTyping = ref(false)
  const unreadCount = ref(0)
  const messages = ref([])
  const draft = ref('')
  const connectionStatus = ref('idle') // idle | connecting | open | closed | error

  const agent = CHAT_AGENT
  const quickChips = CHAT_QUICK_CHIPS

  const hasUnread = computed(() => unreadCount.value > 0)

  let socketClient = null

  function appendMessage(message) {
    messages.value.push({
      id: message.id ?? createMessageId(),
      role: message.role,
      content: message.content ?? '',
      products: message.products ?? [],
      createdAt: message.createdAt ?? new Date().toISOString(),
    })
  }

  function handleSocketMessage(payload) {
    if (!payload || typeof payload !== 'object') return

    if (payload.type === 'typing') {
      isTyping.value = Boolean(payload.active)
      return
    }

    if (payload.type === 'message' && payload.message) {
      isTyping.value = false
      appendMessage(payload.message)
      if (!isOpen.value) unreadCount.value += 1
    }
  }

  function connectSocket() {
    const url = import.meta.env.VITE_CHAT_WS_URL
    if (!url) return

    socketClient?.disconnect()

    connectionStatus.value = 'connecting'
    socketClient = createChatSocket({
      url,
      onOpen: () => {
        connectionStatus.value = 'open'
      },
      onClose: () => {
        connectionStatus.value = 'closed'
      },
      onError: () => {
        connectionStatus.value = 'error'
      },
      onMessage: handleSocketMessage,
    })

    socketClient.connect()
  }

  async function hydrateSession() {
    if (hydrated.value) return

    // TODO(BE): thay bằng chatApi.fetchChatHistory() hoặc event init từ WebSocket
    const response = await fetchChatSessionMock()
    const data = response?.data ?? {}

    messages.value = data.messages ?? []
    unreadCount.value = Number(data.unreadCount) || 0
    hydrated.value = true

    connectSocket()
  }

  function toggleOpen() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      unreadCount.value = 0
    }
  }

  function close() {
    isOpen.value = false
  }

  async function sendMessage(text) {
    const content = String(text ?? draft.value).trim()
    if (!content || isTyping.value) return

    draft.value = ''

    const userMessage = {
      id: createMessageId('user'),
      role: 'user',
      content,
      products: [],
      createdAt: new Date().toISOString(),
    }

    appendMessage(userMessage)

    const wsUrl = import.meta.env.VITE_CHAT_WS_URL
    if (wsUrl && socketClient?.getReadyState() === WebSocket.OPEN) {
      socketClient.send({
        type: 'message',
        content,
        clientMessageId: userMessage.id,
      })
      return
    }

    isTyping.value = true

    try {
      // TODO(BE): thay bằng chatApi.sendChatMessage() khi không dùng WebSocket
      const response = await sendChatMessageMock(content)
      const botMessage = response?.data?.message
      if (botMessage) appendMessage(botMessage)
    } finally {
      isTyping.value = false
    }
  }

  function disconnectSocket() {
    socketClient?.disconnect()
    socketClient = null
    connectionStatus.value = 'idle'
  }

  return {
    hydrated,
    isOpen,
    isTyping,
    unreadCount,
    messages,
    draft,
    connectionStatus,
    agent,
    quickChips,
    hasUnread,
    formatTimeLabel,
    hydrateSession,
    toggleOpen,
    close,
    sendMessage,
    handleSocketMessage,
    disconnectSocket,
  }
})
