import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createMessageServiceSocket } from '../api/messageServiceSocket'
import {
  createConversation,
  getConversationsByUser,
  getMessages,
  markMessageRead,
  postMessage,
} from '../api/messageServiceApi'
import { getBuyerId } from '../lib/chatUserIds'
import {
  formatTimeLabel,
  mapMessageToCustomer,
  normalizeMessagePage,
  pickLatestConversation,
} from '../lib/chatMappers'
import { CHAT_AGENT, CHAT_QUICK_CHIPS } from '../mock/chatMockData'

const CHAT_CHANNEL = 'SUPPORT'

function createMessageId(prefix = 'msg') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const useChatStore = defineStore('chat', () => {
  const hydrated = ref(false)
  const isOpen = ref(false)
  const isTyping = ref(false)
  const unreadCount = ref(0)
  const messages = ref([])
  const draft = ref('')
  const connectionStatus = ref('idle')
  const conversationId = ref(null)
  const staffId = ref(null)
  const buyerId = ref(getBuyerId())
  const loading = ref(false)
  const error = ref(null)

  const agent = CHAT_AGENT
  const quickChips = CHAT_QUICK_CHIPS

  const hasUnread = computed(() => unreadCount.value > 0)

  let socketClient = null
  let subscribedConvId = null

  function resetSessionState() {
    disconnectSocket()
    conversationId.value = null
    staffId.value = null
    messages.value = []
    unreadCount.value = 0
    hydrated.value = false
    error.value = null
  }

  function appendMessage(message) {
    messages.value.push({
      id: message.id ?? createMessageId(),
      role: message.role,
      content: message.content ?? '',
      products: message.products ?? [],
      createdAt: message.createdAt ?? new Date().toISOString(),
      clientTempId: message.clientTempId,
    })
  }

  function upsertMessage(mapped) {
    const byId = messages.value.findIndex((m) => m.id === mapped.id)
    if (byId !== -1) {
      messages.value[byId] = mapped
      return
    }

    if (mapped.clientTempId) {
      const byTemp = messages.value.findIndex((m) => m.clientTempId === mapped.clientTempId)
      if (byTemp !== -1) {
        messages.value[byTemp] = mapped
        return
      }
    }

    if (mapped.role === 'user') {
      const byContent = messages.value.findIndex(
        (m) => m.role === 'user' && m.clientTempId && m.content === mapped.content,
      )
      if (byContent !== -1) {
        messages.value[byContent] = mapped
        return
      }
    }

    appendMessage(mapped)
  }

  function handleIncomingMessage(payload) {
    if (!payload || typeof payload !== 'object' || payload.isInternal) return

    isTyping.value = false
    const mapped = mapMessageToCustomer(payload, buyerId.value)
    upsertMessage(mapped)

    if (mapped.role !== 'user' && !isOpen.value) {
      unreadCount.value += 1
    }
  }

  function subscribeCurrentConversation() {
    if (!socketClient?.isConnected?.() || !conversationId.value) return

    if (subscribedConvId && subscribedConvId !== conversationId.value) {
      socketClient.unsubscribe(`/topic/conversation/${subscribedConvId}`)
    }

    subscribedConvId = conversationId.value
    socketClient.subscribeConversation(conversationId.value, handleIncomingMessage)
  }

  function connectSocket() {
    if (!conversationId.value) return

    socketClient?.disconnect()

    connectionStatus.value = 'connecting'
    socketClient = createMessageServiceSocket({
      onConnect: () => {
        connectionStatus.value = 'open'
        subscribeCurrentConversation()
      },
      onDisconnect: () => {
        connectionStatus.value = 'closed'
      },
      onError: () => {
        connectionStatus.value = 'error'
      },
    })

    socketClient.connect()
  }

  async function loadMessages() {
    if (!conversationId.value) {
      messages.value = []
      return
    }

    const page = await getMessages({ conversationId: conversationId.value, size: 50 })
    const items = normalizeMessagePage(page)
    messages.value = items
      .filter((m) => !m.isInternal)
      .map((m) => mapMessageToCustomer(m, buyerId.value))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  async function markIncomingAsRead() {
    if (!conversationId.value || !isOpen.value) return

    const unreadFromOthers = messages.value.filter(
      (m) => m.role === 'assistant' && typeof m.id === 'number',
    )

    await Promise.allSettled(unreadFromOthers.map((m) => markMessageRead(m.id)))
  }

  async function hydrateSession(force = false) {
    const nextBuyerId = getBuyerId()
    const userChanged = buyerId.value !== nextBuyerId

    if (userChanged) {
      resetSessionState()
      buyerId.value = nextBuyerId
    } else if (force) {
      resetSessionState()
      buyerId.value = nextBuyerId
    } else if (hydrated.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      if (!buyerId.value) {
        hydrated.value = true
        return
      }

      const list = await getConversationsByUser(buyerId.value)
      const existing = pickLatestConversation(list, CHAT_CHANNEL)

      if (existing?.id) {
        conversationId.value = existing.id
        staffId.value = existing.staffId ?? existing.assignedAdminId ?? null
        await loadMessages()
        connectSocket()
      }

      hydrated.value = true
    } catch (err) {
      error.value = err.message || 'Không thể tải hội thoại'
      console.error('[chatStore] hydrateSession', err)
    } finally {
      loading.value = false
    }
  }

  async function ensureConversationForFirstMessage(firstMessage) {
    if (conversationId.value) return { createdWithFirstMessage: false }
    if (!buyerId.value) {
      throw new Error('Vui lòng đăng nhập để sử dụng chat hỗ trợ.')
    }

    const list = await getConversationsByUser(buyerId.value)
    const existing = pickLatestConversation(list, CHAT_CHANNEL)
    if (existing?.id) {
      conversationId.value = existing.id
      staffId.value = existing.staffId ?? existing.assignedAdminId ?? null
      await loadMessages()
      connectSocket()
      hydrated.value = true
      return { createdWithFirstMessage: false }
    }

    const created = await createConversation({
      buyerId: buyerId.value,
      staffId: null,
      message: firstMessage,
      messageType: 'TEXT',
      channel: CHAT_CHANNEL,
      fileId: null,
    })

    conversationId.value = created.id
    staffId.value = created.staffId ?? created.assignedAdminId ?? null
    await loadMessages()
    connectSocket()
    hydrated.value = true

    // Theo API design, message đầu tiên đã được lưu ngay trong createConversation.
    return { createdWithFirstMessage: true }
  }

  function toggleOpen() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      unreadCount.value = 0
      markIncomingAsRead()
    }
  }

  function close() {
    isOpen.value = false
  }

  function open() {
    isOpen.value = true
    unreadCount.value = 0
  }

  async function sendMessage(text) {
    const content = String(text ?? draft.value).trim()
    if (!content) return

    const nextBuyerId = getBuyerId()
    if (!nextBuyerId) {
      error.value = 'Vui lòng đăng nhập để sử dụng chat hỗ trợ.'
      return
    }
    buyerId.value = nextBuyerId

    draft.value = ''
    error.value = null

    try {
      if (!conversationId.value) {
        loading.value = true
        const { createdWithFirstMessage } = await ensureConversationForFirstMessage(content)
        if (createdWithFirstMessage) {
          return
        }
      }

      if (!conversationId.value) {
        return
      }

      const clientTempId = createMessageId('user')
      appendMessage({
        id: clientTempId,
        clientTempId,
        role: 'user',
        content,
        products: [],
        createdAt: new Date().toISOString(),
      })

      if (!socketClient?.isConnected?.()) {
        connectSocket()
      }

      const saved = await postMessage({
        conversationId: conversationId.value,
        senderId: buyerId.value,
        receiverId: staffId.value,
        content,
        messageType: 'TEXT',
        isInternal: false,
      })
      upsertMessage(mapMessageToCustomer(saved, buyerId.value))
    } catch (err) {
      error.value = err.message || 'Gửi tin nhắn thất bại'
      console.error('[chatStore] sendMessage', err)
    } finally {
      loading.value = false
    }
  }

  function disconnectSocket() {
    socketClient?.disconnect()
    socketClient = null
    subscribedConvId = null
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
    conversationId,
    loading,
    error,
      buyerId,
    agent,
    quickChips,
    hasUnread,
    formatTimeLabel,
    hydrateSession,
    resetSession: resetSessionState,
    toggleOpen,
    close,
    open,
    sendMessage,
    disconnectSocket,
  }
})
