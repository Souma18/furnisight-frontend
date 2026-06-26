import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import {
  getAdminInbox,
  getMessages,
  postMessage,
  postInternalNote,
  patchAssign,
  patchStatus,
  patchPriority,
} from '@features/chat/api/messageServiceApi'
import { createMessageServiceSocket } from '@features/chat/api/messageServiceSocket'
import { getStaffId, profileNumericId } from '@features/chat/lib/chatUserIds'
import {
  mapConversationToAdminList,
  mapMessageToAdminTimeline,
  mapPriorityToApi,
  mapStatusToApi,
  normalizeConversationList,
  normalizeMessagePage,
} from '@features/chat/lib/chatMappers'
import { useAdminUiStore } from './adminUiStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { adminApi } from '@shared/lib/api/services'
import { ADMIN_SIM_USERS } from '../config/adminLayoutContent'
import { accountRoleNames, normalizeRoleName } from '../utils/adminAccountRoles'

const INBOX_CHANNEL = 'SUPPORT'
const SUPPORT_PERMISSION = 'CUSTOMER_SUPPORT'

const ROLE_RANKS = {
  staff: 1,
  manager: 2,
  admin: 3,
  super: 3,
  'super admin': 3,
}

function buildInitials(firstName, lastName) {
  const a = (firstName || '').trim()[0] || ''
  const b = (lastName || '').trim()[0] || ''
  const initials = (a + b).toUpperCase()
  return initials || 'AD'
}

function normalizePermission(permission) {
  return String(permission || '').trim().replace(/[-\s]+/g, '_').toUpperCase()
}

function normalizePermissions(permissions = []) {
  return [...new Set((permissions || []).map(normalizePermission).filter(Boolean))]
}

function roleRank(roleName) {
  return ROLE_RANKS[normalizeRoleName(roleName)] || 0
}

function supportRoleRank(roleName, permissions = []) {
  const rank = roleRank(roleName)
  if (rank > 0) return rank
  return permissions.includes(SUPPORT_PERMISSION) ? ROLE_RANKS.staff : 0
}

function bestRoleName(account = {}) {
  return accountRoleNames(account)
    .sort((a, b) => roleRank(b) - roleRank(a))[0] || ''
}

function accountDisplayName(account = {}) {
  return account.name
    || account.displayName
    || [account.lastName, account.firstName].filter(Boolean).join(' ')
    || account.username
    || account.email
    || 'Admin'
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
    tab: 'all',
    priority: 'all',
    assignment: 'all',
  })

  const realtimeUnread = reactive({
    byConversationId: {},
  })

  const assignableAdmins = reactive({
    items: [],
    loading: false,
    loaded: false,
    error: '',
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

  // --- Polling ---
  let pollingInterval = null

  function startPollingInbox() {
    stopPollingInbox()
    pollingInterval = setInterval(() => {
      // Silent polling keeps conversation metadata fresh; unread is session-local via websocket.
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
    if (!socket.client?.isConnected?.()) return

    socket.client.subscribeAdminInbox(handleAdminInboxEvent)

    if (!id) return

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
        
        // Update inbox preview and move to top
        if (conv) {
          conv.preview = mapped.text
          conv.updatedAt = new Date().toISOString()
          clearRealtimeUnread(id)
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
    const isCurrentConversation = workspace.convId === mapped.id
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

    // --- Tab filter: define base status pool ---
    let tabStatuses = null
    if (filters.status === 'new') {
      tabStatuses = ['OPEN']
    } else if (filters.status === 'assigned') {
      tabStatuses = ['ASSIGNED']
    } else if (filters.status === 'pending') {
      tabStatuses = ['IN_PROGRESS']
    } else if (filters.status === 'resolved') {
      tabStatuses = ['RESOLVED']
    } else if (filters.status === 'closed') {
      tabStatuses = ['CLOSED']
    } else if (filters.tab === 'new') {
      tabStatuses = ['OPEN']
    } else if (filters.tab === 'pending') {
      tabStatuses = ['ASSIGNED', 'IN_PROGRESS']
    } else if (filters.tab === 'resolved') {
      tabStatuses = ['RESOLVED', 'CLOSED']
    }
    // 'all' tab → tabStatuses stays null (no status filter)

    // --- Chip filter: layered on top of tab ---
    if (filters.status === 'waiting') {
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
      const mapped = normalizeConversationList(items).map((item) => applyRealtimeUnread(mapConversationToAdminList(item)))

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
            connectSocketForConversation(null)
          }
        } else if (!inbox.items.length) {
          connectSocketForConversation(null)
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
      clearRealtimeUnread(id)
    }
    await loadMessages(id)
  }

  function toggleDetailPanel() {
    workspace.detailVisible = !workspace.detailVisible
  }

  function setMsgType(type) {
    workspace.msgType = type
  }

  function currentAdminRank() {
    const roleNames = [
      ...(authStore.roles || []),
      authStore.user?.role,
      ...(Array.isArray(authStore.user?.roles)
        ? authStore.user.roles.map((role) => (typeof role === 'string' ? role : role?.name))
        : []),
    ].filter(Boolean)
    return Math.max(...roleNames.map(roleRank), authStore.isAdmin ? ROLE_RANKS.admin : 0)
  }

  function accountPermissions(account = {}, roleLookup = new Map()) {
    const fromAccount = normalizePermissions(account.permissions)
    const fromRoles = (account.roles || []).flatMap((role) => {
      if (typeof role === 'string') {
        return roleLookup.get(normalizeRoleName(role))?.permissions || []
      }
      return role.permissions || roleLookup.get(normalizeRoleName(role?.name))?.permissions || []
    })
    const fromSingleRole = roleLookup.get(normalizeRoleName(account.role))?.permissions || []
    return normalizePermissions([...fromAccount, ...fromRoles, ...fromSingleRole])
  }

  function normalizeAssignableAdmin(account = {}, roleLookup = new Map()) {
    const role = bestRoleName(account)
    const permissions = accountPermissions(account, roleLookup)
    const rank = supportRoleRank(role, permissions)
    const staffId = profileNumericId(account, 1_500_000_000, 600_000_000)
    const name = accountDisplayName(account)

    return {
      id: account.id ?? account.accountId ?? staffId,
      staffId,
      name,
      email: account.email || '',
      role,
      rank,
      permissions,
      av: account.av || String(name || account.email || 'A').slice(0, 1).toUpperCase(),
      canSupport: permissions.includes(SUPPORT_PERMISSION),
      active: !['banned', 'blocked', 'locked', 'inactive', 'disabled'].includes(String(account.status || '').toLowerCase()),
    }
  }

  async function loadAssignableAdmins(force = false) {
    if (assignableAdmins.loading || (assignableAdmins.loaded && !force)) return

    assignableAdmins.loading = true
    assignableAdmins.error = ''
    try {
      const [userRes, roleRes] = await Promise.all([
        adminApi.fetchAdminUsers({ size: 500 }),
        adminApi.fetchRoles(),
      ])
      const accounts = Array.isArray(userRes.data) ? userRes.data : userRes.data?.items ?? []
      const roles = Array.isArray(roleRes.data) ? roleRes.data : roleRes.data?.items ?? []
      const roleLookup = new Map(
        roles.map((role) => [
          normalizeRoleName(role.name),
          { ...role, permissions: normalizePermissions(role.permissions) },
        ]),
      )
      const ownRank = currentAdminRank()
      const ownStaffId = getStaffId()

      assignableAdmins.items = accounts
        .map((account) => normalizeAssignableAdmin(account, roleLookup))
        .filter((account) => account.staffId && account.active && account.canSupport)
        .filter((account) => {
          if (ownRank <= ROLE_RANKS.staff) return account.staffId === ownStaffId
          return account.rank > 0 && account.rank < ownRank
        })
        .sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name))
      assignableAdmins.loaded = true
    } catch (error) {
      assignableAdmins.error = error?.response?.data?.message || error.message || 'Không tải được danh sách hỗ trợ.'
      assignableAdmins.items = []
    } finally {
      assignableAdmins.loading = false
    }
  }

  async function assignConversation(staffId) {
    const nextStaffId = Number(staffId)
    if (!workspace.convId || !Number.isInteger(nextStaffId) || nextStaffId <= 0) return

    const assignee = assignableAdmins.items.find((item) => item.staffId === nextStaffId)
    if (!assignee) {
      uiStore.showToast({ icon: 'alert', title: 'Không thể giao hội thoại', subtitle: 'Người nhận không hợp lệ.' })
      return
    }

    try {
      await patchAssign(workspace.convId, nextStaffId)
      const conv = inbox.items.find((c) => c.id === workspace.convId)
      if (conv) {
        conv.staffId = nextStaffId
        conv.assignedAdminId = nextStaffId
        conv.assigneeName = assignee.name
        conv.assigneeRole = assignee.role
        conv.status = 'ASSIGNED'
        conv.statusKey = 'assigned'
      }
      uiStore.showToast({ icon: 'userCheck', title: 'Đã giao hội thoại', subtitle: assignee.name })
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Giao hội thoại thất bại',
        subtitle: error?.response?.data?.message || error.message || '',
      })
    }
  }

  async function updateStatus(statusKey) {
    if (!workspace.convId) return

    try {
      const updated = await patchStatus(workspace.convId, mapStatusToApi(statusKey))
      const conv = inbox.items.find((c) => c.id === workspace.convId)
      if (conv) {
        conv.status = updated?.status || mapStatusToApi(statusKey)
        conv.statusKey = statusKey
        conv.closedAt = updated?.closedAt || (statusKey === 'closed' ? new Date().toISOString() : conv.closedAt)
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

  async function updatePriority(priorityKey) {
    if (!workspace.convId) return

    const conv = inbox.items.find((c) => c.id === workspace.convId)
    const previousPriority = conv?.priority

    if (conv) {
      conv.priority = priorityKey
    }

    try {
      await patchPriority(workspace.convId, mapPriorityToApi(priorityKey))
      uiStore.showToast({ icon: 'flag', title: 'Cập nhật độ ưu tiên', subtitle: '→ ' + priorityKey })
    } catch (error) {
      if (conv) {
        conv.priority = previousPriority
      }
      uiStore.showToast({
        icon: 'alert',
        title: 'Cập nhật độ ưu tiên thất bại',
        subtitle: error.message || '',
      })
    }
  }

  async function resolveConversation() {
    if (!workspace.convId) return

    try {
      const updated = await patchStatus(workspace.convId, 'RESOLVED')
      const conv = inbox.items.find((c) => c.id === workspace.convId)
      if (conv) {
        conv.status = updated?.status || 'RESOLVED'
        conv.statusKey = 'resolved'
        conv.closedAt = updated?.closedAt || conv.closedAt
      }
      uiStore.showToast({ icon: 'check', title: 'Hội thoại đã giải quyết', subtitle: 'Có thể đóng hẳn bằng trạng thái Đã đóng.' })
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

  async function sendInternalNote(text, attachment = null) {
    const trimmed = String(text ?? '').trim()
    if ((!trimmed && !attachment) || !workspace.convId) return

    try {
      const content = trimmed || attachment?.name || 'Đính kèm'
      const note = await postInternalNote(workspace.convId, {
        senderId: getStaffId(),
        content,
        messageType: attachment?.isImage ? 'IMAGE' : attachment ? 'FILE' : 'TEXT',
        mediaId: attachment?.mediaId || undefined,
        attachmentUrl: attachment?.url || undefined,
        attachmentName: attachment?.name || undefined,
        attachmentType: attachment?.type || undefined,
        attachmentSize: attachment?.size || undefined,
      })
      _appendMessageToTimeline({
        ...note,
        attachmentUrl: note?.attachmentUrl || attachment?.url,
        attachmentName: note?.attachmentName || attachment?.name,
        attachmentType: note?.attachmentType || attachment?.type,
        attachmentSize: note?.attachmentSize || attachment?.size,
        mediaId: note?.mediaId || attachment?.mediaId,
      }, true)
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

  async function sendCustomerReply(text, attachment = null) {
    const trimmed = String(text ?? '').trim()
    if ((!trimmed && !attachment) || !workspace.convId) return

    const conv = currentConv.value
    const content = trimmed || attachment?.name || 'Đính kèm'
    const dto = {
      conversationId: workspace.convId,
      senderId: getStaffId(),
      receiverId: conv?.buyerId ?? null,
      content,
      messageType: attachment?.isImage ? 'IMAGE' : attachment ? 'FILE' : 'TEXT',
      mediaId: attachment?.mediaId || undefined,
      attachmentUrl: attachment?.url || undefined,
      attachmentName: attachment?.name || undefined,
      attachmentType: attachment?.type || undefined,
      attachmentSize: attachment?.size || undefined,
      isInternal: false,
    }

    _ensureSocketConnected(workspace.convId)

    try {
      const saved = await postMessage(dto)
      _appendMessageToTimeline({
        ...dto,
        ...saved,
        attachmentUrl: saved?.attachmentUrl || dto.attachmentUrl,
        attachmentName: saved?.attachmentName || dto.attachmentName,
        attachmentType: saved?.attachmentType || dto.attachmentType,
        attachmentSize: saved?.attachmentSize || dto.attachmentSize,
        mediaId: saved?.mediaId || dto.mediaId,
      }, false)
      
      if (conv && conv.statusKey !== 'closed') {
        conv.status = 'WAITING_CUSTOMER'
        conv.statusKey = 'waiting'
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
    assignableAdmins,
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
    loadAssignableAdmins,
    assignConversation,
    updateStatus,
    updatePriority,
    resolveConversation,
    sendCustomerReply,
    sendInternalNote,
    disconnectSocket,
    startPollingInbox,
    stopPollingInbox,
  }
})
