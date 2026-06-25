import { computed, reactive, watch, toRefs } from 'vue'
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
  // --- Domain State ---
  const session = reactive({
    hydrated: false,
    isOpen: false,
    loading: false,
    error: null,
  })

  const workspace = reactive({
    conversationId: null,
    messages: [],
    draft: '',
    isTyping: false,
  })

  const user = reactive({
    buyerId: getBuyerId(),
    staffId: null,
  })

  const socket = reactive({
    connectionStatus: 'idle',
    unreadCount: 0,
  })

  // Provide backward compatibility for chatSocketSession bindings
  const sessionBindings = {
    connectionStatus: computed({
      get: () => socket.connectionStatus,
      set: (val) => { socket.connectionStatus = val },
    }),
    conversationId: computed({
      get: () => workspace.conversationId,
      set: (val) => { workspace.conversationId = val },
    }),
  }

  const agent = CHAT_AGENT
  const quickChips = CHAT_QUICK_CHIPS

  const hasUnread = computed(() => socket.unreadCount > 0)

  const socketSession = createChatSocketSession({
    connectionStatus: sessionBindings.connectionStatus,
    conversationId: sessionBindings.conversationId,
    onIncomingMessage: handleIncomingMessage,
  })

  const authStore = useAuthStore()
  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (!isAuth) {
      resetSessionState()
      user.buyerId = null
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
    Object.assign(session, {
      hydrated: false,
      loading: false,
      error: null,
    })
    Object.assign(workspace, {
      conversationId: null,
      messages: [],
    })
    user.staffId = null
    socket.unreadCount = 0
  }

  function handleIncomingMessage(payload) {
    if (!payload || typeof payload !== 'object' || payload.isInternal) return

    workspace.isTyping = false
    const mapped = mapMessageToCustomer(payload, user.buyerId)
    // Pass `.messages` array to the helper
    const messagesRefProxy = computed({
      get: () => workspace.messages,
      set: (val) => { workspace.messages = val }
    })
    upsertMessage(messagesRefProxy, mapped)

    if (mapped.role !== 'user' && !session.isOpen) {
      socket.unreadCount += 1
    }
  }

  async function loadMessages() {
    if (!workspace.conversationId) {
      workspace.messages = []
      return
    }

    const page = await getMessages({ conversationId: workspace.conversationId, size: 50 })
    const items = normalizeMessagePage(page)
    workspace.messages = items
      .filter((m) => !m.isInternal)
      .map((m) => mapMessageToCustomer(m, user.buyerId))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  async function markIncomingAsRead() {
    if (!workspace.conversationId || !session.isOpen) return

    const unreadFromOthers = workspace.messages.filter(
      (m) => m.role === 'assistant' && typeof m.id === 'number',
    )

    await Promise.allSettled(unreadFromOthers.map((m) => markMessageRead(m.id)))
  }

  async function hydrateSession(force = false) {
    session.loading = true
    session.error = null

    try {
      const nextBuyerId = await resolveBuyerId()
      const userChanged = user.buyerId !== nextBuyerId

      if (userChanged) {
        resetSessionState()
        user.buyerId = nextBuyerId
      } else if (force) {
        resetSessionState()
        user.buyerId = nextBuyerId
      } else if (session.hydrated) {
        return
      }

      if (!user.buyerId) {
        session.hydrated = true
        return
      }

      const list = await getConversationsByUser(user.buyerId)
      const existing = pickLatestConversation(list, CHAT_CHANNEL)

      if (existing?.id) {
        workspace.conversationId = existing.id
        user.staffId = existing.staffId ?? existing.assignedAdminId ?? null
        await loadMessages()
        socketSession.connectSocket()
      }

      session.hydrated = true
    } catch (err) {
      const authStore = useAuthStore()
      session.error = authStore.isAuthenticated
        ? (err.message || 'Không thể tải hội thoại')
        : 'Vui lòng đăng nhập để sử dụng chat hỗ trợ.'
      console.error('[chatStore] hydrateSession', err)
    } finally {
      session.loading = false
    }
  }

  async function ensureConversationForFirstMessage(firstMessage) {
    if (workspace.conversationId) return { createdWithFirstMessage: false }
    if (!user.buyerId) {
      throw new Error('Vui lòng đăng nhập để sử dụng chat hỗ trợ.')
    }

    const list = await getConversationsByUser(user.buyerId)
    const existing = pickLatestConversation(list, CHAT_CHANNEL)
    if (existing?.id) {
      workspace.conversationId = existing.id
      user.staffId = existing.staffId ?? existing.assignedAdminId ?? null
      await loadMessages()
      socketSession.connectSocket()
      session.hydrated = true
      return { createdWithFirstMessage: false }
    }

    const created = await createConversation({
      buyerId: user.buyerId,
      staffId: null,
      message: firstMessage,
      messageType: 'TEXT',
      channel: CHAT_CHANNEL,
      fileId: null,
    })

    workspace.conversationId = created.id
    user.staffId = created.staffId ?? created.assignedAdminId ?? null
    await loadMessages()
    socketSession.connectSocket()
    session.hydrated = true

    // Theo API design, message đầu tiên đã được lưu ngay trong createConversation.
    return { createdWithFirstMessage: true }
  }

  function toggleOpen() {
    session.isOpen = !session.isOpen
    if (session.isOpen) {
      socket.unreadCount = 0
      markIncomingAsRead()
    }
  }

  function close() {
    session.isOpen = false
  }

  function open() {
    session.isOpen = true
    socket.unreadCount = 0
  }

  async function _ensureBuyerAuth() {
    const nextBuyerId = await resolveBuyerId()
    if (!nextBuyerId) {
      session.error = 'Vui lòng đăng nhập để sử dụng chat hỗ trợ.'
      return false
    }
    user.buyerId = nextBuyerId
    return true
  }

  async function _ensureActiveConversation(content) {
    if (!workspace.conversationId) {
      const result = await ensureConversationForFirstMessage(content)
      return result
    }
    return { createdWithFirstMessage: false }
  }

  function _ensureSocketConnected() {
    if (!socketSession.isConnected()) {
      socketSession.connectSocket()
    }
  }

  function _appendMessageToTimeline(payload) {
    const messagesRefProxy = computed({
      get: () => workspace.messages,
      set: (val) => { workspace.messages = val }
    })
    upsertMessage(messagesRefProxy, mapMessageToCustomer(payload, user.buyerId))
  }

  async function sendMessage(text) {
    const content = String(text ?? workspace.draft).trim()
    if (!content) return

    workspace.draft = ''
    session.error = null
    session.loading = true

    try {
      const hasAuth = await _ensureBuyerAuth()
      if (!hasAuth) return

      const convStatus = await _ensureActiveConversation(content)
      if (convStatus.createdWithFirstMessage) return
      if (!workspace.conversationId) return

      _ensureSocketConnected()

      const saved = await postMessage({
        conversationId: workspace.conversationId,
        senderId: user.buyerId,
        receiverId: user.staffId,
        content,
        messageType: 'TEXT',
        isInternal: false,
      })
      
      _appendMessageToTimeline(saved)
    } catch (err) {
      const authStore = useAuthStore()
      session.error = authStore.isAuthenticated
        ? (err.message || 'Gửi tin nhắn thất bại')
        : 'Vui lòng đăng nhập để sử dụng chat hỗ trợ.'
      console.error('[chatStore] sendMessage', err)
    } finally {
      session.loading = false
    }
  }

  return {
    // Domains
    session,
    workspace,
    user,
    socket,
    // Original static properties and getters
    agent,
    quickChips,
    hasUnread,
    formatTimeLabel,
    // Actions
    hydrateSession,
    resetSession: resetSessionState,
    toggleOpen,
    close,
    open,
    sendMessage,
    disconnectSocket: socketSession.disconnectSocket,
  }
})
