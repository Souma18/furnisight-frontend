import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import {
  getAdminInbox,
  getMessages,
  postMessage,
  postInternalNote,
  patchStatus,
  closeConversation,
  markConversationAsReadAdmin,
} from '@features/chat/api/messageServiceApi'
import { createMessageServiceSocket } from '@features/chat/api/messageServiceSocket'
import { getStaffId } from '@features/chat/lib/chatUserIds'
import {
  mapConversationToAdminList,
  mapMessageToAdminTimeline,
  mapStatusToApi,
  normalizeConversationList,
  normalizeMessagePage,
} from '@features/chat/lib/chatMappers'
import { useAdminUiStore } from './adminUiStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { ADMIN_SIM_USERS } from '../config/adminLayoutContent'

const INBOX_CHANNEL = 'SUPPORT'

function buildInitials(firstName, lastName) {
  const a = (firstName || '').trim()[0] || ''
  const b = (lastName || '').trim()[0] || ''
  const initials = (a + b).toUpperCase()
  return initials || 'AD'
}

export const useAdminConversationStore = defineStore('adminConversation', () => {
  const uiStore = useAdminUiStore()
  const authStore = useAuthStore()

  // --- State ---
  const inbox = reactive({
    items: [],
    loading: false,
    loadingMore: false,
    page: 0,
    hasMore: true
  })

  const filters = reactive({
    query: '',
    status: 'all',
    tab: 'all'
  })

  const workspace = reactive({
    convId: null,
    messages: [],
    loading: false,
    detailVisible: true,
    msgType: 'reply'
  })

  const socket = reactive({
    connected: false,
    client: null,
    subscribedId: null
  })

  // --- Getters ---
  const currentAdmin = computed(() => {
    const profile = authStore.user || {}
    const fallback = ADMIN_SIM_USERS.super
    const fullName = profile.displayName || `${profile.lastName ?? ''} ${profile.firstName ?? ''}`.trim()
    return {
      id: profile.id || fallback.id,
      av: buildInitials(profile.firstName, profile.lastName),
      name: fullName || fallback.name,
      email: profile.email || fallback.email,
    }
  })

  const currentConv = computed(() => {
    return inbox.items.find((c) => c.id === workspace.convId) || null
  })

  const filteredConversations = computed(() => {
    let filtered = inbox.items
    if (filters.query) {
      const q = filters.query.toLowerCase()
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q)),
      )
    }
    return filtered
  })

  // --- Polling ---
  let pollingInterval = null

  function startPollingInbox() {
    stopPollingInbox()
    pollingInterval = setInterval(() => {
      // Silent polling: keep current page structure, but fetch latest page 0 to see if unread counts changed
      // To keep it simple, we just reload the inbox silently (no loading spinner).
      // Since it resets to page 0, it might disrupt infinite scroll if the admin scrolled far down.
      // A better way is to call a specific lightweight endpoint, but getAdminInbox is all we have.
      // We will only do this if they are on page 0 or we just fetch page 0 and merge unread counts.
      if (inbox.page <= 1) {
        _silentPollInbox()
      }
    }, 20000)
  }

  function stopPollingInbox() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  async function _silentPollInbox() {
    try {
      const params = buildInboxParams()
      params.page = 0 // always poll the first page
      const data = await getAdminInbox(params)
      const items = Array.isArray(data) ? data : data?.content ?? data?.items ?? []
      const mapped = normalizeConversationList(items).map(mapConversationToAdminList)
      
      mapped.forEach(newConv => {
        const existing = inbox.items.find(c => c.id === newConv.id)
        if (existing) {
          existing.unreadCount = newConv.unreadCount
          existing.unread = newConv.unread
          existing.statusKey = newConv.statusKey
          existing.preview = newConv.preview
          existing.updatedAt = newConv.updatedAt
        } else {
          // If it's a completely new conversation, prepend it
          inbox.items.unshift(newConv)
        }
      })
      
      // Sort by updated time
      inbox.items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    } catch (error) {
      console.error('[adminConversationStore] Silent poll failed', error)
    }
  }

  // --- Actions: Socket ---
  function subscribeAdminTopics(id) {
    if (!socket.client?.isConnected?.() || !id) return

    if (socket.subscribedId && socket.subscribedId !== id) {
      socket.client.unsubscribe(`/topic/conversation/${socket.subscribedId}`)
      socket.client.unsubscribe(`/topic/conversation/${socket.subscribedId}/internal`)
    }

    socket.subscribedId = id
    const conv = inbox.items.find((c) => c.id === id)

    socket.client.subscribeConversation(id, (payload) => {
      if (!payload || payload.isInternal) return
      const mapped = mapMessageToAdminTimeline(payload, {
        buyerId: conv?.buyerId,
        staffId: getStaffId(),
        staffName: currentAdmin.value.name,
      })
      if (!workspace.messages.some((m) => m.id === mapped.id)) {
        workspace.messages.push(mapped)
        
        // Auto mark as read because admin is looking at it
        if (mapped.type === 'customer') {
          markConversationAsReadAdmin(id).catch(console.error)
        }

        // Update inbox preview and move to top
        if (conv) {
          conv.preview = mapped.text
          conv.updatedAt = new Date().toISOString()
          conv.unread = false
          conv.unreadCount = 0
          // move to top
          inbox.items = [conv, ...inbox.items.filter(c => c.id !== id)]
        }
      }
    })

    socket.client.subscribeInternal(id, (payload) => {
      if (!payload) return
      const mapped = mapMessageToAdminTimeline(
        { ...payload, isInternal: true },
        {
          buyerId: conv?.buyerId,
          staffId: getStaffId(),
          staffName: currentAdmin.value.name,
        },
      )
      if (!workspace.messages.some((m) => m.id === mapped.id)) {
        workspace.messages.push(mapped)
        
        // Update inbox preview and move to top
        if (conv) {
          conv.preview = `[Ghi chú] ${mapped.text}`
          conv.updatedAt = new Date().toISOString()
          // move to top
          inbox.items = [conv, ...inbox.items.filter(c => c.id !== id)]
        }
      }
    })
  }

  function connectSocketForConversation(id) {
    if (!id) return

    socket.client?.disconnect()
    socket.connected = false

    socket.client = createMessageServiceSocket({
      onConnect: () => {
        socket.connected = true
        subscribeAdminTopics(id)
      },
      onDisconnect: () => {
        socket.connected = false
      },
      onError: () => {
        socket.connected = false
      },
    })

    socket.client.connect()
  }

  function disconnectSocket() {
    socket.client?.disconnect()
    socket.client = null
    socket.subscribedId = null
    socket.connected = false
  }

  // --- Actions: Inbox ---
  function buildInboxParams() {
    const params = { channel: INBOX_CHANNEL }

    // --- Tab filter: define base status pool ---
    let tabStatuses = null
    if (filters.tab === 'new') {
      tabStatuses = ['OPEN']
    } else if (filters.tab === 'pending') {
      tabStatuses = ['ASSIGNED', 'IN_PROGRESS']
    } else if (filters.tab === 'resolved') {
      tabStatuses = ['RESOLVED', 'CLOSED']
    }
    // 'all' tab → tabStatuses stays null (no status filter)

    // --- Chip filter: layered on top of tab ---
    if (filters.status === 'unread') {
      params.unreadOnly = true
      if (tabStatuses) params.statuses = tabStatuses
    } else if (filters.status === 'urgent') {
      params.priority = 'URGENT'
      if (tabStatuses) params.statuses = tabStatuses
    } else if (filters.status === 'waiting') {
      // 'waiting' means WAITING_CUSTOMER — intersect with tab if possible
      const waitingStatus = ['WAITING_CUSTOMER']
      if (tabStatuses) {
        const intersect = tabStatuses.filter(s => waitingStatus.includes(s))
        params.statuses = intersect.length > 0 ? intersect : waitingStatus
      } else {
        params.statuses = waitingStatus
      }
    } else {
      // No chip filter → use tab statuses directly
      if (tabStatuses) params.statuses = tabStatuses
    }

    params.page = inbox.page
    params.size = 20
    return params
  }

  async function loadInbox(reset = true) {
    if (inbox.loading || inbox.loadingMore) return

    if (reset) {
      inbox.items = [] // Clear immediately to reset UI
      inbox.page = 0
      inbox.hasMore = true
      inbox.loading = true
    } else {
      if (!inbox.hasMore) return
      inbox.loadingMore = true
    }

    try {
      const data = await getAdminInbox(buildInboxParams())
      const items = Array.isArray(data) ? data : data?.content ?? data?.items ?? []
      const mapped = normalizeConversationList(items).map(mapConversationToAdminList)

      if (items.length < 20) {
        inbox.hasMore = false
      }

      if (reset) {
        inbox.items = mapped
        if (inbox.items.length && !workspace.convId) {
          workspace.convId = inbox.items[0].id
          await loadMessages(workspace.convId)
        } else if (workspace.convId && !inbox.items.some((c) => c.id === workspace.convId)) {
          workspace.convId = inbox.items[0]?.id ?? null
          if (workspace.convId) {
            await loadMessages(workspace.convId)
          } else {
            workspace.messages = []
          }
        }
      } else {
        inbox.items.push(...mapped)
      }

      inbox.page++
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Không tải được inbox',
        subtitle: error.message || '',
      })
    } finally {
      inbox.loading = false
      inbox.loadingMore = false
    }
  }

  // --- Actions: Messages & Mutations ---
  async function loadMessages(id = workspace.convId) {
    if (!id) {
      workspace.messages = []
      return
    }

    workspace.loading = true
    try {
      const page = await getMessages({ conversationId: id, includeInternal: true, size: 50 })
      const items = normalizeMessagePage(page)
      const conv = inbox.items.find((c) => c.id === id)

      const sorted = [...items].sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      )
      workspace.messages = sorted.map((m) =>
        mapMessageToAdminTimeline(m, {
          buyerId: conv?.buyerId,
          staffId: getStaffId(),
          staffName: currentAdmin.value.name,
        }),
      )

      connectSocketForConversation(id)
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Không tải được tin nhắn',
        subtitle: error.message || '',
      })
    } finally {
      workspace.loading = false
    }
  }

  async function loadConversation(id) {
    workspace.convId = id
    const conv = inbox.items.find((c) => c.id === id)
    if (conv) {
      if (conv.unreadCount > 0 || conv.unread) {
        markConversationAsReadAdmin(id).catch(console.error)
      }
      conv.unread = false
      conv.unreadCount = 0
    }
    await loadMessages(id)
  }

  function toggleDetailPanel() {
    workspace.detailVisible = !workspace.detailVisible
  }

  function setMsgType(type) {
    workspace.msgType = type
  }

  async function updateStatus(statusKey) {
    if (!workspace.convId) return

    try {
      await patchStatus(workspace.convId, mapStatusToApi(statusKey))
      const conv = inbox.items.find((c) => c.id === workspace.convId)
      if (conv) {
        conv.statusKey = statusKey
      }
      uiStore.showToast({ icon: 'info', title: 'Cập nhật trạng thái', subtitle: '→ ' + statusKey })
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Cập nhật trạng thái thất bại',
        subtitle: error.message || '',
      })
    }
  }

  async function resolveConversation() {
    if (!workspace.convId) return

    try {
      await patchStatus(workspace.convId, 'RESOLVED')
      await closeConversation(workspace.convId)
      const conv = inbox.items.find((c) => c.id === workspace.convId)
      if (conv) {
        conv.statusKey = 'resolved'
      }
      uiStore.showToast({ icon: 'check', title: 'Hội thoại đã giải quyết', subtitle: 'Đã lưu và đóng hội thoại này.' })
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Không thể đóng hội thoại',
        subtitle: error.message || '',
      })
    }
  }

  function _appendMessageToTimeline(payload, isInternal) {
    const conv = currentConv.value
    const mapped = mapMessageToAdminTimeline(
      { ...payload, isInternal },
      { buyerId: conv?.buyerId, staffId: getStaffId(), staffName: currentAdmin.value.name },
    )
    if (!workspace.messages.some((m) => m.id === mapped.id)) {
      workspace.messages.push(mapped)
      
      // Update inbox preview
      if (conv) {
        conv.preview = isInternal ? `[Ghi chú] ${mapped.text}` : `Bạn: ${mapped.text}`
        conv.updatedAt = new Date().toISOString()
        inbox.items = [conv, ...inbox.items.filter(c => c.id !== conv.id)]
      }
    }
  }

  function _ensureSocketConnected(convId) {
    if (!socket.client?.isConnected?.()) {
      connectSocketForConversation(convId)
    }
  }

  async function sendInternalNote(text) {
    const trimmed = String(text ?? '').trim()
    if (!trimmed || !workspace.convId) return

    try {
      const note = await postInternalNote(workspace.convId, {
        senderId: getStaffId(),
        content: trimmed,
        messageType: 'TEXT',
      })
      _appendMessageToTimeline(note, true)
      uiStore.showToast({
        icon: 'lock',
        title: 'Ghi chú đã lưu',
        subtitle: currentAdmin.value.name,
      })
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Lưu ghi chú thất bại',
        subtitle: error.message || '',
      })
    }
  }

  async function sendCustomerReply(text) {
    const trimmed = String(text ?? '').trim()
    if (!trimmed || !workspace.convId) return

    const conv = currentConv.value
    const dto = {
      conversationId: workspace.convId,
      senderId: getStaffId(),
      receiverId: conv?.buyerId ?? null,
      content: trimmed,
      messageType: 'TEXT',
      isInternal: false,
    }

    _ensureSocketConnected(workspace.convId)

    try {
      const saved = await postMessage(dto)
      _appendMessageToTimeline(saved, false)
      
      // Update status on backend to IN_PROGRESS if it was OPEN or WAITING_CUSTOMER
      if (conv && (conv.statusKey === 'new' || conv.statusKey === 'waiting')) {
        await patchStatus(workspace.convId, 'IN_PROGRESS')
        conv.status = 'IN_PROGRESS'
        conv.statusKey = 'pending'
      }
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Gửi tin nhắn thất bại',
        subtitle: error.message || '',
      })
    }
  }

  return {
    // State
    inbox,
    filters,
    workspace,
    socket,
    // Getters
    currentAdmin,
    currentConv,
    filteredConversations,
    // Actions
    loadInbox,
    loadMessages,
    loadConversation,
    toggleDetailPanel,
    setMsgType,
    updateStatus,
    resolveConversation,
    sendCustomerReply,
    sendInternalNote,
    disconnectSocket,
    startPollingInbox,
    stopPollingInbox,
  }
})
