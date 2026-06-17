import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@features/auth/store/authStore'
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
import { appendMessage, createMessageId, upsertMessage } from '../lib/chatMessages'
import { createChatSocketSession } from '../lib/chatSocketSession'
import { CHAT_AGENT, CHAT_QUICK_CHIPS } from '../config/chatContent'

const CHAT_CHANNEL = 'SUPPORT'

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

  const socketSession = createChatSocketSession({
    connectionStatus,
    conversationId,
    onIncomingMessage: handleIncomingMessage,
  })

  const authStore = useAuthStore()
  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (!isAuth) {
      resetSessionState()
      buyerId.value = null
    }
  })

  async function resolveBuyerId() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return null

    if (!authStore.hasProfileIdentity) {
      await authStore.ensureProfileLoaded()
    }

    return getBuyerId()
  }

  function resetSessionState() {
    socketSession.disconnectSocket()
    conversationId.value = null
    staffId.value = null
    messages.value = []
    unreadCount.value = 0
    hydrated.value = false
    error.value = null
  }

  function handleIncomingMessage(payload) {
    if (!payload || typeof payload !== 'object' || payload.isInternal) return

    isTyping.value = false
    const mapped = mapMessageToCustomer(payload, buyerId.value)
    upsertMessage(messages, mapped)

    if (mapped.role !== 'user' && !isOpen.value) {
      unreadCount.value += 1
    }
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
    loading.value = true
    error.value = null

    try {
      const nextBuyerId = await resolveBuyerId()
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
        socketSession.connectSocket()
      }

      hydrated.value = true
    } catch (err) {
      const authStore = useAuthStore()
      error.value = authStore.isAuthenticated
        ? (err.message || 'Không thể tải hội thoại')
        : 'Vui lòng đăng nhập để sử dụng chat hỗ trợ.'
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
      socketSession.connectSocket()
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
    socketSession.connectSocket()
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

    draft.value = ''
    error.value = null
    loading.value = true

    try {
      const nextBuyerId = await resolveBuyerId()
      if (!nextBuyerId) {
        error.value = 'Vui lòng đăng nhập để sử dụng chat hỗ trợ.'
        return
      }
      buyerId.value = nextBuyerId

      if (!conversationId.value) {
        const { createdWithFirstMessage } = await ensureConversationForFirstMessage(content)
        if (createdWithFirstMessage) {
          return
        }
      }

      if (!conversationId.value) {
        return
      }

      const clientTempId = createMessageId('user')
      appendMessage(messages, {
        id: clientTempId,
        clientTempId,
        role: 'user',
        content,
        products: [],
        createdAt: new Date().toISOString(),
      })

      if (!socketSession.isConnected()) {
        socketSession.connectSocket()
      }

      const saved = await postMessage({
        conversationId: conversationId.value,
        senderId: buyerId.value,
        receiverId: staffId.value,
        content,
        messageType: 'TEXT',
        isInternal: false,
      })
      upsertMessage(messages, mapMessageToCustomer(saved, buyerId.value))
    } catch (err) {
      const authStore = useAuthStore()
      error.value = authStore.isAuthenticated
        ? (err.message || 'Gửi tin nhắn thất bại')
        : 'Vui lòng đăng nhập để sử dụng chat hỗ trợ.'
      console.error('[chatStore] sendMessage', err)
    } finally {
      loading.value = false
    }
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
    disconnectSocket: socketSession.disconnectSocket,
  }
})
