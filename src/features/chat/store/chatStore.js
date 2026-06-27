import { computed, reactive, watch, toRefs } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@features/auth/store/authStore'
import {
  createConversation,
  getConversationsByUser,
  getMessages,
  markMessageRead,
  postMessage,
  searchMessages,
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
import { uploadChatAttachment } from '../lib/chatAttachmentUpload'
import { formatChatError } from '../lib/chatErrorMessages'
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
    search: {
      visible: false,
      query: '',
      resultIds: [],
      activeIndex: -1,
      total: 0,
      loading: false,
      error: '',
    },
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
  let searchTimer = null
  let searchRequestSeq = 0

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
      search: {
        visible: false,
        query: '',
        resultIds: [],
        activeIndex: -1,
        total: 0,
        loading: false,
        error: '',
      },
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

  async function ensureConversationForFirstMessage(firstMessage, attachmentPayload = null) {
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
      messageType: attachmentPayload?.messageType || 'TEXT',
      channel: CHAT_CHANNEL,
      fileId: null,
      ...(attachmentPayload?.dtoFields || {}),
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

  function setError(message) {
    session.error = message || null
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

  async function _ensureActiveConversation(content, attachmentPayload = null) {
    if (!workspace.conversationId) {
      const result = await ensureConversationForFirstMessage(content, attachmentPayload)
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

  function mergeSearchMessages(items = []) {
    if (!items.length) return

    const mapped = items
      .filter((message) => !message.isInternal)
      .map((message) => mapMessageToCustomer(message, user.buyerId))

    const byId = new Map(workspace.messages.map((message) => [message.id, message]))
    for (const message of mapped) {
      byId.set(message.id, message)
    }

    workspace.messages = [...byId.values()].sort(
      (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
    )
  }

  async function performSearch() {
    const query = String(workspace.search.query || '').trim()
    if (!query || !workspace.conversationId) {
      Object.assign(workspace.search, {
        resultIds: [],
        activeIndex: -1,
        total: 0,
        loading: false,
        error: '',
      })
      return
    }

    const requestSeq = ++searchRequestSeq
    const previousActiveId = workspace.search.resultIds[workspace.search.activeIndex]
    workspace.search.loading = true
    workspace.search.error = ''

    try {
      const page = await searchMessages({
        conversationId: workspace.conversationId,
        query,
        page: 0,
        size: 20,
        includeInternal: false,
      })
      if (requestSeq !== searchRequestSeq) return

      const items = normalizeMessagePage(page)
      mergeSearchMessages(items)

      const resultIds = items.map((message) => message.id ?? message.messageId).filter(Boolean)
      workspace.search.resultIds = resultIds
      workspace.search.total = Number(page?.totalElements ?? resultIds.length) || 0

      if (!resultIds.length) {
        workspace.search.activeIndex = -1
        return
      }

      const previousIndex = resultIds.indexOf(previousActiveId)
      workspace.search.activeIndex = previousIndex >= 0 ? previousIndex : 0
    } catch (err) {
      if (requestSeq !== searchRequestSeq) return
      workspace.search.resultIds = []
      workspace.search.activeIndex = -1
      workspace.search.total = 0
      workspace.search.error = formatChatError(err, 'Không tìm được tin nhắn.')
    } finally {
      if (requestSeq === searchRequestSeq) {
        workspace.search.loading = false
      }
    }
  }

  function toggleSearch() {
    workspace.search.visible = !workspace.search.visible
    if (!workspace.search.visible) {
      setSearchQuery('')
    }
  }

  function setSearchQuery(query) {
    workspace.search.query = query
    workspace.search.visible = workspace.search.visible || Boolean(String(query || '').trim())
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
    }

    if (!String(query || '').trim()) {
      searchRequestSeq += 1
      Object.assign(workspace.search, {
        resultIds: [],
        activeIndex: -1,
        total: 0,
        loading: false,
        error: '',
      })
      return
    }

    workspace.search.loading = true
    searchTimer = setTimeout(() => {
      performSearch()
    }, 250)
  }

  function closeSearch() {
    workspace.search.visible = false
    setSearchQuery('')
  }

  function nextSearchResult() {
    const total = workspace.search.resultIds.length
    if (!total) return
    workspace.search.activeIndex = (workspace.search.activeIndex + 1 + total) % total
  }

  function prevSearchResult() {
    const total = workspace.search.resultIds.length
    if (!total) return
    workspace.search.activeIndex = (workspace.search.activeIndex - 1 + total) % total
  }

  function buildAttachmentPayload(attachments = []) {
    const list = Array.isArray(attachments) ? attachments.filter(Boolean) : [attachments].filter(Boolean)
    const first = list[0] || null
    const allImages = list.length > 0 && list.every((item) => item.isImage)
    const allFiles = list.length > 0 && list.every((item) => !item.isImage)
    const contentFallback = first
      ? list.length > 1
        ? allImages ? `${list.length} ảnh` : allFiles ? `${list.length} tệp` : `${list.length} đính kèm`
        : first.name || 'Đính kèm'
      : ''

    return {
      list,
      first,
      messageType: list.length ? (allImages ? 'IMAGE' : 'FILE') : 'TEXT',
      contentFallback,
      dtoFields: first ? {
        mediaId: first.mediaId || undefined,
        attachmentUrl: first.url || undefined,
        attachmentName: first.name || undefined,
        attachmentType: first.type || undefined,
        attachmentSize: first.size || undefined,
        attachments: list.map((item) => ({
          mediaId: item.mediaId || '',
          url: item.url || '',
          name: item.name || '',
          type: item.type || '',
          size: item.size || 0,
          isImage: Boolean(item.isImage),
        })),
      } : {},
    }
  }

  async function uploadAttachments(files = []) {
    if (!files.length) return []
    return Promise.all(files.map(async (attachment) => {
      const uploaded = await uploadChatAttachment(attachment.file, authStore)
      return {
        mediaId: uploaded.mediaId || uploaded.id || '',
        url: uploaded.secureUrl || uploaded.secure_url || uploaded.url || '',
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        isImage: attachment.isImage,
      }
    }))
  }

  async function sendMessage(text, files = []) {
    const content = String(text ?? workspace.draft).trim()
    if (!content && !files.length) return false

    session.error = null
    session.loading = true

    try {
      const hasAuth = await _ensureBuyerAuth()
      if (!hasAuth) return false

      const uploadedAttachments = await uploadAttachments(files)
      const attachmentPayload = buildAttachmentPayload(uploadedAttachments)
      const messageContent = content || attachmentPayload.contentFallback || 'Đính kèm'
      const convStatus = await _ensureActiveConversation(messageContent, attachmentPayload)
      if (convStatus.createdWithFirstMessage) {
        workspace.draft = ''
        return true
      }
      if (!workspace.conversationId) return false

      _ensureSocketConnected()

      const saved = await postMessage({
        conversationId: workspace.conversationId,
        senderId: user.buyerId,
        receiverId: user.staffId,
        content: messageContent,
        messageType: attachmentPayload.messageType,
        ...attachmentPayload.dtoFields,
        isInternal: false,
      })
      
      _appendMessageToTimeline(saved)
      workspace.draft = ''
      return true
    } catch (err) {
      const authStore = useAuthStore()
      session.error = authStore.isAuthenticated
        ? formatChatError(err, 'Không gửi được tin nhắn. Vui lòng kiểm tra kết nối hoặc thử lại.')
        : 'Vui lòng đăng nhập để sử dụng chat hỗ trợ.'
      console.error('[chatStore] sendMessage', err)
      return false
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
    setError,
    sendMessage,
    toggleSearch,
    setSearchQuery,
    closeSearch,
    nextSearchResult,
    prevSearchResult,
    disconnectSocket: socketSession.disconnectSocket,
  }
})
