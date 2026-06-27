import { reactive, computed } from 'vue'
import { getAdminInbox } from '@features/chat/api/messageServiceApi'
import { getStaffId } from '@features/chat/lib/chatUserIds'
import {
  mapConversationToAdminList,
  mapPriorityToApi,
  normalizeConversationList,
} from '@features/chat/lib/chatMappers'

const INBOX_CHANNEL = 'SUPPORT'

export function useAdminInbox(ctx) {
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
    tab: 'all',
    priority: 'all',
    assignment: 'all',
  })

  const realtimeUnread = reactive({
    byConversationId: {},
  })

  const filteredConversations = computed(() => {
    let filtered = inbox.items
    if (filters.status === 'new' || filters.tab === 'new') {
      filtered = filtered.filter((c) => c.statusKey === 'new')
    } else if (filters.status === 'assigned') {
      filtered = filtered.filter((c) => c.statusKey === 'assigned')
    } else if (filters.status === 'pending') {
      filtered = filtered.filter((c) => c.statusKey === 'pending')
    } else if (filters.tab === 'pending') {
      filtered = filtered.filter((c) => c.statusKey === 'assigned' || c.statusKey === 'pending')
    } else if (filters.status === 'resolved') {
      filtered = filtered.filter((c) => c.statusKey === 'resolved')
    } else if (filters.status === 'closed') {
      filtered = filtered.filter((c) => c.statusKey === 'closed')
    } else if (filters.tab === 'resolved') {
      filtered = filtered.filter((c) => c.statusKey === 'resolved' || c.statusKey === 'closed')
    }
    if (filters.status === 'waiting') {
      filtered = filtered.filter((c) => c.statusKey === 'waiting')
    }
    if (filters.query) {
      const q = filters.query.toLowerCase()
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q)),
      )
    }
    if (filters.status === 'unread') {
      filtered = filtered.filter((c) => c.unread)
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter((c) => c.priority === filters.priority)
    }
    if (filters.assignment !== 'all') {
      const ownStaffId = Number(getStaffId())
      filtered = filtered.filter((c) => {
        const assignedStaffId = Number(c.assignedAdminId ?? c.staffId ?? 0)
        if (filters.assignment === 'unassigned') return !assignedStaffId
        if (filters.assignment === 'mine') return assignedStaffId > 0 && assignedStaffId === ownStaffId
        if (filters.assignment === 'assigned') return assignedStaffId > 0
        return true
      })
    }
    return filtered
  })

  let pollingInterval = null

  function startPollingInbox() {
    stopPollingInbox()
    pollingInterval = setInterval(() => {
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
        applyRealtimeUnread(newConv)
        if (existing) {
          existing.unreadCount = newConv.unreadCount
          existing.unread = newConv.unread
          existing.statusKey = newConv.statusKey
          existing.status = newConv.status
          existing.name = newConv.name
          existing.email = newConv.email
          existing.av = newConv.av
          existing.avatarUrl = newConv.avatarUrl
          existing.avClass = newConv.avClass
          existing.avColor = newConv.avColor
          existing.textColor = newConv.textColor
          existing.preview = newConv.preview
          existing.priority = newConv.priority
          existing.closedAt = newConv.closedAt
          existing.updatedAt = newConv.updatedAt
        } else {
          inbox.items.unshift(newConv)
        }
      })
      
      inbox.items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    } catch (error) {
      console.error('[adminConversationStore] Silent poll failed', error)
    }
  }

  function applyRealtimeUnread(conv) {
    const count = realtimeUnread.byConversationId[conv.id] || 0
    conv.unreadCount = count
    conv.unread = count > 0
    return conv
  }

  function clearRealtimeUnread(id) {
    if (!id) return
    realtimeUnread.byConversationId[id] = 0
    const conv = inbox.items.find((c) => c.id === id)
    if (conv) {
      conv.unread = false
      conv.unreadCount = 0
    }
  }

  function incrementRealtimeUnread(id) {
    if (!id) return
    realtimeUnread.byConversationId[id] = (realtimeUnread.byConversationId[id] || 0) + 1
  }

  function handleAdminInboxEvent(payload) {
    if (!payload || payload.internal) return

    const mapped = applyRealtimeUnread(mapConversationToAdminList(payload))
    const existing = inbox.items.find((c) => c.id === mapped.id)
    
    // cross-module ref:
    const workspaceConvId = ctx.workspaceModule?.workspace.convId
    const isCurrentConversation = workspaceConvId === mapped.id
    const isCustomerMessage = Number(payload.senderId) === Number(mapped.buyerId)

    if (isCurrentConversation) {
      clearRealtimeUnread(mapped.id)
      mapped.unread = false
      mapped.unreadCount = 0
    } else if (isCustomerMessage) {
      incrementRealtimeUnread(mapped.id)
      applyRealtimeUnread(mapped)
    }

    if (existing) {
      Object.assign(existing, {
        ...mapped,
        unreadCount: realtimeUnread.byConversationId[mapped.id] || 0,
        unread: (realtimeUnread.byConversationId[mapped.id] || 0) > 0,
      })
      inbox.items = [existing, ...inbox.items.filter((c) => c.id !== existing.id)]
    } else {
      inbox.items.unshift(mapped)
    }
  }

  function buildInboxParams() {
    const params = { channel: INBOX_CHANNEL }

    let tabStatuses = null
    if (filters.status === 'new') tabStatuses = ['OPEN']
    else if (filters.status === 'assigned') tabStatuses = ['ASSIGNED']
    else if (filters.status === 'pending') tabStatuses = ['IN_PROGRESS']
    else if (filters.status === 'resolved') tabStatuses = ['RESOLVED']
    else if (filters.status === 'closed') tabStatuses = ['CLOSED']
    else if (filters.tab === 'new') tabStatuses = ['OPEN']
    else if (filters.tab === 'pending') tabStatuses = ['ASSIGNED', 'IN_PROGRESS']
    else if (filters.tab === 'resolved') tabStatuses = ['RESOLVED', 'CLOSED']

    if (filters.status === 'waiting') {
      const waitingStatus = ['WAITING_CUSTOMER']
      if (tabStatuses) {
        const intersect = tabStatuses.filter(s => waitingStatus.includes(s))
        params.statuses = intersect.length > 0 ? intersect : waitingStatus
      } else {
        params.statuses = waitingStatus
      }
    } else {
      if (tabStatuses) params.statuses = tabStatuses
    }

    if (filters.priority !== 'all') {
      params.priority = mapPriorityToApi(filters.priority)
    }

    params.page = inbox.page
    params.size = 20
    return params
  }

  async function loadInbox(reset = true) {
    if (inbox.loading || inbox.loadingMore) return

    if (reset) {
      inbox.items = [] 
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
      const mapped = normalizeConversationList(items).map((item) => applyRealtimeUnread(mapConversationToAdminList(item)))

      if (items.length < 20) inbox.hasMore = false

      if (reset) {
        inbox.items = mapped
        
        // cross-module ref:
        const workspaceModule = ctx.workspaceModule
        const socketModule = ctx.socketModule
        
        if (inbox.items.length && !workspaceModule.workspace.convId) {
          workspaceModule.workspace.convId = inbox.items[0].id
          await workspaceModule.loadMessages(workspaceModule.workspace.convId)
        } else if (workspaceModule.workspace.convId && !inbox.items.some((c) => c.id === workspaceModule.workspace.convId)) {
          workspaceModule.workspace.convId = inbox.items[0]?.id ?? null
          if (workspaceModule.workspace.convId) {
            await workspaceModule.loadMessages(workspaceModule.workspace.convId)
          } else {
            workspaceModule.workspace.messages = []
            socketModule.connectSocketForConversation(null)
          }
        } else if (!inbox.items.length) {
          socketModule.connectSocketForConversation(null)
        }
      } else {
        inbox.items.push(...mapped)
      }

      inbox.page++
    } catch (error) {
      ctx.uiStore.showToast({
        icon: 'alert',
        title: 'Không tải được inbox',
        subtitle: error.message || '',
      })
    } finally {
      inbox.loading = false
      inbox.loadingMore = false
    }
  }

  return {
    inbox,
    filters,
    realtimeUnread,
    filteredConversations,
    startPollingInbox,
    stopPollingInbox,
    applyRealtimeUnread,
    clearRealtimeUnread,
    incrementRealtimeUnread,
    handleAdminInboxEvent,
    loadInbox
  }
}
